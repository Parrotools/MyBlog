import type { HotbarSlot } from "../lib/content";

/**
 * Nine hotbar slots rendered from database data (Setting "hotbar",
 * editable in admin → Profile). Hovering a slot raises it and shows a
 * Minecraft-style item tooltip (name + lore lines).
 */
export default function Hotbar({ slots }: { slots: HotbarSlot[] }) {
  return (
    <div
      className="inline-flex items-end gap-1.5 rounded-2xl border border-line bg-surface p-2 shadow-lg"
      role="list"
      aria-label="Skills hotbar"
    >
      {slots.slice(0, 9).map((slot, i) => (
        <div
          key={`${slot.label}-${i}`}
          role="listitem"
          tabIndex={0}
          className="group/slot relative flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-xl border border-line bg-surface-2 outline-none transition-all duration-200 hover:-translate-y-1.5 hover:border-accent/60 hover:bg-surface focus-visible:-translate-y-1.5 focus-visible:border-accent/60"
        >
          {slot.color ? (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-black text-white shadow-inner transition-transform duration-200 group-hover/slot:scale-110"
              style={{
                background: `linear-gradient(135deg, ${slot.color}, color-mix(in srgb, ${slot.color} 55%, black))`,
              }}
            >
              {slot.glyph}
            </span>
          ) : (
            <span className="text-lg text-muted/60">{slot.glyph || "+"}</span>
          )}
          <span className="absolute bottom-0.5 right-1.5 font-mono text-[9px] text-muted/60">
            {i + 1}
          </span>

          {/* Minecraft-style item tooltip; edge slots anchor to their edge */}
          <div
            className={`mc-tooltip ${
              i <= 1 ? "mc-tooltip-start" : i >= 7 ? "mc-tooltip-end" : ""
            }`}
          >
            <p
              className="text-[13px] font-semibold"
              style={{ color: slot.rarity || "#ffffff" }}
            >
              {slot.label}
            </p>
            {slot.lore.map((line) => (
              <p key={line} className="mt-0.5 text-[11px] italic text-[#a884f3]">
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
