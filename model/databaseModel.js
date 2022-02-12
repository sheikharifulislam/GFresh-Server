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
        await client.close();
    }
}

conntectDatabase();

function databasebaseModel() {
    const database = client.db("GFresh");
    const allProducts = database.collection("All_products");
    const slider = database.collection("Slider");
    const allUsers = database.collection("All_users");
    const allOrders = database.collection("All_Orders");
    const allReviews = database.collection("All_Reviews");

    return {
        allProducts,
        slider,
        allUsers,
        allOrders,
        allReviews,
    }
}

module.exports = databasebaseModel;