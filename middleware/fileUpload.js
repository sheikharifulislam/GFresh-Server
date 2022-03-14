const multer = require('multer');
const path = require('path');

// Create Upload Folder
const uploadFolder = "./assets";

// Define The Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {      
      cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, "")
          .toLowerCase()
          .split(" ")
          .join("-") +
        "-" +
        Date.now();
  
      cb(null, fileName + fileExt);
    },
  });


const fileUpload = multer({
    storage: storage,
    limits: {
      fileSize: 3000000, // 3MB
    },
    fileFilter: (req, file, cb) => {            
        if (
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg"
         ) {
            cb(null, true);
        } else {
            cb(new Error("Only .jpg, .png or .jpeg format allowed!"));
        }
    }
  });
  
  module.exports = fileUpload;