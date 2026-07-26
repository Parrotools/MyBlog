import { NextResponse, type NextRequest } from "next/server";
import { searchPosts } from "../../lib/content";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const posts = await searchPosts(q);
  return NextResponse.json({
    results: posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category,
      tags: p.tags,
    })),
  });
}
