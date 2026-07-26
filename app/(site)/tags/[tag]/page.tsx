import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard from "@/app/components/PostCard";
import { getPublishedPosts } from "@/app/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${decodeURIComponent(tag)}` };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const posts = (await getPublishedPosts()).filter((p) => p.tags.includes(tag));
  if (posts.length === 0) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-14">
      <Link href="/posts" className="sweep-link text-sm text-muted hover:text-heading">
        ← All posts
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-heading">
        <span className="text-accent">#</span>
        {tag}
      </h1>
      <p className="mt-2 text-muted">
        {posts.length} article{posts.length === 1 ? "" : "s"} with this tag.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
