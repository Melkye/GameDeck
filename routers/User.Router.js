const express = require("express");
const UserController = require("../controllers/User.Controller");

const router = express.Router();

router
    .route("/")
    .get(UserController.getAllUsers)
    .post(UserController.createUser);

router
    .route("/:id")
    .get(UserController.getUserById)
    .put(UserController.updateUser)
    .delete(UserController.deleteUser);

router
    .route("/:id/games")
    .get(UserController.getAllUserGamesByUserId);

router
    .route("/:id/articles")
    .get(UserController.getAllUserArticlesByUserId);

router
    .route("/:id/reviews")
    .get(UserController.getAllUserReviewsByUserId)
    .post(UserController.createReview);

router
    .route("/:id/reviews/:reviewId")
    .put(UserController.updateReview)
    .delete(UserController.deleteReview);

router
    .route("/:id/subscribe/:gameId")
    .post(UserController.subscribeToGame);

router
    .route("/:id/unsubscribe/:gameId")
    .post(UserController.unsubscribeFromGame);

module.exports = router;
