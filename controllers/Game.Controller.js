const fs = require("fs");

const db = require("../db.json");

function saveDbChanges() {
  fs.writeFile("db.json", JSON.stringify(db, null, 4), (error) => {
    if (error) throw error;
  });
}

exports.getAllGames = (req, res, next) => {
  try {
    res.send(db.games);
  } catch (error) {
    res.send(error.message);
    console.error(error);
    next();
  }
};

exports.getGameById = (req, res, next) => {
  try {
    const game = db.games.find((g) => g.id === parseInt(req.params.id, 10));
    if (!game) {
      res.status(404).send("A game with specified id is not found");
    } else {
      res.send(game);
    }
  } catch (error) {
    res.send(error.message);
    console.error(error);
    next();
  }
};

exports.createGame = (req, res, next) => {
  try {
    const newGame = {
      id: db.games[db.games.length - 1].id + 1,
      title: req.body.title,
      desc: req.body.desc,
    };
    db.games.push(newGame);
    saveDbChanges();
    res.send(db.games);
  } catch (error) {
    res.send(error.message);
    console.error(error);
    next();
  }
};

exports.updateGame = (req, res, next) => {
  try {
    const game = db.games.find((g) => g.id === parseInt(req.params.id, 10));
    if (!game) {
      res.status(404).send("A game with specified id is not found");
    } else {
      const gameIndex = db.games.indexOf(game);
      db.games[gameIndex].title = req.body.title;
      db.games[gameIndex].desc = req.body.desc;
      saveDbChanges();
      res.send(db.games);
    }
  } catch (error) {
    res.send(error.message);
    console.error(error);
    next();
  }
};

exports.deleteGame = (req, res, next) => {
  try {
    const game = db.games.find((g) => g.id === parseInt(req.params.id, 10));
    if (!game) {
      res.status(404).send("A game with specified id is not found");
    } else {
      const gameIndex = db.games.indexOf(game);
      db.games.splice(gameIndex, 1);
      res.send(db.games);
    }
  } catch (error) {
    res.send(error.message);
    console.error(error);
    next();
  }
};
