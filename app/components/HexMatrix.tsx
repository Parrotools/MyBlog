"use client";

import { useEffect, useRef } from "react";

/**
 * Honeycomb matrix layer (inspired by JIEJOE's hexagons-matrix): hexagon
 * outlines pop in with randomized stagger, then softly pulse. Canvas-based
 * so hundreds of cells stay cheap; lives on the page-jump curtain.
 */

const R = 30; // hex radius (px)
const POP_MS = 420;
const STAGGER_MS = 520;

function hash(i: number): number {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
}

function hexPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (k === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export default function HexMatrix({ color = "#84cc16" }: { color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colW = 1.5 * R;
    const rowH = Math.sqrt(3) * R;
    const cols = Math.ceil(canvas.width / colW) + 2;
    const rows = Math.ceil(canvas.height / rowH) + 2;
    const t0 = performance.now();
    let raf = 0;

    const draw = (now: number) => {
      const t = now - t0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1.4;
      for (let c = 0; c < cols; c++) {
        for (let r2 = 0; r2 < rows; r2++) {
          const i = r2 * cols + c;
          const seed = hash(i);
          const cx = c * colW;
          const cy = r2 * rowH + (c % 2 ? rowH / 2 : 0);
          // pop-in progress with per-hex stagger, slight overshoot
          const local = reduced
            ? 1
            : Math.min(1, Math.max(0, (t - seed * STAGGER_MS) / POP_MS));
          if (local <= 0) continue;
          const overshoot = 1 + 0.25 * Math.sin(local * Math.PI) * (1 - local);
          const scale = local * overshoot;
          // gentle pulse once landed
          const pulse = local >= 1 ? 0.75 + 0.25 * Math.sin(t / 480 + seed * 6.28) : 1;
          const alpha = (0.1 + 0.22 * seed) * local * pulse;
          hexPath(ctx, cx, cy, (R - 4) * scale);
          ctx.strokeStyle = color;
          ctx.globalAlpha = alpha;
          ctx.stroke();
          if (seed > 0.82) {
            ctx.globalAlpha = alpha * 0.35;
            ctx.fillStyle = color;
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    if (reduced) {
      draw(t0 + POP_MS + STAGGER_MS);
    } else {
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        draw(now);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(raf);
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
    />
  );
}
