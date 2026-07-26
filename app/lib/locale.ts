import { cookies, headers } from "next/headers";
import { cache } from "react";
import type { Locale } from "./i18n";

/**
 * Visitor locale: an explicit `lang` cookie (set by the header toggle)
 * wins; otherwise the browser's Accept-Language decides — any Chinese
 * variant (zh, zh-CN, zh-Hans…) gets Simplified Chinese.
 */
export const getLocale = cache(async (): Promise<Locale> => {
  const c = (await cookies()).get("lang")?.value;
  if (c === "en" || c === "zh") return c;
  const accept = (await headers()).get("accept-language") ?? "";
  return /(^|,|;|\s)zh\b|zh-/i.test(accept) ? "zh" : "en";
});
