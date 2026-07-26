import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

import {
  getCategoriesWithCounts,
  getPublishedPosts,
  getTagsWithCounts,
} from "./lib/content";
import { SITE_URL } from "./lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, tags] = await Promise.all([
    getPublishedPosts(),
    getCategoriesWithCounts(),
    getTagsWithCounts(),
  ]);
  const latest = posts[0]?.date;

  return [
    { url: SITE_URL, lastModified: latest, priority: 1 },
    { url: `${SITE_URL}/posts`, lastModified: latest, priority: 0.9 },
    { url: `${SITE_URL}/categories`, priority: 0.6 },
    { url: `${SITE_URL}/about`, priority: 0.7 },
    ...posts.map((p) => ({
      url: `${SITE_URL}/posts/${p.slug}`,
      lastModified: p.date,
      priority: 0.8,
    })),
    ...categories.map((c) => ({
      url: `${SITE_URL}/categories/${c.slug}`,
      priority: 0.5,
    })),
    ...tags.map(({ tag }) => ({
      url: `${SITE_URL}/tags/${encodeURIComponent(tag)}`,
      priority: 0.3,
    })),
  ];
}
