"use strict";

var _require = require("sequelize"),
    Sequelize = _require.Sequelize,
    where = _require.where;

var _require2 = require("sequelize"),
    QueryTypes = _require2.QueryTypes;

var db = new Sequelize("delilahresto", "root", "", {
  host: "localhost",
  port: 3306,
  dialect: "mysql"
});

function alreadyExist(req, res, next) {
  var alreadyExist;
  return regeneratorRuntime.async(function alreadyExist$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(db.query("SELECT * FROM users WHERE (user = :user) OR (email = :email)", {
            type: QueryTypes.SELECT,
            replacements: req.body
          }));

        case 2:
          alreadyExist = _context.sent;
          console.log(alreadyExist);

          if (Object.entries(alreadyExist) != 0) {
            res.status(400).end();
          } else {
            next();
          }

        case 5:
        case "end":
          return _context.stop();
      }
    }
  });
}

function createUser(user) {
  var inserted;
  return regeneratorRuntime.async(function createUser$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(db.query("\n    INSERT INTO users (user, fullName, email, telephone, address, password)\n    VALUES (:user, :fullName, :email, :telephone, :address, :password)\n    ", {
            replacements: user,
            type: QueryTypes.INSERT
          }));

        case 2:
          inserted = _context2.sent;
          console.table(inserted);

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
}

function getProductsList() {
  var products;
  return regeneratorRuntime.async(function getProductsList$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(db.query("\n    SELECT name, price from products", {
            type: QueryTypes.SELECT
          }));

        case 2:
          products = _context3.sent;
          console.table(products);

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
}

module.exports = {
  createUser: createUser,
  alreadyExist: alreadyExist,
  getProductsList: getProductsList
};