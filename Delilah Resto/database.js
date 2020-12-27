const {Sequelize, where} = require("sequelize")
const { QueryTypes } = require("sequelize")

const db = new Sequelize ("delilahresto", "root", "",{
    host: "localhost",
    port: 3306,
    dialect: "mysql"
}
)


async function alreadyExist(user, res, req, next){
    const alreadyExist = await db.query(`SELECT * FROM users WHERE (user = :user) OR (email = :email)`,{
        type: QueryTypes.SELECT,
        replacements: user
    })
    console.log(alreadyExist)
    if(Object.entries(alreadyExist) !=0){
        res.status(400).end()
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

}

module.exports = {
    createUser,
    alreadyExist
}