"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const schema = new mongoose_1.default.Schema({
    fullName: { type: String, trim: true, default: "" },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        validate: [validator_1.default.isEmail, "enter a valid email address"],
    },
    provider: { type: String, trim: true, default: "" },
    googleId: { type: String, trim: true, default: "" },
    password: {
        type: String,
        trim: true,
        minlength: [7, "password cannot be less than 7 digits"],
        required: [true, "enter a valid password"],
        select: false,
    },
    passwordChangedAt: Date,
    passwordResetExpires: Date,
    passwordResetToken: String,
    accountVerificationToken: String,
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
schema.methods.verifyPassword = async function (enteredPassword, password) {
    return bcryptjs_1.default.compare(enteredPassword, password);
};
schema.methods.passwordChanged = function (jwtTime) {
    if (this.passwordChangedAt) {
        const passwordTimeStamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
        return jwtTime < passwordTimeStamp;
    }
    return false;
};
const User = mongoose_1.default.model("User", schema);
exports.default = User;
