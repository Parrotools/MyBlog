import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlockIcon from "@/app/components/BlockIcon";
import PostCard from "@/app/components/PostCard";
import { getCategoryBySlug, getPublishedPosts } from "@/app/lib/content";
import { dicts } from "@/app/lib/i18n";
import { getLocale } from "@/app/lib/locale";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return {};
  return { title: `${cat.name} posts`, description: cat.description };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();

  const posts = (await getPublishedPosts()).filter(
    (p) => p.categorySlug === cat.slug
  );
  const t = dicts[await getLocale()];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-14">
      <Link
        href="/categories"
        className="sweep-link text-sm text-muted hover:text-heading"
      >
        {t.categoriesPage.allCategories}
      </Link>
      <div className="mt-6 flex items-center gap-4">
        <BlockIcon variant={cat.icon} className="h-14 w-14" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-heading">
            {cat.name}
          </h1>
          <p className="mt-1 text-muted">{cat.description}</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="mt-16 text-center text-muted">
          {t.categoriesPage.emptyRegion}
        </p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
