import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev-server access from the tailnet IP (and ngrok-style public hosts).
  // Next's dev-origin check (DNS-rebinding protection) 403s JS chunks for
  // non-allowlisted origins, which breaks hydration/interactivity off localhost.
  allowedDevOrigins: [
    "100.86.95.34",
    "192.168.29.137",
    "localhost",
    "127.0.0.1",
    "::1",
    "ed52-49-36-89-84.ngrok-free.app",
    "100.86.95.34:8080",
  ],
};

export default nextConfig;
