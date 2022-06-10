const express = require("express");
const GameController = require("../controllers/Game.Controller");

const router = express.Router();

router.route("/").get(GameController.getAllGames).post(GameController.createGame);

router
    .route("/:id")
    .get(GameController.getGameById)
    .put(GameController.updateGame)
    .delete(GameController.deleteGame);

router.route("/add-rand").post(GameController.createGameFromGB);

module.exports = router;
