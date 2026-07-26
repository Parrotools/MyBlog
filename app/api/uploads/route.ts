import { NextResponse } from "next/server";
import { db } from "../../lib/db";
import { getSessionUser } from "../../lib/auth";
import { isAllowedImage, saveUpload } from "../../lib/storage";

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

/** Upload an image (admin only). Returns its public URL. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!isAllowedImage(file.type)) {
    return NextResponse.json(
      { error: `Unsupported type: ${file.type}` },
      { status: 415 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 8 MB)" }, { status: 413 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const { storedName, size } = await saveUpload(buffer, file.type);
  const image = await db.image.create({
    data: {
      filename: file.name,
      path: storedName,
      mimeType: file.type,
      size,
    },
  });
  return NextResponse.json({
    id: image.id,
    url: `/uploads/${storedName}`,
    filename: file.name,
  });
}
