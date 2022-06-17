const Joi = require("joi");

const UserModel = require("../models/User.Model");
const GameModel = require("../models/Game.Model");

const ERR_USER_NOT_FOUND = "A user with specified id is not found";
const ERR_GAME_NOT_FOUND = "A game with specified id is not found";
const ERR_USER_SUBSCRIBED = "User already subscribed!";

const userSchemaJoi = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().min(3).required(),
    games: Joi.array().required()
}); 

exports.getAllUsers = async (req, res) => {
    try {
        const usersFull = await UserModel.find({});
        const users = [];
        usersFull.forEach((user) => {
            users.push({ _id: user.id, name: user.name, email: user.email });
        });
        res.send(users);
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userFull = await UserModel.findById(req.params.id);
        if (!userFull) {
            res.status(404).send(ERR_USER_NOT_FOUND);
        } else {
            const user = {
                _id: userFull.id,
                name: userFull.name,
                email: userFull.email,
            };
            res.send(user);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.getAllUserGamesByUserId = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id).populate("games", [
            "title",
            "desc",
        ]);
        if (!user)
        {
            res.status(404).send(ERR_USER_NOT_FOUND);
        }
        else {
            const games = [];
            user.games.forEach((game) => {
                games.push({ _id: game.id, title: game.title, desc: game.desc });
            });
            res.send(games);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.getAllUserArticlesByUserId = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id).populate({
            path: "games",
            populate: { path: "articles" },
        });
        if (!user)
        {
            res.status(404).send(ERR_USER_NOT_FOUND);
        }
        else {
            const articles = [];
            user.games.forEach((game) => {
                game.articles.forEach((article) => {
                    const newArticle = {
                        id: article.id,
                        title: article.title,
                        text: article.text,
                    };
                    if (!articles.find((a) => a.id === newArticle.id)) {
                        articles.push(newArticle);
                    }
                });
            });
            res.send(articles);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.createUser = async (req, res) => {
    try {
        const validationResult = userSchemaJoi.validate(req.body);
        if (validationResult.error) {
            res.status(400).send(validationResult.error);
        }
        else {
            await UserModel.create(req.body);
            this.getAllUsers(req, res);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.subscribeToGame = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        const game = await GameModel.findById(req.params.gameId);
        if (!user) {
            res.status(404).send(ERR_USER_NOT_FOUND);
        } else if (!game) {
            res.status(404).send(ERR_GAME_NOT_FOUND);
        } else if (
            !user.games.find((g) => g.toString() === req.params.gameId)
        ) {
            const userNewGamesIds = user.games;
            userNewGamesIds.push(req.params.gameId);
            await UserModel.findByIdAndUpdate(
                req.params.id,
                { games: userNewGamesIds },
                { new: true },
            );

            const gameNewUsersIds = game.users;
            gameNewUsersIds.push(req.params.id);
            await GameModel.findByIdAndUpdate(
                req.params.gameId,
                { users: gameNewUsersIds },
                { new: true },
            );

            const userToSend = {
                _id: user.id,
                name: user.name,
                email: user.email,
            };
            res.send(userToSend);
        } else {
            res.send(ERR_USER_SUBSCRIBED);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.updateUser = async (req, res) => {
    try {
        const validationResult = userSchemaJoi.validate(req.body);
        if (validationResult.error) {
            res.status(400).send(validationResult.error);
        }
        else {
            const userId = req.params.id;
            const user = await UserModel.findById(userId);
            let gamesExist = true;
            req.body.games.every(async gameId => {
                if (!(await GameModel.findById(gameId)))
                {
                    gamesExist = false;
                    return false;
                }
                return true;
            });
            if (!user) {
                res.status(404).send(ERR_USER_NOT_FOUND);
            } else if (!gamesExist) {
                res.status(404).send(ERR_GAME_NOT_FOUND);
            } else {
                for (const userGameId of user.games) {
                    const game = await GameModel.findById(userGameId);
                    const gameNewUserIds = game.users;
                    const userIndex = gameNewUserIds.indexOf(userId);
                    gameNewUserIds.splice(userIndex, 1);
                    await GameModel.findByIdAndUpdate(
                        userGameId,
                        { users: gameNewUserIds },
                        { new: true },
                    );
                }
                for (const userNewGameId of req.body.games) {
                    const game = await GameModel.findById(userNewGameId);
                    const gameNewUserIds = game.users;
                    if (gameNewUserIds.indexOf(userId) === -1) {
                        gameNewUserIds.push(userId);
                        await GameModel.findByIdAndUpdate(
                            userNewGameId,
                            { users: gameNewUserIds },
                            { new: true },
                        );
                    }
                }
                await UserModel.findByIdAndUpdate(userId, req.body, { new: true });
                this.getUserById(req, res);
            }
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            res.status(404).send(ERR_USER_NOT_FOUND);
        } else {
            for (const userGameId of user.games) {
                const game = await GameModel.findById(userGameId);
                const gameNewUserIds = game.users;
                const userIndex = gameNewUserIds.indexOf(user.id);
                gameNewUserIds.splice(userIndex, 1);
                await GameModel.findByIdAndUpdate(
                    userGameId,
                    { users: gameNewUserIds },
                    { new: true },
                );
            }
            await UserModel.findByIdAndDelete(user.id, { new: true });
            const usersFull = await UserModel.find({});
            const users = [];
            usersFull.forEach((u) => {
                users.push({ _id: u.id, name: u.name, email: u.email });
            });
            res.send(users);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
    }
};
