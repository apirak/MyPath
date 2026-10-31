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
  studyCalendar,
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
    expect(subjects.map(subject => subject.name)).toEqual(
      expect.arrayContaining(studyCalendar.subjects),
    )
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
    const firstMonday = u(AXIS_START) + ((8 - new Date(u(AXIS_START)).getUTCDay()) % 7) * MS
    const budgets: Record<string, number> = {}
    for (let monday = firstMonday; monday < u(AXIS_END); monday += 7 * MS) {
      budgets[isoOf(monday)] = calendarBudgetForWeek(monday)
    }
    expect(budgets).toMatchSnapshot()
  })

  it('ชั่วโมงรายวัน: วันธรรมดา, วันหยุด, วันพิเศษ, ช่วงปิดเทอม', () => {
    const specialDay = studyCalendar.specialDays[0].date
    const schoolBreak = studyCalendar.breaks[0]
    const midBreak = isoOf((u(schoolBreak.start) + u(schoolBreak.end)) / 2)
    expect({
      weekday: calendarHoursForDay('2026-12-07'),
      weekend: calendarHoursForDay('2026-12-06'),
      specialDay: { date: specialDay, hours: calendarHoursForDay(specialDay) },
      schoolBreak: { date: midBreak, hours: calendarHoursForDay(midBreak) },
    }).toMatchSnapshot()
  })
})
