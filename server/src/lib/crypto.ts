import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function randomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function randomOtp(): string {
  return String(crypto.randomInt(100000, 1000000));
}

export function passwordIssue(password: string): string | null {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Use letters and at least one number.";
  }
  return null;
}
