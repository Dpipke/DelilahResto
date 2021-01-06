const {Sequelize, where} = require("sequelize")
const { QueryTypes } = require("sequelize")

const db = new Sequelize ("delilahresto", "root", "",{
    host: "localhost",
    port: 3306,
    dialect: "mysql"
}
)


async function alreadyExist(req, res, next){
    const alreadyExist = await db.query(`SELECT * FROM users WHERE (user = :user) OR (email = :email)`,{
        type: QueryTypes.SELECT,
        replacements: req.body
    })
    console.log(alreadyExist)
    if(Object.entries(alreadyExist) !=0){
        res.status(400).send('user or email already exists')
    }else{
        next()
    }
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
    console.table(users)
}
async function getUser(userToLook){
    const user = await db.query(
        `SELECT password FROM users 
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
    console.table(products)
}

async function getOrdersList(orden){
    const orders = await db.query( `
    SELECT orders.state, 
    orders.hour,
    orders.order_id,
    orders.description, 
    users.address,
    users.fullName,
 
    payment_method.payment_method
    FROM orders
    INNER JOIN payment_method ON orders.payment = payment_method.id
    INNER JOIN users ON users.id = orders.user_id
    ORDER BY orders.state ${orden}`, {
        type: QueryTypes.SELECT
    })
    console.table(orders)
}

async function addNewProduct(newProduct){
    const product = await db.query(`
    INSERT INTO products (name, price)
    VALUES (:name, :price)
    `, {
        replacements: newProduct,
        type: QueryTypes.INSERT
    })
    // por que me carga mal la tabla?
    console.table(product)
}
async function deleteProduct(product){
    const deletedproduct = await db.query(`
    DELETE FROM products WHERE id_product = :id
    `, {
        replacements: product,
        type: QueryTypes.DELETE
    })
    // por que me carga mal la tabla?

}

async function seeOrder(order){
    const seenOrder = await db.query(
        `SELECT * FROM orders WHERE (order_id = :id) `,
        {
        type: QueryTypes.SELECT,
        replacements: order
        })
    console.log(seenOrder)
    return seenOrder
}
async function cancelOrder(order){
    const cancelOrder = await db.query(`
    DELETE FROM orders WHERE order_id= :id
    `, {
        replacements: order,
        type: QueryTypes.DELETE
    })
}

async function getOrderState(order){
    const actualOrder = await db.query(
        `SELECT  
        order_state.state,
        orders.description, 
        orders.total_payment,
        orders.payment, 
        payment_method.payment_method,
        users.address
        FROM orders 
        INNER JOIN order_state ON orders.state = order_state.id_state
        INNER JOIN payment_method ON orders.payment = payment_method.id
        INNER JOIN users ON users.id = orders.user_id
        WHERE (user_id = :userId) `,
        {
        type: QueryTypes.SELECT,
        replacements: order
        })
    console.log(actualOrder)
    return actualOrder
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

async function makeAnOrder(order){
    const product = await db.query(`
    INSERT INTO orders (state, payment, user_id, total_payment)
    VALUES (1, :payment, :userId, :payment)
    `, {
        replacements: order,
        type: QueryTypes.INSERT
    })

    const getOrderId = await db.query(`
    SELECT LAST_INSERT_ID() FROM orders
    `, {
        replacements: order,
        type: QueryTypes.SELECT
    })   
    const getOrderIdValue = getOrderId[0] 
    console.log(getOrderIdValue)
    // const orderId = Object.values(getOrderIdValue)
    // console.log(orderId)

    console.log(order)
    const eachProduct = await db.query(`
    INSERT INTO orders_and_products (order_id)
    VALUES (:LAST_INSERT_ID())
    `, {
        replacements: {'order_id': getOrderIdValue},
        type: QueryTypes.INSERT
    })
}

async function updateProduct(product){

    const set = Object.keys(product).filter(key => product[key] != null && key != "id").map(key => `${key} = :${key}`).join(",")
    const query = `UPDATE products SET ${set} WHERE id_product = :id` 
    const updatedProduct = await db.query(query,
        {
            type: QueryTypes.UPDATE,
            replacements: product
        }
    )
}

async function seeProduct(product){
    const shownProduct = await db.query(
        `SELECT name, price, product_description FROM products 
        WHERE (id_product = :id)`,
        {
        type: QueryTypes.SELECT,
        replacements: product
        })
    console.log(shownProduct)
    return shownProduct
}

async function isAdmin(user){
    const adminPrivilege = await db.query(
        `SELECT admin FROM users 
        WHERE (user = :user) OR (email = :user)`,
        {
        type: QueryTypes.SELECT,
        replacements: user
        })
    console.log(adminPrivilege)
    return adminPrivilege
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
    getOrderState,
    changeOrderState,
    makeAnOrder, 
    seeProduct,
    updateProduct,
    isAdmin
}