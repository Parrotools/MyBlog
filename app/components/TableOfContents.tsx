"use client";

import { useEffect, useState } from "react";
import { useI18n } from "./I18nProvider";
import type { Heading } from "../lib/markdown";

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const { t } = useI18n();
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-15% 0px -75% 0px" }
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted">
        {t.article.onThisPage}
      </p>
      <ul className="space-y-0.5 border-l border-line text-sm">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              data-active={active === h.id}
              className={`toc-link -ml-px block border-l-2 border-transparent py-1 pr-2 text-muted hover:text-heading ${
                h.level === 3 ? "pl-7" : "pl-4"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
