const express = require('express');
const {MongoClient} = require('mongodb');
const objectId = require('mongodb').ObjectId;
const dotenv = require('dotenv').config();
const cors = require('cors');
const multer = require('multer');
const upload = require('./multer/multer.config');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const fs = require('fs').promises;
const app = express();


app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.use((err,req,res,next) => {
    if(err) {
        if(err instanceof multer.MulterError) {
            res.status(500).json("Thre was an upload error")
        }
        else {
            res.status(500).json(err.message)
        }
    }
    else {
        res.status(200).json("Success")
    }
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jrudo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try{
        await client.connect();
        const database = client.db("GFresh");
        const allProducts = database.collection("All_products");
        const slider = database.collection("Slider");
        const allUsers = database.collection("All_users");
        const allOrders = database.collection("All_Orders");
        const allReviews = database.collection("All_Reviews");


        //ALL GET API
        app.get('/all-products',async(req,res) => {
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
        })

        app.get('/manage-all-products', async (req, res) => {
            const {currentPage} = req.query;
            const {size} = req.query;
            // console.log(currentPage * size);            
            const result = await allProducts.find({}).skip(currentPage * size).limit(parseInt(size)).toArray();
            const count = await allProducts.find({}).count();
            res.status(200).json({
                allProducts: result,
                count,
            });            
        })

        app.get('/slider-data',async(req,res) => {
            const result = await slider.find({}).toArray();
            res.send(result);
        })

        app.get('/check-admin',async(req,res) => {
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
        })

        app.get('/all-users',async(req,res) => {
            const users = await allUsers.find({}).toArray();
            res.status(200).json(users);
        })

        //ALL POST API

        app.post('/add-product',upload.single("productImage"), async (req, res) => {
            
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
        });
        
        app.post('/add-slider',upload.single("sliderImage"), async(req, res) => {
            const sliderData = {
                ...req.body,
                sliderImage: req.file.path,
            }
            const result = await slider.insertOne(sliderData);
            res.status(201).json(result);            
        })

        app.post('/add-user',async(req,res) => {
            const user = req.body;            
            const result = await allUsers.insertOne(user);
            res.status(201).json(result);            
        })

        app.post('/add-order',async(req,res) => {
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
        })

        app.post('/add-review',async(req,res) => {
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
        })

        app.post('/create-payment-intent', async(req, res) => {
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

            
        })

        //ALL PATCH AND PUT API
        // app.patch('/update-product-info', async (req, res) => {
        //     const {productId} = req.query;
        //     const {imagePath} = req.query;            
        //     const updateProductInfo = {
        //         ...req.body,
        //         productImage: req.file.path,
        //         reviews: [],
        //         reviewStar: 0,                            
        //     };
        //     updateProductInfo.mainPrice = parseInt(updateProductInfo.mainPrice);                  
        //     updateProductInfo.quantity = parseInt(updateProductInfo.quantity);       
        //     if(updateProductInfo.offerPrice !== 'null') {
        //         updateProductInfo.offerPrice = parseInt(updateProductInfo.offerPrice); 
        //     }
        //     else if(updateProductInfo.offerPrice === 'null') {
        //         updateProductInfo.offerPrice = null;
        //     } 
        //     const result = await allProducts.updateOne(
        //         {
        //             _id: objectId(productId),
        //         },
        //         {
        //             $set: {
        //                 ...updateProductInfo,
        //             }
        //         }
        //     )
        //     await fs.unlink(`./${imagePath}`);
        //     res.status(200).json(result);  
            
        // })

        //ALL DELETE API
        app.delete('/delete-single-product',async(req,res) => {
            const {productId} = req.query;
            const {imagePath} = req.query;
            const result = await allProducts.deleteOne({_id: objectId(productId)});
            await fs.unlink(`./${imagePath}`);
            res.status(200).json(result);  
        })
       

    }
    catch(error) {
        console.log(error.message);
    }
    finally{
        //await client.close();       
    }
}

run();

app.get('/',async(req,res) => {
    res.send("Ariful");
})


const port = process.env.PORT || 5000;
app.listen(port,() => {
    console.log(`Server is Running At Port ${port}`);
})