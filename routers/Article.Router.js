const express = require("express");
const ArticleController = require("../controllers/Article.Controller");

const router = express.Router();

router
    .route("/")
    .get(ArticleController.getAllArticles)
    .post(ArticleController.createArticle);

router
    .route("/:id")
    .get(ArticleController.getArticleById)
    .put(ArticleController.updateArticle)
    .delete(ArticleController.deleteArticle);

router
    .route("/:id/games")
    .get(ArticleController.getAllArticleGamesByArticleId);

module.exports = router;
