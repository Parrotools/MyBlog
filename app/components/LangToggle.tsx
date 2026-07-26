"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "./I18nProvider";

/**
 * EN ↔ 中 switch. Clicking sends a wave sweeping across the page; the
 * language flips while the screen is covered, then the wave rolls off
 * revealing the other language.
 */

const IN_MS = 620;
const HOLD_MS = 380;
const OUT_MS = 620;

/** serpentine edge used on both sides of the wave panel */
function WaveEdge({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 800"
      preserveAspectRatio="none"
      className={`h-full w-24 shrink-0 ${flip ? "-scale-x-100" : ""}`}
      aria-hidden="true"
    >
      <path
        d="M0 0 H55 C 100 70, 15 150, 60 230 C 100 300, 20 380, 60 460 C 100 540, 15 620, 55 700 C 80 750, 60 780, 50 800 H0 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function LangToggle() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");
  const timers = useRef<number[]>([]);
  const next = locale === "zh" ? "en" : "zh";

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  const switchLang = () => {
    if (phase !== "idle") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const apply = () => {
      document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    };
    if (reduced) {
      apply();
      return;
    }
    setPhase("in");
    timers.current.push(
      window.setTimeout(apply, IN_MS),
      window.setTimeout(() => setPhase("out"), IN_MS + HOLD_MS),
      window.setTimeout(() => setPhase("idle"), IN_MS + HOLD_MS + OUT_MS + 60)
    );
  };

  return (
    <>
      <button
        type="button"
        aria-label={t.header.langSwitch}
        title={t.header.langSwitch}
        onClick={switchLang}
        className="press-btn flex h-9 w-9 items-center justify-center rounded-full border border-line text-xs font-bold text-muted hover:text-heading"
      >
        {locale === "zh" ? "EN" : "中"}
      </button>

      {phase !== "idle" && (
        <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
          <div
            className={`absolute inset-y-0 flex text-emerald-500 ${
              phase === "in"
                ? "animate-[wave-in_620ms_cubic-bezier(0.5,0,0.3,1)_both]"
                : "animate-[wave-out_620ms_cubic-bezier(0.7,0,0.5,1)_both]"
            }`}
            style={{ left: "-6rem", right: "-6rem" }}
          >
            <WaveEdge flip />
            <div className="relative -mx-px flex flex-1 items-center justify-center bg-gradient-to-br from-lime-500 via-emerald-500 to-emerald-600">
              <span className="select-none text-8xl font-black text-white/90 drop-shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
                {next === "zh" ? "中" : "EN"}
              </span>
            </div>
            <WaveEdge />
          </div>
        </div>
      )}
    </>
  );
}
