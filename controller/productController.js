const databaseModel = require('../model/databaseModel');
const {allProductsCollection} = databaseModel();
const fs = require('fs').promises;

exports.allProducts = async(req, res,next) => {
    try{
        const {productId} = req.query;
        const {category} = req.query;
        const {productName} = req.query;                   
        let products;
        if(productId) {
            if(productId.length === 24) {
                products = await allProductsCollection.findOne(
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
            products = await allProductsCollection.find(
                {
                    category: {
                        $regex: ".*" + category + ".*", $options: 'im'
                    }
                }
            ).toArray();
    
            res.send(products);
        }
        else if(productName) {
            products = await allProductsCollection.find(
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
            products = await allProductsCollection.aggregate(
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
    catch(error){
        next(error);
    }
}

exports.manageAllProducts = async(req, res, next) => {
    try{
        const {currentPage} = req.query;
        const {size} = req.query;                
        const result = await allProductsCollection.find({}).skip(currentPage * size).limit(parseInt(size)).toArray();
        const count = await allProductsCollection.find({}).count();
        res.status(200).json({
            allProducts: result,
            count,
        }); 
    } 
    catch(error) {
        next(error);
    }
}

exports.addProduct = async(req, res, next) => {
    try{
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
        const result = await allProductsCollection.insertOne(product);
        res.status(201).json(result);
    }
    catch(error) {
        next(error);
    }
}

exports.deleteSingleProduct = async(req, res, next) => {
    try{
        const {productId} = req.query;
        const {imagePath} = req.query;
        const result = await allProductsCollection.deleteOne({_id: objectId(productId)});
        await fs.unlink(`./${imagePath}`);
        res.status(200).json(result);  
    }
    catch(error) {
        next(error);
    }
}
