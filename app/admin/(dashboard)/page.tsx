import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/app/lib/db";
import { btnPrimary, cardCls } from "@/app/components/admin/ui";

export const metadata: Metadata = {
  title: "Admin — Overview",
  robots: { index: false },
};

export default async function AdminOverview() {
  const [byStatus, views, categories, tags, projects, images, recent] =
    await Promise.all([
      db.article.groupBy({ by: ["status"], _count: true }),
      db.article.aggregate({ _sum: { viewCount: true } }),
      db.category.count(),
      db.tag.count(),
      db.project.count(),
      db.image.count(),
      db.article.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: { category: true },
      }),
    ]);

  const count = (status: string) =>
    byStatus.find((s) => s.status === status)?._count ?? 0;

  const stats: Array<[string, number | string]> = [
    ["Published", count("PUBLISHED")],
    ["Drafts", count("DRAFT")],
    ["Archived", count("ARCHIVED")],
    ["Total views", views._sum.viewCount ?? 0],
    ["Categories", categories],
    ["Tags", tags],
    ["Projects", projects],
    ["Images", images],
  ];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-heading">Overview</h1>
        <Link href="/admin/posts/new" className={btnPrimary}>
          + New post
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className={cardCls}>
            <p className="text-2xl font-bold tabular-nums text-heading">{value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-muted">
              {label}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-muted">
        Recently edited
      </h2>
      <div className="overflow-hidden rounded-2xl border border-line">
        {recent.map((a, i) => (
          <Link
            key={a.id}
            href={`/admin/posts/${a.id}`}
            className={`flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-surface-2 ${
              i > 0 ? "border-t border-line" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-heading">{a.title}</p>
              <p className="mt-0.5 font-mono text-xs text-muted">
                {a.category?.name ?? "Uncategorized"} ·{" "}
                {a.updatedAt.toISOString().slice(0, 16).replace("T", " ")}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                a.status === "PUBLISHED"
                  ? "bg-lime-400/15 text-lime-500"
                  : a.status === "DRAFT"
                    ? "bg-amber-400/15 text-amber-500"
                    : "bg-surface-2 text-muted"
              }`}
            >
              {a.status.toLowerCase()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
