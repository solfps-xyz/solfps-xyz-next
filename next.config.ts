import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Add rule for .wasm files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Ensure .wasm files are treated as assets
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    return config;
  },
  // Add headers for correct MIME types
  async headers() {
    return [
      {
        source: "/game/:path*.wasm",
        headers: [
          {
            key: "Content-Type",
            value: "application/wasm",
          },
        ],
      },
      {
        source: "/game/:path*.data",
        headers: [
          {
            key: "Content-Type",
            value: "application/octet-stream",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
