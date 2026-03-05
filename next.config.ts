import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Catalyst SDK on the server; never bundle it for the client.
  serverExternalPackages: ["@zcatalyst/datastore", "@zcatalyst/auth", "@zcatalyst/transport"],

  // Fix: tell Turbopack the workspace root is this directory so it does not
  // walk up and pick up a lockfile from a parent directory.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
