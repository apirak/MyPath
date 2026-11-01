// @vitest-environment jsdom
// หน้า All ของ SDK: render ผ่านทางเข้าเดียว (@learn/mypath) ด้วย fixtures ของ host
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { MyPath, type MyPathData, type StudentPlan } from '@learn/mypath'
import { TODAY, mypathData } from '../../src/host/fixtures'

afterEach(() => { cleanup(); vi.restoreAllMocks() })

const noop = () => {}
const renderMyPath = (data: MyPathData = mypathData) =>
  render(<MyPath data={data} today={TODAY} onPlanChange={noop} onBuyCourse={noop} onStartCourse={noop} />)

describe('สลับ Month / All', () => {
  it('เดือนที่เลือกใน Month ไม่หายเมื่อไป All แล้วกลับมา', () => {
    renderMyPath()
    fireEvent.click(screen.getByLabelText('Next month'))
    expect(screen.getByText('มกราคม 2570')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'All' }))
    expect(screen.queryByText('มกราคม 2570')).toBeNull()
    expect(screen.queryByLabelText('Next month')).toBeNull() // All ไม่มีปุ่มเลื่อน
    fireEvent.click(screen.getByRole('button', { name: 'Month' }))
    expect(screen.getByText('มกราคม 2570')).toBeTruthy()
  })
})

const openAll = () => fireEvent.click(screen.getByRole('button', { name: 'All' }))
const noSubjects: MyPathData = { ...mypathData, plan: { ...mypathData.plan, calendar: { ...mypathData.plan.calendar, subjects: [] } } }

describe('All', () => {
  it('มีแผน: แกนทั้งแผน, แถววิชา, ธงสอบ และกราฟชั่วโมง', () => {
    renderMyPath()
    openAll()
    expect(screen.getByText('ส.ค. 69 – เม.ย. 71')).toBeTruthy()
    expect(screen.getByText('แผนการเรียน')).toBeTruthy()
    expect(screen.getByTitle('Applied Math Admissions TCAS เล่ม 2 (For Dek70) · 26 พ.ย. 69 – 20 ม.ค. 70')).toBeTruthy()
    expect(screen.getByText('Mock ลองสนาม')).toBeTruthy()
    expect(screen.getByText('ชั่วโมงเรียน/สัปดาห์')).toBeTruthy()
  })

  it('ไม่มีวิชาที่เรียน: แสดง empty state', () => {
    renderMyPath(noSubjects)
    openAll()
    expect(screen.getByText('วางแผนการเรียนผ่านคณะที่เลือก')).toBeTruthy()
    expect(screen.queryByText('แผนการเรียน')).toBeNull()
  })
})

// ลากหัวคอร์สใน jsdom: แกนกว้าง 10 px ต่อวัน (ส.ค. 69 – เม.ย. 71)
const PX_PER_DAY = 10
const AXIS_DAYS = (Date.UTC(2028, 4, 1) - Date.UTC(2026, 7, 1)) / 86_400_000
const MATH1 = /^Applied Math Admissions TCAS เล่ม 1 .* · 1 ต.ค. 69 – 25 พ.ย. 69$/
const dragByDays = (title: RegExp, days: number) => {
  const grip = screen.getByTitle(title).querySelector('.mp-tp-grip')!
  fireEvent.pointerDown(grip, { pointerId: 1, clientX: 0 })
  fireEvent.pointerMove(grip, { pointerId: 1, clientX: days * PX_PER_DAY })
  fireEvent.pointerUp(grip, { pointerId: 1 })
}

describe('ลากหัวคอร์ส (controlled)', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: AXIS_DAYS * PX_PER_DAY } as DOMRect)
    HTMLElement.prototype.setPointerCapture ??= () => {}
  })

  it('host ไม่ส่งแผนกลับ: ได้แผนที่มีวันเริ่มต้นใหม่ แต่หน้าจอยังแสดงแผนเดิม', () => {
    const onPlanChange = vi.fn()
    render(<MyPath data={mypathData} today={TODAY} onPlanChange={onPlanChange} onBuyCourse={noop} onStartCourse={noop} />)
    openAll()
    dragByDays(MATH1, 7) // 8 ต.ค. (พฤ.) → snap จ. 5 ต.ค.
    expect(onPlanChange).toHaveBeenCalledTimes(1)
    const sent: StudentPlan = onPlanChange.mock.calls[0][0]
    expect(sent.courses.find(c => c.courseId === 'MATH.1')?.startDate).toBe('2026-10-05')
    expect(screen.getByTitle(MATH1)).toBeTruthy()
  })

  it('host ส่งแผนกลับ: คอร์สขยับ และคอร์สที่ตาม Course ก่อนหน้าขยับตาม', () => {
    function Host() {
      const [plan, setPlan] = useState(mypathData.plan)
      return <MyPath data={{ ...mypathData, plan }} today={TODAY} onPlanChange={setPlan} onBuyCourse={noop} onStartCourse={noop} />
    }
    render(<Host />)
    openAll()
    dragByDays(MATH1, 7)
    expect(screen.getByTitle(/เล่ม 1 .* · 5 ต.ค. 69 – 29 พ.ย. 69$/)).toBeTruthy()
    expect(screen.getByTitle(/เล่ม 2 .* · 30 พ.ย. 69 – 24 ม.ค. 70$/)).toBeTruthy()
  })
})
