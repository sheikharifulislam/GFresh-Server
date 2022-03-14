const stripe = require('stripe')(process.env.STRIPE_KEY);

exports.createPaymentIntent = async(req, res, next) => {
    try{
        let {amount} = req.body;          
        const {quantity} = req.body; 
        const totalAmount = (amount * 100) * quantity;                      
        if(totalAmount) {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: totalAmount,
                currency: 'usd',
                payment_method_types: ['card'],               
            });
            res.status(201).json({
                clientSecret: paymentIntent.client_secret,
            });
        }
        else {
            res.status(204).json('invalid amount and quantity');
        }
    }
    catch(error) {
        next(error);
    }
}