// @vitest-environment jsdom
// Course detail sheet: opens from Month/All, settings emit a plan through
// onPlanChange, and buy/start buttons go through host callbacks.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { MyPath, type MyPathData } from '@learn/mypath'
import { TODAY, mypathData } from '../../src/host/fixtures'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const MATH2 = 'Applied Math Admissions TCAS เล่ม 2 (For Dek70)'
const renderMyPath = (data: MyPathData = mypathData) => {
  const props = {
    onPlanChange: vi.fn(),
    onBuyCourse: vi.fn(),
    onStartCourse: vi.fn(),
  }
  render(<MyPath data={data} today={TODAY} {...props} />)
  return props
}
const sheet = () => document.querySelector('.mp-cdp-sheet')

describe('เปิด/ปิดหน้ารายละเอียดคอร์ส', () => {
  it('กดการ์ดใน Month แล้วเปิด, Esc ปิดหลัง animation 280ms', () => {
    vi.useFakeTimers()
    renderMyPath()
    fireEvent.click(screen.getByText(MATH2))
    // a chapter of book 2
    expect(sheet()?.textContent).toContain('ความสัมพันธ์และฟังก์ชัน')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(sheet()).toBeTruthy() // still playing the close animation
    act(() => {
      vi.advanceTimersByTime(280)
    })
    expect(sheet()).toBeNull()
  })
})

const MATH1 = /^Applied Math Admissions TCAS เล่ม 1 /
const TPAT31 = /^ติวเข้มความถนัด วิศวะ/
const openAll = () =>
  fireEvent.click(screen.getByRole('button', { name: 'All' }))
const openFromAll = (title: RegExp) => {
  openAll()
  fireEvent.click(screen.getByTitle(title))
}
const follows = () =>
  // [weekly hours, start date]
  screen.getAllByLabelText('ตาม Course ก่อนหน้า') as HTMLInputElement[]
const courseIn = (plan: { courses: { courseId: string }[] }, id: string) =>
  plan.courses.find(c => c.courseId === id)

describe('เปิดจาก All', () => {
  it('กดแถบคอร์สแล้วเปิด, กดปุ่ม X ปิด', () => {
    vi.useFakeTimers()
    renderMyPath()
    openFromAll(MATH1)
    expect(screen.getByRole('dialog').textContent).toContain('เซต')
    fireEvent.click(screen.getByLabelText('ปิด'))
    act(() => {
      vi.advanceTimersByTime(280)
    })
    expect(sheet()).toBeNull()
  })

  it('คลิกพื้นหลังแล้วปิด, Space บนแถบคอร์สเปิดได้', () => {
    vi.useFakeTimers()
    renderMyPath()
    openFromAll(MATH1)
    fireEvent.click(document.querySelector('.mp-cdp-backdrop')!)
    act(() => {
      vi.advanceTimersByTime(280)
    })
    expect(sheet()).toBeNull()
    fireEvent.keyDown(screen.getByTitle(MATH1), { key: ' ' })
    expect(sheet()).toBeTruthy()
  })

  it('โฟกัสอยู่ในชีท: Tab วนในชีท แล้วคืนโฟกัสให้แถบที่เปิดตอนปิด', () => {
    vi.useFakeTimers()
    renderMyPath()
    openAll()
    const bar = screen.getByTitle(MATH1)
    bar.focus()
    fireEvent.keyDown(bar, { key: 'Enter' })
    const dialog = screen.getByRole('dialog')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(document.activeElement).toBe(dialog)
    const close = screen.getByLabelText('ปิด'),
      date = screen.getByLabelText('วันเริ่มต้น')
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(date) // Shift+Tab wraps to last
    fireEvent.keyDown(date, { key: 'Tab' })
    expect(document.activeElement).toBe(close) // Tab past last wraps to first
    fireEvent.click(close)
    act(() => {
      vi.advanceTimersByTime(280)
    })
    expect(document.activeElement).toBe(screen.getByTitle(MATH1))
  })

  it('คอร์สไม่มีรายละเอียด: การ์ดย่อจากข้อมูลแผน', () => {
    renderMyPath()
    openFromAll(TPAT31)
    expect(
      screen.getByText('ยังไม่มีรายละเอียดเนื้อหาสำหรับคอร์สนี้'),
    ).toBeTruthy()
  })

  it('สลับ Month/All แล้วหน้ารายละเอียดปิด', () => {
    renderMyPath()
    openFromAll(MATH1)
    fireEvent.click(screen.getByRole('button', { name: 'Month' }))
    expect(sheet()).toBeNull()
  })
})

