const app = require('express')();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();

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
const {seeProduct} = require(`./database`)
const {updateProduct} = require(`./database`)
const {isAdmin} = require(`./database`)


app.use(bodyParser.json())
app.use(helmet())

const authorizationPassword = process.env.AuthPassword;

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
app.post('/login', limiter, async (req, res) =>{
    const loginRequest ={
        user: req.body.user,
    }
    const passwordRequest = req.body.password
    const username = await getUser(loginRequest)
    const objectUserName = username[0]
    const arrayUserName = Object.values(objectUserName).toString()
    console.log(arrayUserName)
    console.log(passwordRequest)
    bcrypt.compare(passwordRequest, arrayUserName, async function(err, result) {
        if (result) {
            const adminPrivilege = await isAdmin(loginRequest)
            const adminPrivilegeObject = adminPrivilege[0]
            const adminPrivilegeArray = Object.values(adminPrivilegeObject).toString()
            console.log(adminPrivilegeArray)
            const userToken = jwt.sign({loginRequest, adminPrivilegeArray}, authorizationPassword)
            console.log(userToken)
            res.status(201).json(userToken)
        }
        else {
            res.status(400).send("Invalid password")
        }
    });

});

app.use(verifyToken);

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
        res.status(200)
});});
})

// ver productos para ahcer pedido

app.get('/products' , (req, res) =>{
    getProductsList()
    res.status(200)
}
)

app.get('/products/:id', (req, res)=>{
    const product = {
        id: req.params.id
    }
    seeProduct(product) 
        if (seeProduct(product) === "") {
            res.status(400).send("Product not found")
        }
        else {
            res.status(200)
        }
    })

    

 
// hacer pedido
// ver si order es uno solo o varias propiedades
app.post('/users/:id/order', (req, res) =>{
    const order = {
        userId: req.params.id,
        totalPrice: req.body.totalPrice,
        payment: req.body.payment,
        productId : req.body.productId
    }

    makeAnOrder(order)
    res.status(201).send('Recibimos tu pedido')
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
app.get('/orders', filterAdmin, (req, res) => {
    getOrdersList("ASC")
})


// cargar producto
app.post('/products', filterAdmin, (req, res)=>{
    const product = {
        name: req.body.name,
        price: req.body.price,
        product_description: req.body.product_description
    }
    addNewProduct(product)
    res.status(200).end()
    
})

// actualizar un producot
app.put('/products/:id', filterAdmin, (req, res)=>{
    const product = {
        id: req.params.id,
        product_description: req.body.product_description,
        price: req.body.price
    }
    console.log(product)
    updateProduct(product)
    res.status(200).end()

})


// eliminar producto
app.delete('/products',filterAdmin, (req, res) =>{
    const product = {
        id: req.body.id,
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
app.put('/orders/:id', filterAdmin, (req, res)=>{
    const state ={
        stateId : req.body.stateId,
        orderId : req.params.id
    }
    // como poner condicion por i order id no existe
    changeOrderState(state)
    res.status(201).end()
})

// cancelar un pedido
app.delete('/orders/:id', filterAdmin, (req, res)=>{
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

function filterAdmin(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];
    const user = jwt.verify(token, authorizationPassword);
    console.log(user);
    if(user.adminPrivilegeArray = "1") {
        next();
    } else {
        res.status(403).end();
    }
}


