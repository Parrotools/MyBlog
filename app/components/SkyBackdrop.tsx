"use client";

import { useEffect, useRef } from "react";

/**
 * HD Minecraft-style sky behind the whole site — now a parallax banner:
 *  - pointer position shifts each layer by its depth (near clouds move
 *    the most, sun/moon/stars barely) with smooth lerping
 *  - pointer movement speed accelerates the cloud drift, easing back to
 *    the base breeze when the pointer rests
 * Day (light theme): sun + white voxel clouds. Night (dark theme): moon,
 * stars, dark clouds. Theme toggle cross-fades like dawn/dusk.
 */

// deterministic star field: [left %, top %, size px, delay s]
const STARS: Array<[number, number, number, number]> = [
  [3, 12, 2, 0.2], [7, 34, 1, 1.8], [11, 6, 2, 3.1], [14, 27, 1, 0.9],
  [18, 44, 2, 2.4], [21, 15, 3, 1.2], [25, 33, 1, 3.8], [28, 8, 2, 0.5],
  [32, 24, 1, 2.9], [35, 47, 2, 1.5], [38, 11, 1, 3.4], [42, 30, 2, 0.8],
  [45, 5, 3, 2.1], [48, 39, 1, 4.2], [52, 19, 2, 1.1], [55, 45, 1, 2.7],
  [58, 9, 2, 0.4], [61, 28, 1, 3.6], [64, 41, 2, 1.9], [67, 14, 1, 2.2],
  [70, 36, 3, 0.7], [73, 7, 2, 3.9], [76, 25, 1, 1.4], [79, 46, 2, 2.6],
  [82, 17, 1, 0.3], [85, 32, 2, 3.3], [88, 10, 1, 1.7], [91, 40, 2, 2.8],
  [94, 21, 3, 0.6], [96, 35, 1, 3.7], [9, 49, 1, 2.0], [23, 42, 2, 4.0],
  [37, 18, 1, 0.1], [51, 50, 2, 3.0], [69, 48, 1, 1.6], [90, 4, 2, 2.5],
];

// Minecraft-style voxel clouds: blocky slabs with bright tops and shaded
// undersides. Each block: [x, y, w, h] in rem within its cloud.
type Tone = "top" | "base" | "under";
type CloudBlock = [number, number, number, number, Tone];

const CLOUD_SHAPES: CloudBlock[][] = [
  [
    [3, 0, 10, 2, "top"],
    [16, 0.7, 5, 1.3, "top"],
    [0, 2, 23, 3.2, "base"],
    [2, 5.2, 18, 1.1, "under"],
  ],
  [
    [2, 0, 8, 1.8, "top"],
    [0, 1.8, 15, 2.8, "base"],
    [1.5, 4.6, 11, 1, "under"],
  ],
  [
    [1.5, 0, 5, 1.5, "top"],
    [0, 1.5, 9, 2.2, "base"],
    [1, 3.7, 6.5, 0.9, "under"],
  ],
];

const TONE_FILTER: Record<Tone, string> = {
  top: "brightness(1.08)",
  base: "none",
  under: "brightness(0.78)",
};

// depth: 0 = far horizon, 1 = right in front (moves fastest, shifts most)
const CLOUDS: Array<{
  top: string;
  shape: number;
  scale: number;
  depth: number;
  op: number;
}> = [
  { top: "4%", shape: 0, scale: 1.15, depth: 0.85, op: 1 },
  { top: "14%", shape: 1, scale: 1.35, depth: 1.0, op: 0.8 },
  { top: "22%", shape: 2, scale: 1.2, depth: 0.7, op: 0.9 },
  { top: "9%", shape: 2, scale: 0.85, depth: 0.45, op: 0.7 },
  { top: "29%", shape: 0, scale: 0.9, depth: 0.3, op: 0.55 },
  { top: "18%", shape: 1, scale: 0.75, depth: 0.55, op: 0.85 },
];

const BASE_SPEED = 22; // px/s drift for a depth-1 cloud
const MAX_BOOST = 7; // pointer motion can speed clouds up to this factor
const MARGIN = 480; // px offscreen on each side before wrapping

function hash(i: number): number {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
}

