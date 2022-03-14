const databaseModel = require('../model/databaseModel');
const {allUsersCollection} = databaseModel();

exports.allUsers = async(req, res, next) => {
    try{
        const users = await allUsersCollection.find({}).toArray();
        res.status(200).json(users);
    }
    catch(error){
        next(error);
    }
}

exports.checkAdmin = async(req, res, next) => {
    try{
        const {userEmail} = req.query;
        console.log(userEmail);
        const user = await allUsersCollection.findOne(
            {
                email: userEmail
            }
        );

        let isAdmin = false;

        if(user?.role === 'admin') {
            isAdmin = true;
        }

        res.status(200).json({isAdmin});
    }
    catch(error) {
        next(error);
    }
}

exports.addUser = async(req, res, next) => {
    try{
        const user = req.body;            
        const result = await allUsersCollection.insertOne(user);
        res.status(201).json(result);  
    }
    catch(error) {
        next(error);
    }
}