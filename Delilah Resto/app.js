const app = require('express')();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

const {createUser} = require(`./database`)
const {alreadyExist} = require(`./database`)
const {getProductsList} = require(`./database`)
const {getUser} = require(`./database`)
const {getOrdersList} = require(`./database`)
const {addNewProduct} = require(`./database`)
const {deleteProduct} = require(`./database`)
const {seeOrder} = require(`./database`)
const {cancelOrder} = require(`./database`)
const {getOrderState} = require(`./database`)
const {changeOrderState} = require(`./database`)
const {makeAnOrder} = require(`./database`)

app.use(bodyParser.json())
app.use(helmet())

const authorizationPassword = process.env.AuthPassword;
dotenv.config();

function verifyToken(req, res, next) {
    console.log(req.headers.authorization);
    const token = req.headers.authorization.split(' ')[1];
    console.log(token)
    try {
        jwt.verify(token, authorizationPassword);
        next();
    } catch (error) {
        res.status(401).send(error);
    }
}

const limiter = rateLimit({
    windowMs: 60*60*1000,
    max: 5
})


// user
// login
app.post('/login', limiter, (req, res) =>{
    const user ={
        user: req.body.user,
        password: req.body.password
    }
    const {password} = getUser(user)
    console.log(password)
    bcrypt.compare(user.password, password, function(err, result) {
        if (result) {
            console.log("It matches!")
        }
        else {
            console.log("Invalid password!");
        }
    });
});


    // if(validateUser(user) === true ){
    //     const userToken = jwt.sign({user, isAdmin}, authorizationPassword)
    //     console.log(userToken)
    //     res.status(201).json(userToken)
    // }else{
    //     res.status(401).send('incorrect user or password').end()
    // }
// })

// app.use(verifyToken);

// crear usuario
app.post('/signup', alreadyExist, limiter, (req, res) =>{
    const user ={
        user: req.body.user,
        fullName: req.body.fullName,
        email: req.body.email,
        telephone: req.body.telephone,
        address: req.body.address,
        password: req.body.password
    }
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
    Object.defineProperty(user, 'hash', {value: hash})
        createUser(user)
});});
})

// ver productos para ahcer pedido

app.get('/products' , (req, res) =>{
    getProductsList()
    res.status(200)
}
)
 
// hacer pedido
// ver si order es uno solo o varias propiedades
let orderId = 1
app.post('/users/:id/order', (req, res) =>{
    const order = {
        userId: req.params.id,
        order: req.body.order,
        totalPrice: req.body.totalPrice,
        payment: req.body.payment
    }
    makeAnOrder(order)
    res.status(201).send('Recibimos tu pedido')
    // order puede ser un array?
})

// seguir pedido
app.get('/users/:id/order', (req, res)=>{
    const order ={
        userId: req.params.id
    }
    getOrderState(order)
    res.status(201).json()

})

//admin
//lista de pedidos
app.get('/orders', (req, res) => {
    getOrdersList(ASC)
})


// cargar producto
app.post('/products', (req, res)=>{
    const product = {
        name: req.body.name,
        price: req.body.price
    }
    addNewProduct(product)
    
})

// eliminar producto
app.delete('/products', (req, res) =>{
    const product = {
        name: req.body.name,
        price: req.body.price
    }
    deleteProduct(product)
})

// ver un pedido
app.get('/orders/:id', (req, res)=>{
    const order ={
        id: req.params.id
    }
    seeOrder(order)
    res.status(201).json()
    
})

// cambiar estado de un pedido
app.put('/orders/:id', (req, res)=>{
    const state ={
        stateId : req.body.stateId,
        orderId : req.params.id
    }
    // como poner condicion por i order id no existe
    changeOrderState(state)
    res.status(201).end()
})

// cancelar un pedido
app.delete('/orders/:id', (req, res)=>{
    const order ={
        id: req.params.id
    }
    cancelOrder(order)
    res.status(201).json()

})

app.listen(3000, () => console.log("server started"))

app.use((err, req, res, next) => {
    console.log(err);
    res.status(400).end();
})



