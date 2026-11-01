// @vitest-environment jsdom
// แผงปฏิทินการเรียนของ SDK: ทุกการแก้สร้างแผนใหม่ด้วย withStudyCalendar แล้วส่งผ่าน onPlanChange
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { MyPath, type MyPathData, type StudentPlan } from '@learn/mypath'
import { buildPlan } from '../../packages/mypath/src/plan/buildPlan'
import { withStudyCalendar } from '../../packages/mypath/src/plan/timeline'
import { TODAY, mypathData } from '../../src/host/fixtures'

afterEach(() => { cleanup(); vi.useRealTimers() })

const { plan } = mypathData
const calendar = plan.calendar

describe('withStudyCalendar', () => {
  it('ไม่แก้แผนเดิม และคงค่าที่ตั้งให้คอร์สไว้', () => {
    const before = structuredClone(plan)
    const next = withStudyCalendar(plan, { ...calendar, weekdayHours: 4 })!
    expect(next.calendar.weekdayHours).toBe(4)
    expect(next.courses).toBe(plan.courses)
    expect(plan).toEqual(before)
  })

  it('ช่วงปิดเทอมซ้อนกันหรือวันเริ่มหลังวันจบ: ไม่มีแผนใหม่', () => {
    const overlap = [...calendar.breaks, { id: 2, start: '2027-01-03', end: '2027-01-10', hours: 2 }]
    expect(withStudyCalendar(plan, { ...calendar, breaks: overlap })).toBeUndefined()
    expect(withStudyCalendar(plan, { ...calendar, breaks: [{ id: 1, start: '2027-01-10', end: '2027-01-03', hours: 2 }] })).toBeUndefined()
    expect(withStudyCalendar(plan, { ...calendar, breaks: [{ id: 1, start: '', end: '2027-01-03', hours: 2 }] })).toBeUndefined()
  })

  it('ปิดวิชาแล้วเปิดกลับมา: คอร์สกลับมาพร้อมค่าเดิมทุกตัว', () => {
    const planned = (p: StudentPlan) => buildPlan({ ...mypathData, plan: p, today: TODAY }).subjects.find(s => s.id === 'a_lv_61')
    const off = withStudyCalendar(plan, { ...calendar, subjects: calendar.subjects.filter(id => id !== 'a_lv_61') })!
    expect(planned(off)).toBeUndefined()
    const on = withStudyCalendar(off, { ...off.calendar, subjects: [...off.calendar.subjects, 'a_lv_61'] })!
    expect(planned(on)).toEqual(planned(plan))
  })
})

const renderMyPath = (data: MyPathData = mypathData) => {
  const onPlanChange = vi.fn()
  render(<MyPath data={data} today={TODAY} onPlanChange={onPlanChange} onBuyCourse={vi.fn()} onStartCourse={vi.fn()} />)
  return onPlanChange
}
const openPanel = () => fireEvent.click(screen.getByRole('button', { name: 'ปฏิทินการเรียน' }))
const panel = () => document.querySelector('.mp-scp-overlay')

describe('เปิด/ปิดแผง', () => {
  it('กดปุ่มปฏิทินใน header แล้วเปิด, ปุ่ม X ปิดหลัง animation 280ms', () => {
    vi.useFakeTimers()
    renderMyPath()
    openPanel()
    expect(screen.getByRole('dialog', { name: 'ปฏิทินการเรียน' })).toBeTruthy()
    fireEvent.click(screen.getByLabelText('ปิดปฏิทินการเรียน'))
    expect(panel()).toBeTruthy() // ยังเล่น animation ปิด
    act(() => { vi.advanceTimersByTime(280) })
    expect(panel()).toBeNull()
  })

  it('Esc และคลิกพื้นหลังปิดได้ (เปิดจาก All ก็ได้)', () => {
    vi.useFakeTimers()
    renderMyPath()
    fireEvent.click(screen.getByRole('button', { name: 'All' }))
    openPanel()
    fireEvent.keyDown(window, { key: 'Escape' })
    act(() => { vi.advanceTimersByTime(280) })
    expect(panel()).toBeNull()
    openPanel()
    fireEvent.click(document.querySelector('.mp-scp-backdrop')!)
    act(() => { vi.advanceTimersByTime(280) })
    expect(panel()).toBeNull()
  })

  it('ปุ่มที่โฟกัสอยู่หายไป (เปิดตั้งค่าวันพิเศษ) แล้ว Tab ดึงโฟกัสกลับเข้าแผง', () => {
    renderMyPath()
    openPanel()
    const toggle = screen.getByRole('button', { name: 'ตั้งค่าวันพิเศษ' })
    toggle.focus()
    fireEvent.click(toggle)
    expect(document.activeElement).toBe(document.body)
    fireEvent.keyDown(document.body, { key: 'Tab' })
    expect(screen.getByRole('dialog', { name: 'ปฏิทินการเรียน' }).contains(document.activeElement)).toBe(true)
  })

  it('สลับ Month/All แล้วแผงปิด แต่เลื่อนเดือนไม่ปิด', () => {
    renderMyPath()
    openPanel()
    fireEvent.click(screen.getByLabelText('Next month'))
    expect(panel()).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'All' }))
    expect(panel()).toBeNull()
  })
})

