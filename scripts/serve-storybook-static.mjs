#!/usr/bin/env node
// Dependency-free static file server for the built Storybook (`storybook-static`).
//
// Used by `playwright.visual.config.ts` (as a Playwright `webServer`) and by
// `scripts/test-storybook-smoke.mjs` to serve the production Storybook build so visual
// snapshots and the test-runner smoke suite exercise the same static artifact CI builds —
// not the Vite dev server, which can differ (HMR client, unminified output, different
// asset hashing).
//
// No third-party dependency is introduced: only Node's built-in `http`/`fs`/`path`/`url`.
import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
};

function parseArgs(argv) {
  const args = { port: 6007, dir: "apps/storybook/storybook-static" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--port") args.port = Number(argv[(i += 1)]);
    else if (arg === "--dir") args.dir = argv[(i += 1)];
  }
  return args;
}

export function createServer({ dir, port }) {
  const root = resolve(process.cwd(), dir);

  if (!existsSync(root)) {
    throw new Error(
      `[serve-storybook-static] Directory not found: ${root}\n` +
        'Build Storybook first: "pnpm --filter @repo/storybook build-storybook"',
    );
  }

  const server = http.createServer((req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      let pathname = decodeURIComponent(url.pathname);
      if (pathname === "/") pathname = "/index.html";

      // Resolve against the static root and refuse anything that escapes it (path traversal).
      const safePath = normalize(join(root, pathname));
      if (!safePath.startsWith(root)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      let filePath = safePath;
      if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
        filePath = join(filePath, "index.html");
      }

      if (!existsSync(filePath)) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found");
        return;
      }

      const type = MIME_TYPES[extname(filePath)] ?? "application/octet-stream";
      res.writeHead(200, { "Content-Type": type });
      createReadStream(filePath).pipe(res);
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`Internal error: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  return { server, root, port };
}

// Only auto-start when run directly (`node scripts/serve-storybook-static.mjs ...`), not
// when imported by scripts/test-storybook-smoke.mjs.
const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const { port, dir } = parseArgs(process.argv.slice(2));
  const { server, root } = createServer({ dir, port });

  server.listen(port, "127.0.0.1", () => {
    console.log(`[serve-storybook-static] Serving ${root} at http://127.0.0.1:${port}`);
  });

  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, () => server.close(() => process.exit(0)));
  }
}
