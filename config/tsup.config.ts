import {defineConfig, Options} from 'tsup'

export default defineConfig({
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
}) as Options
