import fs from "node:fs/promises";
import path from "node:path";

export type StorageKind =
  | "VIDEO"
  | "PDF"
  | "IMAGE"
  | "ASSIGNMENT_FILE"
  | "PROJECT_REPORT"
  | "PRESENTATION"
  | "SUBMISSION"
  | "CERTIFICATE"
  | "OTHER";

export interface StoredObjectMeta {
  key: string;
  mimeType: string;
  byteSize: number;
  originalName: string;
  kind: StorageKind;
}

export interface ObjectStorage {
  put(input: StoredObjectMeta & { body: Buffer }): Promise<StoredObjectMeta>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}

export class LocalObjectStorage implements ObjectStorage {
  constructor(
    private readonly root: string,
    private readonly publicBaseUrl: string,
  ) {}

  async put(input: StoredObjectMeta & { body: Buffer }): Promise<StoredObjectMeta> {
    const full = path.join(this.root, input.key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, input.body);
    const { body: _body, ...meta } = input;
    return meta;
  }

  async getUrl(key: string): Promise<string> {
    return `${this.publicBaseUrl.replace(/\/$/, "")}/${key.replace(/^\/+/, "")}`;
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(path.join(this.root, key));
    } catch {
      return;
    }
  }
}

export function createObjectStorage(driver: string, root: string, publicBaseUrl: string): ObjectStorage {
  if (driver !== "local") {
    throw new Error(`Unsupported storage driver: ${driver}`);
  }
  return new LocalObjectStorage(root, publicBaseUrl);
}
