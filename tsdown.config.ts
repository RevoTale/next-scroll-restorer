import { defineConfig } from 'tsdown';

export default defineConfig({
	clean: true,
	dts: true,
	entry: ['src/**/*'],
	fixedExtension: false,
	format: ['cjs', 'esm'],
	sourcemap: true,
	unbundle: true,
});
