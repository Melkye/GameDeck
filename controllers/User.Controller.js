const User = require("../models/User.Model");
const Game = require("../models/Game.Model");
const Review = require("../models/Review.Model");

const errorConstants = require("../errorConstants");
const validationSchemas = require("../validationSchemas");

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select(["_id", "name", "email"]); // underscore?
        res.send(users);
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select([
            "_id",
            "name",
            "email",
        ]);
        if (!user) {
            res.status(404).send(errorConstants.ERR_USER_NOT_FOUND);
        } else {
            res.send(user);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.getAllUserGamesByUserId = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("games", [
            "_id",
            "title",
            "description",
        ]);
        if (!user) {
            res.status(404).send(errorConstants.ERR_USER_NOT_FOUND);
        } else {
            res.send(user.games);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.getAllUserReviewsByUserId = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate({
            path: "reviews",
            select: ["_id", "text", "isGameRecommended"],
            populate: {
                path: "game",
                select: ["_id", "title", "description"],
            },
        });
        if (!user) {
            res.status(404).send(errorConstants.ERR_USER_NOT_FOUND);
        } else {
            res.send(user.reviews);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.getAllUserArticlesByUserId = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate({
            path: "games",
            select: ["_id", "title", "description"],
            populate: {
                path: "articles",
                select: ["_id", "title", "text"],
            },
        });
        if (!user) {
            res.status(404).send(errorConstants.ERR_USER_NOT_FOUND);
        } else {
            const articles = [];
            user.games.forEach((game) => {
                game.articles.forEach((article) => {
                    if (!articles.find((a) => a.id === article.id)) {
                        articles.push({
                            id: article.id,
                            title: article.title,
                            text: article.text,
                        });
                    }
                });
            });
            res.send(user.games);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.createUser = async (req, res) => {
    try {
        const validationResult = validationSchemas.userSchemaJoi.validate(
            req.body,
        );
        if (validationResult.error) {
            res.status(400).send(validationResult.error.details[0].message);
        } else {
            const newUser = {
                name: req.body.name,
                email: req.body.email,
                games: [],
                reviews: [],
            };
            await User.create(newUser);
            this.getAllUsers(req, res);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.updateUser = async (req, res) => {
    try {
        const validationResult = validationSchemas.userSchemaJoi.validate(
            req.body,
        );
        if (validationResult.error) {
            res.status(400).send(validationResult.error.details[0].message);
        } else {
            const user = await User.findById(req.params.id);
            if (!user) {
                res.status(404).send(errorConstants.ERR_USER_NOT_FOUND);
            } else {
                const updatedUser = await User.findByIdAndUpdate(
                    req.params.id,
                    req.body,
                    { new: true },
                );
                res.send(updatedUser);
            }
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).send(errorConstants.ERR_USER_NOT_FOUND);
        } else {
            for (const userGameId of user.games) {
                const game = await Game.findById(userGameId);
                const gameNewUsersIds = game.users;
                const userIndex = gameNewUsersIds.indexOf(user.id);
                gameNewUsersIds.splice(userIndex, 1);
                await Game.updateOne(
                    { _id: userGameId },
                    { users: gameNewUsersIds },
                );
            }

            for (const userReviewId of user.reviews) {
                const reviewWithoutUser = await Review.findByIdAndUpdate(
                    userReviewId,
                    { user: undefined },
                    { new: true },
                );
                if (!reviewWithoutUser.game) {
                    await Review.deleteOne({ _id: userReviewId });
                }
            }

            await User.deleteOne({ _id: user.id });
            this.getAllUsers(req, res);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.subscribeToGame = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const game = await Game.findById(req.params.gameId);
        if (!user) {
            res.status(404).send(errorConstants.ERR_USER_NOT_FOUND);
        } else if (!game) {
            res.status(404).send(errorConstants.ERR_GAME_NOT_FOUND);
        } else if (
            user.games.find((gameId) => gameId.toString() === req.params.gameId)
        ) {
            res.send(errorConstants.ERR_USER_SUBSCRIBED);
        } else {
            const userNewGamesIds = user.games;
            userNewGamesIds.push(req.params.gameId);
            await User.updateOne(
                { _id: req.params.id },
                { games: userNewGamesIds },
            );

            const gameNewUsersIds = game.users;
            gameNewUsersIds.push(req.params.id);
            await Game.updateOne(
                { _id: req.params.gameId },
                { users: gameNewUsersIds },
            );

            this.getAllUserGamesByUserId(req.params.id);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.unsubscribeFromGame = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const game = await Game.findById(req.params.gameId);
        if (!user) {
            res.status(404).send(errorConstants.ERR_USER_NOT_FOUND);
        } else if (!game) {
            res.status(404).send(errorConstants.ERR_GAME_NOT_FOUND);
        } else if (
            !user.games.find(
                (gameId) => gameId.toString() === req.params.gameId,
            )
        ) {
            res.send(errorConstants.ERR_USER_NOT_SUBSCRIBED);
        } else {
            const userNewGamesIds = user.games;
            const gameIndex = userNewGamesIds.indexOf(req.params.gameId);
            userNewGamesIds.splice(gameIndex, 1);
            await User.updateOne(
                { _id: req.params.id },
                { games: userNewGamesIds },
            );

            const gameNewUsersIds = game.users;
            const userIndex = gameNewUsersIds.indexOf(req.params.id);
            gameNewUsersIds.splice(userIndex, 1);
            await Game.updateOne(
                { _id: req.params.gameId },
                { users: gameNewUsersIds },
            );

            this.getAllUserGamesByUserId(req.params.id);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.createReview = async (req, res) => {
    try {
        const userId = req.params.id;
        const gameId = req.body.game;
        const review = {
            text: req.body.text,
            isGameRecommended: req.body.isGameRecommended,
            user: userId,
            game: gameId,
        };
        const validationResult =
            validationSchemas.reviewSchemaJoi.validate(review);
        if (validationResult.error) {
            res.status(400).send(validationResult.error.details[0].message);
        } else {
            const user = await User.findById(userId);
            const game = await Game.findById(gameId);
            if (!user) {
                res.status(404).send(errorConstants.ERR_USER_NOT_FOUND);
            } else if (!game) {
                res.status(404).send(errorConstants.ERR_GAME_NOT_FOUND);
            } else {
                const newReview = await Review.create(review);

                const userNewReviewsIds = user.reviews;
                userNewReviewsIds.push(newReview.id);
                await User.updateOne(
                    { _id: req.params.id },
                    { reviews: userNewReviewsIds },
                );

                const gameNewReviewsIds = game.reviews;
                gameNewReviewsIds.push(newReview.id);
                await game.updateOne(
                    { _id: req.params.id },
                    { reviews: gameNewReviewsIds },
                );

                this.getAllUserReviewsByUserId(req, res);
            }
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) {
            res.status(404).send(errorConstants.ERR_REVIEW_NOT_FOUND);
        } else if (req.body.game) {
            /// //////////////////////////////////////////////////////////////
            res.status(405).send(
                errorConstants.ERR_REVIEW_GAME_CHANGE_NOT_ALLOWED,
            );
        } else {
            const updatedReviewData = {
                text: req.body.text,
                isGameRecommended: req.body.isGameRecommended,
                game: review.game,
            };
            const validationResult =
                validationSchemas.userSchemaJoi.validate(updatedReviewData);
            if (validationResult.error) {
                res.status(400).send(validationResult.error.details[0].message);
            } else {
                const updatedReview = await Review.findByIdAndUpdate(
                    req.params.reviewId,
                    updatedReviewData,
                    { new: true },
                );
                res.send(updatedReview);
            }
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const userId = req.params.id;
        const { reviewId } = req.params;

        const user = await User.findById(userId);
        const review = await Review.findById(reviewId);
        if (!user) {
            res.status(404).send(errorConstants.ERR_USER_NOT_FOUND);
        } else if (!review) {
            res.status(404).send(errorConstants.ERR_REVIEW_NOT_FOUND);
        } else {
            const userNewReviewsIds = user.reviews;
            const userReviewIndex = userNewReviewsIds.indexOf(reviewId);
            userNewReviewsIds.splice(userReviewIndex, 1);
            await User.updateOne(
                { _id: req.params.id },
                { reviews: userNewReviewsIds },
            );

            const game = await Game.findById(review.game);
            const gameNewReviewsIds = game.reviews;
            const gameReviewIndex = gameNewReviewsIds.indexOf(reviewId);
            gameNewReviewsIds.splice(gameReviewIndex, 1);
            await Game.updateOne(
                { _id: req.params.id },
                { reviews: gameNewReviewsIds },
            );

            await Review.deleteOne({ _id: reviewId });

            this.getAllUserReviewsByUserId(req, res);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};
