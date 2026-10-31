// Characterization: บันทึกผลของแผนเรียน mock (src/mypath/plan.ts) ไว้เป็นค่าอ้างอิงก่อนย้ายโค้ดไป SDK
// state ของ plan.ts อยู่ระดับ module → rebuildPlan() เองก่อนอ่านค่า
import { beforeAll, describe, expect, it } from 'vitest'
import {
  AXIS_END,
  AXIS_START,
  MS,
  TOTAL_DAYS,
  axisLabel,
  axisMonths,
  calendarBudgetForWeek,
  calendarHoursForDay,
  rebuildPlan,
  subjects,
  u,
  isoOf,
} from '../../src/mypath/plan'

beforeAll(() => {
  rebuildPlan()
})

describe('แผนเรียน: วิชาที่เรียน', () => {
  it('คอร์สทุกตัวในวิชาที่เรียน', () => {
    const courses = subjects.flatMap(subject => subject.courses.map(course => ({
      subject: subject.name,
      id: course.id,
      start: course.start,
      end: course.end,
      weeklyHours: course.weeklyHours,
      estimatedWeeks: course.estimatedWeeks,
      owned: course.owned,
      followPrevious: course.followPrevious,
      followPreviousWeeklyHours: course.followPreviousWeeklyHours,
    })))
    expect(courses).toMatchSnapshot()
  })
})

describe('แผนเรียน: แกน', () => {
  it('ช่วงแกนและเดือนบนแกน', () => {
    expect({ AXIS_START, AXIS_END, TOTAL_DAYS, axisLabel, axisMonths }).toMatchSnapshot()
  })
})

describe('งบปฏิทิน', () => {
  it('ทุกวันจันทร์ในแกน', () => {
    // วันจันทร์แรกที่ไม่ก่อน AXIS_START (getUTCDay: อาทิตย์ = 0, จันทร์ = 1)
    const firstMonday = u(AXIS_START) + ((8 - new Date(u(AXIS_START)).getUTCDay()) % 7) * MS
    const budgets: Record<string, number> = {}
    for (let monday = firstMonday; monday < u(AXIS_END); monday += 7 * MS) {
      budgets[isoOf(monday)] = calendarBudgetForWeek(monday)
    }
    expect(budgets).toMatchSnapshot()
  })

  // วันที่ตรึงไว้ตาม studyCalendar ใน studentPlan.ts: วันพิเศษ 2026-12-12 (เสาร์), ช่วงปิดเทอม 2026-12-21 – 2027-01-03
  it('ชั่วโมงรายวัน: วันธรรมดา, เสาร์/อาทิตย์, วันพิเศษ, ช่วงปิดเทอม', () => {
    expect({
      weekday: calendarHoursForDay('2026-12-07'),
      weekend: calendarHoursForDay('2026-12-06'),
      specialDay: calendarHoursForDay('2026-12-12'),
      schoolBreak: calendarHoursForDay('2026-12-27'),
    }).toMatchSnapshot()
  })
})
