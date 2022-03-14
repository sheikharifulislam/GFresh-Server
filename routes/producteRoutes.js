const ProductRouter = require('express').Router();
const fileUpload = require('../middleware/fileUpload');
const {
    allProducts,
    manageAllProducts,
    addProduct,
    deleteSingleProduct
} = require('../controller/productController');

ProductRouter.get('/all-products',allProducts);
ProductRouter.get('/manage-all-products',manageAllProducts);
ProductRouter.post('/add-product',fileUpload.single('productImage'),addProduct);
ProductRouter.delete('/delete-single-prouct',deleteSingleProduct);

module.exports = ProductRouter;