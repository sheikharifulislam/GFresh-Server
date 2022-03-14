const PaymentRoutes = require('express').Router();
const {createPaymentIntent} = require('../controller/paymentController');

PaymentRoutes.post('/create-payment-intent',createPaymentIntent);

module.exports = PaymentRoutes;