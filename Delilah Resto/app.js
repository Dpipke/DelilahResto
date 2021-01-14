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
const {validateUserAccess} = require(`./database`)
const {changeOrderState} = require(`./database`)
const {makeAnOrder} = require(`./database`)
const {seeProduct} = require(`./database`)
const {updateProduct} = require(`./database`)
const {updateOrderInformation} = require(`./database`)

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
    const user = await getUser(loginRequest)
    if(user.length === 0){
        res.status(400).send("invalid user or password")
    }else{
    const objectUser = user[0]
    const objectPassword = objectUser.password
    console.log(objectPassword)
    console.log(passwordRequest)
    bcrypt.compare(passwordRequest, objectPassword, async function(err, result) {
        if (result) {
            const userToken = jwt.sign({user}, authorizationPassword)
            console.log(userToken)
            res.status(200).json(userToken)
        }
        else {
            res.status(400).send("invalid user or password")
        }
    });

}});

app.use(verifyToken);

// crear usuario
app.post('/signup', limiter, alreadyExist, (req, res) =>{
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
        res.status(200).send("user created")
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
        id: +req.params.id
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
app.post('/orders', (req, res) =>{
    const token = req.headers.authorization.split(' ')[1];
    const user = jwt.verify(token, authorizationPassword);
    const userId = user.user[0].id
    const order = {
        total_payment: req.body.total_payment,
        payment: req.body.payment,
        productsList : req.body.productsList,
        deliveryAddress: req.body.deliveryAddress
    }

    makeAnOrder(userId,order)
    res.status(201).send('Recibimos tu pedido')
})


//admin
//lista de pedidos
app.get('/orders', filterAdmin, async (req, res) => {
    const ordersList = await getOrdersList("ASC")
    res.status(200).send(ordersList)
})


// cargar producto
app.post('/products', filterAdmin, async (req, res)=>{
    const product = {
        name: req.body.name,
        price: req.body.price,
        product_description: req.body.product_description
    }
    const newProduct = await addNewProduct(product)
    res.status(200).send(newProduct)
    
})

// actualizar un producot
app.put('/products/:id', filterAdmin, (req, res)=>{
    const product = {
        id: req.params.id,
        product_description: req.body.product_description,
        price: req.body.price
    }
    console.log(product)
    const updatedProduct = updateProduct(product)
    res.status(200).send(updatedProduct)

})


// eliminar producto
app.delete('/products',filterAdmin, (req, res) =>{
    const product = {
        id: req.body.id,
    }
    deleteProduct(product)
    res.status(200).send("Producto eliminado")
})

// ver un pedido
app.get('/orders/:id', validatePermission, async (req, res)=>{
    const orderParameters ={
        id: +req.params.id
    }
    const order = await seeOrder(orderParameters)
    res.status(201).send(order)
    
})

// cambiar  pedido
app.put('/orders/:id', validatePermission, (req, res)=>{
    const token = req.headers.authorization.split(' ')[1];
    const user = jwt.verify(token, authorizationPassword);
    const adminPrivilege = user.user[0].admin
    if(adminPrivilege === 1){
        const state ={
            stateId : req.body.stateId,
            orderId : req.params.id
        }
        changeOrderState(state)
        res.status(200).end()
    }else{
        const orderToModify ={
            orderId : req.params.id,
            payment : req.body.payment,
            total_payment : req.body.total_payment,
            productsList : req.body.productsList

        }
        updateOrderInformation(orderToModify)
        res.status(200).end()
    }
    
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


function filterAdmin(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];
    const user = jwt.verify(token, authorizationPassword);
    const adminPrivilege = user.user[0].admin
    console.log(adminPrivilege);
    if(adminPrivilege === 1 ) {
        next();
    } else {
        res.status(403).end();
    }
}

async function validatePermission(req, res, next){
    console.log("hola")
    const token = req.headers.authorization.split(' ')[1];
    const user = jwt.verify(token, authorizationPassword);
    const userToCheck = user.user[0].id
    const adminPrivilege = user.user[0].admin
    console.log(userToCheck)
    const orderId = req.params.id
    const validateUser = await validateUserAccess(userToCheck, orderId)
    console.log(validateUser.length)
    if(adminPrivilege === 1){
        next();
    }if(validateUser.length === 0){
        res.status(403).send('forbidden access')
    }else{
        next()
    }
}

// async function validateInformationProvided(req, res, next){
//     console.log(req.body)
//     console.log(typeof req.body.user)
//     if(req.body.user !== "string" || req.body.user === null){
//         res.status(400).send("Campo obligatorio. Debe ser una combinacion de letras y numeros")
//     }if(req.body.fullName !== "string" || req.body.fullName === null){
//         res.status(400).send("Campo obligatorio. Debe ser su nombre real")
//     }if(req.body.email.includes("@") === false || req.body.email === null){
//         res.status(400).send("Email invalido")
//     }if(isNan(req.body.telephone) === false || req.body.telephone === null){
//         res.status(400).send("Telefono invalido")
//     }
// }

app.use((err, req, res, next) => {
    console.log("Error");
    res.status(400).end();
})
