"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/app/components/I18nProvider";

type UiPhase = "loading" | "tnt" | "reveal" | "gone";

const MIN_LOAD_MS = 4200; // let the grass animation play at least this long

export default function MinecraftIntro() {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const whiteRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const sceneRef = useRef<import("./IntroScene").IntroScene | null>(null);
  const [phase, setPhase] = useState<UiPhase>("loading");
  const phaseRef = useRef<UiPhase>("loading");

  const setUiPhase = (p: UiPhase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  useEffect(() => {
    if (phaseRef.current === "gone") return;

    // accessibility / no-WebGL: skip the show entirely
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const testGl = document.createElement("canvas");
    const gl = testGl.getContext("webgl2") || testGl.getContext("webgl");
    if (reducedMotion || !gl || !canvasRef.current) {
      setUiPhase("gone");
      return;
    }

    let disposed = false;
    let scene: import("./IntroScene").IntroScene | null = null;
    let progressRaf = 0;

    import("./IntroScene").then(({ IntroScene }) => {
      if (disposed || !canvasRef.current) return;

      scene = sceneRef.current = new IntroScene(canvasRef.current, {
        onExplode: () => {
          const el = flashRef.current;
          if (!el) return;
          el.style.transition = "none";
          el.style.opacity = "0.95";
          requestAnimationFrame(() => {
            el.style.transition = "opacity 450ms ease-out";
            el.style.opacity = "0";
          });
        },
        onEnterFade: (alpha) => {
          if (whiteRef.current) whiteRef.current.style.opacity = String(alpha);
        },
        onDone: () => {
          if (disposed) return;
          setUiPhase("reveal");
          // fade the white overlay out to unveil the blog, then remove
          const root = rootRef.current;
          const white = whiteRef.current;
          if (white) {
            white.style.transition = "opacity 700ms ease-in-out";
            white.style.opacity = "0";
          }
          if (root) {
            root.style.transition = "opacity 700ms ease-in-out";
            root.style.opacity = "0";
          }
          window.setTimeout(() => {
            if (!disposed) setUiPhase("gone");
          }, 750);
        },
      });

      // --- loading progress: theatrical ramp, gated on real page readiness ---
      let pageReady = document.readyState === "complete";
      let fontsReady = false;
      window.addEventListener("load", () => (pageReady = true), { once: true });
      document.fonts?.ready.then(() => (fontsReady = true));
      let shown = 0;
      let watched = 0; // ms of *visible* time — the show waits for the visitor
      let last = performance.now();
      let launched = false;

      const step = (now: number) => {
        // stop for good if the intro was skipped or already finished —
        // otherwise this loop would relaunch the overlay after dispose
        if (disposed || launched || phaseRef.current !== "loading") return;
        // clamp to [0, 0.3]: robust to rAF throttling AND to stale first-frame
        // timestamps (a long main-thread block can make now < last)
        const dt = Math.max(0, Math.min((now - last) / 1000, 0.3));
        last = now;
        if (!document.hidden) watched += dt * 1000;
        const ramp = Math.min(watched / MIN_LOAD_MS, 1);
        // ease toward 92% on the timer; the last 8% needs the page to be ready
        let target = 0.92 * (1 - Math.pow(1 - ramp, 2));
        if (ramp >= 1 && pageReady && fontsReady) target = 1;
        shown += (target - shown) * Math.min(1, dt * 7);
        if (target === 1 && shown > 0.99) shown = 1;

        const pct = Math.floor(shown * 100);
        if (barRef.current) {
          const cells = barRef.current.children;
          const filled = Math.round(shown * cells.length);
          for (let ci = 0; ci < cells.length; ci++) {
            (cells[ci] as HTMLElement).dataset.on = ci < filled ? "1" : "0";
          }
        }
        if (percentRef.current) percentRef.current.textContent = `${pct}%`;

        if (shown >= 1) {
          launched = true;
          setUiPhase("tnt");
          scene?.startTnt();
          return;
        }
        progressRaf = requestAnimationFrame(step);
      };
      progressRaf = requestAnimationFrame(step);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(progressRaf);
      scene?.dispose();
      sceneRef.current = null;
    };
  }, []);

  // the component renders null once the intro ends but stays mounted,
  // so the scene must be torn down here rather than in unmount cleanup
  useEffect(() => {
    if (phase === "gone") {
      // session cookie: the server skips rendering the intro on later visits
      document.cookie = "intro_seen=1; path=/; samesite=lax";
      sceneRef.current?.dispose();
      sceneRef.current = null;
    }
  }, [phase]);

  // lock scrolling while the intro is on screen
  useEffect(() => {
    if (phase === "gone") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      ref={rootRef}
      data-intro-phase={phase}
      className="fixed inset-0 z-[60] bg-[#0b0c10]"
      aria-label="Intro animation"
    >
      {/* while the intro plays, hide the site chrome — inline so it works
          before hydration. Removed when the reveal starts, so the header
          FADES in under the dissolving overlay instead of popping. */}
      {phase !== "reveal" && (
        <style>{`.site-header{opacity:0;pointer-events:none}`}</style>
      )}
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* loading HUD — HD take on the Minecraft XP bar */}
      {phase === "loading" && (
        <div className="absolute inset-x-0 bottom-[11vh] flex flex-col items-center px-6">
          <div className="relative w-full max-w-md">
            {/* percentage floats above the bar like the XP level number */}
            <span
              ref={percentRef}
              className="absolute -top-10 left-1/2 -translate-x-1/2 text-2xl font-black tabular-nums text-[#8dff37]"
              style={{
                textShadow:
                  "0 2px 0 rgba(12,32,0,0.95), 2px 0 0 rgba(12,32,0,0.95), -2px 0 0 rgba(12,32,0,0.95), 0 -2px 0 rgba(12,32,0,0.95), 0 0 18px rgba(125,255,42,0.45)",
              }}
            >
              0%
            </span>
            {/* hotbar-style tray of 20 slots that fill with grass tiles */}
            <div
              ref={barRef}
              className="flex w-full items-center justify-center gap-[3px] rounded-lg border border-black/70 bg-[#15180f]/95 p-1.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.7),inset_0_-1px_0_rgba(255,255,255,0.06),0_2px_10px_rgba(0,0,0,0.5)]"
            >
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="mc-load-cell" data-on="0">
                  <span />
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-xs font-medium uppercase tracking-[0.35em] text-zinc-300/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              {t.intro.loadingWorld}
            </p>
          </div>
        </div>
      )}

      {/* skip button */}
      {phase !== "reveal" && (
        <button
          onClick={() => setUiPhase("gone")}
          className="absolute right-5 top-5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-300 backdrop-blur-md transition-colors hover:bg-white/15 hover:text-white"
        >
          {t.intro.skip}
        </button>
      )}

      {/* explosion flash + flythrough white-out overlays */}
      <div
        ref={flashRef}
        className="pointer-events-none absolute inset-0 bg-white opacity-0"
      />
      <div
        ref={whiteRef}
        className="pointer-events-none absolute inset-0 bg-[#f4f9ff] opacity-0"
      />
    </div>
  );
}
