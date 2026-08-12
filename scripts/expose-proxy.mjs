/**
 * Single-origin reverse proxy: page/app → :3000, impeccable helper → :8400.
 * Rust-style error tolerance — every socket swallows EPIPE/disconnect without
 * killing the whole proxy. WebSocket upgrades forwarded for Next HMR.
 */
import http from "node:http";

const APP = { host: "127.0.0.1", port: 3000 };
const HELPER = { host: "127.0.0.1", port: 8400 };

const HELPER_PREFIXES = [
  "/live.js", "/detect.js", "/modern-screenshot.js", "/annotation",
  "/events", "/health", "/poll", "/source", "/status", "/stop",
  "/screenshot", "/manual-edit-stash", "/manual-edit-commit",
  "/manual-edit-discard", "/manual-edit-repair-decision",
  "/params", "/wrap", "/insert", "/accept", "/discard", "/resume", "/complete",
];

const noop = () => {};
function guard(socket) {
  socket.on("error", noop);
  return socket;
}
function targetFor(pathname) {
  return HELPER_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))
    ? HELPER : APP;
}

const server = http.createServer((req, res) => {
  const target = targetFor(new URL(req.url, "http://x").pathname);
  const proxyReq = http.request(
    { host: target.host, port: target.port, method: req.method, path: req.url, headers: req.headers },
  );
  proxyReq.on("response", (upstream) => {
    res.writeHead(upstream.statusCode ?? 502, upstream.headers);
    guard(upstream).pipe(res);
  });
  proxyReq.on("error", (err) => {
    if (!res.headersSent) { res.writeHead(502, { "Content-Type": "text/plain" }); res.end("proxy error"); }
    else res.end();
  });
  req.on("error", noop);
  guard(req).pipe(proxyReq);
  res.on("error", noop);
});

server.on("upgrade", (req, socket, head) => {
  const target = targetFor(new URL(req.url, "http://x").pathname);
  const proxyReq = http.request(
    { host: target.host, port: target.port, method: req.method, path: req.url, headers: req.headers },
  );
  proxyReq.on("upgrade", (upstream, upstreamSocket) => {
    socket.write("HTTP/1.1 101 Switching Protocols\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n\r\n");
    if (head?.length) upstreamSocket.write(head);
    guard(upstreamSocket).pipe(socket);
    guard(socket).pipe(upstreamSocket);
  });
  proxyReq.on("error", () => guard(socket).destroy());
  guard(req).on("error", noop);
  guard(socket).on("error", noop);
  proxyReq.end();
});

server.on("clientError", (err, socket) => { guard(socket).destroy(); });

server.listen(8080, "0.0.0.0", () => {
  console.log("proxy on :8080 → app :3000 / helper :8400 (harden v2)");
});
