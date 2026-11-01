// ฟังก์ชันล้วนของหน้า All: snap วันเริ่มไปวันจันทร์ และแก้วันเริ่มต้นโดยไม่แตะแผนเดิม
import { describe, expect, it } from 'vitest'
import { MS, u } from '../../packages/mypath/src/plan/dates'
import { calendarBudgetForWeek, snapToMonday, withCourseStartDate } from '../../packages/mypath/src/plan/timeline'
import type { StudentPlan } from '../../packages/mypath/src/types'
import { mypathData } from '../../src/host/fixtures'

describe('snapToMonday', () => {
  // สัปดาห์ของ จ. 7 ธ.ค. 69: จ.–พฤ. ปัดลงไป 7, ศ.–อา. ปัดขึ้นไป 14
  it.each([
    ['2026-12-07', '2026-12-07'],
    ['2026-12-08', '2026-12-07'],
    ['2026-12-09', '2026-12-07'],
    ['2026-12-10', '2026-12-07'],
    ['2026-12-11', '2026-12-14'],
    ['2026-12-12', '2026-12-14'],
    ['2026-12-13', '2026-12-14'],
  ])('%s → %s', (day, monday) => {
    expect(snapToMonday(u(day))).toBe(monday)
  })

  it('ขอบ 3.5 วัน: ถึงขอบแล้วปัดขึ้น ก่อนขอบ 1 ms ปัดลง', () => {
    const edge = u('2026-12-10') + MS / 2
    expect(snapToMonday(edge)).toBe('2026-12-14')
    expect(snapToMonday(edge - 1)).toBe('2026-12-07')
  })
})

describe('withCourseStartDate', () => {
  const plan: StudentPlan = {
    calendar: { weekdayHours: 1, weekendHours: 2, specialDays: [], breaks: [], subjects: ['MATH'] },
    courses: [{ courseId: 'MATH.1', startDate: '2026-08-03', weeklyHours: 3 }, { courseId: 'MATH.2', followPrevious: true }],
  }
  const before = structuredClone(plan)

  it('ตั้งวันเริ่มต้นใหม่ให้คอร์สนั้น ค่าอื่นของคอร์สอยู่ครบ', () => {
    const next = withCourseStartDate(plan, 'MATH.1', '2026-09-07')
    expect(next.courses).toEqual([{ courseId: 'MATH.1', startDate: '2026-09-07', weeklyHours: 3 }, { courseId: 'MATH.2', followPrevious: true }])
    expect(next.calendar).toEqual(plan.calendar)
  })

  it('คอร์สที่ไม่มีในแผน: เพิ่มต่อท้าย (host ไม่ต้องส่งทุกคอร์ส)', () => {
    expect(withCourseStartDate(plan, 'MATH.3', '2027-01-04').courses).toEqual([...plan.courses, { courseId: 'MATH.3', startDate: '2027-01-04' }])
  })

  it('ไม่แก้แผนที่ส่งเข้ามา', () => {
    withCourseStartDate(plan, 'MATH.1', '2026-09-07')
    withCourseStartDate(plan, 'MATH.3', '2027-01-04')
    expect(plan).toEqual(before)
  })
})

describe('calendarBudgetForWeek', () => {
  // สัปดาห์ 7 ธ.ค. มีวันพิเศษ (เสาร์ 12 ธ.ค. = 5 ชม.), สัปดาห์ 21 ธ.ค. อยู่ในช่วงปิดเทอม (2 ชม./วัน)
  it.each([['2026-12-07', 13], ['2026-12-21', 14]])('สัปดาห์ %s = %i ชม.', (monday, hours) => {
    expect(calendarBudgetForWeek(mypathData.plan.calendar, u(monday))).toBe(hours)
  })
})
