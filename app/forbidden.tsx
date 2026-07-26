import type { Metadata } from "next";
import ErrorScene from "./components/ErrorScene";
import { LockedBlock } from "./components/ErrorArt";
import { dicts } from "./lib/i18n";
import { getLocale } from "./lib/locale";

export const metadata: Metadata = {
  title: "403 — This chest is locked",
};

export default async function Forbidden() {
  const t = dicts[await getLocale()].errors.e403;
  return (
    <ErrorScene
      accent="amber"
      code="403"
      quip={t.quip}
      title={t.title}
      description={t.desc}
      art={<LockedBlock />}
    />
  );
}
