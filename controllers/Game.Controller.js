const User = require("../models/User.Model");
const Game = require("../models/Game.Model");
const Article = require("../models/Article.Model");
const Review = require("../models/Review.Model");

const errorConstants = require("../errorConstants");
const validationSchemas = require("../validationSchemas");

exports.getAllGames = async (req, res) => {
    try {
        const games = await Game.find({}).select([
            "_id",
            "title",
            "description",
        ]);
        res.send(games);
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.getGameById = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id).select([
            "_id",
            "title",
            "description",
        ]);
        if (!game) {
            res.status(404).send(errorConstants.ERR_GAME_NOT_FOUND);
        } else {
            res.send(game);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.getAllGameArticlesByGameId = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id).populate("articles", [
            "_id",
            "title",
            "text",
        ]);
        if (!game) {
            res.status(404).send(errorConstants.ERR_GAME_NOT_FOUND);
        } else {
            res.send(game.articles);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};
exports.getAllGameReviewsByGameId = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id).populate({
            path: "reviews",
            select: ["_id", "text", "isGameRecommended"],
            populate: {
                path: "user",
                select: ["_id", "name"],
            },
        });
        if (!game) {
            res.status(404).send(errorConstants.ERR_GAME_NOT_FOUND);
        } else {
            res.send(game.reviews);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.createGame = async (req, res) => {
    try {
        const validationResult = validationSchemas.gameSchemaJoi.validate(
            req.body,
        );
        if (validationResult.error) {
            res.status(400).send(validationResult.error.details[0].message);
        } else {
            const newGame = {
                title: req.body.title,
                description: req.body.description,
                users: [],
                articles: [],
                reviews: [],
            };
            await Game.create(newGame);
            this.getAllGames(req, res);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.createGameFromGB = (req, res) => {
    try {
        const randomId = Math.floor(Math.random() * 99);
        const apiKey = process.env.GIANT_BOMB_API_KEY;
        const url =
            `https://www.giantbomb.com/api/games/?api_key=${apiKey}&format=json&filter=expected_release_year:2021` +
            `&limit=${(randomId + 1).toString()}`;

        fetch(url)
            .then((resp) => resp.json())
            .then((data) => {
                const randomGame = data.results[randomId];
                const newGame = {
                    title: randomGame.name,
                    description: randomGame.deck,
                    users: [],
                    articles: [],
                    reviews: [],
                };
                this.createGame({ body: newGame }, res);
            });
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.updateGame = async (req, res) => {
    try {
        const validationResult = validationSchemas.gameSchemaJoi.validate(
            req.body,
        );
        if (validationResult.error) {
            res.status(400).send(validationResult.error.details[0].message);
        } else {
            const game = await Game.findById(req.params.id);
            if (!game) {
                res.status(404).send(errorConstants.ERR_GAME_NOT_FOUND);
            } else {
                const updatedGame = await Game.findByIdAndUpdate(
                    req.params.id,
                    req.body,
                    { new: true },
                );
                res.send(updatedGame);
            }
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.deleteGame = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            res.status(404).send(errorConstants.ERR_GAME_NOT_FOUND);
        } else {
            for (const gameUserId of game.users) {
                const user = await User.findById(gameUserId);
                const userNewGamesIds = user.games;
                const gameIndex = userNewGamesIds.indexOf(game.id);
                userNewGamesIds.splice(gameIndex, 1);
                await User.updateOne(
                    { _id: gameUserId },
                    { games: userNewGamesIds },
                );
            }
            for (const gameArticleId of game.articles) {
                const article = await Article.findById(gameArticleId);
                const articleNewGamesIds = article.games;
                const gameIndex = articleNewGamesIds.indexOf(game.id);
                articleNewGamesIds.splice(gameIndex, 1);
                await Article.updateOne(
                    { _id: gameArticleId },
                    { games: articleNewGamesIds },
                );
            }
            for (const gameReviewId of game.reviews) {
                const reviewWithoutGame = await Review.findByIdAndUpdate(
                    gameReviewId,
                    { game: undefined },
                    { new: true },
                );
                if (!reviewWithoutGame.user) {
                    await Review.deleteOne({ _id: gameReviewId });
                }
            }
            await Game.deleteOne({ _id: game.id });
            this.getAllGames(req, res);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};
