import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `next build` and `next dev` share ./.next by default, and running a build
  // while the dev server is up leaves a half-written directory behind ("no such
  // file or directory ... .next/server/app/page.js"). Set NEXT_DIST_DIR to
  // build somewhere else instead of stopping the dev server:
  //   NEXT_DIST_DIR=.next-build npx next build
  distDir: process.env.NEXT_DIST_DIR || ".next",

  // The .pkt files live outside of `public/` and are read by the download
  // route at request time, so they must be traced into the deployment bundle.
  outputFileTracingIncludes: {
    "/api/download": ["./labs/**"],
  },
};

export default nextConfig;
