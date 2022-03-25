const orderRoutes = require('./ordersRoutes');
const paymentRoutes = require('./paymentRoutes');
const productRoutes = require('./producteRoutes');
const reviewRoutes = require('./reviewsRoutes');
const sliderRoutes = require('./sliderRoutes');
const userRoutes = require('./userRoutes');

const routes = [
    {
        path: '/orders',
        handler: orderRoutes,
    },
    {
        path: '/payment',
        handler: paymentRoutes,
    },
    {
        path: '/products',
        handler: productRoutes,
    },
    {
        path: '/review',
        handler: reviewRoutes,
    },
    {
        path: '/slider',
        handler: sliderRoutes,
    },
    {
        path: '/user',
        handler: userRoutes,
    }
];

module.exports = (app) => {
    routes.forEach((route) => {
        app.use(route.path, route.handler);
    });
}