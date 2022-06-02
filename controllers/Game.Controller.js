const fs = require("fs");

const db = require("../db.json");

// exports.getAllGames = async (req, res, next) => {
exports.getAllGames = (req, res, next) => {
  // need next here and further?
  try {
    res.send(db.games);
  } catch (error) {
    console.log(error);
    next(error); // wtf?
  }
};

exports.getGameById = (req, res, next) => {
  try {
    const game = db.games.find(g => g.id === parseInt(req.params.id, 10)); // remove array and indexing // done?
    if (!game) {
      res.sendStatus(404);
    } else {
      res.send(game);
    }
  } catch (error) {
    console.log(error);
    next(error); // wtf?
  }
};

exports.createGame = (req, res, next) => {
  try {
    const newId = db.games.length;
    const newGame = {
      id: db.games.length + 1,
      title: req.body.title,
      desc: req.body.desc,
    };
    // res.send(req.body); /// ////
    db.games.push(newGame);
    res.send(db.games); // or this?

    fs.writeFile("db.json", JSON.stringify(db, null, 4), err => {
      if (err) {
        throw err;
      }
      console.log("JSON data is saved.");
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.updateGame = (req, res, next) => {
  try {
    const game = db.games.find(g => g.id === parseInt(req.params.id, 10));
    if (!game) {
      res.sendStatus(404); // works?
    } else {
      const gameIndex = db.games.indexOf(game);
      db.games[gameIndex].title = req.body.title;
      db.games[gameIndex].desc = req.body.desc;

      fs.writeFile("db.json", JSON.stringify(db, null, 4), err => {
        if (err) {
          throw err;
        }
        console.log("JSON data is saved.");
      });
      res.send(db.games);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.deleteGame = (req, res, next) => {
  try {
    // const { id } = req.params;
    const game = db.games.find(g => g.id === parseInt(req.params.id, 10)); // remove array and indexing // what if array is empty
    if (!game) {
      res.sendStatus(404);
    } else {
      const gameIndex = db.games.indexOf(game);
      db.games.splice(gameIndex, 1);
      fs.writeFile("db.json", JSON.stringify(db, null, 4), err => {
        if (err) {
          throw err;
        }
        console.log("JSON data is saved.");
      });
      res.send(db.games); // "deletion successful");
    }
  } catch (error) {
    console.log(error);
    next(error); // wtf?
  }
};
