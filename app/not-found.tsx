import type { Metadata } from "next";
import ErrorScene from "./components/ErrorScene";
import { VoidIsland } from "./components/ErrorArt";
import { dicts } from "./lib/i18n";
import { getLocale } from "./lib/locale";

export const metadata: Metadata = {
  title: "404 — Chunk not found",
};

export default async function NotFound() {
  const t = dicts[await getLocale()].errors.e404;
  return (
    <ErrorScene
      accent="violet"
      code="404"
      quip={t.quip}
      title={t.title}
      description={t.desc}
      art={<VoidIsland />}
    />
  );
}
