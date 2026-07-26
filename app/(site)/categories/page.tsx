import type { Metadata } from "next";
import Link from "next/link";
import BlockIcon from "@/app/components/BlockIcon";
import { getCategoriesWithCounts, getPublishedPosts } from "@/app/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories",
  description: "Articles organized by world region.",
};

export default async function CategoriesPage() {
  const [categories, posts] = await Promise.all([
    getCategoriesWithCounts(),
    getPublishedPosts(),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-14">
      <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">
        Categories
      </h1>
      <p className="mt-2 text-muted">
        {posts.length} articles across {categories.length} regions of the map.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {categories.map((cat) => {
          const recent = posts
            .filter((p) => p.categorySlug === cat.slug)
            .slice(0, 3);
          return (
            <div
              key={cat.slug}
              className="mc-card group relative rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1"
              style={{ "--card-accent": "#84cc16" } as React.CSSProperties}
            >
              <div className="flex items-center gap-4">
                <BlockIcon
                  variant={cat.icon}
                  className="h-12 w-12 group-hover:animate-[mc-hop_0.5s_ease]"
                />
                <div>
                  <h2 className="text-lg font-semibold text-heading">
                    <Link href={`/categories/${cat.slug}`} className="sweep-link">
                      {cat.name}
                      <span className="absolute inset-0" aria-hidden="true" />
                    </Link>
                  </h2>
                  <p className="text-xs text-muted">
                    {cat.count} article{cat.count === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{cat.description}</p>
              {recent.length > 0 && (
                <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
                  {recent.map((p) => (
                    <li key={p.slug} className="truncate text-body">
                      <span className="mr-2 text-accent">▸</span>
                      {p.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
