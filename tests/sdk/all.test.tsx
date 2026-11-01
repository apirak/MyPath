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
const MATH1_MOVED = /เล่ม 1 .* · 5 ต.ค. 69 – 29 พ.ย. 69$/ // ลาก 7 วัน: 8 ต.ค. (พฤ.) → snap จ. 5 ต.ค.
// ลากผ่านทุกระยะใน days (หน่วยวัน) แล้วค้างไว้ — คืนฟังก์ชันปล่อย
const press = (title: RegExp, ...days: number[]) => {
  const grip = screen.getByTitle(title).querySelector('.mp-tp-grip')!
  fireEvent.pointerDown(grip, { pointerId: 1, clientX: 0 })
  for (const d of days) fireEvent.pointerMove(grip, { pointerId: 1, clientX: d * PX_PER_DAY })
  return () => fireEvent.pointerUp(grip, { pointerId: 1 })
}
function EchoHost() {
  const [plan, setPlan] = useState(mypathData.plan)
  return <MyPath data={{ ...mypathData, plan }} today={TODAY} onPlanChange={setPlan} onBuyCourse={noop} onStartCourse={noop} />
}

describe('ลากหัวคอร์ส (controlled)', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: AXIS_DAYS * PX_PER_DAY } as DOMRect)
    HTMLElement.prototype.setPointerCapture ??= () => {}
  })

  it('ระหว่างลากแสดงแผนชั่วคราว ยิง onPlanChange ครั้งเดียวตอนปล่อย', () => {
    const onPlanChange = vi.fn()
    render(<MyPath data={mypathData} today={TODAY} onPlanChange={onPlanChange} onBuyCourse={noop} onStartCourse={noop} />)
    openAll()
    const release = press(MATH1, 14, 21, 7) // ผ่านหลายวันจันทร์ แล้วกลับมาที่ 5 ต.ค.
    expect(screen.getByTitle(MATH1_MOVED)).toBeTruthy()
    expect(onPlanChange).not.toHaveBeenCalled()
    release()
    expect(onPlanChange).toHaveBeenCalledTimes(1)
    const sent: StudentPlan = onPlanChange.mock.calls[0][0]
    expect(sent.courses.find(c => c.courseId === 'MATH.1')?.startDate).toBe('2026-10-05')
  })

  it('host ไม่ส่งแผนกลับ: ปล่อยแล้วหน้าจอกลับไปแผนเดิม', () => {
    render(<MyPath data={mypathData} today={TODAY} onPlanChange={noop} onBuyCourse={noop} onStartCourse={noop} />)
    openAll()
    press(MATH1, 7)()
    expect(screen.getByTitle(MATH1)).toBeTruthy()
  })

  it('host ส่งแผนกลับ: คอร์สขยับ และคอร์สที่ตาม Course ก่อนหน้าขยับตาม', () => {
    render(<EchoHost />)
    openAll()
    press(MATH1, 7)()
    expect(screen.getByTitle(MATH1_MOVED)).toBeTruthy()
    expect(screen.getByTitle(/เล่ม 2 .* · 30 พ.ย. 69 – 24 ม.ค. 70$/)).toBeTruthy()
  })

  it('ไม่ได้ขยับถึงวันจันทร์ใหม่: ไม่ยิง', () => {
    const onPlanChange = vi.fn()
    render(<MyPath data={mypathData} today={TODAY} onPlanChange={onPlanChange} onBuyCourse={noop} onStartCourse={noop} />)
    openAll()
    press(MATH1)()
    expect(onPlanChange).not.toHaveBeenCalled()
  })

  it('แกนไม่ขยับระหว่างลาก แล้วคิดใหม่ตอนปล่อย', () => {
    render(<EchoHost />)
    openAll()
    // MATH.EX จบ 11 เม.ย. 71 — ดันไป 8 สัปดาห์ แผนจบ มิ.ย. 71
    const release = press(/^.* · 1 มี.ค. 71 – 11 เม.ย. 71$/, 56)
    expect(screen.getByTitle(/ · 24 เม.ย. 71 – 4 มิ.ย. 71$/)).toBeTruthy() // แผนชั่วคราว
    expect(screen.getByText('ส.ค. 69 – เม.ย. 71')).toBeTruthy()
    release()
    expect(screen.getByText('ส.ค. 69 – มิ.ย. 71')).toBeTruthy()
  })
})
