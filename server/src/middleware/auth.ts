import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@tesseracareerbridge/database";
import type { JwtPayload, UserRole } from "@tesseracareerbridge/shared";
import { env } from "../config/env.js";
import { HttpError } from "../lib/http.js";
import { ACCESS_COOKIE } from "../lib/cookies.js";

export interface AuthenticatedRequest extends Request {
  auth?: JwtPayload;
}

function readAccessToken(req: Request): string | undefined {
  const cookie = req.cookies?.[ACCESS_COOKIE] as string | undefined;
  if (cookie) return cookie;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return undefined;
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token = readAccessToken(req);
  if (!token) {
    next();
    return;
  }
  try {
    req.auth = jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
  } catch {
    req.auth = undefined;
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  if (!req.auth) {
    next(new HttpError(401, "UNAUTHENTICATED", "Your session has expired. Please log in again."));
    return;
  }
  next();
}

export function requireRoles(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      next(new HttpError(401, "UNAUTHENTICATED", "Your session has expired. Please log in again."));
      return;
    }
    if (req.auth.role === "SUPER_ADMIN") {
      next();
      return;
    }
    if (!roles.includes(req.auth.role)) {
      next(new HttpError(403, "FORBIDDEN", "You do not have access to this resource."));
      return;
    }
    next();
  };
}

export async function requireActiveAccount(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  if (!req.auth) {
    next(new HttpError(401, "UNAUTHENTICATED", "Your session has expired. Please log in again."));
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.auth.sub } });
    if (!user) {
      next(new HttpError(401, "UNAUTHENTICATED", "Your session has expired. Please log in again."));
      return;
    }
    if (user.status === "SUSPENDED" || user.status === "DISABLED") {
      next(new HttpError(403, "ACCOUNT_DISABLED", "This account cannot sign in."));
      return;
    }
    if (user.status === "PENDING_VERIFICATION" || !user.emailVerifiedAt) {
      next(new HttpError(403, "VERIFICATION_REQUIRED", "Your account needs verification."));
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions["expiresIn"],
  });
}
