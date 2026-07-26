import { db } from "./db";
import { extractHeadings, readingTime, type Heading } from "./markdown";
import type { Article, Category, Tag } from "@prisma/client";

export type BlockVariant =
  | "grass"
  | "tnt"
  | "stone"
  | "dirt"
  | "iron"
  | "charred"
  | "redstone";

/** Shape consumed by the public components (cards, lists, article page). */
export interface PostView {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  tags: string[];
  icon: BlockVariant;
  accent: string;
  featured: boolean;
  views: number;
  readMinutes: number;
  coverImage: string | null;
  content: string;
  headings: Heading[];
  status: string;
}

type ArticleFull = Article & { category: Category | null; tags: Tag[] };

function toPostView(a: ArticleFull): PostView {
  return {
    slug: a.slug,
    title: a.title,
    date: (a.publishedAt ?? a.createdAt).toISOString().slice(0, 10),
    excerpt: a.summary,
    category: a.category?.name ?? "Uncategorized",
    categorySlug: a.category?.slug ?? "uncategorized",
    tags: a.tags.map((t) => t.name),
    icon: (a.icon || "grass") as BlockVariant,
    accent: a.accent || "#84cc16",
    featured: a.featured,
    views: a.viewCount,
    readMinutes: readingTime(a.content),
    coverImage: a.coverImage,
    content: a.content,
    headings: extractHeadings(a.content),
    status: a.status,
  };
}

const publishedWhere = { status: "PUBLISHED" } as const;
const fullInclude = { category: true, tags: true } as const;

