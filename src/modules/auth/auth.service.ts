import { prisma } from "../../lib/prisma";
import {
  comparePassword,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "../../utils";
import config from "../../config";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import type { RegisterUserPayload, LoginPayload, AuthResponse } from "./auth.interface";

const registerUserIntoDB = async (payload: RegisterUserPayload): Promise<AuthResponse> => {
  const { name, email, password } = payload;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("User with this email already exists.", StatusCodes.CONFLICT);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, role: true },
  });

  // Generate tokens
  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });

  return { user, accessToken, refreshToken };
};

const loginUserIntoDB = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { email, password } = payload;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, password: true, role: true, isActive: true },
  });

  if (!user) {
    throw new AppError("Invalid email or password.", StatusCodes.UNAUTHORIZED);
  }

  if (!user.isActive) {
    throw new AppError("Account has been deactivated.", StatusCodes.FORBIDDEN);
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password.", StatusCodes.UNAUTHORIZED);
  }

  // Generate tokens
  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

const refreshTokenIntoDB = async (incomingRefreshToken: string): Promise<AuthResponse> => {
  // Verify refresh token
  let decoded;
  try {
    decoded = verifyToken(incomingRefreshToken, config.jwt_refresh_secret);
  } catch {
    throw new AppError("Invalid or expired refresh token.", StatusCodes.UNAUTHORIZED);
  }

  const { userId } = decoded as { userId: number };

  // Check user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  if (!user) {
    throw new AppError("User belonging to this token no longer exists.", StatusCodes.UNAUTHORIZED);
  }

  if (!user.isActive) {
    throw new AppError("Account has been deactivated.", StatusCodes.FORBIDDEN);
  }

  // Issue new tokens
  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

const getMeFromDB = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    throw new AppError("User not found.", StatusCodes.NOT_FOUND);
  }

  return user;
};

export const authService = {
  registerUserIntoDB,
  loginUserIntoDB,
  refreshTokenIntoDB,
  getMeFromDB,
};