import { build } from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

async function main() {
  const result = await build({
    entryPoints: [resolve(root, "src/main.ts")],
    bundle: true,
    minify: true,
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

  await mkdir(resolve(root, "dist"), { recursive: true });
  await writeFile(resolve(root, "dist/index.html"), html);

  const sizeKb = (Buffer.byteLength(html) / 1024).toFixed(1);
  console.log(`Built dist/index.html (${sizeKb} KB, single self-contained file)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});