const express = require("express");
const UserController = require("../controllers/User.Controller");

const router = express.Router();

router.route("/").get(UserController.getAllUsers).post(UserController.createUser);

router
    .route("/:id")
    .get(UserController.getUserById)
    .put(UserController.updateUser)
    .delete(UserController.deleteUser);

module.exports = router;
