import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// library mode: รูปฝังเป็น data URI เสมอ, CSS รวมเป็น dist/style.css
// (docs/mypath-sdk-plan.md "Build และ publish")
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
