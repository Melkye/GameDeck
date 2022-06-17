const Joi = require("joi");

const UserModel = require("../models/User.Model");
const GameModel = require("../models/Game.Model");
const ArticleModel = require("../models/Article.Model");

const ERR_GAME_NOT_FOUND = "A game with specified id is not found";
const ERR_USER_NOT_FOUND = "A user with specified id is not found";
const ERR_ARTICLE_NOT_FOUND = "An article with specified id is not found";

const gameSchemaJoi = Joi.object({
    title: Joi.string().min(3).required(),
    desc: Joi.string().min(3).required(),
    users: Joi.array().required(),
    articles: Joi.array().required()
}); 

exports.getAllGames = async (req, res) => {
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
    }
};

exports.getGameById = async (req, res) => {
    try {
        const gameFull = await GameModel.findById(req.params.id);
        if (!gameFull) {
            res.status(404).send(ERR_GAME_NOT_FOUND);
        } else {
            const game = {
                _id: gameFull.id,
                title: gameFull.title,
                desc: gameFull.desc,
            };
            res.send(game);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.getAllGameArticlesByGameId = async (req, res) => {
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
    }
};

exports.createGame = async (req, res) => {
    try {
        const validationResult = gameSchemaJoi.validate(req.body);
        if (validationResult.error) {
            res.status(400).send(validationResult.error.message);
        }
        else {
            await GameModel.create(req.body);
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
                    desc: randomGame.deck,
                    games: [],
                };
                const newReq = { body: newGame };
                this.createGame(newReq, res);
            });
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.updateGame = async (req, res) => {
    try {
        const validationResult = gameSchemaJoi.validate(req.body);
        if (validationResult.error) {
            res.status(400).send(validationResult.error.message);
        }
        else {
            const gameId = req.params.id;
            const game = await GameModel.findById(gameId);
            let usersExist = true;
            const updateUsers = req.body.users;
            for (const userId of updateUsers) {
                const user = await UserModel.findById(userId);
                if (!user) {
                    usersExist = false;
                }
            }
            let articlesExist = true;
            const updateArticles = req.body.articles;
            for (const articleId of updateArticles) {
                const article = await ArticleModel.findById(articleId);
                if (!article) {
                    articlesExist = false;
                }
            }
            if (!game) {
                res.status(404).send(ERR_GAME_NOT_FOUND);
            } else if (!usersExist) {
                res.status(404).send(ERR_USER_NOT_FOUND);
            } else if (!articlesExist) {
                res.status(404).send(ERR_ARTICLE_NOT_FOUND);
            } else {
                for (const gameUserId of game.users) {
                    const user = await UserModel.findById(gameUserId);
                    const userNewGameIds = user.games;
                    const gameIndex = userNewGameIds.indexOf(gameId);
                    userNewGameIds.splice(gameIndex, 1);
                    await UserModel.findByIdAndUpdate(
                        gameUserId,
                        { games: userNewGameIds },
                        { new: true },
                    );
                }
                for (const gameNewUserId of updateUsers) {
                    const user = await UserModel.findById(gameNewUserId);
                    const userNewGameIds = user.games;
                    if (userNewGameIds.indexOf(gameId) === -1)
                    {
                        userNewGameIds.push(gameId);
                        await UserModel.findByIdAndUpdate(
                            gameNewUserId,
                            { games: userNewGameIds },
                            { new: true },
                        );
                    }
                }

                for (const gameArticleId of game.articles) {
                    const article = await ArticleModel.findById(gameArticleId);
                    const articleNewGameIds = article.games;
                    const gameIndex = articleNewGameIds.indexOf(gameId);
                    articleNewGameIds.splice(gameIndex, 1);
                    if (articleNewGameIds.length === 0) {
                        await ArticleModel.findByIdAndDelete(gameArticleId);
                    }
                    await UserModel.findByIdAndUpdate(
                        gameArticleId,
                        { games: articleNewGameIds },
                        { new: true },
                    );
                }
                for (const gameNewArticleId of updateArticles) {
                    const article = await ArticleModel.findById(gameNewArticleId);
                    const articleNewGameIds = article.games;
                    if (articleNewGameIds.indexOf(gameId) === -1)
                    {
                        articleNewGameIds.push(gameId);
                        await UserModel.findByIdAndUpdate(
                            gameNewArticleId,
                            { games: articleNewGameIds },
                            { new: true },
                        );
                    }
                }
                await GameModel.findByIdAndUpdate(gameId, req.body, { new: true });
                this.getAllGames(req, res);
            }
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.deleteGame = async (req, res) => {
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
            this.getAllGames(req, res);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};
