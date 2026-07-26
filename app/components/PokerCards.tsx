"use client";

import { useEffect, useRef, useState } from "react";
import BlockIcon from "./BlockIcon";
import type { BlockVariant } from "../lib/content";

export interface CharacterCard {
  title: string;
  items: string[];
  icon: BlockVariant;
  color: string;
}

/**
 * Poker-hand fan of "character cards" (inspired by the classic
 * poker-slides effect): cards sit fanned like a hand. Clicking any card
 * draws it to the front; the front card cycles to the back. Cards that
 * move do a full 3D flip mid-flight, showing the card back.
 */

// transform per fan slot — slot 0 is the front card; wide spread so
// every card's face stays mostly readable in the hand
const SLOTS = [
  "rotate(-8deg)",
  "rotate(-4deg) translate(55%, -8%)",
  "rotate(0deg) translate(110%, -13%)",
  "rotate(4deg) translate(165%, -15%)",
  "rotate(8deg) translate(220%, -13%)",
];

const SWITCH_MS = 950;

export default function PokerCards({ cards }: { cards: CharacterCard[] }) {
  const deck = cards.slice(0, SLOTS.length);
  const [order, setOrder] = useState(() => deck.map((_, i) => i));
  // cards currently mid-flip, plus a nonce so re-flips restart the animation
  const [flipping, setFlipping] = useState<ReadonlySet<number>>(new Set());
  const [flipNonce, setFlipNonce] = useState(0);
  const flipTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (flipTimer.current) window.clearTimeout(flipTimer.current);
    };
  }, []);

  const beginFlip = (movers: number[]) => {
    setFlipping(new Set(movers));
    setFlipNonce((n) => n + 1);
    if (flipTimer.current) window.clearTimeout(flipTimer.current);
    flipTimer.current = window.setTimeout(
      () => setFlipping(new Set()),
      SWITCH_MS + 50
    );
  };

  /** front card cycles to the back of the hand */
  const shuffle = () => {
    beginFlip([order[0]]);
    setOrder([...order.slice(1), order[0]]);
  };

  /** clicked card comes to the front; clicking the front sends it back */
  const draw = (cardIndex: number) => {
    if (order[0] === cardIndex) {
      shuffle();
      return;
    }
    beginFlip([cardIndex, order[0]]);
    setOrder([cardIndex, ...order.filter((i) => i !== cardIndex)]);
  };

  if (deck.length === 0) return null;

  return (
    <div className="overflow-x-auto pb-4 pt-2">
      <div
        role="button"
        tabIndex={0}
        aria-label="Character cards — activate to bring the next card forward"
        onClick={shuffle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            shuffle();
          }
        }}
        className="group/fan relative h-[22rem] w-[46rem] shrink-0 cursor-pointer select-none outline-none sm:h-[24rem] sm:w-[52rem]"
      >
        {deck.map((card, cardIndex) => {
          const slot = order.indexOf(cardIndex);
          const front = slot === 0;
          const isFlipping = flipping.has(cardIndex);
          return (
            // outer: position in the fan (slow, smooth travel)
            <div
              key={card.title}
              onClick={(e) => {
                e.stopPropagation();
                draw(cardIndex);
              }}
              className="absolute left-2 top-4 h-[18rem] w-[13.5rem] transition-transform duration-[950ms] ease-[cubic-bezier(0.3,0.9,0.3,1)] sm:h-[20rem] sm:w-[15rem]"
              style={{
                transform: SLOTS[slot],
                zIndex: isFlipping ? 20 : SLOTS.length - slot,
                perspective: "1100px",
                filter: front
                  ? `drop-shadow(0 18px 30px ${card.color}44)`
                  : "drop-shadow(0 14px 24px rgba(0,0,0,0.45))",
              }}
            >
              {/* inner: the 3D flip while switching */}
              <div
                key={isFlipping ? `flip-${flipNonce}` : "still"}
                className="relative h-full w-full [transform-style:preserve-3d]"
                style={
                  isFlipping
                    ? {
                        animation: `card-flip ${SWITCH_MS}ms cubic-bezier(0.45,0,0.25,1) both`,
                      }
                    : undefined
                }
              >
                {/* ============ front face ============ */}
                <div
                  className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border-2 [backface-visibility:hidden]"
                  style={{
                    borderColor: front ? card.color : "var(--line)",
                    // opaque base so fanned cards never bleed through
                    background: `linear-gradient(155deg, ${card.color}20, transparent 45%), var(--background)`,
                  }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{
                      background: `linear-gradient(135deg, ${card.color}33, transparent)`,
                    }}
                  >
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color: card.color }}
                    >
                      ◆ {String(cardIndex + 1).padStart(2, "0")}
                    </span>
                    <BlockIcon
                      variant={card.icon}
                      className={`h-8 w-8 ${front ? "group-hover/fan:animate-[mc-hop_0.5s_ease]" : ""}`}
                    />
                  </div>

                  <div className="flex flex-1 flex-col px-5 pb-4">
                    <h3 className="text-base font-bold leading-snug text-heading">
                      {card.title}
                    </h3>
                    <ul className="mt-3 space-y-2 text-[13px] leading-5 text-muted">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-sm"
                            style={{ background: card.color }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-auto pt-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted/60">
                      Character card
                    </p>
                  </div>

                  <span
                    className="absolute bottom-2 right-3 rotate-180 font-mono text-xs font-bold"
                    style={{ color: card.color }}
                  >
                    ◆ {String(cardIndex + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* ============ card back (visible mid-flip) ============ */}
                <div
                  className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl border-2 [backface-visibility:hidden] [transform:rotateY(180deg)]"
                  style={{
                    borderColor: card.color,
                    background: `repeating-linear-gradient(45deg, ${card.color}14 0 10px, transparent 10px 20px), repeating-linear-gradient(-45deg, ${card.color}0d 0 10px, transparent 10px 20px), var(--background)`,
                  }}
                >
                  <div
                    className="flex h-24 w-24 rotate-45 items-center justify-center rounded-xl border-2"
                    style={{ borderColor: `${card.color}66` }}
                  >
                    <BlockIcon
                      variant={card.icon}
                      className="h-12 w-12 -rotate-45"
                    />
                  </div>
                  <span
                    className="absolute bottom-3 left-0 right-0 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em]"
                    style={{ color: `${card.color}aa` }}
                  >
                    Zige&apos;s deck
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        <p className="absolute -bottom-1 left-2 text-xs text-muted/70 transition-colors group-hover/fan:text-accent">
          ♠ Click any card to draw it forward
        </p>
      </div>
    </div>
  );
}
