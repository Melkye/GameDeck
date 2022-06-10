const Joi = require("joi");
const fs = require("fs");

const db = require("../db.json");
const giantBombApiSettings = require("../giantBombApiSettings.json");

const ERR_GAME_NOT_FOUND = "A game with specified id is not found";

const gameSchema = Joi.object({
    title: Joi.string().min(3).required(),
    desc: Joi.string().min(3).required(),
});

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
        const game = db.games.find((g) => g.id === Number(req.params.id));
        if (!game) {
            res.status(404).send(ERR_GAME_NOT_FOUND);
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
        const validationResult = gameSchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).send(validationResult.error);
        } else {
            const newGame = {
                id: db.games[db.games.length - 1].id + 1,
                title: req.body.title,
                desc: req.body.desc,
            };
            db.games.push(newGame);
            saveDbChanges();
            res.send(db.games);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.createGameFromGB = (req, res, next) => {
    try {
        const randomId = Math.floor(Math.random() * 99);
        const apiKey = giantBombApiSettings.key;
        const url =
            `https://www.giantbomb.com/api/games/?api_key=${apiKey}&format=json&filter=expected_release_year:2021` +
            `&limit=${(randomId + 1).toString()}`;

        fetch(url)
            .then((resp) => resp.json())
            .then((data) => {
                const randomGame = data.results[randomId];
                const newGame = {
                    id: db.games[db.games.length - 1].id + 1,
                    title: randomGame.name,
                    desc: randomGame.deck,
                };
                db.games.push(newGame);
                saveDbChanges();
                res.send(db.games);
            });
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.updateGame = (req, res, next) => {
    try {
        const validationResult = gameSchema.validate(req.body);
        if (validationResult.error) {
            res.status(400).send(validationResult.error);
        } else {
            const game = db.games.find((g) => g.id === Number(req.params.id));
            if (!game) {
                res.status(404).send(ERR_GAME_NOT_FOUND);
            } else {
                const gameIndex = db.games.indexOf(game);
                db.games[gameIndex].title = req.body.title;
                db.games[gameIndex].desc = req.body.desc;
                saveDbChanges();
                res.send(db.games);
            }
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.deleteGame = (req, res, next) => {
    try {
        const game = db.games.find((g) => g.id === Number(req.params.id));
        if (!game) {
            res.status(404).send(ERR_GAME_NOT_FOUND);
        } else {
            const gameIndex = db.games.indexOf(game);
            db.games.splice(gameIndex, 1);
            saveDbChanges();
            res.send(db.games);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};
