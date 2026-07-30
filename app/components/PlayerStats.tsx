import type { Profile } from "../lib/content";

/**
 * Player-style status card driven by profile data (admin → Profile):
 * hearts pop in sequence on hover, the XP bar surges to full.
 */

function Heart() {
  return (
    <svg viewBox="0 0 24 24" className="mc-heart h-4.5 w-4.5" aria-hidden="true">
      <defs>
        <linearGradient id="heart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f87171" />
          <stop offset="1" stopColor="#b91c1c" />
        </linearGradient>
      </defs>
      <path
        d="M12 21S3 14.4 3 8.6A4.6 4.6 0 0 1 7.6 4 5.1 5.1 0 0 1 12 6.7 5.1 5.1 0 0 1 16.4 4 4.6 4.6 0 0 1 21 8.6C21 14.4 12 21 12 21Z"
        fill="url(#heart-fill)"
        stroke="#7f1d1d"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export default async function PlayerStats({ profile }: { profile: Profile }) {
  const xp = Math.min(Math.max(profile.xpPercent, 0), 100);
  return (
    <div className="group/stats inline-flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-8">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Player status
        </span>
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 font-mono text-[11px] text-accent">
          Lv. {profile.level}
        </span>
      </div>

      <div className="hearts flex gap-1" aria-label="Health: full">
        {Array.from({ length: 10 }, (_, i) => (
          <Heart key={i} />
        ))}
      </div>

      <div aria-label={`Experience: ${profile.xpLabel}`}>
        <div className="h-2.5 w-56 overflow-hidden rounded-full border border-line bg-surface-2">
          <div
            className="xp-fill h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 shadow-[0_0_10px_rgba(132,204,22,0.6)]"
            style={{ width: `${xp}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[10px] text-muted">
          <span>{profile.xpLabel}</span>
          <span>next level: {profile.xpNext}</span>
        </div>
      </div>
    </div>
  );
}
