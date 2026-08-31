import { env } from "../config/env.js";
import { createObjectStorage } from "./object-storage.js";

export const storage = createObjectStorage(
  env.storageDriver,
  env.storageLocalRoot,
  env.storagePublicBaseUrl,
);
