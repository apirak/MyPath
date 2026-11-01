// @vitest-environment jsdom
// Small shared UI pieces tested on their own, so a failure names the piece
// instead of a whole <MyPath> screen.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ExamEvent } from '../../packages/mypath/src/types'
import { MyPathProvider } from '../../packages/mypath/src/MyPathProvider'
import { courseButton } from '../../packages/mypath/src/ui/course/openCourse'
import { useOwned } from '../../packages/mypath/src/ui/components/useOwned'
import Plate from '../../packages/mypath/src/ui/month/Plate'
import { TODAY, mypathData } from '../../src/host/fixtures'

afterEach(cleanup)

describe('courseButton', () => {
  it('คลิก, Enter และ Space เปิดคอร์ส ปุ่มอื่นไม่เปิด', () => {
    const open = vi.fn()
    render(<span {...courseButton(open, 'c1')}>คอร์ส</span>)
    const card = screen.getByRole('button', { name: 'คอร์ส' })
    fireEvent.click(card)
    fireEvent.keyDown(card, { key: 'Enter' })
    fireEvent.keyDown(card, { key: ' ' })
    fireEvent.keyDown(card, { key: 'a' })
    expect(open.mock.calls).toEqual([['c1'], ['c1'], ['c1']])
  })
})

describe('useOwned', () => {
  const exam: ExamEvent = { id: 'e1', date: TODAY, label: 'A', kind: 'exam' }
  const mock = (id: string): ExamEvent => ({ ...exam, id, kind: 'mock' })

  function Probe() {
    const owned = useOwned()
    return (
      <output>
        {[
          owned.course('c-owned'),
          owned.course('c-other'),
          owned.event(exam),
          owned.event(mock('m-owned')),
          owned.event(mock('m-other')),
        ].join(',')}
      </output>
    )
  }

  it('คอร์สและ Mock ดูจาก owned ส่วนสอบจริงนับว่ามีเสมอ', () => {
    render(
      <MyPathProvider
        data={{ ...mypathData, owned: ['c-owned', 'm-owned'] }}
        today={TODAY}
        onPlanChange={() => {}}
        onStartCourse={() => {}}
      >
        <Probe />
      </MyPathProvider>,
    )
    expect(screen.getByRole('status').textContent).toBe(
      'true,false,true,true,false',
    )
  })
})

describe('Plate', () => {
  it('ซื้อแล้ว = ทึบสีวิชา · ยังไม่ซื้อ = พื้นอ่อนขอบสี', () => {
    render(
      <>
        <Plate text="owned" color="#123456" owned />
        <Plate text="not" color="#123456" owned={false} />
      </>,
    )
    const owned = screen.getByText('owned').style,
      not = screen.getByText('not').style
    expect([owned.color, owned.boxShadow]).toEqual(['rgb(255, 255, 255)', ''])
    expect(not.boxShadow).toContain('inset')
  })
})
