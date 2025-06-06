import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/**/*'],
    sourcemap: true,
    clean: true,
    format: ['cjs', 'esm'],
    dts: true,
    bundle: false,
    esbuildOptions(options) {
        options.drop = ['console']; // this is the esbuild option
    },
})