/*if (process.env.NODE_ENV !== 'production') {
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

  
  var max;
  var tempUserId;
  var tempUserName;
  var tempUserEmail;
  var tempUserPassword;
  findHighestId(async function(result){
  	  max = result;
  	for (let i = 0; i < max; i++) {
  		tempUserId = await populateUsersID(i);
  		
  		tempUserName = await populateUsersName(i);
  		
  		tempUserEmail = await populateUsersEmailAddress(i);

  		tempUserPassword = await populateUsersPassword(i);
  		users.push({
  			id: tempUserId,
	  	    name: tempUserName,
	  	    email: tempUserEmail,
	  	    password: tempUserPassword
  		})
  		//console.log(users[i]);
  	  }
  });

async function sendEmail(recipients, subject, body) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, 
        auth: {
            user: 'softwarestudio1b@gmail.com', 
            pass: 'Sasuke12345!' 
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"No reply" <ayushdallakoti18@gmail.com>', // sender address
        to: recipients, // list of receivers
        subject: subject, // Subject line
        text: body // plain text body
        //html: '<b>Your email has been verified</b>' // html body
    });

    console.log('Message sent to: ' + recipients);
}

function generatePassword(length) {
  return Math.random().toString(36).replace(/[^a-z0-9]+/g, '').substr(2, length);
}

function handle_database(req,res) {
    // connection will be acquired automatically
    pool.query("select * from user", function(err,rows){
     if(err) {
         return res.json({'error': true, 'message': 'Error occurred'+err});
     }
             //connection will be released as well.
             res.json(rows);
    });
}

//add rows in the table
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

function getAllItems() {
  return new Promise(function(resolve, reject) {
    let selectQuery = "SELECT Name AS 'name', ID AS 'sku', RetailPrice AS 'price', Description AS 'description' FROM ??";    
    let query = mysql.format(selectQuery,["item"]);
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

function addItemToDatabase(data) {

  var numberOfFields = data.fieldValue.length;
  
  let insertQuery = 'INSERT INTO item (Name, Description, CostPrice, RetailPrice, Quantity, SellerID, ImagePath) VALUES (?,?,?,?,?,?,?)'
  
  var query;
  
  query = mysql.format(insertQuery, [data.fieldValue[0], data.fieldValue[1], 0.00, data.fieldValue[2], data.fieldValue[3], 1, "'nope'"]);
  
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

async function f() {
  let results = await getAllItems();
  console.log(results);
}*/

function sum(a,b) {
    return a+b;
}

function multiply(a,b) {
    return a*b;
}

module.exports = function() { 
    this.sum = sum;
    this.multiply = multiply;
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

