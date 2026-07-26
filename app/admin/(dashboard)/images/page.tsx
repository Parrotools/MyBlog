import type { Metadata } from "next";
import CopyButton from "@/app/components/admin/CopyButton";
import DeleteButton from "@/app/components/admin/DeleteButton";
import ImageUploader from "@/app/components/admin/ImageUploader";
import { db } from "@/app/lib/db";
import { deleteImageAction } from "../../actions";

export const metadata: Metadata = {
  title: "Admin — Images",
  robots: { index: false },
};

function formatSize(bytes: number): string {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export default async function AdminImages() {
  const images = await db.image.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-heading">Images</h1>
        <ImageUploader />
      </div>
      <p className="mt-2 text-sm text-muted">
        Upload images here (or straight from the post editor), then paste their
        URL into a cover field or markdown: <code>![alt](/uploads/…)</code>
      </p>

      {images.length === 0 ? (
        <p className="mt-16 text-center text-muted">
          The chest is empty — upload your first image.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => {
            const url = `/uploads/${img.path}`;
            return (
              <div
                key={img.id}
                className="overflow-hidden rounded-2xl border border-line bg-surface"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={img.filename}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <p className="truncate text-sm font-medium text-heading">
                    {img.filename}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {formatSize(img.size)} ·{" "}
                    {img.createdAt.toISOString().slice(0, 10)}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <CopyButton text={url} />
                    <form action={deleteImageAction}>
                      <input type="hidden" name="id" value={img.id} />
                      <DeleteButton
                        label="Delete"
                        confirmText={`Delete ${img.filename}? Pages using it will break.`}
                        className="press-btn rounded-full border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10"
                      />
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
