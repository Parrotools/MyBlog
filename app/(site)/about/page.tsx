import type { Metadata } from "next";
import Avatar from "@/app/components/Avatar";
import Hotbar from "@/app/components/Hotbar";
import PlayerStats from "@/app/components/PlayerStats";
import PokerCards from "@/app/components/PokerCards";
import {
  getHotbar,
  getInterests,
  getProfile,
  getProjects,
  getTimeline,
} from "@/app/lib/content";
import { dicts } from "@/app/lib/i18n";
import { getLocale } from "@/app/lib/locale";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: "Who I am, what I build, and what I'm currently digging into.",
};

const INTEREST_ICONS = ["stone", "redstone", "iron", "grass", "tnt"] as const;
const INTEREST_COLORS = ["#38bdf8", "#8b5cf6", "#f59e0b", "#84cc16", "#ef4444"];

export default async function AboutPage() {
  const [profile, interests, projects, hotbar, timeline] = await Promise.all([
    getProfile(),
    getInterests(),
    getProjects(),
    getHotbar(),
    getTimeline(),
  ]);
  const t = dicts[await getLocale()];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-12rem] h-[30rem] w-[48rem] -translate-x-1/2 rounded-full bg-lime-500/10 blur-[140px]" />
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 py-14">
        {/* ============ player card ============ */}
        <section className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-4 py-1.5 text-xs font-medium text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
              {t.about.badge}
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-heading sm:text-5xl">
              {t.hero.hi} {profile.name}
              {t.hero.hiEnd}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
              {profile.intro}
            </p>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                [t.about.class, profile.education],
                [t.about.skills, profile.skills.join(" · ")],
                [t.about.recording, profile.records.join(" · ")],
                [t.about.contact, profile.email],
              ].map(([term, def]) => (
                <div
                  key={term}
                  className="rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-accent/40"
                >
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    {term}
                  </dt>
                  <dd className="mt-1.5 break-words text-sm leading-6 text-body">
                    {def}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col items-center gap-6">
            <Avatar src={profile.avatar} className="h-32 w-32" />
            <PlayerStats profile={profile} />
          </div>
        </section>

        {/* ============ hotbar ============ */}
        <section className="mt-20">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-muted">
            {t.sections.hotbar}
          </h2>
          <div className="-mt-24 overflow-x-auto pb-2 pt-24">
            <Hotbar slots={hotbar} />
          </div>
        </section>

        {/* ============ quest log / timeline ============ */}
        <section className="mt-20">
          <h2 className="mb-8 text-sm font-semibold uppercase tracking-[0.25em] text-muted">
            {t.about.questLog}
          </h2>
          <ol className="relative space-y-8 border-l-2 border-line pl-8">
            {timeline.map((q) => (
              <li key={`${q.year}-${q.title}`} className="group relative">
                <span
                  className={`absolute -left-[2.45rem] top-1 h-4 w-4 rounded-sm border-2 transition-transform group-hover:scale-125 ${
                    q.done
                      ? "border-lime-500 bg-lime-400 shadow-[0_0_10px_rgba(132,204,22,0.7)]"
                      : "border-line bg-surface"
                  }`}
                  aria-hidden="true"
                />
                <p className="font-mono text-xs text-muted">{q.year}</p>
                <h3 className="mt-1 font-semibold text-heading">
                  {q.title}
                  {!q.done && (
                    <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">
                      {t.about.questAccepted}
                    </span>
                  )}
                </h3>
                <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
                  {q.detail}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ============ interests as a poker hand ============ */}
        <section className="mt-20">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-muted">
            {t.about.cards}{" "}
            <span className="normal-case tracking-normal">
              {t.about.cardsHint}
            </span>
          </h2>
          <PokerCards
            cards={interests.map((group, i) => ({
              title: group.title,
              items: group.items,
              icon: INTEREST_ICONS[i % INTEREST_ICONS.length],
              color: INTEREST_COLORS[i % INTEREST_COLORS.length],
            }))}
          />
        </section>

        {/* ============ projects ============ */}
        <section className="mt-20">
          <h2 className="mb-8 text-sm font-semibold uppercase tracking-[0.25em] text-muted">
            {t.about.showcase}
          </h2>
          {projects.length === 0 ? (
            <p className="text-muted">{t.about.inFurnace}</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {projects.map((p) => (
                <a
                  key={p.id}
                  href={p.githubUrl ?? p.demoUrl ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="mc-card group relative flex flex-col gap-3 rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1"
                  style={{ "--card-accent": "#38bdf8" } as React.CSSProperties}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="sweep-link text-lg font-semibold text-heading">
                      {p.name}
                    </h3>
                    <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-muted">{p.description}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    {p.tech
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-line px-3 py-1 font-mono text-xs text-muted"
                        >
                          {t}
                        </span>
                      ))}
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* ============ contact ============ */}
        <section className="mt-20 rounded-3xl border border-line bg-surface p-10 text-center">
          <h2 className="text-2xl font-bold text-heading">
            {t.about.contactTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            {t.about.contactBody}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="shine rounded-full bg-gradient-to-r from-lime-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(132,204,22,0.35)] transition-transform hover:-translate-y-0.5"
            >
              {t.about.emailMe}
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="press-btn rounded-full border border-line px-6 py-3 text-sm font-medium text-body"
            >
              {t.about.github}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
