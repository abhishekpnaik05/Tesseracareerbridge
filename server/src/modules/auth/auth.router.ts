import { Router } from "express";
import type { Response } from "express";
import { env } from "../../config/env.js";
import { clearAuthCookies, setAccessCookie, setAuthCookies, REFRESH_COOKIE } from "../../lib/cookies.js";
import { forgotLimiter, loginLimiter, registerLimiter, verifyLimiter } from "../../middleware/rate-limit.js";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import * as auth from "./auth.service.js";

export const authRouter = Router();

function noStore(res: Response) {
  res.setHeader("Cache-Control", "no-store");
}

authRouter.post("/register", registerLimiter, async (req, res, next) => {
  try {
    const data = await auth.registerStudent(req.body);
    noStore(res);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const remember = Boolean(req.body?.remember);
    const data = await auth.login(email, password, remember);
    setAuthCookies(res, data.accessToken, data.refreshToken, data.remember);
    noStore(res);
    res.json({ data: { user: data.user } });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", async (req: AuthenticatedRequest, res, next) => {
  try {
    const refreshRaw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await auth.logout(req.auth?.sid, refreshRaw);
    clearAuthCookies(res);
    noStore(res);
    res.json({ data: { ok: true } });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const refreshRaw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const data = await auth.refresh(refreshRaw ?? "");
    setAccessCookie(res, data.accessToken);
    noStore(res);
    res.json({ data: { user: data.user } });
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
});

authRouter.get("/me", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = await auth.me(req.auth!.sub);
    noStore(res);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/verify", verifyLimiter, async (req, res, next) => {
  try {
    const token = typeof req.body?.token === "string" ? req.body.token : undefined;
    const otp = typeof req.body?.otp === "string" ? req.body.otp : undefined;
    const email = typeof req.body?.email === "string" ? req.body.email : undefined;
    const data = await auth.verifyEmail(token, otp, email);
    noStore(res);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/resend-verification", verifyLimiter, async (req, res, next) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email : "";
    const data = await auth.resendVerification(email);
    noStore(res);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/forgot-password", forgotLimiter, async (req, res, next) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email : "";
    const data = await auth.forgotPassword(email);
    noStore(res);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/reset-password", verifyLimiter, async (req, res, next) => {
  try {
    const token = typeof req.body?.token === "string" ? req.body.token : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const confirmPassword = typeof req.body?.confirmPassword === "string" ? req.body.confirmPassword : "";
    await auth.resetPassword(token, password, confirmPassword);
    clearAuthCookies(res);
    noStore(res);
    res.json({ data: { ok: true } });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/change-password", requireAuth, verifyLimiter, async (req: AuthenticatedRequest, res, next) => {
  try {
    await auth.changePassword(
      req.auth!.sub,
      req.auth!.sid,
      typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "",
      typeof req.body?.newPassword === "string" ? req.body.newPassword : "",
      typeof req.body?.confirmPassword === "string" ? req.body.confirmPassword : "",
    );
    noStore(res);
    res.json({ data: { ok: true } });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/sessions", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = await auth.listSessions(req.auth!.sub, req.auth!.sid);
    noStore(res);
    res.json({ data: { sessions: data } });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/dev/last-message", (req, res, next) => {
  try {
    if (env.nodeEnv === "production") {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Not found." } });
      return;
    }
    const email = typeof req.query.email === "string" ? req.query.email : "";
    noStore(res);
    res.json({ data: { message: auth.peekDevInbox(email) ?? null } });
  } catch (error) {
    next(error);
  }
});
