const UserRouter = require("express").Router();
const upload = require("../middleware/fileUpload");
const {
    allUsers,
    checkAdmin,
    addUser,
    singleUser,
    updateUser,
} = require("../controller/userController");

UserRouter.get("/all-user", allUsers);
UserRouter.get("/check-admin", checkAdmin);
UserRouter.post("/add-user", addUser);
UserRouter.get("/single-user", singleUser);
UserRouter.patch("/update-single-user", upload.single("profilePic"), updateUser);

module.exports = UserRouter;
