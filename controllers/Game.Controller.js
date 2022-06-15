const UserModel = require("../models/User.Model");
const GameModel = require("../models/Game.Model");
const ArticleModel = require("../models/Article.Model");

const ERR_GAME_NOT_FOUND = "A game with specified id is not found";

exports.getAllGames = async (req, res, next) => {
    try {
        const gamesFull = await GameModel.find({}).populate("articles", [
            "title",
            "text",
        ]);
        const games = [];
        gamesFull.forEach((game) => {
            games.push({ _id: game.id, title: game.title, desc: game.desc });
        });
        res.send(games);
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.getGameById = async (req, res, next) => {
    try {
        const gameFull = await GameModel.findById(req.params.id);
        const game = {
            _id: gameFull.id,
            title: gameFull.title,
            desc: gameFull.desc,
        };
        if (!game) {
            res.status(404).send(ERR_GAME_NOT_FOUND);
        } else {
            res.send(game);
        }
        next();
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.getAllGameArticlesByGameId = async (req, res, next) => {
    try {
        const game = await GameModel.findById(req.params.id).populate(
            "articles",
            ["title", "text"],
        );
        const articles = [];
        game.articles.forEach((article) => {
            articles.push({
                _id: article.id,
                title: article.title,
                text: article.text,
            });
        });
        res.send(articles);
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.createGame = async (req, res, next) => {
    try {
        await GameModel.create(req.body);
        this.getAllGames(req, res, next);
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
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
                    desc: randomGame.deck,
                    games: [],
                };
                const newReq = { body: newGame };
                this.createGame(newReq, res, next);
            });
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.updateGame = async (req, res, next) => {
    try {
        const gameId = req.params.id;
        const game = await GameModel.findById(gameId);
        if (!game) {
            res.status(404).send(ERR_GAME_NOT_FOUND);
        } else {
            game.users.forEach(async (gameUserId) => {
                const user = await UserModel.findById(gameUserId);
                const userNewGameIds = user.games;
                const gameIndex = userNewGameIds.indexOf(gameId);
                userNewGameIds.splice(gameIndex, 1);
                await UserModel.findByIdAndUpdate(
                    gameUserId,
                    { games: userNewGameIds },
                    { new: true },
                );
            });
            req.body.users.forEach(async (gameNewUserId) => {
                const user = await UserModel.findById(gameNewUserId);
                const userNewGameIds = user.games;
                userNewGameIds.push(gameId);
                await UserModel.findByIdAndUpdate(
                    gameNewUserId,
                    { games: userNewGameIds },
                    { new: true },
                );
            });

            game.articles.forEach(async (gameArticleId) => {
                const article = await ArticleModel.findById(gameArticleId);
                const articleNewGameIds = article.games;
                const gameIndex = articleNewGameIds.indexOf(gameId);
                articleNewGameIds.splice(gameIndex, 1);
                await UserModel.findByIdAndUpdate(
                    gameArticleId,
                    { games: articleNewGameIds },
                    { new: true },
                );
            });
            req.body.articles.forEach(async (gameNewArticleId) => {
                const article = await ArticleModel.findById(gameNewArticleId);
                const articleNewGameIds = article.games;
                articleNewGameIds.push(gameId);
                await UserModel.findByIdAndUpdate(
                    gameNewArticleId,
                    { games: articleNewGameIds },
                    { new: true },
                );
            });

            await GameModel.findByIdAndUpdate(gameId, req.body, { new: true });
            this.getAllGames(req, res, next);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.deleteGame = async (req, res, next) => {
    try {
        const game = await GameModel.findById(req.params.id);
        if (!game) {
            res.status(404).send(ERR_GAME_NOT_FOUND);
        } else {
            game.users.forEach(async (gameUserId) => {
                const user = await UserModel.findById(gameUserId);
                const userNewGameIds = user.games;
                const gameIndex = userNewGameIds.indexOf(game.id);
                userNewGameIds.splice(gameIndex, 1);
                await UserModel.findByIdAndUpdate(
                    gameUserId,
                    { games: userNewGameIds },
                    { new: true },
                );
            });

            game.articles.forEach(async (gameArticleId) => {
                const article = await ArticleModel.findById(gameArticleId);
                const articleNewGameIds = article.games;
                const gameIndex = articleNewGameIds.indexOf(game.id);
                articleNewGameIds.splice(gameIndex, 1);
                if (articleNewGameIds.length === 0) {
                    await ArticleModel.findByIdAndDelete(gameArticleId);
                }
                await UserModel.findByIdAndUpdate(
                    gameArticleId,
                    { games: articleNewGameIds },
                    { new: true },
                );
            });

            await GameModel.findByIdAndDelete(game.id, { new: true });
            this.getAllGames(req, res, next);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};
