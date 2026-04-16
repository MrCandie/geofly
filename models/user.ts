import mongoose, { Document, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IUser extends Document {
  fullName: string;
  email: string;
  provider: string | undefined;
  googleId: string | undefined;
  password: string | undefined;

  passwordChangedAt?: Date;
  passwordResetExpires?: Date;
  passwordResetToken?: string;
  accountVerificationToken?: string;

  verifyPassword(enteredPassword: string, password: string): Promise<boolean>;

  createPasswordResetToken(): string;
  createAccountVerificationToken(): string;
  passwordChanged(jwtTime: number): boolean;
}

const schema = new mongoose.Schema<IUser>(
  {
    fullName: { type: String, trim: true, default: "" },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      validate: [validator.isEmail, "enter a valid email address"],
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

schema.pre<IUser>("save", async function (this: IUser, next: any) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(String(this.password), salt);

  next();
});

schema.methods.verifyPassword = async function (
  enteredPassword: string,
  password: string,
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, password);
};

schema.methods.createPasswordResetToken = function (): string {
  const token = crypto.randomBytes(20).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return token;
};

schema.methods.createAccountVerificationToken = function (): string {
  const token = crypto.randomBytes(20).toString("hex");

  this.accountVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  return token;
};

schema.methods.passwordChanged = function (jwtTime: number): boolean {
  if (this.passwordChangedAt) {
    const passwordTimeStamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000,
    );
    return jwtTime < passwordTimeStamp;
  }
  return false;
};

const User: Model<IUser> = mongoose.model<IUser>("User", schema);

export default User;
