if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  
  const express = require('express')
  const app = express()
  const bcrypt = require('bcrypt')
  const passport = require('passport')
  const flash = require('express-flash')
  const session = require('express-session')
  const methodOverride = require('method-override')

  const initializePassport = require('./passport-config')
  initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  )
  
  const port = 3000;
  const users = []

  /*const mysql = require('mysql'); MUST USE 'npm install mysql' for this to work
  const pool = mysql.createPool({
	  connectionLimit : 100,
	  host : 'localhost',
	  database : 'test',
	  user : 'root',
	  password : 'pass123',
	  debug : false
  });*/
  
  app.set('view-engine', 'ejs')
  app.use(express.urlencoded({ extended: false }))
  app.use(flash())
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(methodOverride('_method'))
  
  app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
  })
  
  app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
  })
  
  app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))
  
  app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
  })
  
  app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      })
      res.redirect('/login')
    } catch {
      res.redirect('/register')
    }
  })
  
  app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
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

  //query rows in the table

  /*function queryRow(data) {
    let selectQuery = 'SELECT * FROM ? WHERE ? = ?';    
    let query = mysql.format(selectQuery,[data.table,data.field1Name, data.field1Value]);
    // query = SELECT * FROM `user` where `EmailAddress` = '12875833@student.uts.edu.au'
    pool.query(query,(err, data) => {
        if(err) {
            console.error(err);
            return;
        }
        // rows fetch
        return data;
    });
}*/

//add rows in the table

/*function addRow(data) {
  let insertQuery = 'INSERT INTO ? (?,?,?,?,?,?,?) VALUES (?,?,?,?,?,?,?)';
  let query = mysql.format(insertQuery,[data.table,data.field1Name,data.field2Name,data.field3Name,data.field4Name,data.field5Name,data.field6Name,data.field7Name,data.field1Value,data.field2Value,data.field3Value,data.field4Value,data.field5Value,data.field6Value,data.field7Value]);
  pool.query(query,(err, response) => {
      if(err) {
          console.error(err);
          return;
      }
      // rows added
      console.log(response.insertId);
  });
}*/
  
//update rows

/*function updateRow(data) {
  let updateQuery = "UPDATE ? SET ? = ? WHERE ? = ?";
  let query = mysql.format(updateQuery,[data.table,data.field1Name,data.field1Value,data.field2Name,data.field2Value]);
  // query = UPDATE `user` SET `EmailAddress`='12875822@student.uts.edu.au' WHERE `Name`='Matt'
  pool.query(query,(err, response) => {
      if(err) {
          console.error(err);
          return;
      }
      // rows updated
      console.log(response.affectedRows);
  });
}*/

// timeout just to avoid firing query before connection happens

//Insert query call
/*setTimeout(() => {
  // call the function
  addRow({
      "table": user,
      
      "field1Name": "ID",
      "field2Name": "Name",
      "field3Name": "DateOfBirth",
      "field4Name": "EmailAddress",
      "field5Name": "PhoneNumber",
      "field6Name": "Verified",
      "field7Name": "Password"

      "field1Value": "2",
      "field2Value": "Matt",
      "field3Value": "2000-01-01 00:00:00",
      "field4Value": "12875833@student.uts.edu.au",
      "field5Value": "0412345678",
      "field6Value": "000",
      "field7Value": "HashedPassword"
  });
},5000);*/

//Select query call
/*setTimeout(() => {
  // call the function
  // select rows
  queryRow({
    "table": "user",

    "field1Name": "EmailAddress",
    "field1Value": "12875833@student.uts.edu.au"
  });
},5000);*/

//Update query call
/*setTimeout(() => {
  // call the function
  // update row
  updateRow({
      "table": "Matt",

      "field1Name": "EmailAddress",
      "field2Name": "Name",

      "field1Value": "12875822@student.uts.edu.au",
      "field2Value": "Matt"
  });
},5000);*/

app.listen(port, () => console.log("Server Started. \nListening on Port:" + port + "\nPress Ctrl + C to stop the server.\n"));