"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catch_async_1 = __importDefault(require("../utils/catch-async"));
const app_error_1 = __importDefault(require("../utils/app-error"));
const user_1 = __importDefault(require("../models/user"));
exports.userAuthMiddleware = (0, catch_async_1.default)(async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token)
        return next(new app_error_1.default("unauthenticated", 401));
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(new app_error_1.default("unauthenticated, Session expired. Please log in again.", 401));
        }
        return next(new app_error_1.default("unauthenticated, Invalid token. Please log in again.", 401));
    }
    const user = await user_1.default.findById(decoded?.id);
    if (!user)
        return next(new app_error_1.default("user not found", 404));
    req.user = user;
    next();
});
