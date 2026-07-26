"use server";

import { redirect } from "next/navigation";
import GithubSlugger from "github-slugger";
import { db } from "../lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  requireAdmin,
  verifyPassword,
} from "../lib/auth";
import { deleteUpload } from "../lib/storage";

export interface ActionState {
  error?: string;
  ok?: boolean;
}

// ------------------------------------------------------------------ auth

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "Enter username and password." };

  const user = await db.user.findUnique({ where: { username } });
  // constant-shape flow whether or not the user exists
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !valid) return { error: "Wrong username or password." };

  await createSession(user.id);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next.length < 8) return { error: "New password needs at least 8 characters." };
  const dbUser = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(current, dbUser.passwordHash))) {
    return { error: "Current password is wrong." };
  }
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next) },
  });
  // invalidate every other session
  await db.session.deleteMany({ where: { userId: user.id } });
  await createSession(user.id);
  return { ok: true };
}

// ------------------------------------------------------------------ articles

export interface ArticlePayload {
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

const STATUSES = new Set(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export async function saveArticleAction(
  payload: ArticlePayload
): Promise<ActionState> {
  await requireAdmin();

  const title = payload.title.trim();
  let slug = payload.slug.trim();
  if (!title) return { error: "Title is required." };
  if (!slug) slug = new GithubSlugger().slug(title);
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: "Slug may only contain lowercase letters, digits and dashes." };
  }
  const status = STATUSES.has(payload.status) ? payload.status : "DRAFT";

  const clash = await db.article.findUnique({ where: { slug } });
  if (clash && clash.id !== payload.id) {
    return { error: `Slug "${slug}" is already used by another article.` };
  }

  const category = payload.categorySlug
    ? await db.category.findUnique({ where: { slug: payload.categorySlug } })
    : null;

  const tagNames = [...new Set(payload.tags.map((t) => t.trim()).filter(Boolean))];
  for (const name of tagNames) {
    await db.tag.upsert({ where: { name }, create: { name }, update: {} });
  }

  const data = {
    title,
    slug,
    summary: payload.summary.trim(),
    content: payload.content,
    coverImage: payload.coverImage.trim() || null,
    icon: payload.icon || "grass",
    accent: payload.accent || "#84cc16",
    status,
    featured: payload.featured,
    categoryId: category?.id ?? null,
    tags: { set: [] as { name: string }[], connect: tagNames.map((name) => ({ name })) },
  };

  if (payload.id) {
    const existing = await db.article.findUnique({ where: { id: payload.id } });
    if (!existing) return { error: "Article no longer exists." };
    await db.article.update({
      where: { id: payload.id },
      data: {
        ...data,
        publishedAt:
          status === "PUBLISHED" && !existing.publishedAt
            ? new Date()
            : existing.publishedAt,
      },
    });
  } else {
    await db.article.create({
      data: {
        ...data,
        tags: { connect: tagNames.map((name) => ({ name })) },
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });
  }
  redirect("/admin/posts");
}

export async function deleteArticleAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await db.article.delete({ where: { id } }).catch(() => {});
  redirect("/admin/posts");
}

// ------------------------------------------------------------------ categories

export async function saveCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "stone");
  if (name) {
    const slug = new GithubSlugger().slug(name);
    if (id) {
      await db.category
        .update({ where: { id }, data: { name, description, icon } })
        .catch(() => {});
    } else {
      await db.category
        .create({ data: { name, slug, description, icon } })
        .catch(() => {});
    }
  }
  redirect("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  // articles keep existing (categoryId becomes null via onDelete: SetNull)
  if (id) await db.category.delete({ where: { id } }).catch(() => {});
  redirect("/admin/categories");
}

// ------------------------------------------------------------------ tags

export async function createTagAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (name) {
    await db.tag.upsert({ where: { name }, create: { name }, update: {} });
  }
  redirect("/admin/tags");
}

