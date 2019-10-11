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
/*const pool = mysql.createPool({
	connectionLimit : 100,
	host : 'localhost',
	database : 'test',
	user : 'root',
	password : 'pass123',
	debug : false
});*/

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
  initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  )
  
  const port = 9000;
  const users = [];
  
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

  
  app.set('views', path.join(__dirname, 'views'));
  app.set('view-engine', 'ejs')
  app.set('view engine', 'ejs');
  app.use(express.urlencoded({ extended: false }))
  app.use(flash())
  app.use(cors());
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(methodOverride('_method'))
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  
  app.get('/list', (req, res) => {
    res.json(['one', 'two', 'three']);
  });

  app.get('/test', (req, res) => {
    res.render('test.ejs', {testdata: 900});
  });
  
  app.post('/test', (req, res) => {
    console.log(req.body);
  });

  app.get('/adding', (req, res) => {
    res.render('adding.ejs');
  });
  
  app.post('/adding', (req, res) => {
    console.log(req.body.name);
    console.log(req.body.price);
    console.log(req.body.description);
    if(req.body.name.length > 0 && req.body.price.length > 0 && req.body.description.length > 0){
      addItemToDatabase({'fieldValue': [req.body.name, req.body.description, req.body.price, 100]});
    }
    else{
      console.log("Not all fields have been filled.");
    }
    res.render('adding.ejs');
  });
  
  app.all('/', checkAuthenticated, async (req, res) => {
    //Add products in here to add to the catalogue page
    let products = [
      {
        name: "intel i5",
        sku: '001',
        price: '299.00',
        description: "intel dual core i5 8th gen processor"
      },
      {
        name: "test 2",
        sku: '002',
        price: '95.00',
        description: "this is a test description"
      },
      {
        name: "test 3",
        sku: '003',
        price: '10.00',
        description: "this is a test 3 description"
      },
    ]
    products = await getAllItems();
    res.render('index.ejs', { name: req.user.name, items: products })
  })

  app.post('/list', (req, res) => {
    console.log(req.body);
    res.send("Success your POST requested contained: " + JSON.stringify(req.body));
  })
  
  app.post('/template', (req, res) => {
    let string = ("Your request was successfully recieved.\n\n" + 
                  "Sender/Referrer:      " + req.headers.referer +"\n" + 
                  "Request Method/Type:  " + req.method + "\n" +
                  "Destination:          " + req.headers.host + req.url + "\n\n" +
                  "Body: " + JSON.stringify(req.body));
    console.log(string);
    res.send(string);
    //res.redirect('back');
  })

  app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
  })
  
  app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
    })
  )

  app.post('/api/login', checkNotAuthenticatedAPI, (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: req.headers.origin + '/product',
      failureRedirect: req.headers.origin,
      failureFlash: true
    })(req, res, next);
  })
  
  app.get('/register', checkNotAuthenticatedAPI, (req, res) => {
    res.render('register.ejs')
  })
  
  app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      var idVar;
      findHighestId(function(result){
    	  idVar = result;
      });
      var nameVar = req.body.name;
      var emailVar = req.body.email;
      var passwordVar = hashedPassword;
      users.push({
        id: idVar,
        name: nameVar,
        email: emailVar,
        password: passwordVar
      })
      
      //Insert query call
      setTimeout(() => {
      //call the function
    	registerUserAddRow({
    	  "fieldValue": [idVar+1,nameVar,emailVar,passwordVar]
    	});
      },5000);
      sendEmail(req.body.email, 'Module Email', 'yo').catch(console.error);
      res.redirect('/login')
    } catch {
      res.redirect('/register')
    }
  })

  app.post('/api/register', checkNotAuthenticatedAPI, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      var idVar;
      findHighestId(function(result){
    	  idVar = result;
      });
      var nameVar = req.body.name;
      var emailVar = req.body.email;
      var passwordVar = hashedPassword;
      users.push({
        id: idVar,
        name: nameVar,
        email: emailVar,
        password: passwordVar
      })
      // console.log(JSON.stringify({
      //   id: idVar,
      //   name: nameVar,
      //   email: emailVar,
      //   password: passwordVar
      // }));
      
      //Insert query call
      setTimeout(() => {
      //call the function
    	registerUserAddRow({
    	  "fieldValue": [idVar+1,nameVar,emailVar,passwordVar]
    	});
      },5000);
      sendEmail(req.body.email, 'Module Email', 'yo').catch(console.error);
      res.redirect(req.headers.origin + '/login');
    } catch {
      res.redirect(req.headers.referer);
    }
  })
  
  app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
  })

  app.all('/delete', (req, res) => {
    var sku = req.body.sku;
    var name = req.body.name;
    console.log("Deleteing item: " + name);
    deleteItem(sku);
    res.redirect('/')
  })
  
  app.post('/api/logout', (req, res) => {
    req.logOut();
    res.redirect(req.headers.origin);
  })
  
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }
  
  function checkAuthenticatedAPI(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('http://localhost:3000/login')
  }
  
  function checkNotAuthenticatedAPI(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('http://localhost:3000/product')
    }
    next()
  }

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AYrqSddTaoMoT0YNT_g45A1D03qeu37-NEUS2CyIx6ZTqxi4nFnsScO7sagv63vr1xVLpjEL-EiV0_OX',
  'client_secret': 'EBLPCMU4LF5SzH5rUEZkYT3tZBSyL5b3eUFwvjClSJTA8HzKKJTSKguRBlKkNphMbDjIueMeLbepNeSa'
});

app.post('/pay', (req, res) => {

  var price = req.body.price;
  var sku = req.body.sku;
  var name = req.body.name;
  var description = req.body.description;
  console.log(req.body);

  const create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3000/success",
      "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": name,
          "sku": sku,
          "price": '0.00',
          "currency": "AUD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "AUD",
        "total": price
      },
        "description": description
    }]
  };
  
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
    }
  });

});
  
  app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const payment = req.query.payment;
    
    const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "AUD",
            "total": "299.00"
        }
    }]
  };
  
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.render('success', { payerId, paymentId, payment});
    }
  });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));
  
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
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

app.get("/",function(req,res){-
     handle_database(req,res);
});

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

exports = app;

async function f() {
  let results = await getAllItems();
  console.log(results);
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

app.listen(port, () => console.log("Server Started. \nOpen localhost:" + port + " in your browser to view the page.\nListening on Port: " + port + "\nPress Ctrl + C to stop the server.\n"));