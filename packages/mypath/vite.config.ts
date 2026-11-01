import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Library mode: images are always inlined as data URIs and all CSS is bundled
// into dist/style.css, so hosts need no asset pipeline
// (docs/mypath-sdk-plan.md, Build section).
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'style',
    },
    rollupOptions: { external: ['react', 'react-dom', 'react/jsx-runtime'] },
  },
})
