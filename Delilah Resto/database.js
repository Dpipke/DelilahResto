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

async function createUser(user){
    const inserted = await db.query(`
    INSERT INTO users (user, fullName, email, telephone, address, password)
    VALUES (:user, :fullName, :email, :telephone, :address, :password)
    `, {
        replacements: user,
        type: QueryTypes.INSERT
    })
    const users = await db.query( `
    SELECT * from users`, {
        type: QueryTypes.SELECT
    })
    console.table(users)
}
async function  validateUser(req, res){
    const validate = await db.query(
        `SELECT * FROM users WHERE (user = :user) OR (email = :user) AND (password = :password) `,
        {
        type: QueryTypes.SELECT,
        replacements: req.body
        })

    if(Object.entries(validate) == 1){
        res.status(200).next()
    }else{
        res.status(401).send('incorrect user or password').end()
    }
}
async function getProductsList(){
    const products = await db.query( `
    SELECT name, price from products`, {
        type: QueryTypes.SELECT
    })
    console.table(products)
}

async function getOrdersList(){
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
    INNER JOIN users ON users.id = orders.user_id`, {
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
    DELETE FROM products WHERE name= :name
    `, {
        replacements: product,
        type: QueryTypes.DELETE
    })
    // por que me carga mal la tabla?

}

async function seeOrder(){
    const seenOrder = await db.query(
        `SELECT * FROM users WHERE (order_id = :id) `,
        {
        type: QueryTypes.SELECT,
        replacements: req.params
        })
    console.log(seenOrder)
}
async function cancelOrder(order){
    const cancelOrder = await db.query(`
    DELETE FROM orders WHERE order_id= :id
    `, {
        replacements: req.params,
        type: QueryTypes.DELETE
    })
}

module.exports = {
    createUser,
    alreadyExist,
    getProductsList,
    validateUser,
    getOrdersList,
    addNewProduct,
    deleteProduct,
    cancelOrder,
    seeOrder
}