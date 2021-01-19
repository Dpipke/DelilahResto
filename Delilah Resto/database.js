const {Sequelize} = require("sequelize")
const { QueryTypes } = require("sequelize")
const dotenv = require('dotenv').config();


const db = new Sequelize (process.env.database, process.env.databaseUser, process.env.databasePassword,{
    host: process.env.databaseHost,
    port: process.env.port,
    dialect: "mysql"
}
)

async function alreadyExist(user){
    const alreadyExist = await db.query(`SELECT * FROM users WHERE (user = :user) OR (email = :email)`,{
        type: QueryTypes.SELECT,
        replacements: user
    })
    return alreadyExist
}

async function createUser(user, hash){
    const inserted = await db.query(`
    INSERT INTO users (user, fullName, email, telephone, address, password, admin)
    VALUES (:user, :fullName, :email, :telephone, :address, :hash, 0)
    `, {
        replacements: user, hash,
        type: QueryTypes.INSERT
    })
    const users = await db.query( `
    SELECT * from users`, {
        type: QueryTypes.SELECT
    })
}
async function getUser(userToLook){
    const user = await db.query(
        `SELECT * FROM users 
        WHERE (user = :user) OR (email = :user)`,
        {
        type: QueryTypes.SELECT,
        replacements: userToLook
        })

    return user

}


async function getProductsList(){
    const products = await db.query( `
    SELECT name, price from products`, {
        type: QueryTypes.SELECT
    })
    return products
}

async function getOrdersList(){
    const joinProductQuantity = await db.query(`
    SELECT CONCAT(name, ' x ', quantity) AS description, order_id 
    FROM orders_and_products
    INNER JOIN products 
    ON products.id_product = orders_and_products.id_product
    `, {
        type: QueryTypes.SELECT
    })

    const orders = await db.query( `
    SELECT orders.state, 
    orders.hour,
    orders.order_id,
    users.address,
    users.fullName,
    order_state.state,
    payment_method.payment_method
    FROM orders
    INNER JOIN payment_method ON orders.payment = payment_method.id
    INNER JOIN users ON users.id = orders.user_id
    INNER JOIN order_state ON orders.state = order_state.id_state`, {
        type: QueryTypes.SELECT,

    })

    const mappedOrdersArray = orders.map( order => Object.assign({}, order, {description: joinProductQuantity.filter( product => product.order_id === order.order_id).map( product => product.description).join(", ")}))
    return mappedOrdersArray
}

async function addNewProduct(newProduct){
    const product = await db.query(`
    INSERT INTO products (name, price)
    VALUES (:name, :price)
    `, {
        replacements: newProduct,
        type: QueryTypes.INSERT
    })
    return product
}
async function deleteProduct(product){
    console.log(product)
    const deletedproduct = await db.query(`
    DELETE FROM products WHERE id_product = :id
    `, {
        replacements: product,
        type: QueryTypes.DELETE
    })

}

async function seeOrder(order){
    const joinProductQuantity = await db.query(`
    SELECT CONCAT(name, ' x ', quantity) AS description, order_id 
    FROM orders_and_products
    INNER JOIN products 
    ON products.id_product = orders_and_products.id_product
    WHERE (order_id = :id)
    `, {
        type: QueryTypes.SELECT,
        replacements: order
    })
    const seenOrder = await db.query(
        `SELECT 
        orders.order_id,
        order_state.state,
        orders.total_payment,
        payment_method.payment_method,
        users.address
        FROM orders 
        INNER JOIN order_state ON orders.state = order_state.id_state
        INNER JOIN payment_method ON orders.payment = payment_method.id
        INNER JOIN users ON users.id = orders.user_id
        WHERE (order_id = :id) `,
        {
        type: QueryTypes.SELECT,
        replacements: order
        })

    const mappedOrderArray = seenOrder.map( order => Object.assign({}, order, {description: joinProductQuantity.filter( product => product.order_id === order.order_id).map( product => product.description).join(", ")}))

    return mappedOrderArray
}
async function cancelOrder(order){
    const cancelOrder = await db.query(`
    DELETE FROM orders WHERE order_id= :id
    `, {
        replacements: order,
        type: QueryTypes.DELETE
    })
    const cancelProductsOrder = await db.query(`
    DELETE FROM orders_and_products WHERE order_id= :id
    `, {
        replacements: order,
        type: QueryTypes.DELETE
    })
}



