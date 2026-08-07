import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // data/*.json은 동적 fs 경로로 읽어서 자동 트레이싱에 안 잡히므로 명시적으로 번들에 포함시킨다.
  outputFileTracingIncludes: {
    "/*": ["./data/**/*.json"],
  },
};

export default nextConfig;
