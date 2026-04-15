import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Content-Security-Policy",
          value:
            process.env.NODE_ENV === "production"
              ? "script-src 'self' 'unsafe-inline'; connect-src 'self' http: https:;"
              : "script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' http: https: ws: wss:;",
        },
      ],
    },
  ],
};

export default nextConfig;
