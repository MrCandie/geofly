import express from "express";
import {
  googleAuth,
  googleAuthCallback,
  login,
  signup,
} from "../controllers/auth.controller";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);

export default router;
