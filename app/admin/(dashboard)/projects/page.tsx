import type { Metadata } from "next";
import DeleteButton from "@/app/components/admin/DeleteButton";
import { btnGhost, btnPrimary, cardCls, inputCls, labelCls } from "@/app/components/admin/ui";
import { db } from "@/app/lib/db";
import { deleteProjectAction, saveProjectAction } from "../../actions";

export const metadata: Metadata = {
  title: "Admin — Projects",
  robots: { index: false },
};

function ProjectFields({
  defaults,
}: {
  defaults?: {
    name?: string;
    description?: string;
    tech?: string;
    githubUrl?: string | null;
    demoUrl?: string | null;
    status?: string;
    sortOrder?: number;
  };
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Name</label>
          <input
            name="name"
            required
            defaultValue={defaults?.name}
            className={inputCls}
            placeholder="LLM Serving Framework"
          />
        </div>
        <div>
          <label className={labelCls}>Technologies (comma-separated)</label>
          <input
            name="tech"
            defaultValue={defaults?.tech}
            className={inputCls}
            placeholder="CUDA, TensorRT, C++"
          />
        </div>
      </div>
      <div className="mt-4">
        <label className={labelCls}>Description</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={defaults?.description}
          className={inputCls}
        />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>GitHub URL</label>
          <input
            name="githubUrl"
            defaultValue={defaults?.githubUrl ?? ""}
            className={`${inputCls} font-mono`}
          />
        </div>
        <div>
          <label className={labelCls}>Demo URL</label>
          <input
            name="demoUrl"
            defaultValue={defaults?.demoUrl ?? ""}
            className={`${inputCls} font-mono`}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Status</label>
            <select
              name="status"
              defaultValue={defaults?.status ?? "active"}
              className={inputCls}
            >
              <option value="active">active</option>
              <option value="in-progress">in-progress</option>
              <option value="archived">archived</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Order</label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={defaults?.sortOrder ?? 0}
              className={inputCls}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default async function AdminProjects() {
  const projects = await db.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="text-2xl font-bold text-heading">Projects</h1>

      <form action={saveProjectAction} className={`${cardCls} mt-8`}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted">
          New project
        </h2>
        <ProjectFields />
        <button type="submit" className={`${btnPrimary} mt-5`}>
          Create project
        </button>
      </form>

      <div className="mt-8 space-y-5">
        {projects.map((p) => (
          <div key={p.id} className={cardCls}>
            <form action={saveProjectAction}>
              <input type="hidden" name="id" value={p.id} />
              <ProjectFields defaults={p} />
              <div className="mt-5 flex items-center gap-3">
                <button type="submit" className={btnGhost}>
                  Save changes
                </button>
              </div>
            </form>
            <form action={deleteProjectAction} className="mt-3">
              <input type="hidden" name="id" value={p.id} />
              <DeleteButton
                label="Delete project"
                confirmText={`Delete project "${p.name}"?`}
                className="press-btn rounded-full border border-red-500/30 px-3.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
              />
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
