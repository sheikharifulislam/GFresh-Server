const ReviewsRouter = require('express').Router();
const {
    addReview
} = require('../controller/reviewsController');

ReviewsRouter.post('/add-review',addReview);

module.exports = addReview;
