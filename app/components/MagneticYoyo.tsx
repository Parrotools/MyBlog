"use client";

import { useEffect, useRef } from "react";

/**
 * Magnetic yoyo (inspired by JIEJOE's magnetic-yoyo / qbitcapital.xyz):
 * mini Minecraft blocks dangle on strings; the cursor repels them
 * magnetically and they swing back on spring physics, tilting with
 * their string. Canvas-based, ambient sway when idle.
 */

interface BlockSkin {
  body: string;
  top: string;
  band?: string; // optional middle band (TNT)
}

const SKINS: BlockSkin[] = [
  { body: "#8a5a3b", top: "#6cbe3a" }, // grass
  { body: "#c2332a", top: "#d94f3f", band: "#f2eee2" }, // tnt
  { body: "#b9bfc9", top: "#d7dce4" }, // iron
  { body: "#f0b429", top: "#fcd34d" }, // gold
  { body: "#5cc8f0", top: "#a3e2ff" }, // diamond
  { body: "#3fa34d", top: "#5ec46d" }, // emerald
  { body: "#8a2c22", top: "#c0392b" }, // redstone
  { body: "#6f4a2c", top: "#8a5a3b" }, // dirt
];

const HEIGHT = 230;
const SPACING = 118;
const REPEL_RADIUS = 150;
const REPEL_FORCE = 420000;
const SPRING = 46;
const DAMPING = 0.9;

interface Ball {
  ax: number; // anchor x
  len: number;
  size: number;
  skin: BlockSkin;
  px: number;
  py: number;
  vx: number;
  vy: number;
  phase: number;
}

export default function MagneticYoyo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let balls: Ball[] = [];
    let raf = 0;
    let last = performance.now();
    const mouse = { x: -9999, y: -9999 };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = HEIGHT * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = canvas.clientWidth;
      const count = Math.max(4, Math.floor(w / SPACING));
      const gap = w / (count + 1);
      balls = Array.from({ length: count }, (_, i) => {
        const len = 92 + ((i * 37) % 52);
        return {
          ax: gap * (i + 1),
          len,
          size: 26 + ((i * 13) % 10),
          skin: SKINS[i % SKINS.length],
          px: gap * (i + 1),
          py: len,
          vx: 0,
          vy: 0,
          phase: i * 1.7,
        };
      });
    };
    build();
    window.addEventListener("resize", build);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    canvas.addEventListener("mouseleave", onLeave);

    const stringColor = () =>
      getComputedStyle(canvas).getPropertyValue("--line") || "rgba(140,150,165,0.4)";

    const draw = (t: number, dt: number) => {
      ctx.clearRect(0, 0, canvas.clientWidth, HEIGHT);
      const lineCol = stringColor();
      for (const b of balls) {
        if (!reduced) {
          // spring back to the hanging rest point
          const rx = b.ax;
          const ry = b.len;
          let fx = (rx - b.px) * SPRING;
          let fy = (ry - b.py) * SPRING;
          // ambient sway keeps them alive
          fx += Math.sin(t * 0.9 + b.phase) * 26;
          // magnetic repulsion from the cursor
          const dx = b.px - mouse.x;
          const dy = b.py - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < REPEL_RADIUS * REPEL_RADIUS) {
            const d = Math.max(Math.sqrt(d2), 14);
            const f = Math.min(REPEL_FORCE / (d2 + 600), 2600);
            fx += (dx / d) * f;
            fy += (dy / d) * f;
          }
          b.vx = (b.vx + fx * dt) * DAMPING;
          b.vy = (b.vy + fy * dt) * DAMPING;
          b.px += b.vx * dt;
          b.py += b.vy * dt;
          // soft tether: don't stretch beyond ~1.5× the string
          const sx = b.px - b.ax;
          const sy = b.py;
          const dist = Math.hypot(sx, sy);
          const maxLen = b.len * 1.5;
          if (dist > maxLen) {
            b.px = b.ax + (sx / dist) * maxLen;
            b.py = (sy / dist) * maxLen;
          }
        }

        // string
        ctx.strokeStyle = lineCol;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(b.ax, 0);
        ctx.lineTo(b.px, b.py);
        ctx.stroke();
        // anchor pin
        ctx.fillStyle = lineCol;
        ctx.beginPath();
        ctx.arc(b.ax, 2, 2.6, 0, Math.PI * 2);
        ctx.fill();

        // block, tilted with its string
        const angle = Math.atan2(b.px - b.ax, b.py) * -1;
        ctx.save();
        ctx.translate(b.px, b.py);
        ctx.rotate(angle);
        const s = b.size;
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 6;
        // body
        ctx.fillStyle = b.skin.body;
        roundRect(ctx, -s / 2, -s / 2, s, s, 5);
        ctx.fill();
        ctx.shadowColor = "transparent";
        // top face strip
        ctx.fillStyle = b.skin.top;
        roundRectTop(ctx, -s / 2, -s / 2, s, s * 0.34, 5);
        ctx.fill();
        // optional band (TNT)
        if (b.skin.band) {
          ctx.fillStyle = b.skin.band;
          ctx.fillRect(-s / 2, -s * 0.1, s, s * 0.22);
        }
        // bevel light + shade
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1.2;
        roundRect(ctx, -s / 2 + 1, -s / 2 + 1, s - 2, s - 2, 4);
        ctx.stroke();
        ctx.restore();
      }
    };

    function roundRect(
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }
    function roundRectTop(
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.lineTo(x + w, y + h);
      c.lineTo(x, y + h);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }

    if (reduced) {
      draw(0, 0);
    } else {
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        draw(now / 1000, dt);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      window.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="w-full"
      style={{ height: HEIGHT }}
    />
  );
}
