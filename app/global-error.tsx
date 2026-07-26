"use client";

import "./globals.css";
import ErrorScene from "./components/ErrorScene";
import { CharredBlock } from "./components/ErrorArt";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <ErrorScene
          accent="lime"
          code="500"
          quip="Ssssomething went very wrong…"
          title="The whole world failed to load"
          description="Even the error page's world had an error. Try again — if it keeps happening, the server room needs a new sign about creepers."
          art={<CharredBlock />}
        >
          <button
            onClick={reset}
            className="shine rounded-full border border-lime-400/40 bg-lime-400/10 px-5 py-2.5 text-sm font-semibold text-lime-300 transition-colors hover:bg-lime-400/20"
          >
            Try again
          </button>
        </ErrorScene>
      </body>
    </html>
  );
}
