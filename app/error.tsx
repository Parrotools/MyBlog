"use client";

import { useEffect } from "react";
import ErrorScene from "./components/ErrorScene";
import { CharredBlock } from "./components/ErrorArt";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScene
      accent="lime"
      code="500"
      quip="Ssssomething went wrong…"
      title="A creeper got into the server room"
      description="The server made a hissing sound and now everything is in pieces. We're already placing the blocks back — try again in a moment."
      art={<CharredBlock />}
    >
      <button
        onClick={reset}
        className="shine rounded-full border border-lime-400/40 bg-lime-400/10 px-5 py-2.5 text-sm font-semibold text-lime-300 transition-colors hover:bg-lime-400/20"
      >
        Try again
      </button>
    </ErrorScene>
  );
}
