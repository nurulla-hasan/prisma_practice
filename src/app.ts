import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import config from "./config";
import globalErrorHandler from "./middleware/globalErrorHandler";
import AppError from "./errors/AppError";

const app: Application = express();

app.use(cors({
  origin: config.app_url,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({ message: "Hello, World!" });
});




// 404 handler — must be after all routes
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} not found`, StatusCodes.NOT_FOUND));
});

// Global error handler — must be the last middleware
app.use(globalErrorHandler);

export default app;