describe('การตั้งค่าส่งแผนผ่าน onPlanChange', () => {
  it('ชั่วโมงต่อสัปดาห์', () => {
    const { onPlanChange } = renderMyPath()
    openFromAll(MATH1)
    fireEvent.change(screen.getByLabelText('ชั่วโมงต่อสัปดาห์'), {
      target: { value: '7' },
    })
    expect(courseIn(onPlanChange.mock.calls[0][0], 'MATH.1')).toEqual({
      courseId: 'MATH.1',
      startDate: '2026-10-01',
      weeklyHours: 7,
    })
  })

  it('วันเริ่มต้น', () => {
    const { onPlanChange } = renderMyPath()
    openFromAll(MATH1)
    fireEvent.change(screen.getByLabelText('วันเริ่มต้น'), {
      target: { value: '2026-10-05' },
    })
    expect(courseIn(onPlanChange.mock.calls[0][0], 'MATH.1')).toEqual({
      courseId: 'MATH.1',
      startDate: '2026-10-05',
      weeklyHours: 3,
    })
  })

  it('เลิกตามจังหวะเรียน: คงชั่วโมงที่รับมาจากเล่มก่อน', () => {
    const { onPlanChange } = renderMyPath()
    fireEvent.click(screen.getByText(MATH2))
    expect(
      (screen.getByLabelText('ชั่วโมงต่อสัปดาห์') as HTMLInputElement).disabled,
    ).toBe(true)
    fireEvent.click(follows()[0])
    expect(courseIn(onPlanChange.mock.calls[0][0], 'MATH.2')).toEqual({
      courseId: 'MATH.2',
      followPrevious: true,
      followPreviousWeeklyHours: false,
      weeklyHours: 3,
    })
  })

  it('เลิกตาม Course ก่อนหน้า (วันเริ่มต้น)', () => {
    const { onPlanChange } = renderMyPath()
    fireEvent.click(screen.getByText(MATH2))
    expect(
      (screen.getByLabelText('วันเริ่มต้น') as HTMLInputElement).disabled,
    ).toBe(true)
    fireEvent.click(follows()[1])
    expect(courseIn(onPlanChange.mock.calls[0][0], 'MATH.2')).toEqual({
      courseId: 'MATH.2',
      followPrevious: false,
      followPreviousWeeklyHours: true,
    })
  })

  it('คอร์สแรกของวิชาติ๊ก "ตาม Course ก่อนหน้า" ไม่ได้', () => {
    renderMyPath()
    openFromAll(MATH1)
    for (const box of follows()) {
      expect(box.disabled).toBe(true)
      expect(box.closest('label')!.title).toBe('ไม่มี Course ก่อนหน้า')
    }
  })

  it('คอร์สที่ host ไม่ได้ส่งมาในแผน: ตั้งค่าแล้วเพิ่มคอร์สนั้นในแผน', () => {
    const plan = {
      ...mypathData.plan,
      courses: mypathData.plan.courses.filter(c => c.courseId !== 'MATH.1'),
    }
    const { onPlanChange } = renderMyPath({ ...mypathData, plan })
    openFromAll(MATH1)
    fireEvent.change(screen.getByLabelText('ชั่วโมงต่อสัปดาห์'), {
      target: { value: '7' },
    })
    expect(courseIn(onPlanChange.mock.calls[0][0], 'MATH.1')).toEqual({
      courseId: 'MATH.1',
      weeklyHours: 7,
    })
  })

  it('host ส่งแผนกลับมาแล้วหน้าจอเปลี่ยนทันที', () => {
    function Host() {
      const [plan, setPlan] = useState(mypathData.plan)
      return (
        <MyPath
          data={{ ...mypathData, plan }}
          today={TODAY}
          onPlanChange={setPlan}
          onBuyCourse={vi.fn()}
          onStartCourse={vi.fn()}
        />
      )
    }
    render(<Host />)
    openFromAll(MATH1)
    // 24 h / 3 h per week
    expect(screen.getByText(/ใช้เวลาประมาณ 8 สัปดาห์/)).toBeTruthy()
    fireEvent.change(screen.getByLabelText('ชั่วโมงต่อสัปดาห์'), {
      target: { value: '6' },
    })
    expect(screen.getByText(/ใช้เวลาประมาณ 4 สัปดาห์/)).toBeTruthy()
    expect(
      screen.getByTitle(
        /^Applied Math Admissions TCAS เล่ม 1 .* · 1 ต.ค. 69 – 28 ต.ค. 69$/,
      ),
    ).toBeTruthy() // the All bar follows
  })
})

describe('ปุ่มซื้อ/เริ่มเรียนไปผ่าน callback', () => {
  it(
    'ยังไม่ซื้อ: ปุ่มซื้อเรียก onBuyCourse พร้อมรหัสคอร์ส' +
      ' และแสดงราคาเดิมขีดฆ่า',
    () => {
      const { onBuyCourse } = renderMyPath()
      openFromAll(/^MATH TCAS ตะลุยโจทย์/)
      expect(screen.getByText('฿6,900').tagName).toBe('S')
      fireEvent.click(screen.getByRole('button', { name: 'หาซื้อบน OnDemand' }))
      expect(onBuyCourse).toHaveBeenCalledWith('MATH.EX')
    },
  )

  it('ซื้อแล้วและมีวันเริ่มต้น: เริ่มเรียนเรียกแค่ onStartCourse', () => {
    const { onStartCourse, onPlanChange } = renderMyPath()
    openFromAll(MATH1)
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มเรียน' }))
    expect(onStartCourse).toHaveBeenCalledWith('MATH.1')
    expect(onPlanChange).not.toHaveBeenCalled()
  })

  it(
    'ซื้อแล้วแต่ยังไม่มีวันเริ่มต้น:' +
      ' ตรึงวันเริ่มด้วย onPlanChange ก่อน onStartCourse',
    () => {
      const plan = {
        ...mypathData.plan,
        courses: mypathData.plan.courses.map(c =>
          c.courseId === 'MATH.1' ? { courseId: 'MATH.1', weeklyHours: 3 } : c,
        ),
      }
      const { onStartCourse, onPlanChange } = renderMyPath({
        ...mypathData,
        plan,
      })
      openFromAll(MATH1)
      fireEvent.click(screen.getByRole('button', { name: 'เริ่มเรียน' }))
      expect(courseIn(onPlanChange.mock.calls[0][0], 'MATH.1')).toEqual({
        courseId: 'MATH.1',
        weeklyHours: 3,
        startDate: TODAY,
      }) // first course with no start date starts Today
      expect(onPlanChange.mock.invocationCallOrder[0]).toBeLessThan(
        onStartCourse.mock.invocationCallOrder[0],
      )
      expect(onStartCourse).toHaveBeenCalledWith('MATH.1')
    },
  )
})