describe('การแก้ส่งแผนผ่าน onPlanChange', () => {
  it('ชั่วโมงวันธรรมดา', () => {
    const onPlanChange = renderMyPath()
    openPanel()
    fireEvent.change(screen.getAllByLabelText('เรียนได้ต่อวัน')[0], { target: { value: '4' } })
    expect(onPlanChange.mock.calls[0][0]).toEqual({ ...plan, calendar: { ...calendar, weekdayHours: 4 } })
  })

  it('เพิ่มวันพิเศษ', () => {
    const onPlanChange = renderMyPath()
    openPanel()
    fireEvent.click(screen.getByRole('button', { name: 'ตั้งค่าวันพิเศษ' }))
    fireEvent.click(screen.getByRole('button', { name: '15' }))
    fireEvent.change(screen.getByLabelText('เรียนได้'), { target: { value: '10' } })
    expect(onPlanChange.mock.calls[0][0].calendar.specialDays).toEqual([{ date: '2026-12-12', hours: 5 }, { date: '2026-12-15', hours: 10 }])
  })

  it('ลบวันพิเศษ', () => {
    const onPlanChange = renderMyPath()
    openPanel()
    fireEvent.click(screen.getByRole('button', { name: 'ตั้งค่าวันพิเศษ' }))
    fireEvent.click(screen.getByRole('button', { name: 'ลบข้อยกเว้น' })) // วันที่เลือกตอนเปิดคือ 12 ธ.ค. ซึ่งเป็นวันพิเศษอยู่แล้ว
    expect(onPlanChange.mock.calls[0][0].calendar.specialDays).toEqual([])
  })

  it('เพิ่ม/ลบช่วงปิดเทอม และแก้ชั่วโมงต่อวันของช่วง', () => {
    const onPlanChange = renderMyPath()
    openPanel()
    fireEvent.click(screen.getByLabelText('เพิ่มช่วงปิดเทอม'))
    expect(onPlanChange.mock.calls[0][0].calendar.breaks).toEqual([calendar.breaks[0], expect.objectContaining({ start: '2027-01-10', end: '2027-01-17', hours: 2 })])
    fireEvent.change(screen.getAllByLabelText('เรียนได้ต่อวัน')[2], { target: { value: '0' } }) // [วันธรรมดา, วันหยุด, ช่วงแรก]
    expect(onPlanChange.mock.calls[1][0].calendar.breaks).toEqual([{ ...calendar.breaks[0], hours: 0 }])
    fireEvent.click(screen.getByLabelText('ลบช่วงปิดเทอม'))
    expect(onPlanChange.mock.calls[2][0].calendar.breaks).toEqual([])
  })

  it('ช่วงปิดเทอมที่ซ้อนกันไม่ส่งให้ host', () => {
    const onPlanChange = renderMyPath()
    openPanel()
    fireEvent.change(screen.getByLabelText('วันจบปิดเทอม'), { target: { value: '2026-12-01' } })
    expect(onPlanChange).not.toHaveBeenCalled()
  })
})

describe('host ส่งแผนกลับ', () => {
  it('ปิดวิชาแล้วหน้า Month เปลี่ยนตามทันที', () => {
    function Host() {
      const [p, setPlan] = useState(plan)
      return <MyPath data={{ ...mypathData, plan: p }} today={TODAY} onPlanChange={setPlan} onBuyCourse={vi.fn()} onStartCourse={vi.fn()} />
    }
    render(<Host />)
    const chem1 = 'เคมี TCAS เล่ม 1 · กลุ่มอะตอมและตารางธาตุ'
    expect(screen.getByText(chem1)).toBeTruthy()
    openPanel()
    fireEvent.click(screen.getByRole('button', { name: 'เคมี', pressed: true }))
    expect(screen.queryByText(chem1)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'เคมี', pressed: false }))
    expect(screen.getByText(chem1)).toBeTruthy()
  })
})
