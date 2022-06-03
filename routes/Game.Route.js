const express = require("express");
const GameController = require("../controllers/Game.Controller");

const router = express.Router();

router.get("/", GameController.getAllGames);
router.get("/:id", GameController.getGameById);

router.post("/", GameController.createGame);
router.post("/add-rand", GameController.createGameFromGB);

router.put("/:id", GameController.updateGame);

router.delete("/:id", GameController.deleteGame);

module.exports = router;
