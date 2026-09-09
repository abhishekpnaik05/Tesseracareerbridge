import type { User } from "@tesseracareerbridge/database";
import type { AuthUser } from "@tesseracareerbridge/shared";
import { prisma } from "@tesseracareerbridge/database";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http.js";
import {
  hashPassword,
  hashToken,
  passwordIssue,
  randomOtp,
  randomToken,
  verifyPassword,
} from "../../lib/crypto.js";
import { lastDevMessage, getMailer } from "../../services/mailer.js";
import { signAccessToken } from "../../middleware/auth.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[0-9+\-\s]{10,16}$/;

// Resend cooldown tracking (in-memory, 60 seconds)
const resendCooldowns = new Map<string, number>();
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    displayName: user.displayName,
    status: user.status,
    emailVerified: Boolean(user.emailVerifiedAt),
    phone: user.phone,
  };
}

function assertNotLocked(user: User) {
  if (user.status === "SUSPENDED" || user.status === "DISABLED") {
    throw new HttpError(403, "ACCOUNT_DISABLED", "This account cannot sign in.");
  }
}

export async function registerStudent(input: {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  terms?: boolean;
}) {
  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim().toLowerCase();
  const phone = input.phone?.trim() || undefined;
  if (name.length < 2) throw new HttpError(400, "VALIDATION", "Enter your full name.");
  if (!EMAIL.test(email)) throw new HttpError(400, "VALIDATION", "Enter a valid email.");
  if (phone && !PHONE.test(phone)) throw new HttpError(400, "VALIDATION", "Enter a valid phone number.");
  if (!input.terms) throw new HttpError(400, "VALIDATION", "Accept the terms to continue.");
  if ((input.password ?? "") !== (input.confirmPassword ?? "")) {
    throw new HttpError(400, "VALIDATION", "Passwords do not match.");
  }
  const issue = passwordIssue(input.password ?? "");
  if (issue) throw new HttpError(400, "VALIDATION", issue);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, "EMAIL_IN_USE", "An account with this email already exists.");

  const passwordHash = await hashPassword(input.password ?? "");
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName: name,
      phone,
      role: "STUDENT",
      status: "PENDING_VERIFICATION",
      studentProfile: { create: { phone } },
    },
  });

  const challenge = await createChallenge(user.id, "EMAIL_VERIFY");
  const mailer = getMailer();
  const verificationUrl = `${env.clientUrl}/verify-email?token=${challenge.token}`;
  try {
    await mailer.send({
      to: email,
      subject: "Verify your TesseraCareerBridge account",
      text: `Hello ${name},

Thank you for creating your TesseraCareerBridge account.

Your verification code is: ${challenge.otp}

This code expires in 10 minutes.

If you did not create this account, you can safely ignore this email.

---
TesseraCareerBridge
${verificationUrl}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your TesseraCareerBridge account</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">TesseraCareerBridge</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
    <h2 style="color: #333; margin-top: 0;">Verify your email address</h2>
    <p>Hello ${name},</p>
    <p>Thank you for creating your TesseraCareerBridge account.</p>
    <p style="font-size: 18px; font-weight: bold; color: #667eea;">Your verification code is:</p>
    <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${challenge.otp}</span>
    </div>
    <p>This code expires in 10 minutes.</p>
    <p style="color: #666; font-size: 14px;">If you did not create this account, you can safely ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    <p style="color: #666; font-size: 12px; text-align: center;">
      © 2024 TesseraCareerBridge. All rights reserved.<br>
      Need help? Contact our support team.
    </p>
  </div>
</body>
</html>`,
    });
  } catch {
    // Email sending failed — registration still succeeded.
    // The user can request a new verification email from the verify page.
  }

  // Only return dev OTP if using logMailer (no email provider configured)
  const isUsingDevMailer = !env.resendApiKey && !(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPassword);

  return {
    user: toAuthUser(user),
    ...(isUsingDevMailer
      ? { devVerificationToken: challenge.token, devOtp: challenge.otp }
      : {}),
  };
}

