import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { after, before, test } from "node:test";
import path from "node:path";

const port = 31137;
const origin = `http://127.0.0.1:${port}`;
let server;
let output = "";

before(async () => {
  server = spawn(
    process.execPath,
    [path.resolve("node_modules/next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  server.stdout.on("data", (chunk) => (output += chunk));
  server.stderr.on("data", (chunk) => (output += chunk));

  for (let attempt = 0; attempt < 120; attempt++) {
    if (server.exitCode !== null) throw new Error(output);
    try {
      const response = await fetch(`${origin}/posts`);
      if (response.ok) return;
    } catch {}
    await delay(250);
  }
  throw new Error(`Next.js did not start:\n${output}`);
}, { timeout: 35_000 });

after(() => server?.kill());

async function introCount(pathname, cached = false) {
  const response = await fetch(`${origin}${pathname}`, {
    headers: cached ? { cookie: "intro_seen=1" } : {},
  });
  assert.equal(response.status, 200);
  return (await response.text()).match(/aria-label="Intro animation"/g)?.length ?? 0;
}

test("every first public entry renders one intro and cached entries render none", async () => {
  assert.equal(await introCount("/posts"), 1);
  assert.equal(await introCount("/posts", true), 0);
  assert.equal(await introCount("/?intro=1"), 1);
  assert.equal(await introCount("/?intro=1", true), 1);
}, { timeout: 35_000 });
