CREATE TABLE users(
    id INT(10) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    fullName VARCHAR(64) NOT NULL,
    email VARCHAR(64) NOT NULL UNIQUE,
    telephone INT(15) NOT NULL,
    address VARCHAR(64) NOT NULL,
    password VARCHAR(64) NOT NULL
)

CREATE TABLE products( id_product INT(10) NOT NULL PRIMARY KEY AUTO_INCREMENT, name VARCHAR(64) NOT NULL, price INT(10) NOT NULL )

CREATE TABLE orders( state VARCHAR(64) NOT NULL, hour TIME, order_id INT(10) PRIMARY KEY AUTO_INCREMENT, description VARCHAR(64) NOT NULL, payment INT(10) NOT NULL, user_id INT(10) NOT NULL)
CREATE TABLE payment_method( id INT(10) NOT NULL PRIMARY KEY AUTO_INCREMENT, payment_method VARCHAR(64) )
INSERT INTO `payment_method`(`payment_method`) VALUES ('efectivo'),('credito'),('debito')
CREATE TABLE order_state( id_state INT(10) NOT NULL, state VARCHAR(64) NOT NULL)
