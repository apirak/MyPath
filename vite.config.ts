import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

const at = (path: string) => fileURLToPath(new URL(path, import.meta.url))
// MYPATH_DIST=1 (pnpm verify:package): host ใช้ไฟล์ที่ build แล้วแบบคนนอก · ปกติชี้ source เพื่อ HMR
const sdk = process.env.MYPATH_DIST
  ? { entry: './packages/mypath/dist/index.js', css: './packages/mypath/dist/style.css' }
  : { entry: './packages/mypath/src/index.ts', css: './packages/mypath/src/mypath.css' }

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // ชี้ทีละไฟล์: host import ได้แค่ทางเข้าของ SDK กับ style.css (path ลึกอย่าง @learn/mypath/x resolve ไม่ได้)
    alias: [
      { find: /^@learn\/mypath$/, replacement: at(sdk.entry) },
      { find: /^@learn\/mypath\/style\.css$/, replacement: at(sdk.css) },
    ],
  },
})
