import rateLimit from "express-rate-limit";

function limiter(windowMs: number, max: number) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: {
      error: {
        code: "TOO_MANY_ATTEMPTS",
        message: "Too many attempts. Please try again later.",
      },
    },
  });
}

export const loginLimiter = limiter(15 * 60 * 1000, 10);
export const registerLimiter = limiter(60 * 60 * 1000, 8);
export const forgotLimiter = limiter(15 * 60 * 1000, 5);
export const verifyLimiter = limiter(15 * 60 * 1000, 12);