async function changeOrderState(orderState){
    const state = await db.query(
        `UPDATE orders
        SET state = :stateId
        WHERE order_id = :orderId`,
        {
            type: QueryTypes.UPDATE,
            replacements: orderState
        }
    )
    console.table(state)
    
}

async function makeAnOrder(userId, order){
    async function transformOrderData(order){
    const orderArray = Object.values(order)
    const productsArray = orderArray[2]
    console.log(productsArray)
    return productsArray
    }

    try{
        const orderData = await transformOrderData(order)
        console.log(orderData)

        
        const orderInformation = await db.query(`
        INSERT INTO orders (state, payment, user_id, total_payment, delivery_address)
        VALUES (1, :payment, :userId, :totalPrice, :deliveryAddress)
        `, {
            replacements: {'userId':userId, 'payment':order.payment, 'totalPrice':order.total_payment, 'deliveryAddress': order.deliveryAddress},
            type: QueryTypes.INSERT
        })
        console.log(orderInformation) 
        
        const orderId = orderInformation[0]
        console.log(orderId)

        const postOrder = await Promise.all(orderData.map(product => db.query(`
            INSERT INTO orders_and_products (order_id, id_product, quantity)
            VALUES (:order_id, :id_product, :quantity)
            `, { replacements: {'order_id': orderId,'id_product': product.id, 'quantity': product.quantity}, type: QueryTypes.INSERT})))
    } catch(error){
        return false 
    }
}

async function updateProduct(product){
    const set = Object.keys(product).filter(key => product[key] != null && key != "id").map(key => `${key} = :${key}`).join(",")
    console.log(product)
    const query = `UPDATE products SET ${set} WHERE id_product = :id` 
    const updatedProduct = await db.query(query,
        {
            type: QueryTypes.UPDATE,
            replacements: product
        }
    )
    console.log(updatedProduct)
}

async function seeProduct(product){
    const shownProduct = await db.query(
        `SELECT name, price, product_description FROM products 
        WHERE (id_product = :id)`,
        {
        type: QueryTypes.SELECT,
        replacements: product
        })
    return shownProduct
}

async function validateUserAccess(id, orderId){
    const isValidate = await db.query(
        `SELECT 
        user_id,
        order_id
        FROM orders 
        WHERE (user_id = :id) AND (order_id = :order_id)`,
        {
        type: QueryTypes.SELECT,
        replacements: {'id': id, 'order_id': orderId}
        })
    console.log(isValidate)
    return isValidate
}

async function updateOrderInformation(order){
    const set = Object.keys(order).filter(key => order[key] != null && key != "orderId" && key != "productsList").map(key => `${key} = :${key}`).join(",")
    if(set != ""){
    const query = `UPDATE orders SET ${set} WHERE (order_id = :orderId)` 
    console.log(query)
    const updatedOrder = await db.query(query,
        {
            type: QueryTypes.UPDATE,
            replacements: order
        }
    )
    }
    const newProductsList = order.productsList
    if(order.productsList != null){ 
        const deleteOldProducts = await db.query(
            `DELETE FROM orders_and_products
            WHERE (order_id = :orderId)`,
            {
            type: QueryTypes.DELETE,
            replacements: order
            })

        const addNewProducts = await Promise.all(newProductsList.map(product => db.query(`
            INSERT INTO orders_and_products (order_id, id_product, quantity)
            VALUES (:order_id, :id_product, :quantity)
            `, { replacements: {'order_id': order.orderId,'id_product': product.id, 'quantity': product.quantity}, type: QueryTypes.INSERT})))
        }
}

async function validateIfExists(id, table, column_name){
    console.log(id)
    const idToLook = await db.query(`SELECT * FROM ${table} WHERE (${column_name} = :id)`,{
        type: QueryTypes.SELECT,
        replacements: id
    })
    return idToLook
}
module.exports = {
    createUser,
    alreadyExist,
    getProductsList,
    getUser,
    getOrdersList,
    addNewProduct,
    deleteProduct,
    cancelOrder,
    seeOrder, 
    validateUserAccess,
    changeOrderState,
    makeAnOrder, 
    seeProduct,
    updateProduct,
    updateOrderInformation,
    validateIfExists
}