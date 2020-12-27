const {Sequelize} = require("sequelize")

const db = new Sequelize ("delilahresto", "root", "",{
    host: "localhost",
    port: 3306,
    dialect: "mysql"
}
)

//CREAR TABLA
// CREATE TABLE users(
//     id INT(10) NOT NULL PRIMARY KEY AUTO_INCREMENT,
//     fullName VARCHAR(64) NOT NULL,
//     email VARCHAR(64) NOT NULL UNIQUE,
//     telephone INT(15) NOT NULL,
//     address VARCHAR(64) NOT NULL,
//     password VARCHAR(64) NOT NULL
// )


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
    "db": db,
    "createUser": createUser
}