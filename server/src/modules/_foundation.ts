import { Router } from "express";
import { notImplemented } from "../lib/http.js";

export function createModuleRouter(moduleName: string): Router {
  const router = Router();
  router.all("*", notImplemented(moduleName));
  return router;
}
