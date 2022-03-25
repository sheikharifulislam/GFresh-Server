const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());
app.use('/assets', express.static('assets'));

// Imports Routes From Routes Directory
const setRoutes = require('./routes/routes');

// Imports Middlewate From Middleware Directory
const errorHandler = require('./middleware/errorHandler');

// Using Routes From Routes Directory
setRoutes(app);

// Using Middleware From Middleware Directory
app.use(errorHandler);

app.get('/',async(req, res) => {
    try{
        res.send('Well Come');
    }
    catch(err){
        res.status(500).json({
            message: 'Internal Server Error',
        })
    }
})



const port = process.env.PORT || 5000;
app.listen(port,() => {
    console.log(`Server is Running At Port ${port}`);
})