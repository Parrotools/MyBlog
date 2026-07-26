import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlockIcon from "@/app/components/BlockIcon";
import ShareRow from "@/app/components/ShareRow";
import TableOfContents from "@/app/components/TableOfContents";
import ViewBeacon from "@/app/components/ViewBeacon";
import { getSessionUser } from "@/app/lib/auth";
import { getPostBySlug, getPublishedPosts } from "@/app/lib/content";
import { dicts, fmt } from "@/app/lib/i18n";
import { getLocale } from "@/app/lib/locale";
import { renderMarkdown } from "@/app/lib/markdown";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // admins can open drafts straight from the dashboard
  const admin = await getSessionUser();
  const post = await getPostBySlug(slug, { includeUnpublished: !!admin });
  if (!post) notFound();

  const [html, all] = await Promise.all([
    renderMarkdown(post.content),
    getPublishedPosts(),
  ]);
  const t = dicts[await getLocale()];
  const idx = all.findIndex((p) => p.slug === post.slug);
  const newer = idx > 0 ? all[idx - 1] : null;
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <div className="relative overflow-hidden">
      <ViewBeacon slug={post.slug} />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 opacity-[0.13] blur-[120px]"
        style={{
          background: `radial-gradient(closest-side, ${post.accent}, transparent)`,
        }}
      />

      <div className="mx-auto w-full max-w-6xl px-6 py-12 lg:grid lg:grid-cols-[minmax(0,1fr)_230px] lg:gap-14">
        <div className="mx-auto w-full max-w-2xl lg:mx-0 lg:max-w-none">
          <Link
            href="/posts"
            className="sweep-link text-sm text-muted hover:text-heading"
          >
            {t.article.allPosts}
          </Link>

          {post.status !== "PUBLISHED" && (
            <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-500">
              {post.status === "DRAFT" ? t.article.draft : t.article.archived}
            </p>
          )}

          <header className="mt-6">
            <div className="flex items-center gap-3">
              <BlockIcon variant={post.icon} className="h-10 w-10" />
              <Link
                href={`/categories/${post.categorySlug}`}
                className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted transition-colors hover:text-accent"
              >
                {post.category}
              </Link>
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-heading sm:text-4xl">
              {post.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2.5 font-mono text-xs text-muted">
              <time dateTime={post.date}>{post.date}</time>
              <span aria-hidden="true">·</span>
              <span>{fmt(t.post.minRead, { n: post.readMinutes })}</span>
              <span aria-hidden="true">·</span>
              <span>{fmt(t.post.views, { n: post.views })}</span>
              <span aria-hidden="true">·</span>
              <div className="flex gap-1.5">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className="mc-tag rounded-full border border-line px-2.5 py-0.5"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </header>

          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt=""
              className="mt-8 w-full rounded-2xl border border-line object-cover"
            />
          )}

          {/* mobile TOC */}
          {post.headings.length > 0 && (
            <details className="mt-8 rounded-2xl border border-line bg-surface p-4 lg:hidden">
              <summary className="cursor-pointer text-sm font-semibold text-heading">
                {t.article.contents}
              </summary>
              <ul className="mt-3 space-y-1.5 text-sm">
                {post.headings.map((h) => (
                  <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
                    <a href={`#${h.id}`} className="text-muted hover:text-accent">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <article
            className="prose-mc mt-10"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
            <ShareRow slug={post.slug} title={post.title} />
          </div>

          <nav className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="More posts">
            {older ? (
              <Link
                href={`/posts/${older.slug}`}
                className="shine group rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {t.article.older}
                </p>
                <p className="sweep-link mt-2 font-semibold text-heading">
                  {older.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {newer ? (
              <Link
                href={`/posts/${newer.slug}`}
                className="shine group rounded-2xl border border-line bg-surface p-5 text-right transition-all hover:-translate-y-0.5 hover:border-accent/40"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {t.article.newer}
                </p>
                <p className="sweep-link mt-2 font-semibold text-heading">
                  {newer.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <TableOfContents headings={post.headings} />
            <a
              href="#"
              className="mt-6 inline-block text-xs text-muted transition-colors hover:text-accent"
            >
              {t.article.backToTop}
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
