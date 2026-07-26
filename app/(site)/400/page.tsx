import type { Metadata } from "next";
import ErrorScene from "@/app/components/ErrorScene";
import { RedstoneGlitch } from "@/app/components/ErrorArt";
import { dicts } from "@/app/lib/i18n";
import { getLocale } from "@/app/lib/locale";

export const metadata: Metadata = {
  title: "400 — Unknown command",
};

export default async function BadRequest() {
  const t = dicts[await getLocale()].errors.e400;
  return (
    <ErrorScene
      accent="red"
      code="400"
      quip={t.quip}
      title={t.title}
      description={t.desc}
      art={<RedstoneGlitch />}
    />
  );
}
