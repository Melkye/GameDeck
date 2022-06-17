const Joi = require("joi");

const GameModel = require("../models/Game.Model");
const ArticleModel = require("../models/Article.Model");

const articleSchemaJoi = Joi.object({
    title: Joi.string().min(3).required(),
    text: Joi.string().min(3).required(),
    games: Joi.array().required()
}); 

const ERR_ARTICLE_NOT_FOUND = "An article with specified id is not found";

exports.getAllArticles = async (req, res) => {
    try {
        const articlesFull = await ArticleModel.find({});
        const articles = [];
        articlesFull.forEach((article) => {
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

exports.getArticleById = async (req, res) => {
    try {
        const articleFull = await ArticleModel.findById(req.params.id);
        if (!articleFull) {
            res.status(404).send(ERR_ARTICLE_NOT_FOUND);
        } else {
            const article = {
                _id: articleFull.id,
                title: articleFull.title,
                text: articleFull.text,
            };
            res.send(article);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.getAllArticleGamesByArticleId = async (req, res) => {
    try {
        const article = await ArticleModel.findById(req.params.id).populate(
            "games",
            ["title", "desc"],
        );
        if (!article)
        {
            res.status(404).send(ERR_ARTICLE_NOT_FOUND);
        }
        else {
            const games = [];
            article.games.forEach((game) => {
                games.push({ _id: game.id, title: game.title, desc: game.desc });
            });
            res.send(games);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.createArticle = async (req, res) => {
    try {
        const validationResult = articleSchemaJoi.validate(req.body);
        if (validationResult.error) {
            res.status(400).send(validationResult.error.message);
        }
        else {
            const newArticle = await ArticleModel.create(req.body);
            const newArticleId = newArticle.id;
            for (const articleGameId of req.body.games) {
                const game = await GameModel.findById(articleGameId);
                const newGameArticleIds = game.articles;
                newGameArticleIds.push(newArticleId);
                await GameModel.findByIdAndUpdate(
                    articleGameId,
                    { articles: newGameArticleIds },
                    { new: true },
                );
            }
            this.getAllArticles(req, res);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.updateArticle = async (req, res) => {
    try {
        const validationResult = articleSchemaJoi.validate(req.body);
        if (validationResult.error) {
            res.status(400).send(validationResult.error.message);
        }
        else {
            const articleId = req.params.id;
            const article = await ArticleModel.findById(articleId);
            if (!article) {
                res.status(404).send(ERR_ARTICLE_NOT_FOUND);
            } else {
                for (const articleGameId of article.games) {
                    const game = await GameModel.findById(articleGameId);
                    const gameNewArticleIds = game.articles;
                    const articleIndex = gameNewArticleIds.indexOf(articleId);
                    gameNewArticleIds.splice(articleIndex, 1);
                    await GameModel.findByIdAndUpdate(
                        articleGameId,
                        { articles: gameNewArticleIds },
                        { new: true },
                    );
                }
                for (const articleNewGameId of req.body.games) {
                    const game = await GameModel.findById(articleNewGameId);
                    const gameNewArticleIds = game.articles;
                    gameNewArticleIds.push(articleId);
                    await GameModel.findByIdAndUpdate(
                        articleNewGameId,
                        { articles: gameNewArticleIds },
                        { new: true },
                    );
                }
                await ArticleModel.findByIdAndDelete(articleId,  { new: true, });
                this.getAllArticles(req, res);
            }
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.deleteArticle = async (req, res) => {
    try {
        const article = await ArticleModel.findById(req.params.id);
        if (!article) {
            res.status(404).send(ERR_ARTICLE_NOT_FOUND);
        } else {
            for (const articleGameId of article.games) {
                const game = await GameModel.findById(articleGameId);
                const gameNewArticleIds = game.articles;
                const articleIndex = gameNewArticleIds.indexOf(article.id);
                gameNewArticleIds.splice(articleIndex, 1);
                await GameModel.findByIdAndUpdate(
                    articleGameId,
                    { articles: gameNewArticleIds },
                    { new: true },
                );
            }
            await ArticleModel.findByIdAndDelete(req.params.id);
            this.getAllArticles(req, res);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};
