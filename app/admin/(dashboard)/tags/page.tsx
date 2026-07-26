import type { Metadata } from "next";
import DeleteButton from "@/app/components/admin/DeleteButton";
import { btnPrimary, cardCls, inputCls, labelCls } from "@/app/components/admin/ui";
import { db } from "@/app/lib/db";
import { createTagAction, deleteTagAction } from "../../actions";

export const metadata: Metadata = {
  title: "Admin — Tags",
  robots: { index: false },
};

export default async function AdminTags() {
  const tags = await db.tag.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-bold text-heading">Tags</h1>

      <form action={createTagAction} className={`${cardCls} mt-8`}>
        <label className={labelCls}>New tag</label>
        <div className="flex gap-3">
          <input name="name" required className={inputCls} placeholder="Rust" />
          <button type="submit" className={btnPrimary}>
            Add
          </button>
        </div>
      </form>

      <div className="mt-8 flex flex-wrap gap-2.5">
        {tags.map((t) => (
          <span
            key={t.id}
            className="flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-4 pr-1.5 text-sm text-body"
          >
            #{t.name}
            <span className="font-mono text-xs text-muted">
              {t._count.articles}
            </span>
            <form action={deleteTagAction} className="flex">
              <input type="hidden" name="id" value={t.id} />
              <DeleteButton
                label="×"
                confirmText={`Remove tag "${t.name}" from all articles?`}
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-500/15 hover:text-red-400"
              />
            </form>
          </span>
        ))}
        {tags.length === 0 && (
          <p className="text-sm text-muted">No tags yet.</p>
        )}
      </div>
    </div>
  );
}
