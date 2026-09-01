import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../");
dotenv.config({ path: path.join(rootDir, ".env") });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? process.env.SERVER_PORT ?? 4000),
  serverUrl: process.env.SERVER_URL ?? `http://localhost:${process.env.PORT ?? process.env.SERVER_PORT ?? 4000}`,
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  apiPrefix: process.env.API_PREFIX ?? "/api/v1",
  databaseUrl: required("DATABASE_URL", "postgresql://tessera:tessera_dev_only@localhost:55432/tesseracareerbridge?schema=public"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET", "change-me-access-secret-min-32-characters"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET", "change-me-refresh-secret-min-32-characters"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  storageDriver: process.env.STORAGE_DRIVER ?? "local",
  storageLocalRoot: process.env.STORAGE_LOCAL_ROOT ?? "./storage/local",
  storagePublicBaseUrl: process.env.STORAGE_PUBLIC_BASE_URL ?? `http://localhost:${process.env.PORT ?? process.env.SERVER_PORT ?? 4000}/storage`,
};