export async function deleteTagAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await db.tag.delete({ where: { id } }).catch(() => {});
  redirect("/admin/tags");
}

// ------------------------------------------------------------------ projects

export async function saveProjectAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const data = {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    tech: String(formData.get("tech") ?? "").trim(),
    githubUrl: String(formData.get("githubUrl") ?? "").trim() || null,
    demoUrl: String(formData.get("demoUrl") ?? "").trim() || null,
    status: String(formData.get("status") ?? "active"),
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
  if (data.name) {
    if (id) {
      await db.project.update({ where: { id }, data }).catch(() => {});
    } else {
      await db.project.create({ data });
    }
  }
  redirect("/admin/projects");
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await db.project.delete({ where: { id } }).catch(() => {});
  redirect("/admin/projects");
}

// ------------------------------------------------------------------ settings

async function putSetting(key: string, value: unknown): Promise<void> {
  await db.setting.upsert({
    where: { key },
    create: { key, value: JSON.stringify(value) },
    update: { value: JSON.stringify(value) },
  });
}

export async function saveProfileAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const csv = (v: FormDataEntryValue | null) =>
    String(v ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  await putSetting("profile", {
    name: String(formData.get("name") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    intro: String(formData.get("intro") ?? "").trim(),
    education: String(formData.get("education") ?? "").trim(),
    skills: csv(formData.get("skills")),
    records: csv(formData.get("records")),
    github: String(formData.get("github") ?? "").trim(),
    x: String(formData.get("x") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    avatar: String(formData.get("avatar") ?? "").trim(),
    level: Number(formData.get("level") ?? 20) || 20,
    xpPercent: Math.min(100, Math.max(0, Number(formData.get("xpPercent") ?? 62) || 0)),
    xpLabel: String(formData.get("xpLabel") ?? "").trim(),
    xpNext: String(formData.get("xpNext") ?? "").trim(),
  });

  // interests: one group per line, "Group title: item, item, item"
  const interests = String(formData.get("interests") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.includes(":"))
    .map((line) => {
      const [title, rest] = [
        line.slice(0, line.indexOf(":")),
        line.slice(line.indexOf(":") + 1),
      ];
      return {
        title: title.trim(),
        items: rest
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
    })
    .filter((g) => g.title && g.items.length > 0);
  await putSetting("interests", interests);

  // timeline: one entry per line, "year | title | detail | done"
  const timeline = String(formData.get("timeline") ?? "")
    .split("\n")
    .map((line) => line.split("|").map((s) => s.trim()))
    .filter((parts) => parts.length >= 2 && parts[0] && parts[1])
    .map(([year, title, detail = "", done = ""]) => ({
      year,
      title,
      detail,
      done: done.toLowerCase() === "done",
    }));
  if (timeline.length > 0) await putSetting("timeline", timeline);

  // hotbar: one slot per line, "label | glyph | #tile | #rarity | lore | lore…"
  const hotbar = String(formData.get("hotbar") ?? "")
    .split("\n")
    .map((line) => line.split("|").map((s) => s.trim()))
    .filter((parts) => parts.length >= 2 && parts[0])
    .map(([label, glyph, color = "", rarity = "#ffffff", ...lore]) => ({
      label,
      glyph,
      color,
      rarity,
      lore: lore.filter(Boolean),
    }));
  if (hotbar.length > 0) await putSetting("hotbar", hotbar.slice(0, 9));

  redirect("/admin/profile?saved=1");
}

export async function saveSiteAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await putSetting("site", {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    footerNote: String(formData.get("footerNote") ?? "").trim(),
  });
  redirect("/admin/settings?saved=1");
}

// ------------------------------------------------------------------ images

export async function deleteImageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const image = await db.image.findUnique({ where: { id } });
    if (image) {
      await deleteUpload(image.path);
      await db.image.delete({ where: { id } });
    }
  }
  redirect("/admin/images");
}
