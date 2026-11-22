import { createHash } from "node:crypto";
import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const contextDir = path.join(projectRoot, ".figma-context");
const buildDir = path.join(projectRoot, ".figma-build");
const assetDir = path.join(projectRoot, "assets", "bing-app", "figma-elements");

const exportedComponents = [
  ["slide-16-screen-02.png", "https://www.figma.com/api/mcp/asset/7fc510f0-7d29-4d89-8004-d2789d2d9991.png"],
  ["slide-16-screen-03.png", "https://www.figma.com/api/mcp/asset/ed60d9ca-a136-4339-998d-9450dd87ff86.png"],
  ["slide-43-list.png", "https://www.figma.com/api/mcp/asset/e72ca599-aa21-4c00-9f78-80d801fc801a.png"],
  ["slide-45-screens.png", "https://www.figma.com/api/mcp/asset/979075d9-3970-4d65-b451-7d499bcb25c9.png"],
];

await mkdir(buildDir, { recursive: true });
await mkdir(assetDir, { recursive: true });

const files = (await readdir(contextDir)).filter((file) => file.endsWith(".jsx"));
const downloads = new Map(exportedComponents.map(([name, url]) => [url, name]));

function fileNameFor(url) {
  const pathname = new URL(url).pathname;
  const sourceExtension = path.extname(pathname).toLowerCase();
  const extension = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"].includes(sourceExtension)
    ? sourceExtension
    : ".png";
  const hash = createHash("sha1").update(url).digest("hex").slice(0, 16);
  return `${hash}${extension}`;
}

for (const file of files) {
  let source = await readFile(path.join(contextDir, file), "utf8");
  const prefix = source.match(/const assetPathPrefix = "([^"]+)";/)?.[1];
  const variablePattern = /const (img[A-Za-z0-9_]*) = `\$\{assetPathPrefix\}\/([^`]+)`;/g;
  source = source.replace(variablePattern, (_match, variable, suffix) => {
    const url = `${prefix}/${suffix}`;
    const name = fileNameFor(url);
    downloads.set(url, name);
    return `const ${variable} = "./assets/bing-app/figma-elements/${name}";`;
  });
  source = source.replace(/const assetPathPrefix = "[^"]+";\n?/, "");
  await writeFile(path.join(buildDir, file.replace(/\.jsx$/, ".tsx")), source);
}

const pending = [...downloads.entries()];
for (let index = 0; index < pending.length; index += 12) {
  await Promise.all(pending.slice(index, index + 12).map(async ([url, name]) => {
    const target = path.join(assetDir, name);
    try {
      await access(target);
      return;
    } catch {
      // Missing assets are downloaded below.
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed ${response.status}: ${url}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) {
      const transparentPixel = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+Xk0+AAAAAElFTkSuQmCC",
        "base64",
      );
      await writeFile(target, transparentPixel);
      return;
    }
    await writeFile(target, bytes);
  }));
}

await writeFile(
  path.join(buildDir, "asset-manifest.json"),
  JSON.stringify({ files: downloads.size, exportedComponents: Object.fromEntries(exportedComponents) }, null, 2),
);

console.log(`Prepared ${files.length} Figma modules and ${downloads.size} local assets.`);
