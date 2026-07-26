import Link from "next/link";
import type { ReactNode } from "react";

type Accent = "violet" | "amber" | "lime" | "red";

const THEME: Record<
  Accent,
  { glowA: string; glowB: string; badge: string; dot: string; code: string }
> = {
  violet: {
    glowA: "bg-violet-600/20",
    glowB: "bg-fuchsia-600/10",
    badge: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    dot: "bg-violet-400",
    code: "from-violet-300 to-fuchsia-600",
  },
  amber: {
    glowA: "bg-amber-500/15",
    glowB: "bg-yellow-600/10",
    badge: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
    code: "from-amber-200 to-amber-600",
  },
  lime: {
    glowA: "bg-lime-500/15",
    glowB: "bg-emerald-600/10",
    badge: "border-lime-400/20 bg-lime-400/10 text-lime-300",
    dot: "bg-lime-400",
    code: "from-lime-200 to-emerald-600",
  },
  red: {
    glowA: "bg-red-600/15",
    glowB: "bg-rose-600/10",
    badge: "border-red-400/20 bg-red-400/10 text-red-300",
    dot: "bg-red-400",
    code: "from-red-300 to-rose-600",
  },
};

export default function ErrorScene({
  accent,
  code,
  quip,
  title,
  description,
  art,
  children,
}: {
  accent: Accent;
  code: string;
  quip: string;
  title: string;
  description: string;
  art: ReactNode;
  children?: ReactNode;
}) {
  const t = THEME[accent];
  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className={`absolute left-1/2 top-[-15%] h-[30rem] w-[46rem] -translate-x-1/2 rounded-full blur-[140px] ${t.glowA}`}
        />
        <div
          className={`absolute bottom-[-20%] right-[-8%] h-[24rem] w-[30rem] rounded-full blur-[120px] ${t.glowB}`}
        />
      </div>

      {art}

      <p
        className={`mb-2 mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium ${t.badge}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
        {quip}
      </p>
      <h1
        className={`bg-gradient-to-b bg-clip-text text-[6.5rem] font-black leading-none tracking-tight text-transparent sm:text-[9rem] ${t.code}`}
      >
        {code}
      </h1>
      <h2 className="mt-2 text-2xl font-bold text-heading sm:text-3xl">
        {title}
      </h2>
      <p className="mt-4 max-w-md text-base leading-7 text-muted">
        {description}
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        {children}
        <Link
          href="/"
          className="shine rounded-full bg-heading px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          Respawn at home
        </Link>
      </div>
    </div>
  );
}
