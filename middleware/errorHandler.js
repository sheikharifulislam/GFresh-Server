const multer = require('multer');
module.exports = (err, req, res, next) => {
    if(err) {
        if(err instanceof multer.MulterError) {
            res.status(500).json("Thre was an upload error")
        }
        else {
            res.status(500).json(err.message)
        }
    }
    else {
        res.status(200).json("Success")
    }
}