const app = require('express')();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require("body-parser");

// ver si esto va aca o en otro archivo, quizas va aparte y se exportan las funciones

const {createUser} = require(`./database`)
const {alreadyExist} = require(`./database`)
const {getProductsList} = require(`./database`)
const {validateUser} = require(`./database`)
const {getOrdersList} = require(`./database`)
const {addNewProduct} = require(`./database`)
const {deleteProduct} = require(`./database`)
const {seeOrder} = require(`./database`)
const {cancelOrder} = require(`./database`)



app.use(bodyParser.json())
app.use(helmet())

const limiter = rateLimit({
    windowMs: 60*60*1000,
    max: 5
})

// user
// login
app.post('/users/login', validateUser, limiter, (req, res) =>{
    const user ={
        user: req.body.user,
        password: req.body.password
    }

})

// crear usuario
app.post('/users/signup', alreadyExist, limiter, (req, res) =>{
    const user ={
        user: req.body.user,
        fullName: req.body.fullName,
        email: req.body.email,
        telephone: req.body.telephone,
        address: req.body.address,
        password: req.body.password
    }
    createUser(user)
    console.log(user)
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
app.post('/users/{id}/order', (req, res) =>{
    const order = {
        userId: req.params.id,
        order: req.body.order,
        orderId: orderId++
    }
    // mandarlo a pedidos
})

// seguir pedido
app.get('/users/{id}/order')

//admin
//lista de pedidos
app.get('/admin/orders', (req, res) => {
    getOrdersList()
})


// cargar producto
app.post('/admin/products', (req, res)=>{
    const product = {
        name: req.body.name,
        price: req.body.price
    }
    addNewProduct(product)
    
})

// eliminar producto
app.delete('/admin/products', (req, res) =>{
    const product = {
        name: req.body.name,
        price: req.body.price
    }
    deleteProduct(product)
})

// ver un pedido
app.get('admin/orders/:id', (req, res)=>{
    seeOrder()

})
// cancelar un pedido
app.delete('admin/orders/:id', (req, res)=>{
    cancelOrder()

})
app.listen(3000, () => console.log("server started"))

app.use((err, req, res, next) => {
    console.log(`error`);
    res.status(400).end();
})