export default function SkyBackdrop() {
  const cloudRefs = useRef<Array<HTMLDivElement | null>>([]);
  const farRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const xs = CLOUDS.map((_, i) => hash(i) * (window.innerWidth + MARGIN));
    // pointer parallax targets + smoothed values
    let tx = 0,
      ty = 0,
      px = 0,
      py = 0;
    // drift boost from pointer velocity
    let boost = 1;
    let lastMouse: { x: number; y: number; t: number } | null = null;
    let raf = 0;
    let last = performance.now();

    const onMove = (e: MouseEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      const now = performance.now();
      if (lastMouse) {
        const dt = Math.max(now - lastMouse.t, 1);
        const vel = Math.hypot(e.clientX - lastMouse.x, e.clientY - lastMouse.y) / dt; // px/ms
        // fast pointer sweeps push the boost up; capped
        boost = Math.min(MAX_BOOST, Math.max(boost, 1 + vel * 3.2));
      }
      lastMouse = { x: e.clientX, y: e.clientY, t: now };
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      // smooth pointer follow + boost decay back to the base breeze
      px += (tx - px) * 0.055;
      py += (ty - py) * 0.055;
      boost += (1 - boost) * 0.012;

      const span = window.innerWidth + MARGIN;
      CLOUDS.forEach((c, i) => {
        const el = cloudRefs.current[i];
        if (!el) return;
        xs[i] += BASE_SPEED * (0.35 + 0.65 * c.depth) * boost * dt;
        if (xs[i] > span) xs[i] -= span + MARGIN * 0.5;
        const shiftX = -px * 90 * c.depth;
        const shiftY = -py * 46 * c.depth;
        el.style.transform = `translate3d(${xs[i] - MARGIN + shiftX}px, ${shiftY}px, 0)`;
      });
      if (farRef.current) {
        farRef.current.style.transform = `translate3d(${-px * 18}px, ${-py * 10}px, 0)`;
      }
    };

    if (reduced) {
      // static parallax-free placement
      CLOUDS.forEach((_, i) => {
        const el = cloudRefs.current[i];
        if (el) el.style.transform = `translate3d(${xs[i] - MARGIN}px, 0, 0)`;
      });
      return;
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden [--cloud:#ffffff] [--cloud-alpha:0.85] dark:[--cloud:#232a4a] dark:[--cloud-alpha:0.5]"
    >
      {/* day sky */}
      <div
        className="absolute inset-0 opacity-100 transition-opacity duration-[1500ms] dark:opacity-0"
        style={{
          background:
            "linear-gradient(180deg, #4f95f0 0%, #7fb4f5 32%, #cfe6ff 62%, #eef6ff 100%)",
        }}
      />
      {/* night sky */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-[1500ms] dark:opacity-100"
        style={{
          background:
            "linear-gradient(180deg, #05091d 0%, #0a1030 34%, #101736 58%, #0c0d11 100%)",
        }}
      />

      {/* far layer: sun, moon and stars — smallest parallax shift */}
      <div ref={farRef} className="absolute inset-0 will-change-transform">
        {/* sun (day) */}
        <div className="absolute right-[8%] top-[2%] opacity-100 transition-opacity duration-[1500ms] dark:opacity-0">
          <div
            className="absolute -inset-40"
            style={{
              background:
                "radial-gradient(circle, rgba(255,246,205,0.55) 0%, rgba(255,246,205,0.18) 45%, transparent 70%)",
            }}
          />
          <div
            className="h-28 w-28 rounded-full"
            style={{
              background:
                "radial-gradient(circle, #fffdf2 0%, #ffedb0 45%, rgba(255,230,150,0.4) 75%, transparent 100%)",
            }}
          />
        </div>

        {/* moon (night) */}
        <div className="absolute right-[10%] top-[4%] opacity-0 transition-opacity duration-[1500ms] dark:opacity-100">
          <div
            className="absolute -inset-44"
            style={{
              background:
                "radial-gradient(circle, rgba(180,205,255,0.22) 0%, rgba(180,205,255,0.08) 45%, transparent 70%)",
            }}
          />
          <div
            className="relative h-20 w-20 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 36% 34%, #f6f8ff 0%, #d3ddf2 55%, #aab9da 100%)",
              boxShadow: "0 0 55px 14px rgba(185,205,255,0.35)",
            }}
          >
            <span className="absolute left-[22%] top-[48%] h-3.5 w-3.5 rounded-full bg-[#98a8cb] opacity-50" />
            <span className="absolute left-[55%] top-[26%] h-2.5 w-2.5 rounded-full bg-[#98a8cb] opacity-40" />
            <span className="absolute left-[60%] top-[62%] h-2 w-2 rounded-full bg-[#98a8cb] opacity-45" />
          </div>
        </div>

        {/* stars (night) */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-[1500ms] dark:opacity-100">
          {STARS.map(([left, top, size, delay], i) => (
            <span
              key={i}
              className="sky-star absolute rounded-full bg-white"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                animation: `star-twinkle ${2.4 + (i % 5) * 0.6}s ease-in-out ${delay}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* drifting voxel clouds — JS-driven so pointer speed can push them */}
      {CLOUDS.map((c, i) => {
        const blocks = CLOUD_SHAPES[c.shape];
        const width = Math.max(...blocks.map(([x, , w]) => x + w));
        const height = Math.max(...blocks.map(([, y, , h]) => y + h));
        return (
          <div
            key={i}
            ref={(el) => {
              cloudRefs.current[i] = el;
            }}
            className="sky-cloud absolute will-change-transform"
            style={{
              top: c.top,
              left: 0,
              transform: "translate3d(-200vw, 0, 0)", // parked until first tick
              opacity: `calc(var(--cloud-alpha) * ${c.op})`,
            }}
          >
            <div
              className="relative"
              style={{
                width: `${width}rem`,
                height: `${height}rem`,
                transform: `scale(${c.scale})`,
                transformOrigin: "top left",
                filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.16))",
              }}
            >
              {blocks.map(([x, y, w, h, tone], bi) => (
                <div
                  key={bi}
                  className="absolute rounded-[3px] transition-colors duration-[1500ms]"
                  style={{
                    left: `${x}rem`,
                    top: `${y}rem`,
                    width: `${w}rem`,
                    height: `${h}rem`,
                    background: "var(--cloud)",
                    filter: TONE_FILTER[tone],
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* readability wash: sky fades into the page background lower down */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 22%, var(--background) 78%)",
        }}
      />
    </div>
  );
}
