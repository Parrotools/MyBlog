import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Local-disk storage adapter for uploads. Isolated here so an
 * S3-compatible adapter can replace it without touching callers.
 */

const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR ?? "./uploads");

const ALLOWED_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
};

export function isAllowedImage(mime: string): boolean {
  return mime in ALLOWED_MIME;
}

export async function saveUpload(
  buffer: Buffer,
  mime: string
): Promise<{ storedName: string; size: number }> {
  const ext = ALLOWED_MIME[mime];
  if (!ext) throw new Error(`Unsupported file type: ${mime}`);
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const storedName = `${Date.now().toString(36)}-${crypto
    .randomBytes(6)
    .toString("hex")}${ext}`;
  await fs.promises.writeFile(path.join(UPLOADS_DIR, storedName), buffer);
  return { storedName, size: buffer.length };
}

export async function deleteUpload(storedName: string): Promise<void> {
  const file = resolveUpload(storedName);
  if (file) await fs.promises.rm(file, { force: true });
}

/** Resolve a stored name to an absolute path — rejects traversal attempts. */
export function resolveUpload(storedName: string): string | null {
  const file = path.resolve(UPLOADS_DIR, storedName);
  if (!file.startsWith(UPLOADS_DIR + path.sep)) return null;
  return file;
}

export function mimeForStored(storedName: string): string {
  const ext = path.extname(storedName).toLowerCase();
  const entry = Object.entries(ALLOWED_MIME).find(([, e]) => e === ext);
  if (entry) return entry[0];
  if (ext === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}
