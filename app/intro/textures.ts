import * as THREE from "three";

/**
 * High-definition procedural textures in a Minecraft-inspired style.
 * Multi-octave value noise, soft shading and baked edge occlusion —
 * generated at runtime on canvases, so no game assets are shipped.
 */

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  return [canvas, ctx];
}

function toTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// ---------------------------------------------------------------- noise

/** Bilinear value noise on a random lattice, sampled at (u,v) in [0,1). */
function lattice(cells: number): (u: number, v: number) => number {
  const g: number[] = [];
  for (let i = 0; i < (cells + 1) * (cells + 1); i++) g.push(Math.random());
  const at = (x: number, y: number) =>
    g[(y % (cells + 1)) * (cells + 1) + (x % (cells + 1))];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (u, v) => {
    const x = u * cells;
    const y = v * cells;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = smooth(x - x0);
    const fy = smooth(y - y0);
    const a = at(x0, y0);
    const b = at(x0 + 1, y0);
    const c = at(x0, y0 + 1);
    const d = at(x0 + 1, y0 + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}

/** Fractal (multi-octave) value noise, output roughly in [0,1]. */
function fbm(octaves: number[], weights?: number[]): (u: number, v: number) => number {
  const layers = octaves.map((c) => lattice(c));
  const w = weights ?? octaves.map((_, i) => 1 / 2 ** i);
  const total = w.reduce((a, b) => a + b, 0);
  return (u, v) => {
    let s = 0;
    for (let i = 0; i < layers.length; i++) s += layers[i](u, v) * w[i];
    return s / total;
  };
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

/**
 * Fill the canvas by evaluating a pixel shader-style callback.
 * The callback returns [r,g,b] in 0..255 for (u,v) in [0,1).
 */
function shade(
  ctx: CanvasRenderingContext2D,
  size: number,
  fn: (u: number, v: number) => [number, number, number]
) {
  const img = ctx.createImageData(size, size);
  const data = img.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const [r, g, b] = fn(x / size, y / size);
      const i = (y * size + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** Soft darkening near the face borders — sells the "block" silhouette in HD. */
function edgeOcclusion(u: number, v: number): number {
  const d = Math.min(u, 1 - u, v, 1 - v); // distance to nearest edge, 0..0.5
  return 0.72 + 0.28 * clamp01(d / 0.12);
}

// ---------------------------------------------------------------- blocks

export function stoneTexture(): THREE.CanvasTexture {
  const size = 512;
  const [canvas, ctx] = makeCanvas(size);
  const blotch = fbm([4, 8, 16, 32]);
  const tint = lattice(6);
  shade(ctx, size, (u, v) => {
    const l = 0.4 + 0.24 * blotch(u, v) + (Math.random() - 0.5) * 0.035;
    const warm = (tint(u, v) - 0.5) * 8;
    const ao = edgeOcclusion(u, v);
    const g = clamp01(l) * 255 * ao;
    return [g + warm, g, g - warm * 0.5];
  });
  // faint fracture lines
  ctx.strokeStyle = "rgba(20,20,24,0.18)";
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    const x0 = Math.random() * size;
    const y0 = Math.random() * size;
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(
      x0 + (Math.random() - 0.5) * 220,
      y0 + (Math.random() - 0.5) * 220,
      x0 + (Math.random() - 0.5) * 320,
      y0 + (Math.random() - 0.5) * 320
    );
    ctx.stroke();
  }
  return toTexture(canvas);
}

function dirtShader(): (u: number, v: number) => [number, number, number] {
  const soil = fbm([6, 12, 24, 48]);
  const hueN = lattice(8);
  return (u, v) => {
    const l = 0.26 + 0.18 * soil(u, v) + (Math.random() - 0.5) * 0.03;
    const h = 22 + hueN(u, v) * 10;
    const [r, g, b] = hslToRgb(h, 0.42, clamp01(l));
    const ao = edgeOcclusion(u, v);
    return [r * ao, g * ao, b * ao];
  };
}

function addPebbles(ctx: CanvasRenderingContext2D, size: number) {
  for (let i = 0; i < 26; i++) {
    const r = 4 + Math.random() * 9;
    const x = Math.random() * size;
    const y = Math.random() * size;
    const dark = Math.random() < 0.6;
    ctx.fillStyle = dark ? "rgba(40,26,14,0.28)" : "rgba(190,150,110,0.22)";
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.6 + Math.random() * 0.4), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function dirtTexture(): THREE.CanvasTexture {
  const size = 512;
  const [canvas, ctx] = makeCanvas(size);
  shade(ctx, size, dirtShader());
  addPebbles(ctx, size);
  return toTexture(canvas);
}

export function grassTopTexture(): THREE.CanvasTexture {
  const size = 512;
  const [canvas, ctx] = makeCanvas(size);
  const meadow = fbm([5, 10, 20, 40]);
  const hueN = lattice(7);
  shade(ctx, size, (u, v) => {
    const l = 0.3 + 0.17 * meadow(u, v) + (Math.random() - 0.5) * 0.03;
    const h = 96 + hueN(u, v) * 22;
    const [r, g, b] = hslToRgb(h, 0.52, clamp01(l));
    const ao = edgeOcclusion(u, v);
    return [r * ao, g * ao, b * ao];
  });
  // short blade strokes for texture depth
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 3 + Math.random() * 7;
    ctx.strokeStyle =
      Math.random() < 0.5 ? "rgba(24,60,16,0.16)" : "rgba(150,220,90,0.14)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 3, y - len);
    ctx.stroke();
  }
  return toTexture(canvas);
}

export function grassSideTexture(): THREE.CanvasTexture {
  const size = 512;
  const [canvas, ctx] = makeCanvas(size);
  const soil = dirtShader();
  const grass = fbm([6, 12, 24]);
  const boundary = lattice(10);
  const hueN = lattice(7);
  shade(ctx, size, (u, v) => {
    const cut = 0.16 + boundary(u, 0) * 0.12; // wavy grass line
    const blend = clamp01((v - cut) / 0.03);
    if (blend >= 1) return soil(u, v);
    const l = 0.3 + 0.16 * grass(u, v);
    const h = 98 + hueN(u, v) * 20;
    const [r, g, b] = hslToRgb(h, 0.52, clamp01(l));
    const ao = edgeOcclusion(u, v);
    const gr: [number, number, number] = [r * ao, g * ao, b * ao];
    if (blend <= 0) return gr;
    const so = soil(u, v);
    return [
      gr[0] + (so[0] - gr[0]) * blend,
      gr[1] + (so[1] - gr[1]) * blend,
      gr[2] + (so[2] - gr[2]) * blend,
    ];
  });
  addPebbles(ctx, size);
  return toTexture(canvas);
}

// ---------------------------------------------------------------- tnt

export function tntSideTexture(): THREE.CanvasTexture {
  const size = 512;
  const [canvas, ctx] = makeCanvas(size);
  const grain = fbm([8, 24, 64]);
  shade(ctx, size, (u, v) => {
    const l = 0.4 + 0.1 * grain(u, v);
    const [r, g, b] = hslToRgb(5, 0.72, clamp01(l));
    const ao = edgeOcclusion(u, v);
    return [r * ao, g * ao, b * ao];
  });
  // vertical seams between dynamite sticks
  ctx.fillStyle = "rgba(60,10,6,0.35)";
  for (let i = 1; i < 4; i++) {
    ctx.fillRect(i * (size / 4) - 3, 0, 6, size);
  }
  // paper band
  const bandY = size * 0.36;
  const bandH = size * 0.28;
  const bandGrad = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
  bandGrad.addColorStop(0, "#ddd6c6");
  bandGrad.addColorStop(0.12, "#f4efe3");
  bandGrad.addColorStop(0.88, "#efe9da");
  bandGrad.addColorStop(1, "#d3ccba");
  ctx.fillStyle = bandGrad;
  ctx.fillRect(0, bandY, size, bandH);
  // bold HD lettering
  ctx.fillStyle = "#1c1a17";
  ctx.font = "900 118px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const letters = ["T", "N", "T"];
  const spread = 118;
  letters.forEach((ch, i) => {
    ctx.fillText(ch, size / 2 + (i - 1) * spread, bandY + bandH / 2 + 4);
  });
  return toTexture(canvas);
}

export function tntTopTexture(): THREE.CanvasTexture {
  const size = 512;
  const [canvas, ctx] = makeCanvas(size);
  const grain = fbm([8, 24]);
  shade(ctx, size, (u, v) => {
    const l = 0.3 + 0.08 * grain(u, v);
    const [r, g, b] = hslToRgb(4, 0.6, clamp01(l));
    const ao = edgeOcclusion(u, v);
    return [r * ao, g * ao, b * ao];
  });
  // bundle of dynamite sticks seen from above
  const grid = 3;
  const cell = size / (grid + 0.6);
  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      const cx = size / 2 + (gx - 1) * cell;
      const cy = size / 2 + (gy - 1) * cell;
      const r = cell * 0.42;
      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      grad.addColorStop(0, "#f2ead6");
      grad.addColorStop(0.8, "#dcd2b8");
      grad.addColorStop(1, "#b8ad90");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#4a4038";
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return toTexture(canvas);
}

// ---------------------------------------------------------------- effects

/** Soft blobby puff used for explosion smoke sprites. */
export function smokeTexture(): THREE.CanvasTexture {
  const size = 256;
  const [canvas, ctx] = makeCanvas(size);
  for (let i = 0; i < 10; i++) {
    const r = 40 + Math.random() * 52;
    const x = size / 2 + (Math.random() - 0.5) * 90;
    const y = size / 2 + (Math.random() - 0.5) * 90;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Bright radial flash for the moment of detonation. */
export function flashTexture(): THREE.CanvasTexture {
  const size = 256;
  const [canvas, ctx] = makeCanvas(size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,244,1)");
  g.addColorStop(0.3, "rgba(255,236,190,0.9)");
  g.addColorStop(1, "rgba(255,190,110,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** HD sky with sun glow and soft clouds, visible through the blast hole. */
export function skyTexture(): THREE.CanvasTexture {
  const size = 1024;
  const [canvas, ctx] = makeCanvas(size);
  const g = ctx.createLinearGradient(0, 0, 0, size);
  g.addColorStop(0, "#3d7fe8");
  g.addColorStop(0.5, "#6fa8f5");
  g.addColorStop(0.85, "#c5e2ff");
  g.addColorStop(1, "#e8f4ff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  // sun with layered glow
  const sx = size * 0.7;
  const sy = size * 0.22;
  const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 0.28);
  glow.addColorStop(0, "rgba(255,252,230,0.95)");
  glow.addColorStop(0.18, "rgba(255,244,190,0.55)");
  glow.addColorStop(1, "rgba(255,240,180,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#fffdf2";
  ctx.beginPath();
  ctx.arc(sx, sy, size * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // soft clouds
  ctx.filter = "blur(18px)";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  const clouds: Array<[number, number, number, number]> = [
    [0.16, 0.3, 0.2, 0.05],
    [0.45, 0.42, 0.26, 0.06],
    [0.78, 0.5, 0.18, 0.045],
    [0.28, 0.58, 0.22, 0.05],
    [0.6, 0.18, 0.16, 0.04],
  ];
  for (const [cx, cy, rw, rh] of clouds) {
    ctx.beginPath();
    ctx.ellipse(cx * size, cy * size, rw * size, rh * size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      (cx + 0.06) * size,
      (cy - 0.03) * size,
      rw * 0.6 * size,
      rh * 0.8 * size,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.filter = "none";

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
