import { NextResponse } from "next/server";
import { getSessionUser } from "../../lib/auth";
import { renderMarkdown } from "../../lib/markdown";

/** Renders markdown with the exact production pipeline, for the editor's live preview. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    content?: string;
  } | null;
  if (typeof body?.content !== "string") {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }
  const html = await renderMarkdown(body.content.slice(0, 200_000));
  return NextResponse.json({ html });
}
