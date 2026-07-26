"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnPrimary } from "./ui";

export default function ImageUploader() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className={`${btnPrimary} cursor-pointer`}>
        {busy ? "Uploading…" : "+ Upload image"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={async (e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = "";
            if (files.length === 0) return;
            setBusy(true);
            setError(null);
            for (const file of files) {
              const body = new FormData();
              body.append("file", file);
              const res = await fetch("/api/uploads", { method: "POST", body });
              if (!res.ok) {
                const data = (await res.json().catch(() => ({}))) as {
                  error?: string;
                };
                setError(data.error ?? `Upload failed for ${file.name}`);
              }
            }
            setBusy(false);
            router.refresh();
          }}
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