async function createChallenge(userId: string, type: "EMAIL_VERIFY" | "PASSWORD_RESET") {
  const token = randomToken();
  const otp = randomOtp();
  const minutes = type === "EMAIL_VERIFY" ? 10 : 60;
  await prisma.authChallenge.updateMany({
    where: { userId, type, usedAt: null },
    data: { usedAt: new Date() },
  });
  await prisma.authChallenge.create({
    data: {
      userId,
      type,
      tokenHash: hashToken(token),
      otpHash: hashToken(otp),
      expiresAt: new Date(Date.now() + minutes * 60 * 1000),
    },
  });
  return { token, otp };
}

export async function login(emailRaw: string, password: string, remember: boolean) {
  const email = emailRaw.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid credentials.");
  }
  assertNotLocked(user);
  if (user.status === "PENDING_VERIFICATION" || !user.emailVerifiedAt) {
    throw new HttpError(403, "VERIFICATION_REQUIRED", "Your account needs verification.");
  }

  const refreshRaw = randomToken();
  const session = await prisma.authSession.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshRaw),
      expiresAt: new Date(Date.now() + (remember ? 30 : 7) * 24 * 60 * 60 * 1000),
    },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    sid: session.id,
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return { user: toAuthUser(user), accessToken, refreshToken: refreshRaw, remember };
}

export async function logout(sessionId?: string, refreshRaw?: string) {
  if (sessionId) {
    await prisma.authSession.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  if (refreshRaw) {
    await prisma.authSession.updateMany({
      where: { tokenHash: hashToken(refreshRaw), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

export async function refresh(refreshRaw: string) {
  if (!refreshRaw) {
    throw new HttpError(401, "INVALID_TOKEN", "Your session has expired. Please log in again.");
  }
  const session = await prisma.authSession.findUnique({
    where: { tokenHash: hashToken(refreshRaw) },
  });
  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    throw new HttpError(401, "INVALID_TOKEN", "Your session has expired. Please log in again.");
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    throw new HttpError(401, "UNAUTHENTICATED", "Your session has expired. Please log in again.");
  }
  assertNotLocked(user);
  if (user.status === "PENDING_VERIFICATION" || !user.emailVerifiedAt) {
    throw new HttpError(403, "VERIFICATION_REQUIRED", "Your account needs verification.");
  }
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    sid: session.id,
  });
  return { user: toAuthUser(user), accessToken };
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { studentProfile: true, mentorProfile: true },
  });
  if (!user) throw new HttpError(401, "UNAUTHENTICATED", "Your session has expired. Please log in again.");
  if (user.status === "SUSPENDED" || user.status === "DISABLED") {
    throw new HttpError(403, "ACCOUNT_DISABLED", "This account cannot sign in.");
  }
  return {
    user: toAuthUser(user),
    studentProfile: user.studentProfile
      ? {
          university: user.studentProfile.university,
          usn: user.studentProfile.usn,
          branch: user.studentProfile.branch,
          semester: user.studentProfile.semester,
          phone: user.studentProfile.phone,
          college: user.studentProfile.college,
          graduationYear: user.studentProfile.graduationYear,
          city: user.studentProfile.city,
          state: user.studentProfile.state,
        }
      : null,
    mentorProfile: user.mentorProfile
      ? {
          title: user.mentorProfile.title,
          bio: user.mentorProfile.bio,
          phone: user.mentorProfile.phone,
          skills: user.mentorProfile.skills,
          experience: user.mentorProfile.experience,
          linkedin: user.mentorProfile.linkedin,
          github: user.mentorProfile.github,
        }
      : null,
  };
}

export async function verifyEmail(token?: string, otp?: string, email?: string) {
  const challenge = await findChallenge("EMAIL_VERIFY", token, otp, email);
  const user = await prisma.user.update({
    where: { id: challenge.userId },
    data: { emailVerifiedAt: new Date(), status: "ACTIVE" },
  });
  await prisma.authChallenge.update({ where: { id: challenge.id }, data: { usedAt: new Date() } });
  return { user: toAuthUser(user) };
}

export async function resendVerification(emailRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  if (!EMAIL.test(email)) throw new HttpError(400, "VALIDATION", "Enter a valid email.");
  
  // Check resend cooldown
  const now = Date.now();
  const lastResendTime = resendCooldowns.get(email);
  if (lastResendTime && now - lastResendTime < RESEND_COOLDOWN_MS) {
    const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - lastResendTime)) / 1000);
    throw new HttpError(429, "RESEND_COOLDOWN", `Please wait ${remainingSeconds} seconds before requesting another code.`);
  }
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerifiedAt && user.status !== "DISABLED" && user.status !== "SUSPENDED") {
    const challenge = await createChallenge(user.id, "EMAIL_VERIFY");
    const mailer = getMailer();
    const verificationUrl = `${env.clientUrl}/verify-email?token=${challenge.token}`;
    await mailer.send({
      to: email,
      subject: "Verify your TesseraCareerBridge account",
      text: `Hello ${user.displayName},

Thank you for creating your TesseraCareerBridge account.

Your verification code is: ${challenge.otp}

This code expires in 10 minutes.

If you did not create this account, you can safely ignore this email.

---
TesseraCareerBridge
${verificationUrl}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your TesseraCareerBridge account</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">TesseraCareerBridge</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
    <h2 style="color: #333; margin-top: 0;">Verify your email address</h2>
    <p>Hello ${user.displayName},</p>
    <p>Thank you for creating your TesseraCareerBridge account.</p>
    <p style="font-size: 18px; font-weight: bold; color: #667eea;">Your verification code is:</p>
    <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${challenge.otp}</span>
    </div>
    <p>This code expires in 10 minutes.</p>
    <p style="color: #666; font-size: 14px;">If you did not create this account, you can safely ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    <p style="color: #666; font-size: 12px; text-align: center;">
      © 2024 TesseraCareerBridge. All rights reserved.<br>
      Need help? Contact our support team.
    </p>
  </div>
</body>
</html>`,
    });
    // Set cooldown
    resendCooldowns.set(email, now);
    
    // Only return dev OTP if using logMailer (no email provider configured)
    const isUsingDevMailer = !env.resendApiKey && !(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPassword);
    
    return isUsingDevMailer
      ? { message: "If an account needs verification, we issued a new code.", devVerificationToken: challenge.token, devOtp: challenge.otp }
      : { message: "If an account needs verification, we issued a new code." };
  }
  return { message: "If an account needs verification, we issued a new code." };
}

