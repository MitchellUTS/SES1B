const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email)
    if (user == null) {
    	console.log("Email: " + email);
      return done(null, false, { message: 'Invalid email or password' })
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Invalid email or password' })
      }
    } catch (e) {
      return done(e)
    }
  }

    passport.use(new LocalStrategy({ usernameField: 'email'},
    authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

module.exports = initialize

/*const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById, getPasswordById) {
  const authenticateUser = async (email, password, done) => {
    if (email == null) {
      return done(null, false, { message: 'No user with that email' })
    }

    try {
      if (await bcrypt.compare(password, getPasswordById)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }
  passport.use(new LocalStrategy({ usernameField: 'email'},authenticateUser))
		    passport.serializeUser((email, done) => done(null, id))
		    passport.deserializeUser((id, done) => {
		        return done(null, getUserById(id))
		    })
}

module.exports = initialize*/
