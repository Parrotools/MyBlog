/**
 * Seeds the database: admin user, categories, the MDX articles from
 * content/posts/ (one-time migration), projects, and profile settings.
 * Idempotent — safe to re-run; existing rows are upserted by unique keys.
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const CATEGORIES: Array<{
  name: string;
  slug: string;
  icon: string;
  description: string;
}> = [
  {
    name: "Algorithm",
    slug: "algorithm",
    icon: "stone",
    description: "Dynamic programming, graphs, data structures & ICPC training",
  },
  {
    name: "AI",
    slug: "ai",
    icon: "redstone",
    description: "LLMs, deep learning, attention and the math underneath",
  },
  {
    name: "Backend",
    slug: "backend",
    icon: "iron",
    description: "Servers, deployment, infrastructure and reliability",
  },
  {
    name: "Frontend",
    slug: "frontend",
    icon: "tnt",
    description: "Web graphics, Three.js, physics and UI engineering",
  },
  {
    name: "Life",
    slug: "life",
    icon: "grass",
    description: "Meta, tools, workflows and thoughts along the way",
  },
];

const PROJECTS = [
  {
    name: "LLM Serving Framework",
    description:
      "A learning project around fast LLM inference: batching, KV-cache management and GPU scheduling.",
    tech: "CUDA, TensorRT, C++",
    githubUrl: "https://github.com/Parrotools",
    status: "in-progress",
    sortOrder: 1,
  },
  {
    name: "Distributed KV Cache System",
    description:
      "Exploring cache coherence and eviction across nodes — Rust for the engine, Redis as the reference.",
    tech: "Rust, Redis",
    githubUrl: "https://github.com/Parrotools",
    status: "in-progress",
    sortOrder: 2,
  },
];

async function main() {
  // ---- admin user
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "change-me-please";
  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.upsert({
    where: { username },
    create: { username, passwordHash },
    update: {}, // never overwrite an existing password on re-seed
  });
  console.log(`✔ admin user "${username}" ready`);

  // ---- categories
  for (const cat of CATEGORIES) {
    await db.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: { icon: cat.icon, description: cat.description },
    });
  }
  console.log(`✔ ${CATEGORIES.length} categories`);

  // ---- articles from content/posts/*.mdx
  const postsDir = path.join(process.cwd(), "content", "posts");
  const files = fs.existsSync(postsDir)
    ? fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"))
    : [];
  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
    const { data, content } = matter(raw);
    const categorySlug = String(data.category ?? "Life").toLowerCase();
    const category = await db.category.findUnique({ where: { slug: categorySlug } });
    const tagNames: string[] = Array.isArray(data.tags) ? data.tags.map(String) : [];
    for (const name of tagNames) {
      await db.tag.upsert({ where: { name }, create: { name }, update: {} });
    }
    await db.article.upsert({
      where: { slug },
      create: {
        slug,
        title: String(data.title ?? slug),
        summary: String(data.excerpt ?? ""),
        content: content.trim(),
        icon: String(data.icon ?? "grass"),
        accent: String(data.accent ?? "#84cc16"),
        status: "PUBLISHED",
        featured: Boolean(data.featured),
        publishedAt: new Date(String(data.date ?? Date.now())),
        categoryId: category?.id,
        tags: { connect: tagNames.map((name) => ({ name })) },
      },
      update: {}, // don't clobber edits made through the dashboard
    });
  }
  console.log(`✔ ${files.length} articles imported from content/posts/`);

  // ---- projects
  for (const p of PROJECTS) {
    const existing = await db.project.findFirst({ where: { name: p.name } });
    if (!existing) await db.project.create({ data: p });
  }
  console.log(`✔ ${PROJECTS.length} projects`);

  // ---- settings (only if missing — dashboard edits win)
  const defaults: Record<string, unknown> = {
    profile: {
      name: "Zige",
      tagline: "Computer science undergrad",
      intro:
        "I train for ICPC, poke at AI systems, and deploy things on Linux — then write down what exploded.",
      education: "Computer Science undergraduate",
      skills: ["C++", "Python", "TypeScript", "PyTorch", "Next.js", "Linux"],
      records: ["Algorithms", "AI", "Backend engineering", "Technical notes"],
      github: "https://github.com/Parrotools",
      x: "https://x.com/",
      email: "2261216827@qq.com",
    },
    interests: [
      { title: "Competitive Programming", items: ["ICPC training", "Algorithm learning"] },
      { title: "Artificial Intelligence", items: ["Large Language Models", "AI Infrastructure"] },
      { title: "Programming", items: ["Rust", "C++", "Distributed Systems"] },
      { title: "Other Interests", items: ["Reading", "Music", "Sports"] },
    ],
    site: {
      title: "Zige's Blog",
      description:
        "Algorithms, AI, backend engineering and the occasional explosion — a personal blog with a Minecraft-inspired 3D intro.",
      footerNote: "No creepers were harmed in the making of this website.",
    },
  };
  for (const [key, value] of Object.entries(defaults)) {
    const existing = await db.setting.findUnique({ where: { key } });
    if (!existing) {
      await db.setting.create({ data: { key, value: JSON.stringify(value) } });
    }
  }
  console.log("✔ settings");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
