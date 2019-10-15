if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  
  'use strict';
  const nodemailer = require('nodemailer');
  var createError = require('http-errors');
  var express = require('express');
  var path = require('path');
  var cookieParser = require('cookie-parser');
  var logger = require('morgan');
  var cors = require('cors');
  var indexRouter = require('./routes/index');
  var usersRouter = require('./routes/users');
  var testAPIRouter = require('./routes/testAPI');
  const ejs = require('ejs');
  const paypal = require('paypal-rest-sdk');
  const app = express()
  const bcrypt = require('bcrypt')
  const passport = require('passport')
  const flash = require('express-flash')
  const session = require('express-session')
  const methodOverride = require('method-override')
  const bodyParser = require("body-parser");

  var mysql = require('mysql');
// const pool = mysql.createPool({
// 	connectionLimit : 100,
// 	host : 'localhost',
// 	database : 'test',
// 	user : 'root',
// 	password : 'pass123',
// 	debug : false
// });

const pool = mysql.createPool({
	connectionLimit : 100,
	host : 'leenet.net.au',
	database : 'test',
	user : 'admin',
	password : 'password',
	port : "3360",
	debug : false
});
  
  const initializePassport = require('./passport-config')

function registerUserAddRow(data) {
    var numberOfFields = data.fieldValue.length;

    let insertQuery = 'INSERT INTO ?? (??,??,??,??) VALUES (?,?,?,?)'

    var query;

    query = mysql.format(insertQuery,["user","ID","Name","EmailAddress","Password",data.fieldValue[0],data.fieldValue[1],data.fieldValue[2],data.fieldValue[3]]);

    console.log(query);

    pool.query(query,(err, response) => {
        if(err) {
            console.error(err);
            return;
        }
        // rows added
        console.log(response.insertId);
    });
}
//update rows
function updateUserPassword(data) {
  let updateQuery = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
  let query = mysql.format(updateQuery,["user","Password",data.Password,"EmailAddress",data.EmailAddress]);
  // query = UPDATE `user` SET `EmailAddress`='12875822@student.uts.edu.au' WHERE `Name`='Matt'
  pool.query(query,(err, response) => {
      if(err) {
          console.error(err);
          return;
      }
      // rows updated
      console.log(response.affectedRows);
  });
}

//query rows in the table
function findUserByEmail(emailAddress, callback) {
	  let selectQuery = 'SELECT * FROM ?? WHERE ?? = ? LIMIT 1';    
	  let query = mysql.format(selectQuery,["user","EmailAddress", emailAddress]);
	  // query = SELECT * FROM `user` where `EmailAddress` = '12875833@student.uts.edu.au'
	  pool.query(query,(err, data) => {
	      if(err) {
	          console.error(err);
	          return;
	      }
	      // rows fetch
	      return callback(data[0].EmailAddress);
	  });
	}

//query rows in the table
function findUserIdByEmail(emailAddress, callback) {
    let selectQuery = 'SELECT * FROM ?? WHERE ?? = ? LIMIT 1';    
    let query = mysql.format(selectQuery,["user","EmailAddress", emailAddress]);
    // query = SELECT * FROM `user` where `EmailAddress` = '12875833@student.uts.edu.au'
    pool.query(query,(err, data) => {
        if(err) {
            console.error(err);
            return;
        }
        // rows fetch
        return callback(data[0].ID);
    });
}

function findHighestId(callback) {
    let selectQuery = 'SELECT ?? FROM ?? ORDER BY ?? DESC LIMIT 1';    
    let query = mysql.format(selectQuery,["ID","user","ID"]);
    pool.query(query,(err, data) => {
        if(err) {
            console.error(err);
            return;
        }
        return callback(data[0].ID);
    });
}

function findPasswordById(id, callback) {
	let selectQuery = 'SELECT * FROM ?? WHERE ?? = ? LIMIT 1';
	let query = mysql.format(selectQuery,["user","ID", id]);
	pool.query(query,(err, data) => {
        if(err) {
            console.error(err);
            return;
        }
        // rows fetch
        return callback(data[0].Password);
    });
}

async function populateUserIdWrapper(index) {
	await populateUsersID(index);
}

