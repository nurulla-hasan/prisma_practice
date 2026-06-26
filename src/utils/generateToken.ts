import crypto from "node:crypto";

const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

export default generateToken;
