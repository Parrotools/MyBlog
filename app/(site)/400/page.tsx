import type { Metadata } from "next";
import ErrorScene from "@/app/components/ErrorScene";
import { RedstoneGlitch } from "@/app/components/ErrorArt";

export const metadata: Metadata = {
  title: "400 — Unknown command",
};

export default function BadRequest() {
  return (
    <ErrorScene
      accent="red"
      code="400"
      quip="Unknown or incomplete command"
      title="That request didn't parse"
      description="The server read your request the way a command block reads a typo — red particles everywhere, nothing executed. Check the syntax and try again."
      art={<RedstoneGlitch />}
    />
  );
}
