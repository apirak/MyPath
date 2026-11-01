import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // ชี้ไฟล์เดียว: host import ได้แค่ทางเข้าของ SDK (path ลึกอย่าง @learn/mypath/x resolve ไม่ได้)
    alias: [{ find: /^@learn\/mypath$/, replacement: fileURLToPath(new URL('./packages/mypath/src/index.ts', import.meta.url)) }],
  },
})
