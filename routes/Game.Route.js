const express = require("express"); // need?
const GameController = require("../controllers/Game.Controller"); // .js?

const router = express.Router();

router.get("/", GameController.getAllGames);
router.get("/:id", GameController.getGameById);

router.post("/", GameController.createGame);

router.put("/:id", GameController.updateGame);

router.delete("/:id", GameController.deleteGame);

module.exports = router;
