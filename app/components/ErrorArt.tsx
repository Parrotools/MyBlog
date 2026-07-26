import BlockIcon from "./BlockIcon";

/**
 * Per-error-page illustrations: floating HD block compositions,
 * each with its own character and idle animation.
 */

/** 404 — a lost island floating over the void. */
export function VoidIsland() {
  return (
    <div className="relative h-44 w-64">
      <div className="absolute bottom-1 left-1/2 h-10 w-44 -translate-x-1/2 rounded-full bg-violet-500/25 blur-2xl" />
      {/* stray stars in the void */}
      <div className="absolute left-4 top-8 h-1 w-1 rounded-full bg-white/50" />
      <div className="absolute right-10 top-2 h-1 w-1 rounded-full bg-white/35" />
      <div className="absolute left-14 bottom-4 h-1 w-1 rounded-full bg-white/25" />
      <div className="absolute right-2 bottom-10 h-1.5 w-1.5 rounded-full bg-violet-300/50" />

      <div className="absolute left-1/2 top-3 -translate-x-1/2 animate-[err-float_4.5s_ease-in-out_infinite]">
        <BlockIcon
          variant="grass"
          className="h-28 w-28 drop-shadow-[0_20px_28px_rgba(0,0,0,0.55)]"
        />
      </div>
      <div className="absolute bottom-5 left-4 animate-[err-float_5.4s_ease-in-out_0.6s_infinite]">
        <BlockIcon variant="dirt" className="h-12 w-12 opacity-80" />
      </div>
      <div className="absolute right-5 top-0 animate-[err-float_6s_ease-in-out_1.1s_infinite]">
        <BlockIcon variant="stone" className="h-10 w-10 opacity-70" />
      </div>
    </div>
  );
}

/** 403 — an iron block wearing a golden padlock. */
export function LockedBlock() {
  return (
    <div className="relative h-44 w-56">
      <div className="absolute bottom-2 left-1/2 h-10 w-40 -translate-x-1/2 rounded-full bg-amber-500/20 blur-2xl" />
      <div className="absolute left-1/2 top-2 -translate-x-1/2 animate-[err-float_5s_ease-in-out_infinite]">
        <div className="relative">
          <BlockIcon
            variant="iron"
            className="h-32 w-32 drop-shadow-[0_20px_28px_rgba(0,0,0,0.5)]"
          />
          {/* golden padlock */}
          <svg
            viewBox="0 0 64 64"
            className="absolute -bottom-2 -right-3 h-16 w-16 drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="lock-body" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fcd34d" />
                <stop offset="1" stopColor="#b45309" />
              </linearGradient>
            </defs>
            <path
              d="M20 30 v-8 a12 12 0 0 1 24 0 v8"
              fill="none"
              stroke="#d97706"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <rect x="12" y="28" width="40" height="30" rx="6" fill="url(#lock-body)" />
            <circle cx="32" cy="41" r="4.5" fill="#451a03" />
            <rect x="30" y="43" width="4" height="8" rx="2" fill="#451a03" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/** 500 — a charred block, still smoking, with glowing ember cracks. */
export function CharredBlock() {
  return (
    <div className="relative h-44 w-56">
      <div className="absolute bottom-2 left-1/2 h-12 w-44 -translate-x-1/2 rounded-full bg-lime-500/15 blur-2xl" />
      {/* smoke wisps */}
      <div className="absolute left-1/2 top-6 h-7 w-7 -translate-x-8 rounded-full bg-zinc-400/30 blur-md motion-safe:animate-[err-smoke_2.6s_ease-out_infinite]" />
      <div className="absolute left-1/2 top-4 h-8 w-8 translate-x-2 rounded-full bg-zinc-300/25 blur-md motion-safe:animate-[err-smoke_3.2s_ease-out_0.9s_infinite]" />
      <div className="absolute left-1/2 top-8 h-6 w-6 -translate-x-1 rounded-full bg-zinc-500/30 blur-md motion-safe:animate-[err-smoke_2.9s_ease-out_1.7s_infinite]" />

      <div className="absolute left-1/2 top-6 -translate-x-1/2">
        <div className="relative">
          <BlockIcon
            variant="charred"
            className="h-32 w-32 drop-shadow-[0_20px_28px_rgba(0,0,0,0.6)]"
          />
          {/* ember cracks */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-32 w-32 animate-[err-ember_1.8s_ease-in-out_infinite]"
            aria-hidden="true"
            style={{ filter: "drop-shadow(0 0 5px rgba(251,146,60,0.9))" }}
          >
            <polyline
              points="24,42 34,50 31,62 42,68"
              fill="none"
              stroke="#fb923c"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <polyline
              points="72,40 62,50 66,60 56,70"
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <polyline
              points="44,20 52,28 62,24"
              fill="none"
              stroke="#fdba74"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

/** 400 — a redstone block and a command that refused to parse. */
export function RedstoneGlitch() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-36 w-56">
        <div className="absolute bottom-0 left-1/2 h-10 w-40 -translate-x-1/2 rounded-full bg-red-600/20 blur-2xl" />
        <div className="absolute left-1/2 top-1 -translate-x-1/2 animate-[err-float_4.8s_ease-in-out_infinite]">
          <BlockIcon
            variant="redstone"
            className="h-28 w-28 drop-shadow-[0_18px_26px_rgba(0,0,0,0.55)]"
          />
        </div>
        {/* redstone dust trail */}
        <svg
          viewBox="0 0 220 30"
          className="absolute bottom-0 left-1/2 h-7 w-52 -translate-x-1/2 animate-[err-ember_2.2s_ease-in-out_infinite]"
          aria-hidden="true"
          style={{ filter: "drop-shadow(0 0 4px rgba(239,68,68,0.8))" }}
        >
          <polyline
            points="8,22 48,22 60,12 104,12 118,22 168,22"
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="44" y="18" width="8" height="8" rx="1.5" fill="#dc2626" />
          <rect x="100" y="8" width="8" height="8" rx="1.5" fill="#ef4444" />
          <rect x="164" y="18" width="8" height="8" rx="1.5" fill="#b91c1c" />
        </svg>
      </div>
      <div className="mt-4 rounded-lg border border-red-400/20 bg-black/60 px-4 py-2 font-mono text-sm text-red-300">
        <span className="text-zinc-500">&gt;</span> /teleport @you ~ ~ ~nowhere
        <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 bg-red-400 animate-[err-blink_1.1s_steps(1)_infinite]" />
      </div>
    </div>
  );
}
