"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import BlockIcon from "./BlockIcon";
import HexMatrix from "./HexMatrix";

/**
 * Page-jump curtain (inspired by JIEJOE's jump-animation, the no-refresh
 * flavor): clicking an internal link raises a full-screen cover with a
 * spinner, the route changes underneath, then the cover drops away.
 */

type Phase = "idle" | "cover" | "wait" | "leave";

const COVER_MS = 600;
const REVEAL_DELAY_MS = 220;
const LEAVE_MS = 600;
const SAFETY_MS = 6000;

function isInternalPageLink(a: HTMLAnchorElement): string | null {
  if (a.target && a.target !== "_self") return null;
  if (a.hasAttribute("download")) return null;
  const href = a.getAttribute("href");
  if (!href || href.startsWith("#")) return null;
  let dest: URL;
  try {
    dest = new URL(a.href, window.location.href);
  } catch {
    return null;
  }
  if (dest.origin !== window.location.origin) return null;
  // documents & files served by route handlers, not app pages
  if (/\.(xml|txt|json|pdf|png|jpe?g|gif|webp|svg|avif|ico)$/i.test(dest.pathname))
    return null;
  if (dest.pathname.startsWith("/uploads/")) return null;
  return dest.pathname + dest.search;
}

export default function PageJump() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const url = `${pathname}?${searchParams.toString()}`;
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const timers = useRef<number[]>([]);

  const changePhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  // intercept internal link clicks (capture phase, before Next's Link)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const next = isInternalPageLink(a as HTMLAnchorElement);
      if (!next) return;
      const current = window.location.pathname + window.location.search;
      if (next === current) return;

      e.preventDefault(); // Link sees defaultPrevented and skips its own nav
      if (phaseRef.current !== "idle") return; // a jump is already running

      changePhase("cover");
      later(() => {
        router.push(next);
        changePhase("wait");
      }, COVER_MS);
      // safety net: never leave the curtain stuck
      later(() => {
        if (phaseRef.current === "cover" || phaseRef.current === "wait") {
          changePhase("leave");
          later(() => changePhase("idle"), LEAVE_MS + 50);
        }
      }, SAFETY_MS);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router, changePhase, later]);

  // the URL changed while the curtain was up → reveal the new page
  useEffect(() => {
    if (phaseRef.current !== "wait") return;
    later(() => {
      changePhase("leave");
      later(() => changePhase("idle"), LEAVE_MS + 50);
    }, REVEAL_DELAY_MS);
  }, [url, changePhase, later]);

  if (phase === "idle") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[80] flex flex-col items-center justify-center gap-6 bg-background ${
        phase === "leave"
          ? "animate-[jump-down_0.6s_cubic-bezier(0.65,0,0.35,1)_both]"
          : "animate-[jump-up_0.6s_cubic-bezier(0.65,0,0.35,1)_both]"
      }`}
    >
      {/* honeycomb matrix stagger-popping behind the spinner */}
      <HexMatrix color="#84cc16" />
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 50 50" className="absolute inset-0 h-full w-full">
          <circle
            cx="25"
            cy="25"
            r="22"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="138"
            className="animate-[jump-ring_2.6s_ease-in-out_infinite] [transform-origin:center]"
          />
        </svg>
        <BlockIcon
          variant="grass"
          className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-[mc-hop_1.1s_ease-in-out_infinite]"
        />
      </div>
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.4em] text-muted">
        Loading
      </p>
    </div>
  );
}
