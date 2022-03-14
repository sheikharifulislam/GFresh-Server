const UserRouter = require('express').Router();
const {
    allUsers,
    checkAdmin,
    addUser
} = require('../controller/userController');

UserRouter.get('/all-user',allUsers);
UserRouter.get('/check-admin',checkAdmin);
UserRouter.post('/add-user',addUser);

module.exports = UserRouter;