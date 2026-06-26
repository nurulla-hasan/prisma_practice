import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const envSchema = z.object({
  PORT: z.string().default("5000"),
  DATABASE_URL: z.url(),
  APP_URL: z.url(),
  BCRYPT_SALT_ROUNDS: z.string().default("12"),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().default("1d"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
});

const env = envSchema.parse(process.env);

export default {
  port: env.PORT,
  database_url: env.DATABASE_URL,
  app_url: env.APP_URL,
  bcrypt_salt_rounds: env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: env.JWT_REFRESH_EXPIRES_IN,
};
