import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	devIndicators: false,
	distDir: process.env.NEXT_BUILD_DIST_DIR ?? ".next",
	reactCompiler: true,
	...(process.env.NEXT_BUILD_BUNDLER === "webpack"
		? {}
		: {
				experimental: {
					turbopackRustReactCompiler: true,
				},
			}),
};

export default nextConfig;
