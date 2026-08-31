import type { CookieOptions, Response } from "express";
import { env } from "../config/env.js";

export const ACCESS_COOKIE = "tcb_access";
export const REFRESH_COOKIE = "tcb_refresh";

function baseCookie(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
  };
}

export function setAccessCookie(res: Response, accessToken: string) {
  res.cookie(ACCESS_COOKIE, accessToken, { ...baseCookie(), maxAge: 15 * 60 * 1000 });
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  remember: boolean,
) {
  const refreshMs = (remember ? 30 : 7) * 24 * 60 * 60 * 1000;
  setAccessCookie(res, accessToken);
  res.cookie(REFRESH_COOKIE, refreshToken, { ...baseCookie(), maxAge: refreshMs });
}

export function clearAuthCookies(res: Response) {
  const opts = baseCookie();
  res.clearCookie(ACCESS_COOKIE, opts);
  res.clearCookie(REFRESH_COOKIE, opts);
}
