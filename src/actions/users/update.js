"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../../models/User"));
exports.default = async ({ body: { name, email }, params: { id } }, reply) => User_1.default.query()
    .patchAndFetchById(id, { name, email })
    .then((user) => {
    if (!user) {
        return reply.status(404).send({ error: 'User not found' });
    }
    else {
        return reply.send(user);
    }
});
