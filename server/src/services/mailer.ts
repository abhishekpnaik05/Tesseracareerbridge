import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { Resend } from "resend";
import { env } from "../config/env.js";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

const inbox = new Map<string, MailMessage>();

export const logMailer: Mailer = {
  async send(message) {
    inbox.set(message.to.toLowerCase(), message);
    console.log(`[mailer:dev] to=${message.to} subject=${message.subject}\n${message.text}\n`);
  },
};

export function lastDevMessage(email: string): MailMessage | undefined {
  return inbox.get(email.toLowerCase());
}

let smtpTransporter: Transporter | null = null;

function createSmtpTransporter(): Transporter | null {
  if (!env.smtpHost || !env.smtpPort || !env.smtpUser || !env.smtpPassword) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: parseInt(env.smtpPort, 10),
    secure: env.smtpPort === "465", // true for 465, false for other ports
    auth: {
      user: env.smtpUser,
      pass: env.smtpPassword,
    },
  });
}

export const smtpMailer: Mailer = {
  async send(message) {
    if (!smtpTransporter) {
      smtpTransporter = createSmtpTransporter();
    }

    if (!smtpTransporter) {
      throw new Error("SMTP is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD environment variables.");
    }

    try {
      await smtpTransporter.sendMail({
        from: env.emailFrom || env.smtpUser,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    } catch (error) {
      console.error("[mailer:smtp] Failed to send email:", error);
      throw new Error("Failed to send email. Please try again later.");
    }
  },
};

let resendClient: Resend | null = null;

function createResendClient(): Resend | null {
  if (!env.resendApiKey) {
    return null;
  }
  return new Resend(env.resendApiKey);
}

export const resendMailer: Mailer = {
  async send(message) {
    if (!resendClient) {
      resendClient = createResendClient();
    }

    if (!resendClient) {
      throw new Error("Resend is not configured. Please set RESEND_API_KEY environment variable.");
    }

    try {
      await resendClient.emails.send({
        from: env.emailFrom || "onboarding@resend.dev",
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    } catch (error) {
      console.error("[mailer:resend] Failed to send email:", error);
      throw new Error("Failed to send email. Please try again later.");
    }
  },
};

export function getMailer(): Mailer {
  // Priority: Resend > SMTP > logMailer (development)
  if (env.resendApiKey) {
    return resendMailer;
  }
  if (env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPassword) {
    return smtpMailer;
  }
  return logMailer;
}
