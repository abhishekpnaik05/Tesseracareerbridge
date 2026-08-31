import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function notImplemented(moduleName: string) {
  return (_req: Request, _res: Response, next: NextFunction) => {
    next(
      new HttpError(
        501,
        "NOT_IMPLEMENTED",
        `${moduleName} is a foundation module and is not implemented yet.`,
      ),
    );
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  if (err instanceof SyntaxError) {
    res.status(400).json({
      error: {
        code: "VALIDATION",
        message: "Invalid request.",
      },
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    },
  });
}