function populateUsersID(index) {
	return new Promise(function (resolve, reject) {
	let selectQuery = 'SELECT * FROM ??';
	let query = mysql.format(selectQuery,["user"]);
	pool.query(query,(err, data) => {
	      if(err) {
	          console.error(err);
	          reject(err);
	          return;
	      }
	      // rows fetch
	      resolve(data[index].ID);
	  });
	});
}

async function populateUserNameWrapper(index) {
	return (await populateUsersName(index));
}

function populateUsersName(index) {
	return new Promise(function (resolve, reject) {
	let selectQuery = 'SELECT * FROM ??';
	let query = mysql.format(selectQuery,["user"]);
	pool.query(query,(err, data) => {
	      if(err) {
	          console.error(err);
	          reject(err);
	          return;
	      }
	      // rows fetch
	      resolve(data[index].Name);
	  });
	});
}

async function populateUserEmailAddressWrapper(index) {
	return (await populateUsersEmailAddress(index));
}

function populateUsersEmailAddress(index) {
	return new Promise(function (resolve, reject) {
	let selectQuery = 'SELECT * FROM ??';
	let query = mysql.format(selectQuery,["user"]);
	pool.query(query,(err, data) => {
	      if(err) {
	          console.error(err);
	          reject(err);
	          return;
	      }
	      // rows fetch
	      resolve(data[index].EmailAddress);
	  });
	});
}

async function populateUserPasswordWrapper(index) {
	return (await populateUsersPassword(index));
}

function populateUsersPassword(index) {
	return new Promise(function (resolve, reject) {
	let selectQuery = 'SELECT * FROM ??';
	let query = mysql.format(selectQuery,["user"]);
	pool.query(query,(err, data) => {
	      if(err) {
	          console.error(err);
	          reject(err);
	          return;
	      }
	      // rows fetch
	      resolve(data[index].Password);
	  });
	});
}
/*
async function f() {
  let results = await getAllItems();
  console.log(results);
}*/

function addItemToDatabase(data) {

    var numberOfFields = data.fieldValue.length;

    let insertQuery = 'INSERT INTO item (Name, Description, CostPrice, RetailPrice, Quantity, SellerID, ImagePath) VALUES (?,?,?,?,?,?,?)'

    var query;

    query = mysql.format(insertQuery, [data.fieldValue[0], data.fieldValue[1], 0.00, data.fieldValue[2], data.fieldValue[3], data.fieldValue[4], "'nope'"]);

    //console.log(query);

    pool.query(query,(err, response) => {
        if(err) {
            console.error(err);
            return;
        }
        // rows added
        console.log(response.insertId);
    });
}

function addSellerToDatabase(data) {

    let insertQuery = 'INSERT INTO seller (UserID, SellerName) VALUES (?,?)'

    var query = mysql.format(insertQuery, [data.ID, data.sellerName]);

    console.log(query);

    pool.query(query,(err, response) => {
        if(err) {
            console.error(err);
            return;
        }
        // rows added
        console.log(response.insertId);
    });
}
function addTransactionToDatabase(data) {
    return new Promise(function(resolve, reject) {
        let insertQuery = 'INSERT INTO transaction (BuyerID, ItemID) VALUES (?,?)'

        var query = mysql.format(insertQuery, [data.UserID, data.ItemID]);

        pool.query(query,(err, response) => {
            if(err) {
                console.error(err);
                reject(err);
                return;
            }
            // rows added
            resolve(response.insertId);
        });
    });
}

function deleteItem(sku){
    return new Promise(function(resolve, reject) {
        let query = "DELETE FROM item WHERE ID = ?";
        query = mysql.format(query, [sku]);
        pool.query(query,(err, data) =>{
        if(err) {
            console.error(err);
            reject(err);
            return;
        }
        resolve(data);
        });
    });
}

function getAllItems() {
    return new Promise(function(resolve, reject) {
      let selectQuery = "SELECT Name AS 'name', it.ID AS 'sku', RetailPrice AS 'price', Description AS 'description', SellerID as 'sellerID' ";
      selectQuery += "FROM ?? as it LEFT JOIN ?? as tr ON it.ID = tr.ItemID ";
      selectQuery += "GROUP BY it.ID, it.Name, it.RetailPrice, it.Description, it.SellerID ";
      selectQuery += "ORDER BY COUNT(it.ID) DESC";
      let query = mysql.format(selectQuery,["item", "transaction"]);
      // query = SELECT * FROM `user` where `EmailAddress` = '12875833@student.uts.edu.au'
      pool.query(query,(err, data) => {
          if(err) {
              console.error(err);
              reject(err);
              return;
          }
          // rows fetch
          //console.log(data);
          resolve(data);
      });
    });
}

