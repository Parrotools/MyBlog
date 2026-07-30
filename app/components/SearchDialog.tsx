"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface Hit {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
}

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHits([]);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // debounced server search — all state updates happen inside the timeout
  useEffect(() => {
    const q = query.trim();
    const t = window.setTimeout(
      async () => {
        if (q.length < 2) {
          setHits([]);
          setLoading(false);
          return;
        }
        setLoading(true);
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
            signal: controller.signal,
          });
          const data = (await res.json()) as { results: Hit[] };
          setHits(data.results);
        } catch {
          /* aborted or offline — keep previous hits */
        } finally {
          setLoading(false);
        }
      },
      q.length < 2 ? 0 : 200
    );
    return () => window.clearTimeout(t);
  }, [query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press-btn hidden items-center gap-2 rounded-full border border-line px-3.5 py-2 text-xs text-muted sm:flex"
        aria-label="Search posts"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        Search
        <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px]">
          Ctrl K
        </kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press-btn flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted sm:hidden"
        aria-label="Search posts"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Search"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts… (attention, ICPC, nginx)"
                className="w-full bg-transparent py-4 text-sm text-heading outline-none placeholder:text-muted"
              />
              <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted">
                Esc
              </kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {query.trim().length < 2 ? (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  Type at least 2 characters to search the world.
                </p>
              ) : hits.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  {loading
                    ? "Mining…"
                    : `No loot found for "${query}". Try different keywords.`}
                </p>
              ) : (
                hits.map((hit) => (
                  <Link
                    key={hit.slug}
                    href={`/posts/${hit.slug}`}
                    onClick={close}
                    className="group block rounded-xl px-3 py-3 transition-colors hover:bg-surface-2"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="sweep-link font-medium text-heading">
                        {hit.title}
                      </span>
                      <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">
                        {hit.category}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                      {hit.excerpt}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
