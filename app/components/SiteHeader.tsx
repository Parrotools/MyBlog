"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BlockIcon from "./BlockIcon";
import SearchDialog from "./SearchDialog";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader({ siteTitle }: { siteTitle: string }) {
  const pathname = usePathname();
  const NAV = [
    { href: "/", label: "Home" },
    { href: "/posts", label: "Posts" },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="site-header sticky top-0 z-50 border-b border-line bg-background/85 backdrop-blur-md transition-opacity duration-700">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-6 py-3.5">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <BlockIcon
            variant="grass"
            className="h-8 w-8 group-hover:animate-[mc-hop_0.5s_ease]"
          />
          <span className="text-base font-semibold tracking-tight text-heading">
            {siteTitle}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`press-btn rounded-full px-4 py-2 text-sm ${
                  active ? "font-semibold text-accent" : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <SearchDialog />
          <ThemeToggle />
        </div>
      </div>

      <nav
        className="flex items-center justify-center gap-1 border-t border-line px-4 py-1.5 md:hidden"
        aria-label="Main mobile"
      >
        {NAV.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`press-btn rounded-full px-3 py-1.5 text-xs ${
                active ? "font-semibold text-accent" : "text-muted"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
