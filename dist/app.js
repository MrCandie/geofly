"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
dotenv_1.default.config();
const error_controller_1 = __importDefault(require("./controllers/error.controller"));
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const passport_1 = __importDefault(require("passport"));
require("./utils/passport");
const app_error_1 = __importDefault(require("./utils/app-error"));
const app = (0, express_1.default)();
console.log("🔥 APP FILE IS RUNNING");
const allowedOrigins = ["http://localhost:5173"];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((0, helmet_1.default)());
app.use((0, hpp_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
});
app.use("/api", limiter);
app.disable("x-powered-by");
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(body_parser_1.default.json({ limit: "10mb" }));
app.use(body_parser_1.default.urlencoded({ limit: "10mb", extended: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.get("/", (req, res) => {
    res.send("<h1>WELCOME TO GOFLY</h1>");
});
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    next();
});
app.use("/api/v1/auth", auth_router_1.default);
app.all(/.*/, (req, res, next) => {
    next(new app_error_1.default(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(error_controller_1.default);
const db = process.env.DATABASE;
console.log(db);
async function startServer() {
    const port = process.env.PORT || 8080;
    console.log("🚀 Starting server...");
    try {
        if (!db) {
            console.error("❌ DATABASE env is not defined");
            process.exit(1);
        }
        console.log("🔌 Connecting to DB...");
        await mongoose_1.default.connect(db);
        console.log("✅ database connection successful");
        app.listen(port, () => {
            console.log(`🔥 app running on port ${port}`);
        });
    }
    catch (error) {
        console.error("❌ Server error:", error);
        process.exit(1);
    }
}
startServer();
