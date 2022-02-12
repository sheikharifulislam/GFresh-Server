const route = require('express').Router();
const upload = require('../multer/multer.config');
const {
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
} = require('../controller/controller');

//ALL GET API
route.get('/',defaultRoute)
route.get('/all-products', allProducts)
route.get('/manage-all-products', manageAllProducts)
route.get('/slider-data', sliderData)
route.get('/check-admin', checkAdmin)
route.get('/all-users', allUsers)

//ALL POST API
route.post('/add-product',upload.single("productImage"), addProduct);
route.post('/add-slider',upload.single("sliderImage"), addSlider)
route.post('/add-user', addUser)
route.post('/add-order', addOrder)
route.post('/add-review', addReview)
route.post('/create-payment-intent', createPaymentIntent)

//ALL PATCH AND PUT API
route.patch('/update-product-info',upload.single("productImage"), updateProductInfo)

//ALL DELETE API
route.delete('/delete-single-product', deleteSingleProduct);

module.exports = route;