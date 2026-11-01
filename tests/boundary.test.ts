// Layer boundary (docs/mypath-sdk-plan.md "แยก host กับ SDK"): the host
// reaches the SDK only through @learn/mypath.
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = resolve(__dirname, '..')

// import x from 'a' · import 'a' · import('a') · export … from 'a' ·
// @import 'a' (CSS)
const IMPORT = /(?:\bfrom\s*|\bimport\s*\(?\s*|@import\s+)(['"])([^'"]+)\1/g
// @import url('a') · @import url(a) (CSS)
const CSS_IMPORT_URL = /@import\s+url\(\s*(['"]?)([^'")\s]+)\1\s*\)/g
// public/ paths the SDK must not reference. Checks every string, including
// CSS url() which is often unquoted.
const PUBLIC_PATH = /(['"`(])\/(?:mypath|cover)\//

// `file` is relative to ROOT; returns a reason for every boundary crossing.
function violations(file: string, source: string): string[] {
  const out: string[] = []
  for (const [, , spec] of [
    ...source.matchAll(IMPORT),
    ...source.matchAll(CSS_IMPORT_URL),
  ]) {
    // Normalize relative and '/…' (Vite resolves from root) to ROOT-relative
    // so they can be compared with each layer's folder.
    const local = spec.startsWith('.') || spec.startsWith('/')
    const target = spec.startsWith('.')
      ? relative(ROOT, resolve(ROOT, dirname(file), spec))
      : spec.replace(/^\//, '')
    const sdk =
      target.startsWith('packages/mypath') ||
      spec === '@learn/mypath' ||
      spec.startsWith('@learn/mypath/')
    if (file.startsWith('packages/mypath/')) {
      if (local && !target.startsWith('packages/mypath/'))
        out.push(`ออกนอก package: ${spec}`)
      // The SDK depends only on react; its icons are its own SVGs.
      if (spec.startsWith('react-router') || spec === 'lucide-react')
        out.push(`dependency ของ host: ${spec}`)
    } else if (file.startsWith('src/host/')) {
      if (sdk && spec !== '@learn/mypath' && spec !== '@learn/mypath/style.css')
        out.push(`ไม่ผ่าน @learn/mypath: ${spec}`)
    }
  }
  if (file.startsWith('packages/mypath/') && PUBLIC_PATH.test(source))
    out.push('อ้างไฟล์ใน public/')
  return out
}

const sourceFiles = (dir: string) =>
  (readdirSync(join(ROOT, dir), { recursive: true }) as string[])
    .filter(name => /\.(tsx?|css)$/.test(name))
    .map(name => join(dir, name))

describe('ขอบเขต: โค้ดจริง', () => {
  it.each(['packages/mypath/src', 'src/host'])(
    '%s ไม่ import ข้ามขอบเขต',
    dir => {
      const files = sourceFiles(dir)
      expect(files.length).toBeGreaterThan(0)
      const found = files.flatMap(file =>
        violations(file, readFileSync(join(ROOT, file), 'utf8')).map(
          reason => `${file}: ${reason}`,
        ),
      )
      expect(found).toEqual([])
    },
  )
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
    [
      'packages/mypath/src/mypath.css',
      '.x{background:url(/mypath/plan-header-bg.png)}',
    ],
    [
      'packages/mypath/src/mypath.css',
      "@import url('../../../src/index.css');",
    ],
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
    [host, "import '@learn/mypath/style.css'"],
    ['packages/mypath/src/mypath.css', "@import url('./ui/month.css');"],
    ['packages/mypath/src/mypath.css', '@import url(./ui/month.css);'],
  ])('ผ่าน %s: %s', (file, source) => {
    expect(violations(file, source)).toEqual([])
  })
})

// Every SDK stylesheet; @import lines are skipped (they aren't selectors).
const sdkCss = () =>
  sourceFiles('packages/mypath/src')
    .filter(file => file.endsWith('.css'))
    .map(file => readFileSync(join(ROOT, file), 'utf8'))
    .join('\n')
    .replace(/^@import .*$/gm, '')

describe('ขอบเขต: CSS ของ SDK', () => {
  it('ทุก selector อยู่ใต้ .mypath-root', () => {
    const css = sdkCss().replace(/\/\*[\s\S]*?\*\//g, '')
    const selectors = [...css.matchAll(/([^{}]+)\{/g)]
      .map(([, s]) => s.trim())
      .filter(s => !s.startsWith('@'))
      .flatMap(s => s.split(','))
    expect(selectors.length).toBeGreaterThan(0)
    // @keyframes steps (from/to/0%) are not selectors.
    expect(
      selectors
        .map(s => s.trim())
        .filter(
          s =>
            !/^(from|to|[\d.]+%)$/.test(s) &&
            !/^(\.mypath-root|:where\(\.mypath-root\))([\s.:[]|$)/.test(s),
        ),
    ).toEqual([])
  })

  it('ชื่อ @keyframes ขึ้นต้นด้วย mp- (ชื่อเป็น global ชนกับ host ได้)', () => {
    const css = sdkCss()
    expect(
      [...css.matchAll(/@keyframes\s+([\w-]+)/g)]
        .map(([, name]) => name)
        .filter(name => !name.startsWith('mp-')),
    ).toEqual([])
  })
})

describe('ขอบเขต: package ของ SDK', () => {
  const pkg = JSON.parse(
    readFileSync(join(ROOT, 'packages/mypath/package.json'), 'utf8'),
  )

  it('dependency มีแค่ peer react / react-dom (ไม่มี lucide-react)', () => {
    expect(pkg.dependencies).toBeUndefined()
    expect(pkg.peerDependencies).toEqual({
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    })
    expect(JSON.stringify(pkg)).not.toContain('lucide')
  })

  it('exports เปิดแค่ทางเข้าหลักกับ style.css', () => {
    expect(Object.keys(pkg.exports)).toEqual(['.', './style.css'])
  })

  // Library mode inlines every image as a data URI; assume base64 (4/3
  // growth), the worst case.
  it('รูปที่ฝังใน bundle รวมกันไม่เกิน 100 KB', () => {
    const dir = join(ROOT, 'packages/mypath/src/assets')
    const bytes = (readdirSync(dir, { recursive: true }) as string[])
      .filter(name => /\.(png|jpe?g|svg|webp|gif)$/.test(name))
      .reduce((sum, name) => sum + readFileSync(join(dir, name)).length, 0)
    expect((bytes * 4) / 3).toBeLessThanOrEqual(100 * 1024)
  })
})
