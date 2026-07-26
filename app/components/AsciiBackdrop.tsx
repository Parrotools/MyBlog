"use client";

import { useEffect, useRef } from "react";

/**
 * Procedural ASCII animation layer (inspired by JIEJOE's ascii-animation:
 * brightness fields mapped to characters, played as frames on a canvas).
 * Each error page gets its own field:
 *   void   — swirling vortex + sparse stars (404)
 *   lock   — pulsing square vault rings (403)
 *   fire   — rising flames, hotter at the bottom (500)
 *   glitch — shifting static with row bursts (400)
 */

export type AsciiVariant = "void" | "lock" | "fire" | "glitch";

const RAMP = " ·.:;+=xX#@";
const CELL_W = 11;
const CELL_H = 16;
const FPS = 13;

function hash(x: number, y: number, s: number): number {
  const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return v - Math.floor(v);
}

/** cheap bilinear value noise */
function noise(u: number, v: number, s: number): number {
  const x0 = Math.floor(u);
  const y0 = Math.floor(v);
  const fx = u - x0;
  const fy = v - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(x0, y0, s);
  const b = hash(x0 + 1, y0, s);
  const c = hash(x0, y0 + 1, s);
  const d = hash(x0 + 1, y0 + 1, s);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

function intensity(
  variant: AsciiVariant,
  x: number,
  y: number,
  cols: number,
  rows: number,
  t: number
): number {
  const nx = (x - cols / 2) / (cols / 2); // -1..1
  const ny = (y - rows / 2) / (rows / 2);
  switch (variant) {
    case "void": {
      const r = Math.hypot(nx, ny * 1.6);
      const ang = Math.atan2(ny * 1.6, nx);
      const swirl = 0.5 + 0.5 * Math.sin(r * 9 - t * 1.6 + ang * 2);
      const falloff = Math.max(0, 1 - r * 0.9);
      const star = hash(x, y, 7) > 0.985 ? 0.9 : 0;
      return Math.max(swirl * falloff * 0.75, star);
    }
    case "lock": {
      const d = Math.max(Math.abs(nx), Math.abs(ny * 1.7)); // square rings
      const ring = 0.5 + 0.5 * Math.sin(d * 14 - t * 2.2);
      return ring * Math.max(0, 1 - d * 0.85) * 0.8;
    }
    case "fire": {
      const base = (y / rows) ** 1.6; // hotter toward the bottom
      const n =
        0.6 * noise(x * 0.14, y * 0.09 - t * 1.4, 3) +
        0.4 * noise(x * 0.32, y * 0.2 - t * 2.3, 11);
      return Math.max(0, n * base * 1.6 - 0.12);
    }
    case "glitch": {
      const frame = Math.floor(t * 9);
      const burst = hash(0, y, frame) > 0.93 ? 0.7 : 0;
      const shift = Math.floor(hash(1, y, frame) * 6);
      const grain = hash(x + shift, y, frame);
      return (grain > 0.82 ? grain * 0.8 : 0) + burst * hash(x, y, frame + 1);
    }
  }
}

export default function AsciiBackdrop({
  variant,
  color,
  className,
}: {
  variant: AsciiVariant;
  color: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t: number) => {
      const cols = Math.ceil(canvas.width / CELL_W);
      const rows = Math.ceil(canvas.height / CELL_H);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "bold 14px ui-monospace, monospace";
      ctx.textBaseline = "top";
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = Math.min(1, Math.max(0, intensity(variant, x, y, cols, rows, t)));
          const ch = RAMP[Math.floor(i * (RAMP.length - 1))];
          if (ch === " ") continue;
          ctx.globalAlpha = 0.4 + 0.6 * i;
          // strong cells get a glow so the animation reads clearly
          ctx.shadowBlur = i > 0.55 ? 7 : 0;
          ctx.fillText(ch, x * CELL_W, y * CELL_H);
        }
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    if (reduced) {
      draw(1.7); // single still frame
    } else {
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (now - last < 1000 / FPS) return;
        last = now;
        draw(now / 1000);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [variant, color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? "opacity-[0.16]"}`}
    />
  );
}
