const databaseModel = require('../model/databaseModel');
const {allOrdersCollection} = databaseModel();

exports.allOrders = async(req, res, next) => {
    try{
        const {userEmail} = req.query;
        const {currentPage} = req.query;
        const {size} = req.query;
        const {orderStatus} = req.query;    
        let count;
        let orders;     
        if((userEmail && currentPage && size)) {
            count = await allOrdersCollection.find({
                'userInfo.userEmail': userEmail,
            })
            .count();
            orders = await allOrdersCollection.find({
                'userInfo.userEmail': userEmail,
            })        
            .skip(currentPage * size)
            .limit(parseInt(size))
            .toArray();        
        }
        else if(orderStatus && currentPage && size) {
            count = await allOrdersCollection.find(
                {
                    'orderInfo.orderStatus': orderStatus,
                }
            )
            .count();
            orders = await allOrdersCollection.find(
                {
                    'orderInfo.orderStatus': orderStatus,
                }
            )
            .skip(currentPage * size)
            .limit(parseInt(size))
            .toArray();        
        }
        else if(userEmail !== true && orderStatus !== true && currentPage && size) {
            count = await allOrdersCollection.find({}).count();
            orders = await allOrdersCollection.find({})
            .skip(currentPage * size)
            .limit(parseInt(size))
            .toArray();        
        }    
        res.status(200).json({
            allOrders: orders,
            count,
        });
    }
    catch(error) {
        next(error);
    }
}

exports.addOrder = async(req, res, next) => {
    try{
        const orderData = req.body;
        const {productId} = req.query;
        const result = await allOrdersCollection.insertOne(orderData);
        const updateProductQuantity = await allProductsCollection.updateOne(
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
    catch(error) {
        next(error);
    }
}
exports.updateOrderStatus = async(req, res, next) => {
    try{
        const {orderId} = req.query;
        const {updateStatus} = req.body;
        const result = await allOrdersCollection.updateOne(
            {
                _id: objectId(orderId),
            },
            {
                $set: {
                    'orderInfo.orderStatus': updateStatus
                }
            }
        );

        res.status(201).json(result);
    }
    catch(error) {
        next(error);
    }
}