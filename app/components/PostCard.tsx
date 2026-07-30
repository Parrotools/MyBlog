import Link from "next/link";
import BlockIcon from "./BlockIcon";
import type { PostView } from "../lib/content";

export default async function PostCard({ post }: { post: PostView }) {
  return (
    <article
      className="mc-card group relative flex flex-col gap-3 rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_44px_-12px_var(--card-accent)]"
      style={{ "--card-accent": post.accent } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold leading-snug text-heading">
          <Link href={`/posts/${post.slug}`} className="sweep-link">
            {post.title}
            <span className="absolute inset-0" aria-hidden="true" />
          </Link>
        </h3>
        <BlockIcon
          variant={post.icon}
          className="h-9 w-9 shrink-0 opacity-90 group-hover:animate-[mc-hop_0.5s_ease]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs text-muted">
        <time dateTime={post.date}>{post.date}</time>
        <span aria-hidden="true">·</span>
        <span>{post.readMinutes} min read</span>
        {post.views > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {post.views}
            </span>
          </>
        )}
        <span aria-hidden="true">·</span>
        <Link
          href={`/categories/${post.categorySlug}`}
          className="relative z-10 rounded-full bg-surface-2 px-2 py-0.5 transition-colors hover:text-accent"
        >
          {post.category}
        </Link>
      </div>

      <p className="line-clamp-3 text-sm leading-6 text-muted">{post.excerpt}</p>

      <div className="mt-auto flex items-center justify-between pt-3">
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="mc-tag relative z-10 rounded-full border border-line px-3 py-1 text-xs text-muted"
            >
              #{tag}
            </Link>
          ))}
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 max-sm:hidden -translate-x-2">
          Read
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 8h9M9 4.5 12.5 8 9 11.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </article>
  );
}
