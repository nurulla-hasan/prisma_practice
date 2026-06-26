import bcrypt from "bcryptjs";
import config from "../config";

const hashPassword = async (plainPassword: string): Promise<string> => {
  const salt = await bcrypt.genSalt(Number(config.bcrypt_salt_rounds));
  return bcrypt.hash(plainPassword, salt);
};

const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export { hashPassword, comparePassword };