export async function forgotPassword(emailRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  if (!EMAIL.test(email)) throw new HttpError(400, "VALIDATION", "Enter a valid email.");
  const user = await prisma.user.findUnique({ where: { email } });
  const payload: {
    message: string;
    devResetToken?: string;
    devOtp?: string;
  } = {
    message: "If an account exists for that email, we sent reset instructions.",
  };
  if (user && user.status !== "DISABLED") {
    const challenge = await createChallenge(user.id, "PASSWORD_RESET");
    const mailer = getMailer();
    const resetUrl = `${env.clientUrl}/reset-password?token=${challenge.token}`;
    await mailer.send({
      to: email,
      subject: "Reset your TesseraCareerBridge password",
      text: `Hello ${user.displayName},

We received a request to reset your password for your TesseraCareerBridge account.

Your password reset code is: ${challenge.otp}

This code expires in 60 minutes.

If you did not request this password reset, you can safely ignore this email.

---
TesseraCareerBridge
${resetUrl}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your TesseraCareerBridge password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">TesseraCareerBridge</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
    <h2 style="color: #333; margin-top: 0;">Reset your password</h2>
    <p>Hello ${user.displayName},</p>
    <p>We received a request to reset your password for your TesseraCareerBridge account.</p>
    <p style="font-size: 18px; font-weight: bold; color: #667eea;">Your password reset code is:</p>
    <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${challenge.otp}</span>
    </div>
    <p>This code expires in 60 minutes.</p>
    <p style="color: #666; font-size: 14px;">If you did not request this password reset, you can safely ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    <p style="color: #666; font-size: 12px; text-align: center;">
      © 2024 TesseraCareerBridge. All rights reserved.<br>
      Need help? Contact our support team.
    </p>
  </div>
</body>
</html>`,
    });
    
    // Only return dev OTP if using logMailer (no email provider configured)
    const isUsingDevMailer = !env.resendApiKey && !(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPassword);
    if (isUsingDevMailer) {
      payload.devResetToken = challenge.token;
      payload.devOtp = challenge.otp;
    }
  }
  return payload;
}

