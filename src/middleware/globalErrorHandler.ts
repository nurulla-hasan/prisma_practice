import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError";
import { handlePrismaError, logger } from "../utils";

const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof SyntaxError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Invalid JSON payload";
  } else if ((err as any).code?.startsWith("P")) {
    const appError = handlePrismaError(err);
    statusCode = appError.statusCode;
    message = appError.message;
  }

  logger.error({ err, statusCode }, message);

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
  });
};

export default globalErrorHandler;
