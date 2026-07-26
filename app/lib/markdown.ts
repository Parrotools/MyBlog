import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import GithubSlugger from "github-slugger";

/**
 * The one markdown pipeline used everywhere: public article pages, the
 * admin editor's live preview, and /api/preview. Plain markdown (GFM +
 * LaTeX math + Shiki highlighting) — deliberately NOT evaluated as MDX,
 * so user-typed content can never crash the React tree.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypePrettyCode, {
      theme: { dark: "github-dark-default", light: "github-light" },
      keepBackground: false,
      defaultLang: "txt",
    })
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Extract h2/h3 headings with the same ids rehype-slug will generate. */
export function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "");
  for (const line of withoutCode.split("\n")) {
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/`/g, "").replace(/\*\*?/g, "");
    headings.push({ id: slugger.slug(text), text, level: m[1].length as 2 | 3 });
  }
  return headings;
}

export function readingTime(markdown: string): number {
  const words = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
