const databaseModel = require('../model/databaseModel');
const {sliderCollection} = databaseModel();

exports.getSider = async(req, res, next) => {
    try{
        const result = await sliderCollection.find({}).toArray();
        res.send(result);
    }
    catch(error) {
        next(error);
    }
}

exports.addSlider = async(req, res, next) => {
    try{
        const sliderData = {
            ...req.body,
            sliderImage: req.file.path,
        }
        const result = await sliderCollection.insertOne(sliderData);
        res.status(201).json(result);  
    }
    catch(error) {
        next(error);
    }
}

