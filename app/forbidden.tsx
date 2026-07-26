import type { Metadata } from "next";
import ErrorScene from "./components/ErrorScene";
import { LockedBlock } from "./components/ErrorArt";

export const metadata: Metadata = {
  title: "403 — This chest is locked",
};

export default function Forbidden() {
  return (
    <ErrorScene
      accent="amber"
      code="403"
      quip="This chest is locked"
      title="You don't have the key"
      description="This area is protected and your permissions don't open it. If you think you should have access, ask the server admin to /op you."
      art={<LockedBlock />}
    />
  );
}
