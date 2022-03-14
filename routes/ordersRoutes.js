const OrderRouter = require('express').Router();
const {
    allOrders,
    addOrder,
    updateOrderStatus,
} = require('../controller/ordersController');

OrderRouter.get('/all-orders',allOrders);
OrderRouter.post('/add-order',addOrder);
OrderRouter.patch('/update-order-status',updateOrderStatus);

module.exports = OrderRouter;