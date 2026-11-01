// ขอบเขต 3 ชั้น (docs/mypath-sdk-plan.md "แยก host กับ SDK"): host → SDK ได้ทางเดียวผ่าน @learn/mypath
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = resolve(__dirname, '..')

// import x from 'a' · import 'a' · import('a') · export … from 'a' · @import 'a' (CSS)
const IMPORT = /(?:\bfrom\s*|\bimport\s*\(?\s*|@import\s+)(['"])([^'"]+)\1/g
// path ใน public/ ที่ SDK อ้างไม่ได้ — ตรวจทุก string ไม่ใช่แค่ import
const PUBLIC_PATH = /(['"`])\/(?:mypath|cover)\//

// file เป็น path จาก ROOT, คืนเหตุผลของทุกจุดที่ข้ามขอบเขต
function violations(file: string, source: string): string[] {
  const out: string[] = []
  for (const [, , spec] of source.matchAll(IMPORT)) {
    // relative → path จาก ROOT เพื่อเทียบกับโฟลเดอร์ของแต่ละชั้น
    const target = spec.startsWith('.') ? relative(ROOT, resolve(ROOT, dirname(file), spec)) : spec
    if (file.startsWith('packages/mypath/')) {
      if (spec.startsWith('.') && !target.startsWith('packages/mypath/')) out.push(`ออกนอก package: ${spec}`)
      if (spec.startsWith('react-router')) out.push(`react-router: ${spec}`)
    } else if (file.startsWith('src/host/')) {
      if (target.includes('packages/mypath') || spec.startsWith('@learn/mypath/')) out.push(`ไม่ผ่าน @learn/mypath: ${spec}`)
    } else if (file.startsWith('src/prototype/')) {
      if (target.startsWith('src/host') || spec === '@learn/mypath' || spec.startsWith('@learn/mypath/')) out.push(`prototype พึ่ง host/SDK: ${spec}`)
    }
  }
  if (file.startsWith('packages/mypath/') && PUBLIC_PATH.test(source)) out.push('อ้างไฟล์ใน public/')
  return out
}

const sourceFiles = (dir: string) => (readdirSync(join(ROOT, dir), { recursive: true }) as string[])
  .filter(name => /\.(tsx?|css)$/.test(name))
  .map(name => join(dir, name))

describe('ขอบเขต: โค้ดจริง', () => {
  it.each(['packages/mypath/src', 'src/host', 'src/prototype'])('%s ไม่ import ข้ามขอบเขต', dir => {
    const files = sourceFiles(dir)
    expect(files.length).toBeGreaterThan(0)
    const found = files.flatMap(file => violations(file, readFileSync(join(ROOT, file), 'utf8')).map(reason => `${file}: ${reason}`))
    expect(found).toEqual([])
  })
})

describe('ขอบเขต: เทสต์จับการ import ข้ามได้จริง', () => {
  const sdk = 'packages/mypath/src/ui/Month.tsx'
  const host = 'src/host/pages/MyPathTab.tsx'
  const proto = 'src/prototype/pages/MyPath.tsx'
  it.each([
    [sdk, "import plan from '../../../../src/prototype/mypath/plan'"],
    [sdk, "import { Link } from 'react-router-dom'"],
    [sdk, "const img = '/mypath/graduate-cap.png'"],
    [sdk, 'const cover = `/cover/Math.png`'],
    [host, "import { MyPath } from '../../../packages/mypath/src'"],
    [host, "import types from '@learn/mypath/types'"],
    [proto, "import BottomNav from '../../host/components/BottomNav'"],
    [proto, "import { MyPath } from '@learn/mypath'"],
  ])('%s: %s', (file, source) => {
    expect(violations(file, source)).not.toEqual([])
  })

  it.each([
    [sdk, "import type { MyPathProps } from '../types'"],
    [sdk, "import { useState } from 'react'"],
    [host, "import { MyPath } from '@learn/mypath'"],
    [proto, "import HeaderButton from '../components/HeaderButton'"],
  ])('ผ่าน %s: %s', (file, source) => {
    expect(violations(file, source)).toEqual([])
  })
})
