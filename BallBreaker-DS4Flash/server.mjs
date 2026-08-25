import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { watch } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { build } from "esbuild";

const root = dirname(fileURLToPath(import.meta.url));
const dist = resolve(root, "dist");
const port = Number(process.env.PORT || 5173);

let buildQueued = false;
async function rebuild() {
  if (buildQueued) return;
  buildQueued = true;
  await new Promise((r) => setTimeout(r, 80));
  try {
    const result = await build({
      entryPoints: [resolve(root, "src/main.ts")],
      bundle: true,
      minify: false,
      format: "iife",
      platform: "browser",
      target: ["es2019", "chrome90", "safari14"],
      write: false,
      legalComments: "none",
    });
    const js = result.outputFiles[0].text;
    const template = await readFile(resolve(root, "template.html"), "utf8");
    const html = template.replace(
      /<script id="__BUNDLE__"><\/script>/,
      () => `<script>\n${js}\n</script>`
    );
    await writeFile(resolve(dist, "index.html"), html);
    console.log(`[dev] rebuilt ${new Date().toLocaleTimeString()}`);
  } catch (e) {
    console.error("[dev] build failed:\n", e);
  } finally {
    buildQueued = false;
  }
}

watch(resolve(root, "src"), { recursive: true }, () => rebuild());
watch(resolve(root, "template.html"), () => rebuild());

const server = createServer((req, res) => {
  const url = req.url === "/" || req.url === "/index.html" ? "/index.html" : req.url;
  const file = resolve(dist, "." + url);
  if (!file.startsWith(dist)) {
    res.writeHead(403).end();
    return;
  }
  readFile(file)
    .then((data) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    })
    .catch(() => {
      res.writeHead(404).end("Not found");
    });
});

await rebuild();
server.listen(port, () => {
  console.log(`Ball Breaker dev server → http://localhost:${port}`);
});