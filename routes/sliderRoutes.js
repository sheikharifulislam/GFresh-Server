const SliderRouter = require('express').Router();
const fileUpload = require('../middleware/fileUpload');
const {
    getSider,
    addSlider,
} = require('../controller/sliderController');

SliderRouter.get('/get-slider',getSider);
SliderRouter.post('/add-slider',fileUpload.single('sliderImage'),addSlider);

module.exports = SliderRouter;