function getItemsWithName(data) {
    return new Promise(function(resolve, reject) {
      let selectQuery = "SELECT Name AS 'name', it.ID AS 'sku', RetailPrice AS 'price', Description AS 'description', SellerID as 'sellerID' "
      selectQuery += "FROM ?? as it LEFT JOIN ?? as tr ON it.ID = tr.ItemID "
      selectQuery += "WHERE Name like ? OR RetailPrice like ? OR Description like ? ";    
      selectQuery += "GROUP BY it.ID, it.Name, it.RetailPrice, it.Description, it.SellerID ";
      selectQuery += "ORDER BY COUNT(it.ID) DESC";
      let value = ("%" + data.searchCritera + "%");
      let query = mysql.format(selectQuery,["item", "transaction", value, value, value]);
      pool.query(query,(err, data) => {
          if(err) {
              console.error(err);
              reject(err);
              return;
          }
          // rows fetch
          //console.log(data);
          resolve(data);
      });
    });
}

function updateUserPassword(data) {
    return new Promise(function(resolve, reject) {
        let updateQuery = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
        let query = mysql.format(updateQuery,["user","Password", data.Password,"EmailAddress", data.EmailAddress]);
        // query = UPDATE `user` SET `EmailAddress`='12875822@student.uts.edu.au' WHERE `Name`='Matt'
        pool.query(query,(err, response) => {
            if(err) {
                console.error(err);
                reject(err);
                return;
            }
            // rows updated
            //console.log(response.affectedRows);
            resolve(response.affectedRows);
        });
    });
}

function doesSellerExist(data) {
    return new Promise(function(resolve, reject) {
        let insertQuery = 'SELECT COUNT(*) as ? FROM seller WHERE UserID = ?'
        let query = mysql.format(insertQuery, ["temp", data.ID]);

        pool.query(query,(err, data) => {
            if(err) {
                console.error(err);
                reject(err);
                return;
            }
            // rows added
            resolve(data[0].temp);
        });
    });
}

function countUsersWithEmail(data) {
    return new Promise(function(resolve, reject) {
        let insertQuery = 'SELECT COUNT(EmailAddress) as ? FROM user WHERE EmailAddress = ?'
        let query = mysql.format(insertQuery, ["count", data.Email]);

        pool.query(query,(err, data) => {
            if(err) {
                console.error(err);
                reject(err);
                return;
            }
            // rows added
            resolve(data[0].count);
        });
    });
}

module.exports = function() {
    this.addItemToDatabase = addItemToDatabase;
    this.deleteItem = deleteItem;
    this.getAllItems = getAllItems;
    this.getItemsWithName = getItemsWithName;
    this.addSellerToDatabase = addSellerToDatabase;
    this.addTransactionToDatabase = addTransactionToDatabase;
    this.doesSellerExist = doesSellerExist;
    this.countUsersWithEmail = countUsersWithEmail;
    this.updateUserPassword = updateUserPassword;
    this.populateUsersID = populateUsersID;
    this.populateUsersName = populateUsersName;
    this.populateUsersEmailAddress = populateUsersEmailAddress;
    this.populateUsersPassword = populateUsersPassword;
    this.updateUserPassword = updateUserPassword;
    this.findUserByEmail = findUserByEmail;
    this.findUserIdByEmail = findUserIdByEmail;
    this.findHighestId = findHighestId;
    this.findPasswordById = findPasswordById;
    this.registerUserAddRow = registerUserAddRow;
}

// for(let i = 0; i < 20; i++)
// {
//   deleteItem(i);
// }

//getAllItems().then(data => {console.log("getAllItems:", data);});
//f();
//addItemToDatabase({'fieldValue': ["testing", "its a test product", 101.00, 25]});

//console.log(findUserById(1));

//console.log("Random Password:", generatePassword(10));

