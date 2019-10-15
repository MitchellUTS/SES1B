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

const initializePassport = require('./passport-config')

function sendVerificationEmail(emailAddress, name) {
    let email = {
        from: '"Lavender NoReply" <ayushdallakoti18@gmail.com>', // sender address
        to: emailAddress, // list of receivers
        subject: "Thank you for signing up for Lavender!", // Subject line
        html: '<h1>Hi ' + name + ',</h1><br/><p>Thanks for registering with Lavender.<p/><p>Your email has been verified<p/><br/>Regards, The Lavender Team!' // html body
    }
    sendEmail(email).catch(console.error);
}

function sendPasswordResetEmail(emailAddress, name, password) {
    let email = {
        from: '"Lavender NoReply" <ayushdallakoti18@gmail.com>', // sender address
        to: emailAddress, // list of receivers
        subject: "Password Reset with Lavender", // Subject line
        html: '<h1>Hi ' + name + ',</h1><br/><p>Your password has been reset.<p/><p>Your new password is: ' + password + '<p/><br/>Regards, The Lavender Team!' // html body
    }
    sendEmail(email).catch(console.error);
}

function sendPasswordChangeEmail(emailAddress, name, password) {
    let email = {
        from: '"Lavender NoReply" <ayushdallakoti18@gmail.com>', // sender address
        to: emailAddress, // list of receivers
        subject: "Password Change with Lavender", // Subject line
        html: '<h1>Hi ' + name + ',</h1><br/><p>Your password has been changed.<p/><p>Your new password is: ' + password + '<p/><br/>Regards, The Lavender Team!' // html body
    }
    sendEmail(email).catch(console.error);
}

async function sendEmail(email) {
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
    let info = await transporter.sendMail(email);

    console.log('Message sent to: ' + email.to);
}

function generatePassword(length) {
    return Math.random().toString(36).replace(/[^a-z0-9]+/g, '').substr(5, length);
}

module.exports = function() { 
    this.sendEmail                  = sendEmail;
    this.sendVerificationEmail      = sendVerificationEmail;
    this.sendPasswordResetEmail     = sendPasswordResetEmail;
    this.sendPasswordChangeEmail    = sendPasswordChangeEmail;
    this.generatePassword           = generatePassword;
}

