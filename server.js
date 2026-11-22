const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.PORT || 4173);
const root = __dirname;
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
};

http
  .createServer((request, response) => {
    const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
    const requestedPath = pathname === "/" ? "index.html" : pathname.slice(1);
    const filePath = path.resolve(root, requestedPath);

    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.stat(filePath, (error, stats) => {
      if (error || !stats.isFile()) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      const contentType = contentTypes[path.extname(filePath)] || "application/octet-stream";
      const range = request.headers.range;

      if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
        if (!match) {
          response.writeHead(416, { "Content-Range": `bytes */${stats.size}` });
          response.end();
          return;
        }

        let start;
        let end;
        if (match[1] === "") {
          const suffixLength = Number(match[2]);
          start = Math.max(0, stats.size - suffixLength);
          end = stats.size - 1;
        } else {
          start = Number(match[1]);
          end = match[2] === "" ? stats.size - 1 : Number(match[2]);
        }

        if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= stats.size || end < start) {
          response.writeHead(416, { "Content-Range": `bytes */${stats.size}` });
          response.end();
          return;
        }

        end = Math.min(end, stats.size - 1);
        response.writeHead(206, {
          "Accept-Ranges": "bytes",
          "Content-Length": end - start + 1,
          "Content-Range": `bytes ${start}-${end}/${stats.size}`,
          "Content-Type": contentType,
        });

        if (request.method === "HEAD") {
          response.end();
          return;
        }

        fs.createReadStream(filePath, { start, end }).pipe(response);
        return;
      }

      response.writeHead(200, {
        "Accept-Ranges": "bytes",
        "Content-Length": stats.size,
        "Content-Type": contentType,
      });

      if (request.method === "HEAD") {
        response.end();
        return;
      }

      fs.createReadStream(filePath).pipe(response);
    });
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`Portfolio preview: http://127.0.0.1:${port}`);
  });
