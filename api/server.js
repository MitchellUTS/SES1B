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
  require('./database.js')();
  require('./email.js')();

  var amount;
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
  
  const port = 80;
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

  app.get('/products/add', checkAuthenticated, (req, res) => {
    res.render('add.ejs', {message: ""});
  });
  
  app.post('/products/add', checkAuthenticated, (req, res) => {
    //console.log(req.body.name);
    //console.log(req.body.price);
    //console.log(req.body.description);
    let json = {message: "Failed to the product, please fill in all the fields."}
    if(req.body.name.length > 0 && req.body.price.length > 0 && req.body.description.length > 0){
      json = {message: ("You successfully added: " + req.body.name + " to the catalogue." )};
      addItemToDatabase({'fieldValue': [req.body.name, req.body.description, req.body.price, 100, req.user.id]});
    }
    else{
      console.log("Not all fields have been filled.");
    }
    res.render('add.ejs', json);
  });

  app.get('/products', checkAuthenticated, async (req, res) => {
    //Add products in here to add to the catalogue page
    let sellerCount = await doesSellerExist({ID: req.user.id});
    let isSeller = sellerCount > 0;
    let products = await getAllItems();
    res.render('products.ejs', { name: req.user.name, user: req.user.id, items: products, isSeller: isSeller })
  })

  app.post('/products', checkAuthenticated, async (req, res) => {
    let sellerCount = await doesSellerExist({ID: req.user.id});
    let isSeller = sellerCount > 0;
    let products = await getItemsWithName({ searchCritera: req.body.searchCritera });
    res.render('products.ejs', { name: req.user.name, user: req.user.id, items: products, isSeller: isSeller })
  })
  
  app.all('/', checkAuthenticated, (req, res) => {
    //Add products in here to add to the catalogue page
    /*let products = await getAllItems();
    res.render('index.ejs', { name: req.user.name, items: products })*/
    res.redirect("/products");
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

  app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs', {message: ""});
  })
  
  app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      let userCount = await countUsersWithEmail({ Email: req.body.email });
      if (userCount > 0) {
        res.render('register.ejs', {message: ("Unable to register your account, an account already exists with the email: " + req.body.email)});
        return;
      }

      let isSeller = typeof req.body.seller !== 'undefined';
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      var idVar;
      findHighestId(function(result){
    	  idVar = result + 1;
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
    	  "fieldValue": [nameVar,emailVar,passwordVar]
    	});
      },5000);

      if (isSeller) {
        setTimeout(() => {
          //call the function
          addSellerToDatabase({ ID: idVar, sellerName: (nameVar +"'s Store") });
        },5000);
      }

      sendVerificationEmail(req.body.email, req.body.name);
      res.redirect('/login')
    } catch {
      res.render('register.ejs', {message: "Unable to register your account."});
    }
  })


  app.get('/password/change', checkAuthenticated, (req, res) => {
    res.render('passwordchange.ejs', {message: ""});
  })
  
  app.post('/password/change', checkAuthenticated, async (req, res) => {
    try {

      let password = req.body.password;
      
      let hashedPassword = await bcrypt.hash(password, 10);
      let user = users.find(user => user.email === req.user.email);

      user.password = hashedPassword;
      //Insert query call
      setTimeout(() => {
        //call the function
        updateUserPassword({Password: user.password, EmailAddress: user.email});
      },5000);
      sendPasswordChangeEmail(user.email, user.name, req.body.password);
      res.render('passwordchange.ejs', {message: "Successfully changed your password."});
    } catch {
      res.render('passwordchange.ejs', {message: "Unable to change your password."});
    }
  })

  app.get('/password/reset', checkNotAuthenticated, (req, res) => {
    res.render('passwordreset.ejs', {message: ""});
  })
  
  app.post('/password/reset', checkNotAuthenticated, async (req, res) => {
    try {
      let password = generatePassword(6);
      
      let hashedPassword = await bcrypt.hash(password, 10);
      let user = users.find(user => user.email === req.body.email);

      user.password = hashedPassword;
      //Insert query call
      setTimeout(() => {
        //call the function
        updateUserPassword({Password: user.password, EmailAddress: user.email});
      },5000);
      sendPasswordResetEmail(user.email, user.name, password);
      res.render('passwordreset.ejs', {message: ("Successfully reset the password of: " + user.email)});
    } catch {
      res.render('passwordreset.ejs', {message: ("Unable to reset the password of: " + req.body.email)});
    }
  })
  
  app.all('/logout', checkAuthenticated, (req, res) => {
    req.logOut();
    res.redirect('/login');
  })

  app.post('/delete', checkAuthenticated, (req, res) => {
    let sku = req.body.sku;
    let name = req.body.name;
    console.log("Deleteing item: " + name);
    deleteItem(sku);
    res.redirect('/products');
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
  
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AYrqSddTaoMoT0YNT_g45A1D03qeu37-NEUS2CyIx6ZTqxi4nFnsScO7sagv63vr1xVLpjEL-EiV0_OX',
  'client_secret': 'EBLPCMU4LF5SzH5rUEZkYT3tZBSyL5b3eUFwvjClSJTA8HzKKJTSKguRBlKkNphMbDjIueMeLbepNeSa'
});

app.post('/pay', checkAuthenticated, (req, res) => {

  var price = req.body.price;
  var sku = req.body.sku;
  var name = req.body.name;
  var description = req.body.description;


  //console.log(req.body);

  amount = {"currency": "AUD", "total": price };

  const create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:" + port + "/success",
      "cancel_url": "http://localhost:" + port + "/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": name,
          "sku": sku,
          "price": price,
          "currency": "AUD",
          "quantity": 1
        }]
      },
      "amount": amount,
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
        "amount": amount
    }]
  };
  
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        res.render('error.ejs');
        //throw error;
    } else {
        //console.log(payment.transactions);
        let items = payment.transactions[0].item_list.items;
        if (payment.state === "approved") {
          for (let i = 0; i < items.length; i++)  {
              addTransactionToDatabase({UserID: req.user.id, ItemID: items[i].sku});
          }
        }
        
        res.render('success', { payerId: payerId, paymentId: paymentId, payment: payment.transactions[0].amount.total});
    }
  });
});

app.get('/cancel', checkAuthenticated, function (req, res) {
  res.render('cancel.ejs');
});
  
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

/*async function sendEmail(recipients, subject, body) {
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
}*/

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

exports = app;

//sendVerificationEmail("mitch@leenet.net.au", "Mitchell Lee");
//sendPasswordResetEmail("mitch@leenet.net.au", "Mitchell Lee", "12NewPassword34");

app.listen(port, () => console.log("Server Started. \nOpen localhost:" + port + " in your browser to view the page.\nListening on Port: " + port + "\nPress Ctrl + C to stop the server.\n"));