import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleEditor from "@/app/components/admin/ArticleEditor";
import { db } from "@/app/lib/db";

export const metadata: Metadata = {
  title: "Admin — Edit post",
  robots: { index: false },
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, categories] = await Promise.all([
    db.article.findUnique({
      where: { id },
      include: { category: true, tags: true },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!article) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Link
        href="/admin/posts"
        className="sweep-link text-sm text-muted hover:text-heading"
      >
        ← Posts
      </Link>
      <h1 className="mb-8 mt-3 text-2xl font-bold text-heading">
        Edit: <span className="text-muted">{article.title}</span>
      </h1>
      <ArticleEditor
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          summary: article.summary,
          content: article.content,
          coverImage: article.coverImage ?? "",
          icon: article.icon,
          accent: article.accent,
          status: article.status,
          featured: article.featured,
          categorySlug: article.category?.slug ?? "",
          tags: article.tags.map((t) => t.name),
        }}
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
      />
    </div>
  );
}
