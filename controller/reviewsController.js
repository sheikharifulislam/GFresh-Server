const objectId = require('mongodb').ObjectId;
const databaseModel = require('../model/databaseModel');
const {allReviewsCollection} = databaseModel();

exports.addReview = async(req, res, next) => {
    try{
        const {productId} = req.query;
        const review = req.body;
        review.reviewStar = parseInt(review.reviewStar);
        const addReview = await allReviewsCollection.insertOne(review);
        const productReview = await allProductsCollection.updateOne(
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
    catch(error) {
        next(error);
    }
}