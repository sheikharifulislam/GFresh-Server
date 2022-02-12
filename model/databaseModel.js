const {MongoClient} = require('mongodb');
const dotenv = require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jrudo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function conntectDatabase() {
    try{
        await client.connect();
    }
    catch(e){
        console.log(e.message);
    }
    finally{
        // await client.close();
    }
}

conntectDatabase();

function databasebaseModel() {
    const database = client.db("GFresh");
    const allProductsCollection = database.collection("All_products");
    const sliderCollection = database.collection("Slider");
    const allUsersCollection = database.collection("All_users");
    const allOrdersCollection = database.collection("All_Orders");
    const allReviewsCollection = database.collection("All_Reviews");

    return {
        allProductsCollection,
        sliderCollection,
        allUsersCollection,
        allOrdersCollection,
        allReviewsCollection,
    }
}

module.exports = databasebaseModel;