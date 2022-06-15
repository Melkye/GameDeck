const UserModel = require("../models/User.Model");
const GameModel = require("../models/Game.Model");
const ArticleModel = require("../models/Article.Model");

const ERR_USER_NOT_FOUND = "A user with specified id is not found";

exports.getAllUsers = async (req, res, next) => {
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
        next();
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const userFull = await UserModel.findById(req.params.id);
        const user = {
            _id: userFull.id,
            name: userFull.name,
            email: userFull.email,
        };
        if (!user) {
            res.status(404).send(ERR_USER_NOT_FOUND);
        } else {
            res.send(user);
        }
        next(); // ?
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.getAllUserGamesByUserId = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.params.id).populate("games", [
            "title",
            "desc",
        ]);
        const games = [];
        user.games.forEach((game) => {
            games.push({ _id: game.id, title: game.title, desc: game.desc });
        });
        res.send(games);
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.getAllUserArticlesByUserId = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.params.id).populate({
            path: "games",
            populate: { path: "articles" },
        });
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
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.createUser = async (req, res, next) => {
    try {
        await UserModel.create(req.body);
        this.getAllUsers(req, res, next);
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.subscribeToGame = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            res.status(404).send(ERR_USER_NOT_FOUND);
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

            const game = await GameModel.findById(req.params.gameId);
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
            res.send("User already subscribed!");
        }
        next();
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await UserModel.findById(userId);
        if (!user) {
            res.status(404).send(ERR_USER_NOT_FOUND);
        } else {
            user.games.forEach(async (userGameId) => {
                const game = await GameModel.findById(userGameId);
                const gameNewUserIds = game.users;
                const userIndex = gameNewUserIds.indexOf(userId);
                gameNewUserIds.splice(userIndex, 1);
                await GameModel.findByIdAndUpdate(
                    userGameId,
                    { users: gameNewUserIds },
                    { new: true },
                );
            });
            req.body.games.forEach(async (userNewGameId) => {
                const game = await GameModel.findById(userNewGameId);
                const gameNewUserIds = game.users;
                gameNewUserIds.push(userId);
                await GameModel.findByIdAndUpdate(
                    userNewGameId,
                    { users: gameNewUserIds },
                    { new: true },
                );
            });
            await UserModel.findByIdAndUpdate(userId, req.body, { new: true });
            const userToSend = {
                _id: user.id,
                name: user.name,
                email: user.email,
            };
            res.send(userToSend);
        }
    } catch (error) {
        res.send(error.message);
        console.error(error);
        next();
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            res.status(404).send(ERR_USER_NOT_FOUND);
        } else {
            user.games.forEach(async (userGameId) => {
                const game = await GameModel.findById(userGameId);
                const gameNewUserIds = game.users;
                const userIndex = gameNewUserIds.indexOf(user.id);
                gameNewUserIds.splice(userIndex, 1);
                await GameModel.findByIdAndUpdate(
                    userGameId,
                    { users: gameNewUserIds },
                    { new: true },
                );
            });
            await UserModel.findByIdAndUpdate(user.id, req.body, { new: true });
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
        next();
    }
};