export async function getPublishedPosts(): Promise<PostView[]> {
  const rows = await db.article.findMany({
    where: publishedWhere,
    include: fullInclude,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toPostView);
}

/** Published post by slug; admins may also load drafts for preview. */
export async function getPostBySlug(
  slug: string,
  opts: { includeUnpublished?: boolean } = {}
): Promise<PostView | null> {
  const row = await db.article.findUnique({
    where: { slug },
    include: fullInclude,
  });
  if (!row) return null;
  if (row.status !== "PUBLISHED" && !opts.includeUnpublished) return null;
  return toPostView(row);
}

/** Popular = most viewed; falls back to featured order for fresh sites. */
export async function getPopularPosts(limit = 3): Promise<PostView[]> {
  const rows = await db.article.findMany({
    where: publishedWhere,
    include: fullInclude,
    orderBy: [{ viewCount: "desc" }, { featured: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
  return rows.map(toPostView);
}

export interface CategoryView {
  name: string;
  slug: string;
  icon: BlockVariant;
  description: string;
  count: number;
}

export async function getCategoriesWithCounts(): Promise<CategoryView[]> {
  const cats = await db.category.findMany({
    include: { _count: { select: { articles: { where: publishedWhere } } } },
    orderBy: { name: "asc" },
  });
  return cats.map((c) => ({
    name: c.name,
    slug: c.slug,
    icon: (c.icon || "stone") as BlockVariant,
    description: c.description,
    count: c._count.articles,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<CategoryView | null> {
  const c = await db.category.findUnique({
    where: { slug: slug.toLowerCase() },
    include: { _count: { select: { articles: { where: publishedWhere } } } },
  });
  if (!c) return null;
  return {
    name: c.name,
    slug: c.slug,
    icon: (c.icon || "stone") as BlockVariant,
    description: c.description,
    count: c._count.articles,
  };
}

export async function getTagsWithCounts(): Promise<{ tag: string; count: number }[]> {
  const tags = await db.tag.findMany({
    include: { _count: { select: { articles: { where: publishedWhere } } } },
    orderBy: { name: "asc" },
  });
  return tags
    .map((t) => ({ tag: t.name, count: t._count.articles }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Simple SQL full-text search across title, summary, content and names. */
export async function searchPosts(query: string, limit = 8): Promise<PostView[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const rows = await db.article.findMany({
    where: {
      ...publishedWhere,
      OR: [
        { title: { contains: q } },
        { summary: { contains: q } },
        { content: { contains: q } },
        { tags: { some: { name: { contains: q } } } },
        { category: { is: { name: { contains: q } } } },
      ],
    },
    include: fullInclude,
    take: limit * 3,
  });
  // rank: title > tags/category > summary > body
  const ql = q.toLowerCase();
  const scored = rows.map((r) => {
    let score = 0;
    if (r.title.toLowerCase().includes(ql)) score += 6;
    if (r.tags.some((t) => t.name.toLowerCase().includes(ql))) score += 4;
    if (r.category?.name.toLowerCase().includes(ql)) score += 3;
    if (r.summary.toLowerCase().includes(ql)) score += 2;
    if (r.content.toLowerCase().includes(ql)) score += 1;
    return { row: r, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => toPostView(s.row));
}

// ------------------------------------------------------------------ settings

export interface Profile {
  name: string;
  tagline: string;
  intro: string;
  education: string;
  skills: string[];
  records: string[];
  github: string;
  x: string;
  email: string;
  /** image URL (e.g. /uploads/…); empty = the grass-block icon */
  avatar: string;
  level: number;
  xpPercent: number;
  xpLabel: string;
  xpNext: string;
}

export interface InterestGroup {
  title: string;
  items: string[];
}

export interface HotbarSlot {
  label: string;
  glyph: string;
  /** tile color (hex); empty string renders the "empty slot" style */
  color: string;
  /** tooltip name color, like item rarity in-game */
  rarity: string;
  lore: string[];
}

export interface TimelineEntry {
  year: string;
  title: string;
  detail: string;
  done: boolean;
}

export interface SiteConfig {
  title: string;
  description: string;
  footerNote: string;
}

export const DEFAULT_PROFILE: Profile = {
  name: "Parrotools",
  tagline: "Computer science undergrad",
  intro:
    "I train for ICPC, poke at AI systems, and deploy things on Linux — then write down what exploded.",
  education: "Computer Science undergraduate",
  skills: ["C++", "Python", "TypeScript", "PyTorch", "Next.js", "Linux"],
  records: ["Algorithms", "AI", "Backend engineering", "Technical notes"],
  github: "https://github.com/Parrotools",
  x: "https://x.com/",
  email: "2261216827@qq.com",
  avatar: "",
  level: 20,
  xpPercent: 62,
  xpLabel: "CS undergrad",
  xpNext: "graduation",
};

export const DEFAULT_HOTBAR: HotbarSlot[] = [
  {
    label: "C++",
    glyph: "C++",
    color: "#0369a1",
    rarity: "#55ffff",
    lore: ["Iron pickaxe of ICPC", "+10 speed, -5 memory safety"],
  },
  {
    label: "Python",
    glyph: "Py",
    color: "#ca8a04",
    rarity: "#ffff55",
    lore: ["Shovel for data and models", "Moves absurd amounts of dirt"],
  },
  {
    label: "TypeScript",
    glyph: "TS",
    color: "#2563eb",
    rarity: "#55ffff",
    lore: ["Diamond pickaxe", "Types are torches in the cave"],
  },
  {
    label: "PyTorch",
    glyph: "🔥",
    color: "#ea580c",
    rarity: "#ff5555",
    lore: ["Enchanted furnace", "Smelts gradients into models"],
  },
  {
    label: "Next.js",
    glyph: "▲",
    color: "#3f3f46",
    rarity: "#ffffff",
    lore: ["Crafting table", "This site was made on it"],
  },
  {
    label: "Three.js",
    glyph: "3D",
    color: "#0d9488",
    rarity: "#55ff55",
    lore: ["Spyglass of many angles", "Pages become places"],
  },
  {
    label: "Linux",
    glyph: "🐧",
    color: "#525252",
    rarity: "#ffffff",
    lore: ["Home biome of every server", "Tame it with systemd"],
  },
  {
    label: "Git",
    glyph: "⎇",
    color: "#e11d48",
    rarity: "#ff5555",
    lore: ["Respawn anchor", "No explosion is permanent"],
  },
  {
    label: "Empty slot",
    glyph: "+",
    color: "",
    rarity: "#aaaaaa",
    lore: ["Reserved on purpose", "Room for what this year drops"],
  },
];

export const DEFAULT_TIMELINE: TimelineEntry[] = [
  {
    year: "2026",
    title: "Started ICPC training",
    detail: "Weekly virtual contests, upsolving discipline, one topic block per week.",
    done: true,
  },
  {
    year: "2026",
    title: "Launched this blog",
    detail: "Blew a hole in a stone wall with real physics to open a website.",
    done: true,
  },
  {
    year: "2027",
    title: "AI infrastructure internship",
    detail: "Quest accepted — grinding the skill tree toward serving systems.",
    done: false,
  },
  {
    year: "2028",
    title: "Large-scale AI engineering projects",
    detail: "Endgame content: training and serving at scales that need real infra.",
    done: false,
  },
];

export const DEFAULT_INTERESTS: InterestGroup[] = [
  { title: "Competitive Programming", items: ["ICPC training", "Algorithm learning"] },
  { title: "Artificial Intelligence", items: ["Large Language Models", "AI Infrastructure"] },
  { title: "Programming", items: ["Rust", "C++", "Distributed Systems"] },
  { title: "Other Interests", items: ["Reading", "Music", "Sports"] },
];

export const DEFAULT_SITE: SiteConfig = {
  title: "Parrotools' Blog",
  description:
    "Algorithms, AI, backend engineering and the occasional explosion — a personal blog with a Minecraft-inspired 3D intro.",
  footerNote: "No creepers were harmed in the making of this website.",
};

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.setting.findUnique({ where: { key } });
  if (!row) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(row.value) as T) };
  } catch {
    return fallback;
  }
}

export function getProfile(): Promise<Profile> {
  return getSetting("profile", DEFAULT_PROFILE);
}

export async function getInterests(): Promise<InterestGroup[]> {
  const row = await db.setting.findUnique({ where: { key: "interests" } });
  if (!row) return DEFAULT_INTERESTS;
  try {
    const parsed = JSON.parse(row.value) as InterestGroup[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_INTERESTS;
  } catch {
    return DEFAULT_INTERESTS;
  }
}

export function getSiteConfig(): Promise<SiteConfig> {
  return getSetting("site", DEFAULT_SITE);
}

async function getSettingArray<T>(key: string, fallback: T[]): Promise<T[]> {
  const row = await db.setting.findUnique({ where: { key } });
  if (!row) return fallback;
  try {
    const parsed = JSON.parse(row.value) as T[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function getHotbar(): Promise<HotbarSlot[]> {
  return getSettingArray("hotbar", DEFAULT_HOTBAR);
}

export function getTimeline(): Promise<TimelineEntry[]> {
  return getSettingArray("timeline", DEFAULT_TIMELINE);
}

export async function getProjects() {
  return db.project.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}
