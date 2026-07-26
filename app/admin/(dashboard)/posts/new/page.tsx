import type { Metadata } from "next";
import Link from "next/link";
import ArticleEditor from "@/app/components/admin/ArticleEditor";
import { db } from "@/app/lib/db";

export const metadata: Metadata = {
  title: "Admin — New post",
  robots: { index: false },
};

export default async function NewPostPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Link
        href="/admin/posts"
        className="sweep-link text-sm text-muted hover:text-heading"
      >
        ← Posts
      </Link>
      <h1 className="mb-8 mt-3 text-2xl font-bold text-heading">New post</h1>
      <ArticleEditor
        article={{
          title: "",
          slug: "",
          summary: "",
          content: "",
          coverImage: "",
          icon: "grass",
          accent: "#84cc16",
          status: "DRAFT",
          featured: false,
          categorySlug: "",
          tags: [],
        }}
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
      />
    </div>
  );
}
