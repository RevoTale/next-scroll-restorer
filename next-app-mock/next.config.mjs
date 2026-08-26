import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('..', import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
	outputFileTracingRoot: workspaceRoot,
	turbopack: {
		root: workspaceRoot,
	},
};

export default nextConfig;
