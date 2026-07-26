import Link from "next/link";
import { cookies } from "next/headers";
import MinecraftIntro from "@/app/intro/MinecraftIntro";
import Avatar from "@/app/components/Avatar";
import BlockIcon from "@/app/components/BlockIcon";
import Hotbar from "@/app/components/Hotbar";
import PlayerStats from "@/app/components/PlayerStats";
import PostCard from "@/app/components/PostCard";
import {
  getCategoriesWithCounts,
  getHotbar,
  getPopularPosts,
  getProfile,
  getPublishedPosts,
} from "@/app/lib/content";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ intro?: string }>;
}) {
  const [posts, popular, categories, profile, hotbar, cookieStore, params] =
    await Promise.all([
      getPublishedPosts(),
      getPopularPosts(3),
      getCategoriesWithCounts(),
      getProfile(),
      getHotbar(),
      cookies(),
      searchParams,
    ]);
  const latest = posts.slice(0, 4);
  // the 3D intro plays once per browser session (cookie set on finish/skip);
  // /?intro=1 forces a replay any time
  const introSeen = params.intro !== "1" && cookieStore.has("intro_seen");

  return (
    <>
      {/* fullscreen 3D intro overlay; removes itself once the camera flies through */}
      {!introSeen && <MinecraftIntro />}

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-14rem] h-[34rem] w-[52rem] -translate-x-1/2 rounded-full bg-lime-500/10 blur-[140px]" />
          <div className="absolute bottom-[-10rem] right-[-14rem] h-[28rem] w-[36rem] rounded-full bg-emerald-600/10 blur-[130px]" />
        </div>

        {/* ================= hero ================= */}
        <section className="mx-auto grid w-full max-w-5xl items-center gap-12 px-6 pb-16 pt-16 sm:pt-24 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-4 py-1.5 text-xs font-medium text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
              You made it through the wall
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-heading sm:text-6xl">
              Hi, I&apos;m{" "}
              <span className="bg-gradient-to-r from-lime-400 to-emerald-500 bg-clip-text text-transparent">
                {profile.name}
              </span>
              .
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              {profile.tagline}. {profile.intro} This blog is a place to record:
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {profile.records.map((r) => (
                <li
                  key={r}
                  className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-body transition-colors hover:border-accent/50 hover:text-accent"
                >
                  {r}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/posts"
                className="shine rounded-full bg-gradient-to-r from-lime-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(132,204,22,0.35)] transition-transform hover:-translate-y-0.5"
              >
                Read the blog
              </Link>
              <Link
                href="/about"
                className="press-btn rounded-full border border-line px-6 py-3 text-sm font-medium text-body"
              >
                About me →
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <Avatar src={profile.avatar} />
            <PlayerStats profile={profile} />
          </div>
        </section>

        {/* ================= hotbar ================= */}
        <section className="mx-auto w-full max-w-5xl px-6 pb-20">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-muted">
            Daily hotbar{" "}
            <span className="normal-case tracking-normal">— hover the slots</span>
          </h2>
          <div className="-mt-24 overflow-x-auto pb-2 pt-24">
            <Hotbar slots={hotbar} />
          </div>
        </section>

        <div className="mx-auto h-px w-full max-w-5xl bg-gradient-to-r from-transparent via-lime-500/40 to-transparent" />

        {/* ================= popular ================= */}
        {popular.length > 0 && (
          <section className="mx-auto w-full max-w-5xl px-6 py-14">
            <h2 className="mb-8 text-sm font-semibold uppercase tracking-[0.25em] text-muted">
              ★ Popular posts
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              {popular.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* ================= latest ================= */}
        <section className="mx-auto w-full max-w-5xl px-6 pb-14">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted">
              Latest posts
            </h2>
            <Link
              href="/posts"
              className="sweep-link text-sm text-muted hover:text-heading"
            >
              View all {posts.length} →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {latest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        {/* ================= categories ================= */}
        <section className="mx-auto w-full max-w-5xl px-6 pb-20">
          <h2 className="mb-8 text-sm font-semibold uppercase tracking-[0.25em] text-muted">
            Categories
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="shine group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40"
              >
                <BlockIcon
                  variant={cat.icon}
                  className="h-11 w-11 shrink-0 transition-transform duration-300 group-hover:scale-110"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-heading">
                    {cat.name}
                    <span className="ml-2 font-mono text-xs text-muted">
                      {cat.count}
                    </span>
                  </p>
                  <p className="truncate text-xs leading-5 text-muted">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
