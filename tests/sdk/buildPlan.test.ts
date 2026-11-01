// Oracle: SDK buildPlan ต้องคิดแผนได้เท่ากับ rebuildPlan() ของ prototype เมื่อได้ข้อมูลชุดเดียวกัน
// fixtures ของ host แปลงมาจาก src/prototype/mypath/* ตามสัญญาข้อมูล → ป้อนได้ตรงๆ
import { describe, expect, it } from 'vitest'
import * as proto from '../../src/prototype/mypath/plan'
import { buildPlan } from '../../packages/mypath/src/plan/buildPlan'
import { TODAY, mypathData } from '../../src/host/fixtures'

proto.rebuildPlan()
const plan = buildPlan({ ...mypathData, today: TODAY })

const pick = (courses: { id: string; start: string; end: string; weeklyHours: number; estimatedWeeks: number }[]) =>
  courses.map(({ id, start, end, weeklyHours, estimatedWeeks }) => ({ id, start, end, weeklyHours, estimatedWeeks }))

describe('buildPlan เท่ากับ prototype', () => {
  it('คอร์สทุกตัวในวิชาที่เรียน', () => {
    expect(plan.subjects.map(s => ({ name: s.name, color: s.color, courses: pick(s.courses) })))
      .toEqual(proto.subjects.map(s => ({ name: s.name, color: s.color, courses: pick(s.courses) })))
    expect(plan.totalHours).toBe(proto.totalHours)
  })

  it('แกน', () => {
    expect(plan.axis).toEqual({
      start: proto.AXIS_START, end: proto.AXIS_END, totalDays: proto.TOTAL_DAYS,
      months: proto.axisMonths, label: proto.axisLabel, monthLines: proto.monthLines,
    })
  })

  it('ชั่วโมงตามแผนรายวัน', () => {
    expect(plan.scheduledHoursByDay).toEqual(proto.scheduledHoursByDay)
  })
})

describe('buildPlan: วันนี้และข้อมูลไม่ครบ', () => {
  const base = { catalog: mypathData.catalog, events: [], today: '2027-03-10' }
  const calendar = { ...mypathData.plan.calendar, subjects: ['tgat'] }

  it('คอร์สแรกที่ไม่มีวันเริ่มต้นเริ่มที่วันนี้', () => {
    const { subjects } = buildPlan({ ...base, plan: { calendar, courses: [] } })
    expect(subjects[0].courses[0].start).toBe('2027-03-10')
  })

  it('วันเริ่มต้นในอดีตไม่ถูกดันขึ้นมา และวันที่ผิดรูป = ไม่ได้ตั้ง', () => {
    expect(buildPlan({ ...base, plan: { calendar, courses: [{ courseId: 'TGAT.1', startDate: '2026-01-05' }] } }).subjects[0].courses[0].start).toBe('2026-01-05')
    expect(buildPlan({ ...base, plan: { calendar, courses: [{ courseId: 'TGAT.1', startDate: 'oops' }] } }).subjects[0].courses[0].start).toBe('2027-03-10')
  })

  it('catalog ว่างไม่ throw และแกนครอบวันนี้', () => {
    const { subjects, axis } = buildPlan({ ...base, catalog: [], plan: { calendar, courses: [] } })
    expect(subjects).toEqual([])
    expect(axis.label).toBe('มี.ค. 70 – มี.ค. 70')
  })
})
