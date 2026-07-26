"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTheme } from "next-themes";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import GithubSlugger from "github-slugger";
import {
  saveArticleAction,
  type ArticlePayload,
} from "@/app/admin/actions";
import { btnGhost, btnPrimary, inputCls, labelCls } from "./ui";

export interface EditorArticle {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  icon: string;
  accent: string;
  status: string;
  featured: boolean;
  categorySlug: string;
  tags: string[];
}

const ICONS = ["grass", "tnt", "stone", "dirt", "iron", "charred", "redstone"];

export default function ArticleEditor({
  article,
  categories,
}: {
  article: EditorArticle;
  categories: Array<{ name: string; slug: string }>;
}) {
  const [form, setForm] = useState<EditorArticle>(article);
  const [tagsText, setTagsText] = useState(article.tags.join(", "));
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const { resolvedTheme } = useTheme();
  const slugTouched = useRef(Boolean(article.id));

  const set = <K extends keyof EditorArticle>(key: K, value: EditorArticle[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // live preview via the production markdown pipeline
  useEffect(() => {
    if (!showPreview) return;
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: form.content }),
        });
        if (res.ok) {
          const data = (await res.json()) as { html: string };
          setPreviewHtml(data.html);
        }
      } catch {
        /* keep the last successful preview */
      }
    }, 500);
    return () => window.clearTimeout(t);
  }, [form.content, showPreview]);

  const upload = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Upload failed.");
        return null;
      }
      return data.url;
    } finally {
      setUploading(false);
    }
  };

  const save = (statusOverride?: string) => {
    setError(null);
    const payload: ArticlePayload = {
      id: form.id,
      title: form.title,
      slug: form.slug,
      summary: form.summary,
      content: form.content,
      coverImage: form.coverImage,
      icon: form.icon,
      accent: form.accent,
      status: statusOverride ?? form.status,
      featured: form.featured,
      categorySlug: form.categorySlug,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
    };
    startTransition(async () => {
      const result = await saveArticleAction(payload);
      // on success the action redirects; reaching here means a validation error
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="space-y-6">
      {/* meta fields */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className={labelCls}>Title</label>
          <input
            value={form.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!slugTouched.current) {
                setForm((f) => ({
                  ...f,
                  title: e.target.value,
                  slug: new GithubSlugger().slug(e.target.value),
                }));
              }
            }}
            placeholder="Understanding Transformer Attention"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Slug</label>
          <input
            value={form.slug}
            onChange={(e) => {
              slugTouched.current = true;
              set("slug", e.target.value);
            }}
            placeholder="understanding-transformer-attention"
            className={`${inputCls} font-mono`}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Summary</label>
        <textarea
          value={form.summary}
          onChange={(e) => set("summary", e.target.value)}
          rows={2}
          placeholder="One or two sentences shown on cards, search and RSS."
          className={inputCls}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={labelCls}>Category</label>
          <select
            value={form.categorySlug}
            onChange={(e) => set("categorySlug", e.target.value)}
            className={inputCls}
          >
            <option value="">— none —</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className={inputCls}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Card icon</label>
          <select
            value={form.icon}
            onChange={(e) => set("icon", e.target.value)}
            className={inputCls}
          >
            {ICONS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Accent color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.accent}
              onChange={(e) => set("accent", e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-surface"
              aria-label="Accent color"
            />
            <input
              value={form.accent}
              onChange={(e) => set("accent", e.target.value)}
              className={`${inputCls} font-mono`}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className={labelCls}>Tags (comma-separated)</label>
          <input
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="AI, deep-learning, PyTorch"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Cover image</label>
          <div className="flex items-center gap-2">
            <input
              value={form.coverImage}
              onChange={(e) => set("coverImage", e.target.value)}
              placeholder="/uploads/… or leave empty"
              className={`${inputCls} font-mono`}
            />
            <label className={`${btnGhost} cursor-pointer whitespace-nowrap`}>
              {uploading ? "Uploading…" : "Upload"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await upload(file);
                    if (url) set("coverImage", url);
                  }
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-body">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set("featured", e.target.checked)}
          className="h-4 w-4 accent-lime-500"
        />
        Featured (pinned into Popular when views are tied)
      </label>

      {/* content */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <label className={`${labelCls} mb-0`}>Content (Markdown)</label>
          <div className="flex items-center gap-2">
            <label className={`${btnGhost} cursor-pointer px-4 py-1.5 text-xs`}>
              {uploading ? "Uploading…" : "Insert image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await upload(file);
                    if (url) {
                      set(
                        "content",
                        `${form.content}\n\n![${file.name}](${url})\n`
                      );
                    }
                  }
                  e.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => setShowPreview((p) => !p)}
              className={`${btnGhost} px-4 py-1.5 text-xs ${
                showPreview ? "border-accent/50 text-accent" : ""
              }`}
            >
              {showPreview ? "Hide preview" : "Live preview"}
            </button>
          </div>
        </div>

        <div className={showPreview ? "grid gap-4 xl:grid-cols-2" : ""}>
          <div className="overflow-hidden rounded-xl border border-line">
            <CodeMirror
              value={form.content}
              onChange={(value) => set("content", value)}
              extensions={[markdown()]}
              theme={resolvedTheme === "light" ? "light" : "dark"}
              minHeight="420px"
              maxHeight="70vh"
              basicSetup={{ lineNumbers: true, foldGutter: false }}
            />
          </div>
          {showPreview && (
            <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-surface p-6">
              <div
                className="prose-mc"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <button
          type="button"
          onClick={() => save()}
          disabled={pending}
          className={btnPrimary}
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {form.status !== "PUBLISHED" && (
          <button
            type="button"
            onClick={() => save("PUBLISHED")}
            disabled={pending}
            className={btnGhost}
          >
            Save &amp; publish
          </button>
        )}
        {form.id && form.slug && (
          <a
            href={`/posts/${form.slug}`}
            target="_blank"
            rel="noreferrer"
            className={`${btnGhost} ml-auto`}
          >
            Open page ↗
          </a>
        )}
      </div>
    </div>
  );
}
