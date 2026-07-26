"use client";

import { useEffect } from "react";
import ErrorScene from "./components/ErrorScene";
import { CharredBlock } from "./components/ErrorArt";
import { useI18n } from "./components/I18nProvider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScene
      accent="lime"
      code="500"
      quip={t.errors.e500.quip}
      title={t.errors.e500.title}
      description={t.errors.e500.desc}
      art={<CharredBlock />}
    >
      <button
        onClick={reset}
        className="shine rounded-full border border-lime-400/40 bg-lime-400/10 px-5 py-2.5 text-sm font-semibold text-lime-300 transition-colors hover:bg-lime-400/20"
      >
        {t.errors.tryAgain}
      </button>
    </ErrorScene>
  );
}
