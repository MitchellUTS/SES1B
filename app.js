const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
'mode': 'sandbox', //sandbox or live
'client_id': 'AYrqSddTaoMoT0YNT_g45A1D03qeu37-NEUS2CyIx6ZTqxi4nFnsScO7sagv63vr1xVLpjEL-EiV0_OX',
'client_secret': 'EBLPCMU4LF5SzH5rUEZkYT3tZBSyL5b3eUFwvjClSJTA8HzKKJTSKguRBlKkNphMbDjIueMeLbepNeSa'
});

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {
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
            "name": "Intel Core i5",
            "sku": "001",
            "price": "299.00",
            "currency": "AUD",
            "quantity": 1
        }]
    },
    "amount": {
        "currency": "AUD",
        "total": "299.00"
    },
    "description": "A CPU"
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

app.listen(3000, () => console.log('Server Started'));