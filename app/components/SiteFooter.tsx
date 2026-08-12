import Link from "next/link";
import BlockIcon from "./BlockIcon";
import type { Profile, SiteConfig } from "../lib/content";

export default async function SiteFooter({
  site,
  profile,
}: {
  site: SiteConfig;
  profile: Profile;
}) {
  const socials = [
    {
      label: "GitHub",
      href: profile.github,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
        </svg>
      ),
    },
    {
      label: "X / Twitter",
      href: profile.x,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.6 2H8l4.4 5.9L18.9 2Zm-1.1 18h1.7L7.1 3.7H5.3L17.8 20Z" />
        </svg>
      ),
    },
    {
      label: "Email",
      href: `mailto:${profile.email}`,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      ),
    },
    {
      label: "RSS",
      href: "/feed.xml",
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M4 4a16 16 0 0 1 16 16h-3A13 13 0 0 0 4 7V4Zm0 6a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7v-3Zm2.5 10a2.5 2.5 0 1 1-2.5-2.5A2.5 2.5 0 0 1 6.5 20Z" />
        </svg>
      ),
    },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-12 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <BlockIcon variant="grass" className="h-7 w-7" />
            <span className="font-semibold text-heading">{site.title}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted">
            {site.description}
          </p>
        </div>

        <nav aria-label="Footer" className="text-sm">
          <p className="mb-3 font-semibold uppercase tracking-[0.2em] text-muted">
            Explore
          </p>
          <ul className="space-y-2">
            {([
              ["All posts", "/posts"],
              ["Categories", "/categories"],
              ["About me", "/about"],
              ["RSS feed", "/feed.xml"],
              ["Admin", "/admin"],
            ] as const).map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="sweep-link text-muted hover:text-heading">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-sm">
          <p className="mb-3 font-semibold uppercase tracking-[0.2em] text-muted">
            Find me
          </p>
          <div className="flex gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                title={s.label}
                className="press-btn flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted hover:text-heading"
                {...(s.href.startsWith("http")
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-1.5 px-6 py-6 text-center">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="inline-block cursor-crosshair hover:animate-[tnt-flash_0.4s_steps(2)_infinite]">
              <BlockIcon variant="tnt" className="h-5 w-5" />
            </span>
            <span>© 2026 {profile.name} — built with Next.js, Three.js and one block of TNT</span>
          </div>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted/70 hover:text-heading"
          >
            鄂ICP备2025146739号
          </a>
          {site.footerNote && (
            <p className="text-xs text-muted/70">{site.footerNote}</p>
          )}
        </div>
      </div>
    </footer>
  );
}
