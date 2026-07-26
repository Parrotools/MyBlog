"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // true after hydration, false during SSR — avoids a theme-icon mismatch
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={mounted ? (isDark ? "Switch to day" : "Switch to night") : "Toggle theme"}
      title={mounted ? (isDark ? "Set time day" : "Set time night") : undefined}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="press-btn relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-line text-muted hover:text-heading"
    >
      {/* sun */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`absolute h-4.5 w-4.5 transition-all duration-500 ${
          mounted && !isDark
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-50 opacity-0"
        }`}
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="4.5" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <rect
              key={i}
              x="11.25"
              y="1.5"
              width="1.5"
              height="4"
              rx="0.75"
              transform={`rotate(${(a * 180) / Math.PI} 12 12)`}
            />
          );
        })}
      </svg>
      {/* moon */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`absolute h-4.5 w-4.5 transition-all duration-500 ${
          !mounted || isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-50 opacity-0"
        }`}
        fill="currentColor"
      >
        <path d="M20.4 14.2A8.5 8.5 0 0 1 9.8 3.6 8.5 8.5 0 1 0 20.4 14.2Z" />
      </svg>
    </button>
  );
}
