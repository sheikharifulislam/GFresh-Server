const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();


app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.use((err,req,res,next) => {
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
})

app.get('/',async(req,res) => {
    res.send("Ariful");
})


const port = process.env.PORT || 5000;
app.listen(port,() => {
    console.log(`Server is Running At Port ${port}`);
})