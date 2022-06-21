const Game = require("../models/Game.Model");
const Article = require("../models/Article.Model");

const errorConstants = require("../errorConstants");
const validationSchemas = require("../validationSchemas");

exports.getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find({}).select([
            "_id",
            "title",
            "text",
        ]);
        res.send(articles);
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).select([
            "_id",
            "title",
            "text",
        ]);
        if (!article) {
            res.status(404).send(errorConstants.ERR_ARTICLE_NOT_FOUND);
        } else {
            res.send(article);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.getAllArticleGamesByArticleId = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate(
            "games",
            ["_id", "title", "description"],
        );
        if (!article) {
            res.status(404).send(errorConstants.ERR_ARTICLE_NOT_FOUND);
        } else {
            res.send(article.games);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.createArticle = async (req, res) => {
    try {
        const validationResult = validationSchemas.articleSchemaJoi.validate(
            req.body,
        );
        if (validationResult.error) {
            res.status(400).send(validationResult.error.details[0].message);
        } else {
            let allGamesExist = true;
            for (const articleGameId of req.body.games) {
                const game = await Game.findById(articleGameId);
                if (!game) {
                    allGamesExist = false;
                    res.send(
                        `${errorConstants.ERR_GAME_NOT_FOUND}:${articleGameId}`,
                    );
                }
            }
            if (allGamesExist) {
                const newArticle = await Article.create(req.body);

                for (const articleGameId of req.body.games) {
                    const game = await Game.findById(articleGameId);
                    const newGameArticleIds = game.articles;
                    newGameArticleIds.push(newArticle.id);

                    await Game.updateOne(
                        { _id: articleGameId },
                        { articles: newGameArticleIds },
                    );
                }
                this.getAllArticles(req, res);
            }
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.updateArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            res.status(404).send(errorConstants.ERR_ARTICLE_NOT_FOUND);
        } else if (req.body.games) {
            res.status(405).send(
                errorConstants.ERR_ARTICLE_GAMES_CHANGE_NOT_ALLOWED,
            );
        } else {
            const updatedArticleData = {
                title: req.body.data,
                text: req.body.text,
                games: article.games,
            };
            const validationResult =
                validationSchemas.articleSchemaJoi.validate(updatedArticleData);
            if (validationResult.error) {
                res.status(400).send(validationResult.error.details[0].message);
            } else {
                const updatedArticle = await Article.findByIdAndUpdate(
                    req.params.id,
                    req.body,
                    { new: true },
                );
                res.send(updatedArticle);
            }
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            res.status(404).send(errorConstants.ERR_ARTICLE_NOT_FOUND);
        } else {
            for (const articleGameId of article.games) {
                const game = await Game.findById(articleGameId);
                const gameNewArticleIds = game.articles;
                const articleIndex = gameNewArticleIds.indexOf(article.id);
                gameNewArticleIds.splice(articleIndex, 1);

                await Game.updateOne(
                    { _id: articleGameId },
                    { articles: gameNewArticleIds },
                );
            }
            await Article.deleteOne({ _id: req.params.id });
            this.getAllArticles(req, res);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};
