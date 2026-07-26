import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/app/lib/db";
import { btnPrimary } from "@/app/components/admin/ui";
import DeleteButton from "@/app/components/admin/DeleteButton";
import { deleteArticleAction } from "../../actions";

export const metadata: Metadata = {
  title: "Admin — Posts",
  robots: { index: false },
};

const FILTERS = ["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const;

export default async function AdminPosts({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = FILTERS.includes((status ?? "") as (typeof FILTERS)[number])
    ? status
    : "ALL";

  const articles = await db.article.findMany({
    where: filter && filter !== "ALL" ? { status: filter } : undefined,
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-heading">Posts</h1>
        <Link href="/admin/posts/new" className={btnPrimary}>
          + New post
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "ALL" ? "/admin/posts" : `/admin/posts?status=${f}`}
            className={`press-btn rounded-full border px-4 py-1.5 text-sm ${
              filter === f
                ? "border-accent/50 font-semibold text-accent"
                : "border-line text-muted"
            }`}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line">
        {articles.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted">
            Nothing here — write something!
          </p>
        )}
        {articles.map((a, i) => (
          <div
            key={a.id}
            className={`flex flex-wrap items-center gap-3 px-5 py-4 ${
              i > 0 ? "border-t border-line" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/posts/${a.id}`}
                className="sweep-link font-medium text-heading"
              >
                {a.title}
              </Link>
              <p className="mt-1 font-mono text-xs text-muted">
                /{a.slug} · {a.category?.name ?? "Uncategorized"} · {a.viewCount}{" "}
                views · updated {a.updatedAt.toISOString().slice(0, 10)}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                a.status === "PUBLISHED"
                  ? "bg-lime-400/15 text-lime-500"
                  : a.status === "DRAFT"
                    ? "bg-amber-400/15 text-amber-500"
                    : "bg-surface-2 text-muted"
              }`}
            >
              {a.status.toLowerCase()}
            </span>
            <Link
              href={`/posts/${a.slug}`}
              className="press-btn rounded-full border border-line px-3.5 py-1.5 text-xs text-muted"
            >
              View
            </Link>
            <Link
              href={`/admin/posts/${a.id}`}
              className="press-btn rounded-full border border-line px-3.5 py-1.5 text-xs text-muted"
            >
              Edit
            </Link>
            <form action={deleteArticleAction}>
              <input type="hidden" name="id" value={a.id} />
              <DeleteButton
                label="Delete"
                confirmText={`Delete "${a.title}"? There is no undo.`}
                className="press-btn rounded-full border border-red-500/30 px-3.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
              />
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
