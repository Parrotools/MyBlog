"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text).catch(() => {});
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className="press-btn rounded-full border border-line px-3 py-1 text-xs text-muted hover:text-heading"
    >
      {copied ? "Copied ✓" : "Copy URL"}
    </button>
  );
}