export async function resetPassword(token: string, password: string, confirmPassword: string) {
  if (!token) throw new HttpError(400, "VALIDATION", "This reset link is invalid or has expired.");
  if (password !== confirmPassword) throw new HttpError(400, "VALIDATION", "Passwords do not match.");
  const issue = passwordIssue(password);
  if (issue) throw new HttpError(400, "VALIDATION", issue);
  const challenge = await findChallenge("PASSWORD_RESET", token);
  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: challenge.userId }, data: { passwordHash } }),
    prisma.authChallenge.update({ where: { id: challenge.id }, data: { usedAt: new Date() } }),
    prisma.authSession.updateMany({
      where: { userId: challenge.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

export async function changePassword(
  userId: string,
  currentSessionId: string | undefined,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
) {
  if (newPassword !== confirmPassword) throw new HttpError(400, "VALIDATION", "Passwords do not match.");
  const issue = passwordIssue(newPassword);
  if (issue) throw new HttpError(400, "VALIDATION", issue);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new HttpError(400, "VALIDATION", "Current password is incorrect.");
  }
  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.authSession.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(currentSessionId ? { id: { not: currentSessionId } } : {}),
      },
      data: { revokedAt: new Date() },
    }),
  ]);
}

export async function listSessions(userId: string, currentSessionId?: string) {
  const rows = await prisma.authSession.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, expiresAt: true },
  });
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    current: row.id === currentSessionId,
  }));
}

async function findChallenge(
  type: "EMAIL_VERIFY" | "PASSWORD_RESET",
  token?: string,
  otp?: string,
  email?: string,
) {
  if (!token && !otp) throw new HttpError(400, "VALIDATION", "Enter a verification code.");
  const now = new Date();
  if (token) {
    const row = await prisma.authChallenge.findFirst({
      where: { type, tokenHash: hashToken(token), usedAt: null, expiresAt: { gt: now } },
    });
    if (!row) throw new HttpError(400, "INVALID_TOKEN", "This link or code is invalid or has expired.");
    return row;
  }
  if (!email) throw new HttpError(400, "VALIDATION", "Email is required with a code.");
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) throw new HttpError(400, "INVALID_TOKEN", "This link or code is invalid or has expired.");
  const row = await prisma.authChallenge.findFirst({
    where: { type, userId: user.id, usedAt: null, expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
  });
  if (!row || !row.otpHash) {
    throw new HttpError(400, "INVALID_TOKEN", "This link or code is invalid or has expired.");
  }
  
  // Check max attempts (5 attempts allowed)
  if (row.attempts >= 5) {
    await prisma.authChallenge.update({ where: { id: row.id }, data: { usedAt: new Date() } });
    throw new HttpError(400, "TOO_MANY_ATTEMPTS", "Too many incorrect attempts. Please request a new code.");
  }
  
  // Check OTP before incrementing attempts
  if (row.otpHash !== hashToken(otp ?? "")) {
    // Increment attempts for incorrect OTP
    const updatedRow = await prisma.authChallenge.update({ 
      where: { id: row.id }, 
      data: { attempts: row.attempts + 1 } 
    });
    const remainingAttempts = 5 - updatedRow.attempts;
    if (remainingAttempts > 0) {
      throw new HttpError(400, "INVALID_TOKEN", `Invalid verification code. ${remainingAttempts} attempts remaining.`);
    } else {
      throw new HttpError(400, "TOO_MANY_ATTEMPTS", "Too many incorrect attempts. Please request a new code.");
    }
  }
  
  return row;
}

export function peekDevInbox(email: string) {
  if (env.nodeEnv === "production") {
    throw new HttpError(404, "NOT_FOUND", "Not found.");
  }
  return lastDevMessage(email);
}
