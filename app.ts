import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
dotenv.config();

import globalErrorController from "./controllers/error.controller";

import authRoute from "./routers/auth.router";
import passport from "passport";
import AppError from "./utils/app-error";

const app = express();

const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(helmet());

app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use("/api", limiter);

app.disable("x-powered-by");

app.use(
  session({
    secret: process.env.GOOGLE_CLIENT_SECRET!,
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("<h1>WELCOME TO GOFLY</h1>");
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

// routes here

app.use("/api/v1/auth", authRoute);

app.all(/.*/, (req: Request, res: Response, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorController);

const db = process.env.DATABASE;
console.log(db);

async function startServer() {
  const port = process.env.PORT || 8080;
  try {
    const response = await mongoose.connect(db!);

    console.log("database connection successful");

    app.listen(port, () => {
      console.log(`app running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}
startServer();
