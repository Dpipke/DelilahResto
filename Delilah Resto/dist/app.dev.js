"use strict";

var app = require('express')();

var helmet = require('helmet');

var rateLimit = require('express-rate-limit');

var bodyParser = require("body-parser"); // ver si esto va aca o en otro archivo, quizas va aparte y se exportan las funciones


var _require = require("sequelize"),
    QueryTypes = _require.QueryTypes;

var _require2 = require("./database"),
    db = _require2.db;

app.use(bodyParser.json());
app.use(helmet());
var limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5
}); // user
// login

app.post('/users/login', validateUser, limiter, function (req, res) {
  var user = {
    user: req.body.user,
    email: req.body.email,
    password: req.body.password
  };
});

var validateUser = function validateUser(req, res, next) {
  if (users.some(function (user) {
    return user.user === req.body.user || user.email === req.body.email;
  } && user.password === req.body.password)) next(); // if () 
  //     res.status(400).end();
  // else res.status(404).end();
}; // crear usuario
// chequear si esta bien que aca vaya un next


app.post('/users/signup', function (req, res, next) {
  var user = {
    user: req.body.user,
    fullName: req.body.fullName,
    email: req.body.email,
    telephone: req.body.telephone,
    address: req.body.address,
    password: req.body.password
  }; // por que no me reconoce el db de arriba?

  db.createUser(user);
}); // hacer pedido
// ver si order es uno solo o varias propiedades

var orderId = 1;
app.post('users/{id}/order', function (req, res) {
  var order = {
    userId: req.params.id,
    order: req.body.order,
    orderId: orderId++
  }; // mandarlo a pedidos
}); // seguir pedido

app.get('users/{id}/order');
app.listen(3000, function () {
  return console.log("server started");
});