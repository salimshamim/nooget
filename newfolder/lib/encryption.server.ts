import bcrypt from "bcryptjs";
import crypto from "crypto";
const algorithm = "aes-256-cbc";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

const secretKey = process.env.DB_ENCRYPTION_KEY;


export function encryptPassword(password: string): string {
  // Generate a random initialization vector
  if (!secretKey) {
    throw new Error("DB_ENCRYPTION_KEY is not defined in the environment variables.");
  }
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);
  let encrypted = cipher.update(password);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  // Prepend IV to the encrypted data so that we can decrypt later
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decryptPassword(encryptedPassword: string): string {
  if (!secretKey) {
    throw new Error("DB_ENCRYPTION_KEY is not defined in the environment variables.");
  }
  const parts = encryptedPassword.split(":");
  const iv = Buffer.from(parts.shift()!, "hex");
  const encryptedText = Buffer.from(parts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}