import Link from "next/link";
import BlockIcon from "@/app/components/BlockIcon";
import { requireAdmin } from "@/app/lib/auth";
import { logoutAction } from "../actions";

const NAV: Array<{ href: string; label: string; glyph: string }> = [
  { href: "/admin", label: "Overview", glyph: "◈" },
  { href: "/admin/posts", label: "Posts", glyph: "✎" },
  { href: "/admin/categories", label: "Categories", glyph: "▦" },
  { href: "/admin/tags", label: "Tags", glyph: "#" },
  { href: "/admin/projects", label: "Projects", glyph: "⚒" },
  { href: "/admin/images", label: "Images", glyph: "▣" },
  { href: "/admin/profile", label: "Profile", glyph: "☻" },
  { href: "/admin/settings", label: "Settings", glyph: "⚙" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen">
      {/* sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-surface/50 md:flex">
        <Link href="/admin" className="group flex items-center gap-2.5 px-5 py-5">
          <BlockIcon
            variant="iron"
            className="h-8 w-8 group-hover:animate-[mc-hop_0.5s_ease]"
          />
          <div>
            <p className="text-sm font-bold text-heading">Server room</p>
            <p className="text-[11px] text-muted">@{user.username}</p>
          </div>
        </Link>
        <nav className="flex-1 space-y-0.5 px-3 py-2" aria-label="Admin">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="press-btn flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-muted hover:text-heading"
            >
              <span className="w-4 text-center text-accent/80">{item.glyph}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-2 border-t border-line p-4">
          <Link
            href="/"
            className="press-btn block rounded-xl px-3.5 py-2 text-sm text-muted hover:text-heading"
          >
            ← View site
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="press-btn w-full rounded-xl px-3.5 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile top bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-line px-4 py-3 md:hidden">
          <nav className="flex gap-1" aria-label="Admin mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="press-btn whitespace-nowrap rounded-full px-3 py-1.5 text-xs text-muted"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction}>
            <button type="submit" className="text-xs text-red-400">
              Log out
            </button>
          </form>
        </div>

        <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
