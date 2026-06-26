import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError";

interface PrismaClientError {
  code?: string;
  meta?: Record<string, unknown>;
  message?: string;
}

const handlePrismaError = (error: PrismaClientError): AppError => {
  switch (error.code) {
    case "P2000":
      return new AppError("Value too long for column", StatusCodes.BAD_REQUEST);

    case "P2002": {
      const fields = error.meta?.target
        ? (error.meta.target as string[]).join(", ")
        : "field";
      return new AppError(
        `Duplicate value for: ${fields}`,
        StatusCodes.CONFLICT,
      );
    }

    case "P2003":
      return new AppError(
        "Foreign key constraint failed",
        StatusCodes.BAD_REQUEST,
      );

    case "P2025":
      return new AppError("Record not found", StatusCodes.NOT_FOUND);

    case "P2014":
      return new AppError(
        "Required relation violation",
        StatusCodes.BAD_REQUEST,
      );

    default:
      return new AppError(
        error.message || "Database error",
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
  }
};

export default handlePrismaError;
