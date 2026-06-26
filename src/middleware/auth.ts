import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import config from "../config";
import AppError from "../errors/AppError";
import { catchAsync, verifyToken } from "../utils";
import type { IJwtPayload, TUserRole } from "../types";

const auth = (...allowedRoles: TUserRole[]) =>
  catchAsync(async (req, _res, next) => {
    // 1. Extract token — cookie first, then header (raw or Bearer)
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        token = authHeader.startsWith("Bearer ")
          ? authHeader.split(" ")[1]
          : authHeader;
      }
    }

    if (!token) {
      throw new AppError("Access denied. No token provided.", StatusCodes.UNAUTHORIZED);
    }

    // 2. Verify token
    let decoded: IJwtPayload;
    try {
      decoded = verifyToken(token, config.jwt_access_secret) as IJwtPayload;
    } catch {
      throw new AppError("Invalid or expired token.", StatusCodes.UNAUTHORIZED);
    }

    // 3. Check if user still exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      throw new AppError("User belonging to this token no longer exists.", StatusCodes.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError("Account has been deactivated.", StatusCodes.FORBIDDEN);
    }

    // 4. Attach to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    } as IJwtPayload;

    // 5. Role check (if any roles specified)
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      throw new AppError(
        `Role '${user.role}' is not authorized to access this resource.`,
        StatusCodes.FORBIDDEN,
      );
    }

    next();
  });

export default auth;
