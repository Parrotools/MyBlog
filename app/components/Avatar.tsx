import Avatar3D from "./Avatar3D";

/**
 * Profile avatar: uploaded image if set, otherwise a real-3D HD grass
 * block (slow turntable + faint bob), keeping the hover hop on the
 * wrapper.
 */
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
        <div
          className={`relative group-hover:animate-[mc-hop_0.6s_ease] ${className ?? "h-36 w-36"}`}
        >
          <Avatar3D className="h-full w-full" />
        </div>
      )}
    </div>
  );
}
