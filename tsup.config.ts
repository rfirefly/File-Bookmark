import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/extension.ts'],
  format: ['cjs'],
  shims: false,
  dts: false,
  clean: true,
  sourcemap: process.env.NODE_ENV === 'development',
  env: {
    NODE_ENV: process.env.NODE_ENV || 'production',
  },
  external: [
    'vscode',
  ],
})
