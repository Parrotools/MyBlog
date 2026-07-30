import type { Metadata } from "next";
import ErrorScene from "./components/ErrorScene";
import { VoidIsland } from "./components/ErrorArt";

export const metadata: Metadata = {
  title: "404 — Chunk not found",
};

export default function NotFound() {
  return (
    <ErrorScene
      accent="violet"
      code="404"
      quip="These chunks were never generated"
      title="Chunk not found"
      description="You wandered past the edge of the map. The page you're looking for doesn't exist — or it fell into the void a long time ago."
      art={<VoidIsland />}
    />
  );
}
