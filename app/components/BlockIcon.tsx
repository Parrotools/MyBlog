/**
 * Crisp isometric block icons as inline SVG — HD vector takes on
 * Minecraft-style cubes (grass, TNT, stone) used as visual accents.
 */

type Variant = "grass" | "tnt" | "stone" | "dirt" | "iron" | "charred" | "redstone";

const FACES: Record<
  Variant,
  { top: [string, string]; left: [string, string]; right: [string, string] }
> = {
  grass: {
    top: ["#a3e635", "#5cbb3e"],
    left: ["#8a5a3b", "#5e3d22"],
    right: ["#6f4a2c", "#432a15"],
  },
  tnt: {
    top: ["#f87171", "#dc2626"],
    left: ["#dc2626", "#991b1b"],
    right: ["#b91c1c", "#7f1d1d"],
  },
  stone: {
    top: ["#a1a1aa", "#71717a"],
    left: ["#71717a", "#3f3f46"],
    right: ["#52525b", "#27272a"],
  },
  dirt: {
    top: ["#a06a42", "#7a4f30"],
    left: ["#8a5a3b", "#5e3d22"],
    right: ["#6f4a2c", "#432a15"],
  },
  iron: {
    top: ["#f4f4f5", "#d4d4d8"],
    left: ["#d4d4d8", "#a1a1aa"],
    right: ["#b9b9c0", "#8e8e96"],
  },
  charred: {
    top: ["#52525b", "#3f3f46"],
    left: ["#3f3f46", "#27272a"],
    right: ["#2c2c31", "#18181b"],
  },
  redstone: {
    top: ["#f87171", "#dc2626"],
    left: ["#dc2626", "#991b1b"],
    right: ["#b91c1c", "#7f1d1d"],
  },
};

export default function BlockIcon({
  variant = "grass",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const f = FACES[variant];
  const id = `bi-${variant}`;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-t`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={f.top[0]} />
          <stop offset="1" stopColor={f.top[1]} />
        </linearGradient>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={f.left[0]} />
          <stop offset="1" stopColor={f.left[1]} />
        </linearGradient>
        <linearGradient id={`${id}-r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={f.right[0]} />
          <stop offset="1" stopColor={f.right[1]} />
        </linearGradient>
      </defs>
      {/* left face */}
      <polygon points="8,30 50,52 50,96 8,74" fill={`url(#${id}-l)`} />
      {/* right face */}
      <polygon points="92,30 50,52 50,96 92,74" fill={`url(#${id}-r)`} />
      {/* top face */}
      <polygon points="50,8 92,30 50,52 8,30" fill={`url(#${id}-t)`} />
      {variant === "grass" && (
        <>
          {/* grass overhang dripping onto the soil faces */}
          <polygon points="8,30 50,52 50,60 8,38" fill="#65a30d" opacity="0.9" />
          <polygon points="92,30 50,52 50,60 92,38" fill="#4d7c0f" opacity="0.9" />
        </>
      )}
      {variant === "tnt" && (
        <>
          {/* paper band across the side faces */}
          <polygon points="8,50 50,72 50,84 8,62" fill="#f3efe2" opacity="0.95" />
          <polygon points="92,50 50,72 50,84 92,62" fill="#e4dfcf" opacity="0.95" />
        </>
      )}
      {/* soft edge highlight */}
      <polygon
        points="50,8 92,30 50,52 8,30"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
