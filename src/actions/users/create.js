"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../../models/User"));
const objection_1 = require("objection");
exports.default = async ({ body: { name, email } }, reply) => User_1.default.query()
    .insert({ name, email })
    .then((user) => reply.code(201).send(user))
    .catch((error) => {
    if (error instanceof objection_1.UniqueViolationError) {
        if (error.columns.includes('email')) {
            return reply.code(400).send({ message: 'email already taken' });
        }
    }
    return reply.send(error);
});
