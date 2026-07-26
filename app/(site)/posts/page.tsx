import type { Metadata } from "next";
import Link from "next/link";
import PostCard from "@/app/components/PostCard";
import {
  getCategoriesWithCounts,
  getPublishedPosts,
  getTagsWithCounts,
} from "@/app/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All posts",
  description: "Every article on the blog — filter by category or tag.",
};

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; category?: string }>;
}) {
  const { tag, category } = await searchParams;
  const [all, categories, tags] = await Promise.all([
    getPublishedPosts(),
    getCategoriesWithCounts(),
    getTagsWithCounts(),
  ]);

  const posts = all.filter(
    (p) =>
      (!tag || p.tags.includes(tag)) &&
      (!category || p.categorySlug === category.toLowerCase())
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-14">
      <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">
        All posts
      </h1>
      <p className="mt-2 text-muted">
        {posts.length} of {all.length} article{all.length === 1 ? "" : "s"}
        {category ? ` in ${category}` : ""}
        {tag ? ` tagged #${tag}` : ""}
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-2">
        <Link
          href="/posts"
          className={`press-btn rounded-full border px-4 py-1.5 text-sm ${
            !category && !tag
              ? "border-accent/50 font-semibold text-accent"
              : "border-line text-muted"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/posts?category=${c.slug}`}
            className={`press-btn rounded-full border px-4 py-1.5 text-sm ${
              category?.toLowerCase() === c.slug
                ? "border-accent/50 font-semibold text-accent"
                : "border-line text-muted"
            }`}
          >
            {c.name}
            <span className="ml-1.5 font-mono text-xs opacity-60">{c.count}</span>
          </Link>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map(({ tag: t, count }) => (
          <Link
            key={t}
            href={`/posts?tag=${encodeURIComponent(t)}`}
            className={`mc-tag rounded-full border px-3 py-1 text-xs ${
              tag === t
                ? "border-accent/50 font-semibold text-accent"
                : "border-line text-muted"
            }`}
          >
            #{t}
            <span className="ml-1 font-mono opacity-60">{count}</span>
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="mt-16 text-center text-muted">
          No posts here yet — this chunk is still generating.
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
