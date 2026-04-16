"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createSendToken = async (user, statusCode, res) => {
    const payload = { id: user.id, email: user.email };
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
    user.password = undefined;
    return res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
};
exports.default = createSendToken;
