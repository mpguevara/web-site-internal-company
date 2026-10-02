import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, extname, sep } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const publicFiles = new Set([
  "index.html", "margen.html", "styles.css", "margen.css", "script.js",
  "margen.js", "translations.js", "mail-config.js",
]);
const mime = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".png": "image/png",
  ".ico": "image/x-icon", ".svg": "image/svg+xml", ".json": "application/json",
};
const port = Number(process.env.PORT || 3003);
createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname === "/") pathname = "/index.html";
    if (pathname === "/margen" || pathname === "/margen/") pathname = "/margen.html";
    const relative = pathname.slice(1);
    const path = resolve(root, relative);
    if (!path.startsWith(root) || relative.includes("\\") ||
        !(publicFiles.has(relative) || path.startsWith(resolve(root, "assets") + sep))) {
      response.writeHead(404).end("Not found");
      return;
    }
    const body = await readFile(path);
    response.writeHead(200, { "Content-Type": mime[extname(path)] || "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Static preview: http://localhost:${port}/margen (no API functions)`);
});
