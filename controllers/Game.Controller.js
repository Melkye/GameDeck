const User = require("../models/User.Model");
const Game = require("../models/Game.Model");
const Article = require("../models/Article.Model");
const Review = require("../models/Review.Model");

const errorConstants = require("../errorConstants");
const validationSchemas = require("../validationSchemas");

exports.getAllGames = async (req, res, next) => {
    try {
        const games = await Game.find({}).select([
            "_id",
            "title",
            "description",
        ]);
        res.send(games);
    } catch (error) {
        next(error);
    }
};

exports.getGameById = async (req, res, next) => {
    try {
        const game = await Game.findById(req.params.id).select([
            "_id",
            "title",
            "description",
        ]);
        if (!game) {
            res.status(404);
            throw new Error(errorConstants.ERR_GAME_NOT_FOUND);
        } else {
            res.send(game);
        }
    } catch (error) {
        next(error);
    }
};

exports.getAllGameArticlesByGameId = async (req, res, next) => {
    try {
        const game = await Game.findById(req.params.id).populate("articles", [
            "_id",
            "title",
            "text",
        ]);
        if (!game) {
            res.status(404);
            throw new Error(errorConstants.ERR_GAME_NOT_FOUND);
        } else {
            res.send(game.articles);
        }
    } catch (error) {
        next(error);
    }
};
exports.getAllGameReviewsByGameId = async (req, res, next) => {
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
            res.status(404);
            throw new Error(errorConstants.ERR_GAME_NOT_FOUND);
        } else {
            res.send(game.reviews);
        }
    } catch (error) {
        next(error);
    }
};

exports.createGame = async (req, res, next) => {
    try {
        const validationResult = validationSchemas.gameSchemaJoi.validate(
            req.body,
        );
        if (validationResult.error) {
            res.status(400);
            throw new Error(validationResult.error.details[0].message);
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
        next(error);
    }
};

exports.createGameFromGB = (req, res, next) => {
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
                };
                this.createGame({ body: newGame }, res);
            });
    } catch (error) {
        next(error);
    }
};

exports.updateGame = async (req, res, next) => {
    try {
        const validationResult = validationSchemas.gameSchemaJoi.validate(
            req.body,
        );
        if (validationResult.error) {
            res.status(400);
            throw new Error(validationResult.error.details[0].message);
        } else {
            const game = await Game.findById(req.params.id);
            if (!game) {
                res.status(404);
                throw new Error(errorConstants.ERR_GAME_NOT_FOUND);
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
        next(error);
    }
};

exports.deleteGame = async (req, res, next) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            res.status(404);
            throw new Error(errorConstants.ERR_GAME_NOT_FOUND);
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
                if (articleNewGamesIds.length === 1) {
                    await Article.deleteOne({ _id: gameArticleId });
                } else {
                    const gameIndex = articleNewGamesIds.indexOf(game.id);
                    articleNewGamesIds.splice(gameIndex, 1);
                    await Article.updateOne(
                        { _id: gameArticleId },
                        { games: articleNewGamesIds },
                    );
                }
            }
            for (const gameReviewId of game.reviews) {
                const reviewWithoutGame = await Review.findByIdAndUpdate(
                    gameReviewId,
                    { game: "000000000000000000000000" },
                    { new: true },
                );
                if (
                    reviewWithoutGame.user.toString() ===
                    "000000000000000000000000"
                ) {
                    await Review.deleteOne({ _id: gameReviewId });
                }
            }
            await Game.deleteOne({ _id: game.id });
            this.getAllGames(req, res);
        }
    } catch (error) {
        next(error);
    }
};
