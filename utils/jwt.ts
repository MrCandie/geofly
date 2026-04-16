import { Response } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

interface IUserPayload {
  id: string;
  email: string;
  password?: string;
  [key: string]: any;
}

const createSendToken = async (
  user: IUserPayload,
  statusCode: number,
  res: Response,
): Promise<Response> => {
  const payload = { id: user.id, email: user.email };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET as Secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    } as SignOptions,
  );

  user.password = undefined;

  return res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export default createSendToken;
