const app = require('express')();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require("body-parser");

// ver si esto va aca o en otro archivo, quizas va aparte y se exportan las funciones

const {createUser} = require(`./database`)
const {alreadyExist} = require(`./database`)

app.use(bodyParser.json())
app.use(helmet())

const limiter = rateLimit({
    windowMs: 60*60*1000,
    max: 5
})

// user
// login
// app.post('/users/login', validateUser, limiter, (req, res) =>{
//     const user ={
//         user: req.body.user,
//         email: req.body.email,
//         password: req.body.password
//     }

// })

// const validateUser= (req, res, next) => {
//     if (users.some((user => user.user === req.body.user || user.email === req.body.email) && user.password === req.body.password)) 
//         next()
//     // if () 
//     //     res.status(400).end();
//     // else res.status(404).end();
    
// }

// crear usuario
// chequear si esta bien que aca vaya un next


app.post('/users/signup', (req, res) =>{
    const user ={
        user: req.body.user,
        fullName: req.body.fullName,
        email: req.body.email,
        telephone: req.body.telephone,
        address: req.body.address,
        password: req.body.password
    }
    alreadyExist(user, req, res)
    createUser(user)
    console.log(user)
})
 
// hacer pedido
// ver si order es uno solo o varias propiedades
let orderId = 1
app.post('users/{id}/order', (req, res) =>{
    const order = {
        userId: req.params.id,
        order: req.body.order,
        orderId: orderId++
    }
    // mandarlo a pedidos
})

// seguir pedido
app.get('users/{id}/order')


app.listen(3000, () => console.log("server started"))

app.use((err, req, res, next) => {
    console.log(`error`);
    res.status(400).end();
})



