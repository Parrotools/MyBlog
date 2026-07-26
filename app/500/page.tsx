export const dynamic = "force-dynamic";

/** Preview route: throws so the 500 boundary (app/error.tsx) renders. */
export default function ServerErrorDemo(): never {
  throw new Error("Preview of the 500 page — a creeper did this on purpose.");
}
