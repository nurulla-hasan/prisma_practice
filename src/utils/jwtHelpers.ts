import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../config";

const signAccessToken = (payload: object, options?: SignOptions): string => {
  return jwt.sign(payload, config.jwt_access_secret, {
    expiresIn: config.jwt_access_expires_in as string | number,
    ...options,
  } as SignOptions);
};

const signRefreshToken = (payload: object, options?: SignOptions): string => {
  return jwt.sign(payload, config.jwt_refresh_secret, {
    expiresIn: config.jwt_refresh_expires_in as string | number,
    ...options,
  } as SignOptions);
};

const verifyToken = (token: string, secret: string): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

export { signAccessToken, signRefreshToken, verifyToken };
