import type { Metadata } from "next";
import BlockIcon from "@/app/components/BlockIcon";
import DeleteButton from "@/app/components/admin/DeleteButton";
import { btnGhost, btnPrimary, cardCls, inputCls, labelCls } from "@/app/components/admin/ui";
import { db } from "@/app/lib/db";
import { deleteCategoryAction, saveCategoryAction } from "../../actions";

export const metadata: Metadata = {
  title: "Admin — Categories",
  robots: { index: false },
};

const ICONS = ["grass", "tnt", "stone", "dirt", "iron", "charred", "redstone"];

export default async function AdminCategories() {
  const categories = await db.category.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="text-2xl font-bold text-heading">Categories</h1>

      <form action={saveCategoryAction} className={`${cardCls} mt-8`}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted">
          New category
        </h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className={labelCls}>Name</label>
            <input name="name" required className={inputCls} placeholder="Systems" />
          </div>
          <div>
            <label className={labelCls}>Icon</label>
            <select name="icon" className={inputCls}>
              {ICONS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className={btnPrimary}>
              Create
            </button>
          </div>
        </div>
        <div className="mt-4">
          <label className={labelCls}>Description</label>
          <input
            name="description"
            className={inputCls}
            placeholder="What lives in this region of the map"
          />
        </div>
      </form>

      <div className="mt-8 space-y-4">
        {categories.map((c) => (
          <form key={c.id} action={saveCategoryAction} className={cardCls}>
            <input type="hidden" name="id" value={c.id} />
            <div className="flex flex-wrap items-end gap-4">
              <BlockIcon variant={c.icon as never} className="h-10 w-10 shrink-0" />
              <div className="min-w-40 flex-1">
                <label className={labelCls}>Name</label>
                <input name="name" defaultValue={c.name} className={inputCls} />
              </div>
              <div className="min-w-64 flex-[2]">
                <label className={labelCls}>Description</label>
                <input
                  name="description"
                  defaultValue={c.description}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Icon</label>
                <select name="icon" defaultValue={c.icon} className={inputCls}>
                  {ICONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className={btnGhost}>
                Save
              </button>
            </div>
            <p className="mt-3 font-mono text-xs text-muted">
              /{c.slug} · {c._count.articles} article
              {c._count.articles === 1 ? "" : "s"}
            </p>
          </form>
        ))}
      </div>

      <div className="mt-8 space-y-2">
        {categories.map((c) => (
          <form
            key={c.id}
            action={deleteCategoryAction}
            className="inline-block ltr:mr-2"
          >
            <input type="hidden" name="id" value={c.id} />
            <DeleteButton
              label={`Delete "${c.name}"`}
              confirmText={`Delete category "${c.name}"? Its articles become Uncategorized.`}
              className="press-btn rounded-full border border-red-500/30 px-3.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
            />
          </form>
        ))}
      </div>
    </div>
  );
}
