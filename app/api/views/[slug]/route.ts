import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

/** View-count beacon: fired once per browser session from article pages. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const result = await db.article.updateMany({
    where: { slug, status: "PUBLISHED" },
    data: { viewCount: { increment: 1 } },
  });
  return NextResponse.json({ counted: result.count > 0 });
}
