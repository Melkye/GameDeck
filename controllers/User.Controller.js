const fs = require("fs");

const db = require("../db.json");

function saveDbChanges() {
  fs.writeFile("db.json", JSON.stringify(db, null, 4), (error) => {
    if (error) throw error;
  });
}

exports.getAllUsers = (req, res, next) => {
  try {
    res.send(db.users);
  } catch (error) {
    res.send(error.message);
    console.error(error);
    next();
  }
};

exports.getUserById = (req, res, next) => {
  try {
    const user = db.users.find((u) => u.id === parseInt(req.params.id, 10));
    if (!user) {
      res.status(404).send("A user with specified id is not found");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.send(error.message);
    console.error(error);
    next();
  }
};

exports.createUser = (req, res, next) => {
  try {
    const newUser = {
      id: db.users[db.users.length - 1].id + 1,
      name: req.body.name,
      email: req.body.email,
    };
    db.users.push(newUser);
    saveDbChanges();
    res.send(db.users);
  } catch (error) {
    res.send(error.message);
    console.error(error);
    next();
  }
};

exports.updateUser = (req, res, next) => {
  try {
    const user = db.users.find((u) => u.id === parseInt(req.params.id, 10));
    if (!user) {
      res.status(404).send("A user with specified id is not found");
    } else {
      const userIndex = db.users.indexOf(user);
      db.users[userIndex].name = req.body.name;
      db.users[userIndex].email = req.body.email;
      saveDbChanges();
      res.send(db.users);
    }
  } catch (error) {
    res.send(error.message);
    console.error(error);
    next();
  }
};

exports.deleteUser = (req, res, next) => {
  try {
    const user = db.users.find((u) => u.id === parseInt(req.params.id, 10));
    if (!user) {
      res.status(404).send("A user with specified id is not found");
    } else {
      const userIndex = db.users.indexOf(user);
      db.users.splice(userIndex, 1);
      res.send(db.users);
    }
  } catch (error) {
    res.send(error.message);
    console.error(error);
    next();
  }
};