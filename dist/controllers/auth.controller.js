"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.googleAuthCallback = exports.googleAuth = exports.signup = void 0;
const user_1 = __importDefault(require("../models/user"));
const jwt_1 = __importDefault(require("../utils/jwt"));
const xss_1 = __importDefault(require("xss"));
const validator_1 = __importDefault(require("validator"));
const app_error_1 = __importDefault(require("../utils/app-error"));
const catch_async_1 = __importDefault(require("../utils/catch-async"));
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const hash_password_1 = require("../utils/hash-password");
exports.signup = (0, catch_async_1.default)(async (req, res, next) => {
    if (!req.body)
        return next(new app_error_1.default("Invalid parameters", 400));
    const { email, fullName, password } = req.body;
    if (!email || !password || !fullName) {
        return next(new app_error_1.default("Kindly provide a valid name, email, and password", 400));
    }
    if (!validator_1.default.isEmail(email)) {
        return next(new app_error_1.default("Invalid email format", 400));
    }
    const userExists = await user_1.default.findOne({ email });
    if (userExists) {
        return next(new app_error_1.default("User with this email address exists already", 400));
    }
    const hashed = await (0, hash_password_1.hashPin)(password);
    const user = await user_1.default.create({
        email,
        fullName: (0, xss_1.default)(fullName),
        password: hashed,
    });
    await user.save();
    return (0, jwt_1.default)(user, 200, res);
});
exports.googleAuth = passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
});
exports.googleAuthCallback = [
    passport_1.default.authenticate("google", {
        failureRedirect: `${process.env.APP_URL}/login`,
        session: false,
    }),
    async (req, res) => {
        const user = req.user;
        if (!user) {
            return res.redirect(`${process.env.APP_URL}/login`);
        }
        const JWT_SECRET = process.env.JWT_SECRET;
        const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });
        res.redirect(`${process.env.APP_URL}?token=${token}&email=${user.email}&name=${user.fullName}`);
    },
];
exports.login = (0, catch_async_1.default)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
        return next(new app_error_1.default("Provide a valid email address and password", 400));
    if (!validator_1.default.isEmail)
        return next(new app_error_1.default("Invalid email format", 400));
    const user = await user_1.default.findOne({ email }).select("+password");
    if (!user)
        return next(new app_error_1.default("User not found", 404));
    if (!(await user.verifyPassword(password, String(user.password))))
        return next(new app_error_1.default("Login details incorrect", 401));
    user.password = undefined;
    user.passwordChangedAt = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    user.provider = undefined;
    user.googleId = undefined;
    (0, jwt_1.default)(user, 200, res);
});
