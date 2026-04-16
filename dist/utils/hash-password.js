"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const hashPin = async (pin) => {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(pin, salt);
};
exports.hashPin = hashPin;
