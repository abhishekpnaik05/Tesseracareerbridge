import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { API_ROUTES } from "@tesseracareerbridge/shared";
import { env } from "./config/env.js";
import { errorHandler } from "./lib/http.js";
import { optionalAuth } from "./middleware/auth.js";
import { registerModules } from "./modules/register.js";
import { storage } from "./storage/instance.js";
import path from "node:path";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());
  app.use(optionalAuth);

  const api = express.Router();
  api.get(API_ROUTES.health, (_req, res) => {
    res.json({
      data: {
        status: "ok",
        service: "tesseracareerbridge-server",
        storage: env.storageDriver,
        objectStorage: Boolean(storage),
      },
    });
  });
  registerModules(api);
  app.use(env.apiPrefix, api);
  app.use("/storage", express.static(path.resolve(env.storageLocalRoot)));

  app.use(errorHandler);
  return app;
}
