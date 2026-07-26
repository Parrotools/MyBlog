import BlockIcon from "./BlockIcon";

/** Profile avatar: uploaded image if set, otherwise the grass-block mark. */
export default function Avatar({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <div className="group relative">
      <div className="absolute -inset-6 rounded-full bg-lime-500/15 opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Avatar"
          className={`relative rounded-3xl border border-line object-cover drop-shadow-[0_24px_32px_rgba(0,0,0,0.45)] group-hover:animate-[mc-hop_0.6s_ease] ${className ?? "h-36 w-36"}`}
        />
      ) : (
        <BlockIcon
          variant="grass"
          className={`relative drop-shadow-[0_24px_32px_rgba(0,0,0,0.45)] group-hover:animate-[mc-hop_0.6s_ease] ${className ?? "h-36 w-36"}`}
        />
      )}
    </div>
  );
}
