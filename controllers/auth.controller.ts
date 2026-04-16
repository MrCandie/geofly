import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import createSendToken from "../utils/jwt";
import xss from "xss";
import validator from "validator";
import AppError from "../utils/app-error";
import catchAsync from "../utils/catch-async";
import passport from "passport";
import jwt from "jsonwebtoken";
import { MyUser } from "../constants";

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) return next(new AppError("Invalid parameters", 400));

    const { email, fullName, password } = req.body as {
      email?: string;
      fullName?: string;
      password?: string;
    };

    if (!email || !password || !fullName) {
      return next(
        new AppError("Kindly provide a valid name, email, and password", 400),
      );
    }

    if (!validator.isEmail(email)) {
      return next(new AppError("Invalid email format", 400));
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return next(
        new AppError("User with this email address exists already", 400),
      );
    }

    const user = await User.create({
      email,
      fullName: xss(fullName),
      password,
    });

    user.createAccountVerificationToken();
    await user.save();

    return createSendToken(user, 200, res);
  },
);

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallback = [
  passport.authenticate("google", {
    failureRedirect: `${process.env.APP_URL}/login`,
    session: false,
  }),
  async (req: Request, res: Response) => {
    const user: MyUser | undefined = req.user;

    if (!user) {
      return res.redirect(`${process.env.APP_URL}/login`);
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );

    res.redirect(
      `${process.env.APP_URL}?token=${token}&email=${user.email}&name=${user.fullName}`,
    );
  },
];

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(
      new AppError("Provide a valid email address and password", 400),
    );

  if (!validator.isEmail)
    return next(new AppError("Invalid email format", 400));

  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new AppError("User not found", 404));

  if (!(await user.verifyPassword(password, String(user.password))))
    return next(new AppError("Login details incorrect", 401));

  user.password = undefined;
  user.passwordChangedAt = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  user.provider = undefined;
  user.googleId = undefined;

  createSendToken(user, 200, res);
});
