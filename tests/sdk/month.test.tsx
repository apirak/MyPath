// @vitest-environment jsdom
// Smoke test หน้า Month ของ SDK: render ผ่านทางเข้าเดียว (@learn/mypath) ด้วย
// fixtures ของ host
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { MyPath, type MyPathData } from '@learn/mypath'
import { TODAY, mypathData } from '../../src/host/fixtures'

afterEach(cleanup)

const noop = () => {}
const renderMyPath = (data: MyPathData = mypathData, today: string = TODAY) =>
  render(
    <MyPath
      data={data}
      today={today}
      onPlanChange={noop}
      onBuyCourse={noop}
      onStartCourse={noop}
    />,
  )
const noSubjects: MyPathData = {
  ...mypathData,
  plan: {
    ...mypathData.plan,
    calendar: { ...mypathData.plan.calendar, subjects: [] },
  },
}

describe('Month', () => {
  it('มีแผน: หัววันนี้, คอร์สที่กำลังเรียน และกลุ่มถัดไป', () => {
    renderMyPath()
    expect(screen.getByText('ธันวาคม 2569')).toBeTruthy()
    expect(screen.getByText('วันนี้ · 5 ธ.ค. 69')).toBeTruthy()
    expect(screen.getByText('วันนี้ · กำลังเรียน')).toBeTruthy()
    expect(
      screen.getByText('Applied Math Admissions TCAS เล่ม 2 (For Dek70)'),
    ).toBeTruthy() // MATH.2 ต่อจาก MATH.1 (จบ 25 พ.ย.)
    expect(screen.getByText('ถัดไป')).toBeTruthy()
    // M1 วันที่ 20 อยู่ในกลุ่มถัดไป
    expect(screen.getByText('Mock ลองสนาม')).toBeTruthy()
  })

  it('ไม่มีวิชาที่เรียน: แสดง empty state', () => {
    renderMyPath(noSubjects)
    expect(screen.getByText('วางแผนการเรียนผ่านคณะที่เลือก')).toBeTruthy()
    expect(screen.queryByText('ถัดไป')).toBeNull()
  })

  it('สองตัวพร้อมกันไม่ปนกัน', () => {
    const a = renderMyPath(mypathData, TODAY).container
    const b = renderMyPath(noSubjects, '2027-03-10').container
    expect(within(a).getByText('ธันวาคม 2569')).toBeTruthy()
    expect(within(a).queryByText('วางแผนการเรียนผ่านคณะที่เลือก')).toBeNull()
    expect(within(b).getByText('มีนาคม 2570')).toBeTruthy()
    expect(within(b).getByText('วางแผนการเรียนผ่านคณะที่เลือก')).toBeTruthy()
  })

  it('เปลี่ยน prop today แล้วหน้าตาเปลี่ยนตาม', () => {
    const { rerender } = renderMyPath()
    rerender(
      <MyPath
        data={mypathData}
        today="2026-12-20"
        onPlanChange={noop}
        onBuyCourse={noop}
        onStartCourse={noop}
      />,
    )
    expect(screen.getByText('วันนี้ · 20 ธ.ค. 69')).toBeTruthy()
    expect(screen.queryByText('วันนี้ · 5 ธ.ค. 69')).toBeNull()
  })

  it('‹ › เลื่อนเดือนได้แค่ในแกน', () => {
    renderMyPath()
    fireEvent.click(screen.getByLabelText('Next month'))
    expect(screen.getByText('มกราคม 2570')).toBeTruthy()
    for (let i = 0; i < 6; i++)
      fireEvent.click(screen.getByLabelText('Previous month')) // กดเกินขอบ
    // เดือนแรกของแกน (TGAT.1 เริ่ม 1 ส.ค. 69)
    expect(screen.getByText('สิงหาคม 2569')).toBeTruthy()
    expect(
      (screen.getByLabelText('Previous month') as HTMLButtonElement).disabled,
    ).toBe(true)
  })

  it('ไม่ส่ง today: ใช้วันตามเวลาไทยจากนาฬิกาเครื่อง', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    // UTC ยังเป็นวันที่ 4 แต่เวลาไทยเป็น 01:30 ของวันที่ 5
    vi.setSystemTime(new Date('2026-12-04T18:30:00Z'))
    try {
      render(
        <MyPath
          data={mypathData}
          onPlanChange={noop}
          onBuyCourse={noop}
          onStartCourse={noop}
        />,
      )
      expect(screen.getByText('วันนี้ · 5 ธ.ค. 69')).toBeTruthy()
    } finally {
      vi.useRealTimers()
    }
  })

  it('today ผิดรูป = ไม่ได้ส่ง (ไม่พัง)', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-12-05T03:00:00Z'))
    try {
      renderMyPath(mypathData, '2026/12/05')
      expect(screen.getByText('วันนี้ · 5 ธ.ค. 69')).toBeTruthy()
    } finally {
      vi.useRealTimers()
    }
  })
})
