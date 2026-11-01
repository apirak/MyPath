// Prettier ไม่ตัดคอมเมนต์และ string — สคริปต์นี้กันบรรทัดเกิน 80 ตัวอักษรที่หลุดมา
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const MAX = 80
const files = execSync(
  'git ls-files -co --exclude-standard "*.ts" "*.tsx" "*.css"',
  {
    encoding: 'utf8',
  },
)
  .split('\n')
  .filter(Boolean)

let count = 0
for (const file of files)
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if ([...line].length <= MAX) return
      count++
      console.error(`${file}:${i + 1} ยาว ${[...line].length} ตัวอักษร`)
    })

if (count) {
  console.error(`\n${count} บรรทัดยาวเกิน ${MAX} ตัวอักษร`)
  process.exit(1)
}
