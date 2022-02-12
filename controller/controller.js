const {
    allProducts,
    slider,
    allUsers,
    allOrders,
    allReviews,
} = require('../model/databaseModel');
const fs = require('fs').promises;
const stripe = require('stripe')(process.env.STRIPE_KEY);
const objectId = require('mongodb').ObjectId;
const dotenv = require('dotenv').config();

const defaultRoute = async(req,res) => {
    res.send("Well Come");
}

const allProducts = async(req,res) => {
    const {productId} = req.query;
    const {category} = req.query;
    const {productName} = req.query;                   
    let products;

    if(productId) {
        if(productId.length === 24) {
            products = await allProducts.findOne(
                {
                    _id: objectId(productId)
                }
            );
            
            res.send(products)
        }
        else {
            res.status(500).json("Please Provide A Valid Id");
        }
    }
    else if(category) {
        products = await allProducts.find(
            {
                category: {
                    $regex: ".*" + category + ".*", $options: 'im'
                }
            }
        ).toArray();

        res.send(products);
    }
    else if(productName) {
        products = await allProducts.find(
            {
                $or: [
                   {
                    productName: {
                        $regex: ".*" + productName + ".*", $options: 'im'
                    },
                   },
                   {
                        category: {
                            $regex: ".*" + productName + ".*", $options: 'im'
                        }
                   }
                ]
            }
        )                
        .toArray();                

        res.send(products);
    }            
    else if(productId !== true && category !== true && productName !== true) {
        products = await allProducts.aggregate(
            [
                {
                    $sample: {
                        size: 15,
                    }
                }
            ]
        )
        .toArray();

        res.send(products);
    }
}

const manageAllProducts = async (req, res) => {
    const {currentPage} = req.query;
    const {size} = req.query;                
    const result = await allProducts.find({}).skip(currentPage * size).limit(parseInt(size)).toArray();
    const count = await allProducts.find({}).count();
    res.status(200).json({
        allProducts: result,
        count,
    });            
}

const sliderData = async(req,res) => {
    const result = await slider.find({}).toArray();
    res.send(result);
}

const checkAdmin = async(req,res) => {
    const {userEmail} = req.query;
    const user = await allUsers.findOne(
        {
            email: userEmail
        }
    );

    let isAdmin = false;

    if(user?.role === 'admin') {
        isAdmin = true;
    }

    res.status(200).json({isAdmin});
}

const allUsers = async(req,res) => {
    const users = await allUsers.find({}).toArray();
    res.status(200).json(users);
}

//ALL POST API

const addProduct = async (req, res) => {
            
    const product = {
        ...req.body,
        productImage: req.file.path,
        reviews: [],
        reviewStar: 0,                            
    };           
    product.mainPrice = parseInt(product.mainPrice);                  
    product.quantity = parseInt(product.quantity);       
    if(product.offerPrice !== 'null') {
         product.offerPrice = parseInt(product.offerPrice); 
    }
    else if(product.offerPrice === 'null') {
     product.offerPrice = null;
    }          
    const result = await allProducts.insertOne(product);
    res.status(201).json(result);        
 }

 const addSlider = async(req, res) => {
    const sliderData = {
        ...req.body,
        sliderImage: req.file.path,
    }
    const result = await slider.insertOne(sliderData);
    res.status(201).json(result);            
}

const addUser = async(req,res) => {
    const user = req.body;            
    const result = await allUsers.insertOne(user);
    res.status(201).json(result);            
}

const addOrder = async(req,res) => {
    const orderData = req.body;
    const {productId} = req.query;
    const result = await allOrders.insertOne(orderData);
    const updateProductQuantity = await allProducts.updateOne(
        {
            _id: objectId(productId),
        },
        {
            $inc: {
                quantity: - parseInt(orderData.orderInfo.orderQuantity),
            }
        } 
    );
    res.status(201).json({
        updateProductQuantity,
        result,
    });
}

const addReview = async(req,res) => {
    const {productId} = req.query;
    const review = req.body;
    review.reviewStar = parseInt(review.reviewStar);
    const addReview = await allReviews.insertOne(review);
    const productReview = await allProducts.updateOne(
        {
            _id: objectId(productId),
        },
        {
            $push: {
                reviews: review,
            },
            $inc: {
                reviewStar: review.reviewStar,                        
            }
        }
       
    )

    res.status(201).json({
        addReview,
        productReview,
    })
}

const createPaymentIntent = async(req, res) => {
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

//ALL UPDATE API

const updateProductInfo = async (req, res) => {
    const {productId} = req.query;
    const {imagePath} = req.query;        
               
    const updateProductInfo = {
        ...req.body,                
        reviews: [],
        reviewStar: 0,                            
    };           
    delete updateProductInfo._id; 
    delete updateProductInfo.reviews;
    delete updateProductInfo.reviewStar;          

//    if(req.file !== undefined) {
//     updateProductInfo.productImage = req.file.path;
//     await fs.unlink(`./${imagePath}`);            
//    }
   console.log(updateProductInfo);
   console.log(req.file);     

    /* updateProductInfo.mainPrice = parseInt(updateProductInfo.mainPrice);                  
    updateProductInfo.quantity = parseInt(updateProductInfo.quantity);       
    if(updateProductInfo.offerPrice !== 'null') {
        updateProductInfo.offerPrice = parseInt(updateProductInfo.offerPrice); 
    }
    else if(updateProductInfo.offerPrice === 'null') {
        updateProductInfo.offerPrice = null;
    } 
    const result = await allProducts.updateOne(
        {
            _id: objectId(productId),
        },
        {
            $set: {
                ...updateProductInfo,
            }
        }
    )           
    res.status(200).json(result); */   
    
    res.end();
}

const deleteSingleProduct = async(req,res) => {
    const {productId} = req.query;
    const {imagePath} = req.query;
    const result = await allProducts.deleteOne({_id: objectId(productId)});
    await fs.unlink(`./${imagePath}`);
    res.status(200).json(result);  
}

module.exports = {
    defaultRoute,
    allProducts,
    manageAllProducts,
    sliderData,
    checkAdmin,
    allUsers,
    addProduct,
    addSlider,
    addUser,
    addOrder,
    addReview,
    createPaymentIntent,
    updateProductInfo,
    deleteSingleProduct,
}