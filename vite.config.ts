import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

const abs = (path: string) => fileURLToPath(new URL(path, import.meta.url))
// MYPATH_DIST=1 (pnpm verify:package): the host consumes the built files like
// an outside app would. Otherwise point at source for HMR.
const sdkPaths = process.env.MYPATH_DIST
  ? {
      entry: './packages/mypath/dist/index.js',
      css: './packages/mypath/dist/style.css',
    }
  : {
      entry: './packages/mypath/src/index.ts',
      css: './packages/mypath/src/mypath.css',
    }

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Exact-match aliases: the host may import only the SDK entry and
    // style.css; deep paths like @learn/mypath/x must fail to resolve.
    alias: [
      { find: /^@learn\/mypath$/, replacement: abs(sdkPaths.entry) },
      { find: /^@learn\/mypath\/style\.css$/, replacement: abs(sdkPaths.css) },
    ],
  },
})
