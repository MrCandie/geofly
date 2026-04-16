import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
  status?: string;
}

const sendErrDev = (err: AppError, res: Response): void => {
  console.log(err);
  res.status(err.statusCode!).json({
    status: err.status,
    error: err,
    message: err.statusCode!.toString().toLowerCase().startsWith("4")
      ? err.message
      : "Unable to complete your request at this time",
  });
};

export default (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  sendErrDev(err, res);
};
