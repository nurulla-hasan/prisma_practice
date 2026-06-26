import { StatusCodes } from "http-status-codes";
import { authService } from "./auth.service";
import { catchAsync, sendResponse } from "../../utils";
import AppError from "../../errors/AppError";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const registerUser = catchAsync(async (req, res) => {
  const result = await authService.registerUserIntoDB(req.body);

  res.cookie("accessToken", result.accessToken, cookieOptions);
  res.cookie("refreshToken", result.refreshToken, cookieOptions);

  sendResponse(res, StatusCodes.CREATED, "User registered successfully", {
    user: result.user,
    // accessToken: result.accessToken,
    // refreshToken: result.refreshToken,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await authService.loginUserIntoDB(req.body);

  res.cookie("accessToken", result.accessToken, cookieOptions);
  res.cookie("refreshToken", result.refreshToken, cookieOptions);

  sendResponse(res, StatusCodes.OK, "Login successful", {
    // user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new AppError("Refresh token is required.", StatusCodes.BAD_REQUEST);
  }

  const result = await authService.refreshTokenIntoDB(incomingRefreshToken);

  res.cookie("accessToken", result.accessToken, cookieOptions);
  res.cookie("refreshToken", result.refreshToken, cookieOptions);

  sendResponse(res, StatusCodes.OK, "Token refreshed successfully", {
    // user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

const getMe = catchAsync(async (req, res) => {
  const user = await authService.getMeFromDB(req.user!.userId);

  sendResponse(res, StatusCodes.OK, "Profile fetched successfully", user);
});

export const authController = {
  registerUser,
  loginUser,
  refreshToken,
  getMe,
};
