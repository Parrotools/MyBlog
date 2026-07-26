import fs from "fs";
import { NextResponse } from "next/server";
import { mimeForStored, resolveUpload } from "../../lib/storage";

/** Serves uploaded images from UPLOADS_DIR (which lives outside public/). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string[] }> }
) {
  const { file } = await params;
  const storedName = file.join("/");
  const absolute = resolveUpload(storedName);
  if (!absolute || !fs.existsSync(absolute)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const data = await fs.promises.readFile(absolute);
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": mimeForStored(storedName),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
