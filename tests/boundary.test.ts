// ขอบเขต 3 ชั้น (docs/mypath-sdk-plan.md "แยก host กับ SDK"): host → SDK ได้ทางเดียวผ่าน @learn/mypath
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = resolve(__dirname, '..')

// import x from 'a' · import 'a' · import('a') · export … from 'a' · @import 'a' (CSS)
const IMPORT = /(?:\bfrom\s*|\bimport\s*\(?\s*|@import\s+)(['"])([^'"]+)\1/g
// @import url('a') · @import url(a) (CSS)
const CSS_IMPORT_URL = /@import\s+url\(\s*(['"]?)([^'")\s]+)\1\s*\)/g
// path ใน public/ ที่ SDK อ้างไม่ได้ — ตรวจทุก string รวม url() ของ CSS ที่มักไม่มี quote
const PUBLIC_PATH = /(['"`(])\/(?:mypath|cover)\//

// file เป็น path จาก ROOT, คืนเหตุผลของทุกจุดที่ข้ามขอบเขต
function violations(file: string, source: string): string[] {
  const out: string[] = []
  for (const [, , spec] of [...source.matchAll(IMPORT), ...source.matchAll(CSS_IMPORT_URL)]) {
    // relative และ '/…' (Vite resolve จาก root) → path จาก ROOT เพื่อเทียบกับโฟลเดอร์ของแต่ละชั้น
    const local = spec.startsWith('.') || spec.startsWith('/')
    const target = spec.startsWith('.') ? relative(ROOT, resolve(ROOT, dirname(file), spec)) : spec.replace(/^\//, '')
    const sdk = target.startsWith('packages/mypath') || spec === '@learn/mypath' || spec.startsWith('@learn/mypath/')
    if (file.startsWith('packages/mypath/')) {
      if (local && !target.startsWith('packages/mypath/')) out.push(`ออกนอก package: ${spec}`)
      // SDK ไม่มี dependency นอกจาก react (ไอคอนเป็น SVG ของ SDK เอง)
      if (spec.startsWith('react-router') || spec === 'lucide-react') out.push(`dependency ของ host: ${spec}`)
    } else if (file.startsWith('src/host/')) {
      if (sdk && spec !== '@learn/mypath') out.push(`ไม่ผ่าน @learn/mypath: ${spec}`)
    }
  }
  if (file.startsWith('packages/mypath/') && PUBLIC_PATH.test(source)) out.push('อ้างไฟล์ใน public/')
  return out
}

const sourceFiles = (dir: string) => (readdirSync(join(ROOT, dir), { recursive: true }) as string[])
  .filter(name => /\.(tsx?|css)$/.test(name))
  .map(name => join(dir, name))

describe('ขอบเขต: โค้ดจริง', () => {
  it.each(['packages/mypath/src', 'src/host'])('%s ไม่ import ข้ามขอบเขต', dir => {
    const files = sourceFiles(dir)
    expect(files.length).toBeGreaterThan(0)
    const found = files.flatMap(file => violations(file, readFileSync(join(ROOT, file), 'utf8')).map(reason => `${file}: ${reason}`))
    expect(found).toEqual([])
  })
})

describe('ขอบเขต: เทสต์จับการ import ข้ามได้จริง', () => {
  const sdk = 'packages/mypath/src/ui/Month.tsx'
  const host = 'src/host/pages/MyPathTab.tsx'
  it.each([
    [sdk, "import plan from '../../../../src/host/fixtures'"],
    [sdk, "import { Link } from 'react-router-dom'"],
    [sdk, "const img = '/mypath/graduate-cap.png'"],
    [sdk, 'const cover = `/cover/Math.png`'],
    [sdk, "import { X } from 'lucide-react'"],
    [sdk, "import fixtures from '/src/host/fixtures'"],
    ['packages/mypath/src/mypath.css', '.x{background:url(/mypath/plan-header-bg.png)}'],
    ['packages/mypath/src/mypath.css', "@import url('../../../src/index.css');"],
    ['packages/mypath/src/mypath.css', '@import url(../../../src/index.css);'],
    [host, "import { MyPath } from '../../../packages/mypath/src'"],
    [host, "import types from '@learn/mypath/types'"],
  ])('%s: %s', (file, source) => {
    expect(violations(file, source)).not.toEqual([])
  })

  it.each([
    [sdk, "import type { MyPathProps } from '../types'"],
    [sdk, "import { useState } from 'react'"],
    [host, "import { MyPath } from '@learn/mypath'"],
    ['packages/mypath/src/mypath.css', "@import url('./ui/month.css');"],
    ['packages/mypath/src/mypath.css', '@import url(./ui/month.css);'],
  ])('ผ่าน %s: %s', (file, source) => {
    expect(violations(file, source)).toEqual([])
  })
})

describe('ขอบเขต: CSS ของ SDK', () => {
  it('ทุก selector อยู่ใต้ .mypath-root', () => {
    const css = readFileSync(join(ROOT, 'packages/mypath/src/mypath.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    const selectors = [...css.matchAll(/([^{}]+)\{/g)].map(([, s]) => s.trim()).filter(s => !s.startsWith('@')).flatMap(s => s.split(','))
    expect(selectors.length).toBeGreaterThan(0)
    // ขั้นของ @keyframes (from/to/0%) ไม่ใช่ selector
    expect(selectors.map(s => s.trim()).filter(s => !/^(from|to|[\d.]+%)$/.test(s) && !/^(\.mypath-root|:where\(\.mypath-root\))([\s.:[]|$)/.test(s))).toEqual([])
  })

  it('ชื่อ @keyframes ขึ้นต้นด้วย mp- (ชื่อเป็น global ชนกับ host ได้)', () => {
    const css = readFileSync(join(ROOT, 'packages/mypath/src/mypath.css'), 'utf8')
    expect([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map(([, name]) => name).filter(name => !name.startsWith('mp-'))).toEqual([])
  })
})
