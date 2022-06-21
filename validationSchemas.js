/* eslint-disable no-unused-vars */
const joi = require("joi");
const { joiPassword } = require("joi-password");

exports.userSchemaJoi = joi.object({
    name: joi.string().min(3).required(),
    email: joi.string().email().min(8).max(32).required(),
    // password: joiPassword().string().min(8).max(32).required(),
    // isAdmin: joi.boolean().required(),
    // games: joi.array().items(joi.string().length(24)).required(), // or remove those?
    // reviews: joi.array().items(joi.string().length(24)).required()
});

exports.gameSchemaJoi = joi.object({
    title: joi.string().min(3).required(),
    description: joi.string().min(3).required(),
    // users: joi.array().required(),
    // articles: joi.array().items(joi.string().length(24)).required(),
    // reviews: joi.array().items(joi.string().length(24)).required()
});

exports.articleSchemaJoi = joi.object({
    title: joi.string().min(3).required(),
    text: joi.string().min(3).required(),
    author: joi.string().min(3).required(),
    games: joi.array().items(joi.string().length(24)).required(),
});

exports.reviewSchemaJoi = joi.object({
    text: joi.string().min(3).required(),
    isGameRecommended: joi.boolean().required(),
    // user: joi.string().length(24).required(),
    game: joi.string().length(24).required(),
});
