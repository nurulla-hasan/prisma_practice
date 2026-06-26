import { Response } from "express";

interface IApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: IApiResponse<T>["meta"],
): void => {
  const response: IApiResponse<T> = {
    success: true,
    statusCode,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
  };

  res.status(statusCode).json(response);
};

export default sendResponse;
