import { JwtPayload } from "jsonwebtoken";

export type TUserRole = "USER" | "ADMIN";

export interface IJwtPayload extends JwtPayload {
  userId: number;
  email: string;
  role: TUserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}
