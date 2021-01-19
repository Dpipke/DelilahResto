DROP DATABASE IF EXISTS delilahresto

CREATE DATABASE delilahresto

DROP TABLE IF EXISTS `users`
CREATE TABLE users(
    id INT(10) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user VARCHAR(64) NOT NULL UNIQUE,
    fullName VARCHAR(64) NOT NULL,
    email VARCHAR(64) NOT NULL UNIQUE,
    telephone INT(15) NOT NULL,
    address VARCHAR(64) NOT NULL,
    password VARCHAR(64) NOT NULL, 
    admin tinyint(1)
)

DROP TABLE IF EXISTS `products`
CREATE TABLE products( 
    id_product INT(10) NOT NULL PRIMARY KEY AUTO_INCREMENT, 
    name VARCHAR(64) NOT NULL, 
    price INT(10) NOT NULL,
    product_description VARCHAR(64) 
    )

DROP TABLE IF EXISTS `orders`
CREATE TABLE orders( 
    state VARCHAR(64) NOT NULL, 
    hour TIME, 
    order_id INT(10) PRIMARY KEY AUTO_INCREMENT, 
    payment INT(10) NOT NULL, 
    user_id INT(10) NOT NULL,
    total_payment INT(10) NOT NULL,
    delivery_address VARCHAR(64) NOT NULL
    )

DROP TABLE IF EXISTS `payment_method`
CREATE TABLE payment_method( 
    id INT(10) NOT NULL PRIMARY KEY AUTO_INCREMENT, 
    payment_method VARCHAR(64) 
    )
INSERT INTO `payment_method`(`payment_method`) 
VALUES ('efectivo'),
    ('credito'),
    ('debito')

DROP TABLE IF EXISTS `order_state`
CREATE TABLE order_state( 
    id_state INT(10) NOT NULL PRIMARY KEY AUTO_INCREMENT, 
    state VARCHAR(64) NOT NULL
    )
INSERT INTO `order_state`(`state`) 
VALUES ('Nuevo'),
    ('Confirmado'),
    ('Preparando'),
    ('Enviando'), 
    ('Entregado')

DROP TABLE IF EXISTS `orders_and_products`
CREATE TABLE orders_and_products( 
    order_id INT(10) NOT NULL, 
    id_product INT(10) NOT NULL, 
    quantity INT(10) NOT NULL 
)
