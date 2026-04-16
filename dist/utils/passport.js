"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const user_1 = __importDefault(require("../models/user"));
dotenv_1.default.config();
const randomPassword = crypto_1.default.randomBytes(20).toString("hex");
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/api/v1/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
            return done(new Error("No email found in Google profile"), false);
        }
        let user = await user_1.default.findOne({ email });
        if (!user) {
            user = await user_1.default.create({
                googleId: profile.id,
                fullName: profile.name?.givenName,
                email,
                provider: "google",
                password: randomPassword,
            });
        }
        return done(null, user);
    }
    catch (err) {
        return done(err, false);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await user_1.default.findById(id);
        done(null, user);
    }
    catch (err) {
        done(err, null);
    }
});
exports.default = passport_1.default;
