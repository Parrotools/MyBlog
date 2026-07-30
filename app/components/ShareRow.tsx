import { SITE_URL } from "../lib/site";

/** Share links for a post — no tracking scripts, just intent URLs. */
export default async function ShareRow({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const url = `${SITE_URL}/posts/${slug}`;
  const eUrl = encodeURIComponent(url);
  const eTitle = encodeURIComponent(title);

  const targets = [
    {
      label: "Share on X",
      short: "X",
      href: `https://x.com/intent/post?text=${eTitle}&url=${eUrl}`,
    },
    {
      label: "Share on LinkedIn",
      short: "in",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${eUrl}`,
    },
    {
      label: "Share on Reddit",
      short: "r/",
      href: `https://www.reddit.com/submit?url=${eUrl}&title=${eTitle}`,
    },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        Share
      </span>
      <div className="flex gap-2">
        {targets.map((t) => (
          <a
            key={t.short}
            href={t.href}
            target="_blank"
            rel="noreferrer"
            aria-label={t.label}
            title={t.label}
            className="press-btn flex h-9 w-9 items-center justify-center rounded-full border border-line font-mono text-xs font-bold text-muted hover:text-heading"
          >
            {t.short}
          </a>
        ))}
      </div>
    </div>
  );
}
