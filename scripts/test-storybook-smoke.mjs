#!/usr/bin/env node
// Runs @storybook/test-runner against the built Storybook static output.
//
// @storybook/test-runner ships its own Jest + Playwright runtime (independent of the
// @playwright/test-based visual harness in tests/visual/). It renders every story and fails on
// render/console errors or a failing `play` function — a fast complementary smoke test that
// catches broken stories even where no visual baseline exists yet (e.g. a story added but not
// yet re-baselined).
//
// This wrapper starts the dependency-free static server from serve-storybook-static.mjs,
// waits for it to respond, runs `test-storybook --url`, then always tears the server down and
// propagates the real exit code.
import { spawn } from "node:child_process";
import { createServer } from "./serve-storybook-static.mjs";

const PORT = Number(process.env.STORYBOOK_STATIC_PORT ?? 6007);
const DIR = process.env.STORYBOOK_STATIC_DIR ?? "apps/storybook/storybook-static";
const url = `http://127.0.0.1:${PORT}`;

async function waitForServer(target, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${target}/index.json`);
      if (res.ok) return;
    } catch {
      // Not up yet — retry until timeout.
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for ${target} to respond`);
}

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => resolvePromise(code ?? 1));
  });
}

async function main() {
  const { server } = createServer({ dir: DIR, port: PORT });
  await new Promise((resolvePromise) => server.listen(PORT, "127.0.0.1", resolvePromise));
  console.log(`[test-storybook-smoke] Serving ${DIR} at ${url}`);

  let exitCode = 1;
  try {
    await waitForServer(url);
    exitCode = await run("pnpm", [
      "--filter",
      "@repo/storybook",
      "exec",
      "test-storybook",
      "--url",
      url,
      "--ci",
    ]);
  } finally {
    await new Promise((resolvePromise) => server.close(resolvePromise));
  }

  process.exit(exitCode);
}

main().catch((error) => {
  console.error("[test-storybook-smoke]", error);
  process.exit(1);
});
