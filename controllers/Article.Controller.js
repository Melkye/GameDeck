const GameModel = require("../models/Game.Model");
const ArticleModel = require("../models/Article.Model");

const ERR_ARTICLE_NOT_FOUND = "An article with specified id is not found";

exports.getAllArticles = async (req, res, next) => {
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
        next();
    }
};

exports.getArticleById = async (req, res, next) => {
    try {
        const articleFull = await ArticleModel.findById(req.params.id);
        const article = {
            _id: articleFull.id,
            title: articleFull.title,
            text: articleFull.text,
        };
        if (!article) {
            res.status(404).send(ERR_ARTICLE_NOT_FOUND);
        } else {
            res.send(article);
        }
        next();
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.getAllArticleGamesByArticleId = async (req, res, next) => {
    try {
        const article = await ArticleModel.findById(req.params.id).populate(
            "games",
            ["title", "desc"],
        );
        const games = [];
        article.games.forEach((game) => {
            games.push({ _id: game.id, title: game.title, desc: game.desc });
        });
        res.send(games);
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.createArticle = async (req, res, next) => {
    try {
        const newArticle = await ArticleModel.create(req.body);
        const newArticleId = newArticle.id;
        req.body.games.forEach(async (articleGameId) => {
            const game = await GameModel.findById(articleGameId);
            const newGameArticleIds = game.articles;
            newGameArticleIds.push(newArticleId);
            await GameModel.findByIdAndUpdate(
                articleGameId,
                { articles: newGameArticleIds },
                { new: true },
            );
        });
        this.getAllArticles(req, res, next);
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.updateArticle = async (req, res, next) => {
    try {
        const articleId = req.params.id;
        const article = await ArticleModel.findById(articleId);
        if (!article) {
            res.status(404).send(ERR_ARTICLE_NOT_FOUND);
        } else {
            article.games.forEach(async (articleGameId) => {
                const game = await GameModel.findById(articleGameId);
                const gameNewArticleIds = game.articles;
                const articleIndex = gameNewArticleIds.indexOf(articleId);
                gameNewArticleIds.splice(articleIndex, 1);
                await GameModel.findByIdAndUpdate(
                    articleGameId,
                    { articles: gameNewArticleIds },
                    { new: true },
                );
            });
            req.body.games.forEach(async (articleNewGameId) => {
                const game = await GameModel.findById(articleNewGameId);
                const gameNewArticleIds = game.articles;
                gameNewArticleIds.push(articleId);
                await GameModel.findByIdAndUpdate(
                    articleNewGameId,
                    { articles: gameNewArticleIds },
                    { new: true },
                );
            });
            await ArticleModel.findByIdAndUpdate(articleId, req.body, {
                new: true,
            });
            this.getAllArticles(req, res, next);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.deleteArticle = async (req, res, next) => {
    try {
        const article = await ArticleModel.findById(req.params.id);
        if (!article) {
            res.status(404).send(ERR_ARTICLE_NOT_FOUND);
        } else {
            article.games.forEach(async (articleGameId) => {
                const game = await GameModel.findById(articleGameId);
                const gameNewArticleIds = game.articles;
                const articleIndex = gameNewArticleIds.indexOf(article.id);
                gameNewArticleIds.splice(articleIndex, 1);
                await GameModel.findByIdAndUpdate(
                    articleGameId,
                    { articles: gameNewArticleIds },
                    { new: true },
                );
            });
            await ArticleModel.findByIdAndDelete(req.params.id);
            this.getAllArticles(req, res, next);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};
