// Characterization: ผลของแผนเรียน mock ที่บันทึกไว้ตอนยังเป็น prototype (tag mockup-v1) — ตอนนี้คิดด้วย SDK จาก fixtures ของ host และต้องได้ snapshot เดิม (ตัด owned ออก: การซื้อไม่ใช่ส่วนของแผน, ADR-0002)
import { describe, expect, it } from 'vitest'
import { buildPlan } from '../../packages/mypath/src/plan/buildPlan'
import { MS, u, isoOf } from '../../packages/mypath/src/plan/dates'
import { calendarBudgetForWeek, calendarHoursForDay } from '../../packages/mypath/src/plan/timeline'
import { TODAY, mypathData } from '../../src/host/fixtures'

const { subjects, axis, totalHours, scheduledHoursByDay } = buildPlan({ ...mypathData, today: TODAY })
const { calendar } = mypathData.plan

describe('แผนเรียน: วิชาที่เรียน', () => {
  it('คอร์สทุกตัวในวิชาที่เรียน', () => {
    const courses = subjects.flatMap(subject => subject.courses.map(course => ({
      subject: subject.name,
      id: course.id,
      start: course.start,
      end: course.end,
      weeklyHours: course.weeklyHours,
      estimatedWeeks: course.estimatedWeeks,
      followPrevious: course.followPrevious,
      followPreviousWeeklyHours: course.followPreviousWeeklyHours,
    })))
    expect(courses).toMatchSnapshot()
  })
})

describe('แผนเรียน: แกน', () => {
  it('ช่วงแกนและเดือนบนแกน', () => {
    // key เป็นชื่อค่าคงที่เดิมของ prototype เพื่อใช้ snapshot เดิมได้
    expect({ AXIS_START: axis.start, AXIS_END: axis.end, TOTAL_DAYS: axis.totalDays, axisLabel: axis.label, axisMonths: axis.months }).toMatchSnapshot()
  })
})

// บันทึกตอนลบ prototype (#13) แทน oracle เดิมที่เทียบค่าเหล่านี้กับ prototype — ค่าเท่ากับ prototype ณ ตอนนั้น
describe('แผนเรียน: ชั่วโมงตามแผน, เส้นเดือน, สีวิชา', () => {
  it('ชั่วโมงตามแผนรวมรายสัปดาห์ (กราฟชั่วโมงเรียน/สัปดาห์ของ All)', () => {
    const weeks: Record<string, number> = {}
    for (const [iso, hours] of scheduledHoursByDay) {
      const day = u(iso), monday = isoOf(day - ((new Date(day).getUTCDay() + 6) % 7) * MS)
      weeks[monday] = +((weeks[monday] ?? 0) + hours).toFixed(4)
    }
    expect({ totalHours, weeks }).toMatchSnapshot()
  })

  it('เส้นเดือนบนแกนและสีของวิชา', () => {
    expect({ monthLines: axis.monthLines, colors: subjects.map(s => `${s.name} ${s.color}`) }).toMatchSnapshot()
  })
})

describe('งบปฏิทิน', () => {
  it('ทุกวันจันทร์ในแกน', () => {
    // วันจันทร์แรกที่ไม่ก่อน axis.start (getUTCDay: อาทิตย์ = 0, จันทร์ = 1)
    const firstMonday = u(axis.start) + ((8 - new Date(u(axis.start)).getUTCDay()) % 7) * MS
    const budgets: Record<string, number> = {}
    for (let monday = firstMonday; monday < u(axis.end); monday += 7 * MS) {
      budgets[isoOf(monday)] = calendarBudgetForWeek(calendar, monday)
    }
    expect(budgets).toMatchSnapshot()
  })

  // วันที่ตรึงไว้ตาม plan.calendar ใน fixtures: วันพิเศษ 2026-12-12 (เสาร์), ช่วงปิดเทอม 2026-12-21 – 2027-01-03
  it('ชั่วโมงรายวัน: วันธรรมดา, เสาร์/อาทิตย์, วันพิเศษ, ช่วงปิดเทอม', () => {
    expect({
      weekday: calendarHoursForDay(calendar, '2026-12-07'),
      weekend: calendarHoursForDay(calendar, '2026-12-06'),
      specialDay: calendarHoursForDay(calendar, '2026-12-12'),
      schoolBreak: calendarHoursForDay(calendar, '2026-12-27'),
    }).toMatchSnapshot()
  })
})
