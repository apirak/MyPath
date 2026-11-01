// คิดแผนจากข้อมูลของ host — copy rebuildPlan() จาก src/prototype/mypath/plan.ts
// มาเป็นฟังก์ชันล้วน (ไม่มี state ระดับ module)
// ต่างจาก prototype: ไม่มี DAY_START/DAY_LAST —
// คอร์สแรกที่ไม่มีวันเริ่มต้นเริ่มที่ "วันนี้" (สัญญาข้อมูล
// "ไม่มีขอบเขตเวลาในสัญญา")
import type {
  CourseCatalogItem,
  ExamEvent,
  ISODate,
  MyPathData,
} from '../types'
import { MS, addDays, be, isISODate, isoOf, mn, u } from './dates'

export type PlannedCourse = CourseCatalogItem & {
  start: ISODate
  end: ISODate
  startDate?: ISODate
  followPrevious: boolean
  followPreviousWeeklyHours: boolean
  weeklyHours: number
  estimatedWeeks: number
}
export type PlannedSubject = {
  id: string
  name: string
  color: string
  courses: PlannedCourse[]
}
export type Axis = {
  start: ISODate
  end: ISODate // exclusive
  totalDays: number
  months: { label: string; days: number }[]
  label: string
  monthLines: number[]
}
export type Plan = {
  today: ISODate
  subjects: PlannedSubject[]
  totalHours: number
  axis: Axis
  scheduledHoursByDay: Map<ISODate, number>
  events: ExamEvent[]
}
export type PlanInput = Pick<MyPathData, 'catalog' | 'plan' | 'events'> & {
  today: ISODate
}

const DEFAULT_WEEKLY_HOURS = 5
export const estimatedWeeksFor = (hours: number, weeklyHours: number) =>
  Math.ceil(hours / weeklyHours)
// บีบให้อยู่ 1–10 ตามสัญญา — 0 จากแผนที่เสียทำให้จำนวนสัปดาห์เป็น Infinity และ
// loop รายวันไม่จบ
const weeklyHoursFor = (
  weeklyHours: number | undefined,
  followPrevious: boolean,
  previousWeeklyHours: number,
) =>
  followPrevious
    ? previousWeeklyHours
    : Math.min(10, Math.max(1, weeklyHours ?? DEFAULT_WEEKLY_HOURS))

// แกนเดือน: ต้นเดือนของสิ่งแรก ถึงสิ้นเดือนของสิ่งสุดท้าย
const axisOf = (first: number, lastDay: number): Axis => {
  const last = new Date(lastDay)
  const start = `${isoOf(first).slice(0, 7)}-01`
  const end = isoOf(Date.UTC(last.getUTCFullYear(), last.getUTCMonth() + 1, 1))
  const totalDays = (u(end) - u(start)) / MS
  const months: Axis['months'] = []
  for (let cursor = start; u(cursor) < u(end);) {
    const [y, m] = cursor.slice(0, 7).split('-').map(Number)
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate()
    months.push({ label: `${mn[m - 1]} ${be(y)}`, days })
    cursor = addDays(cursor, days)
  }
  let daysBefore = 0
  const monthLines = months
    .slice(0, -1)
    .map(month => ((daysBefore += month.days) / totalDays) * 100)
  return {
    start,
    end,
    totalDays,
    months,
    label: `${months[0].label} – ${months.at(-1)!.label}`,
    monthLines,
  }
}

// คอร์สในวิชาเดียวกันต่อกันวันถัดไป; หนึ่งสัปดาห์ของคอร์สยาว 7 วันปฏิทินเสมอ
// วิชาที่เรียน = วิชาใน catalog ที่เปิดใน calendar.subjects เรียงตาม catalog;
// id ที่ไม่รู้จักถูกข้าม
export function buildPlan({
  catalog,
  plan,
  events: allEvents,
  today,
}: PlanInput): Plan {
  // วันสอบผิดรูป = ไม่มีรายการนั้น
  const events = allEvents.filter(event => isISODate(event.date))
  const enabled = catalog
    .flatMap(group => group.subjects)
    .filter(subject => plan.calendar.subjects.includes(subject.id))
  const planById = new Map(plan.courses.map(c => [c.courseId, c]))
  const starts = new Map<string, number>(),
    ends = new Map<string, number>()
  const weeklyHoursById = new Map<string, number>()
  const scheduledHoursByDay = new Map<ISODate, number>()
  for (const subject of enabled) {
    let nextStart = -Infinity
    let previousWeeklyHours = DEFAULT_WEEKLY_HOURS
    for (const [index, course] of subject.courses.entries()) {
      const student = planById.get(course.id)
      const followPrevious = !!student?.followPrevious && index > 0
      const startDate =
        !followPrevious && isISODate(student?.startDate)
          ? u(student.startDate)
          : undefined
      // ไม่มีวันเริ่มต้น: คอร์สแรกเริ่มวันนี้, เล่มถัดไปต่อจากเล่มก่อน ·
      // startDate ในอดีตไม่ถูกดันขึ้นมา
      const start = Math.max(
        nextStart,
        startDate ?? (index === 0 ? u(today) : nextStart),
      )
      const followPreviousWeeklyHours =
        !!student?.followPreviousWeeklyHours && index > 0
      const weeklyHours = weeklyHoursFor(
        student?.weeklyHours,
        followPreviousWeeklyHours,
        previousWeeklyHours,
      )
      const weeks = estimatedWeeksFor(course.hours, weeklyHours)
      const end = start + weeks * 7 * MS - MS
      starts.set(course.id, start)
      ends.set(course.id, end)
      nextStart = end + MS
      weeklyHoursById.set(course.id, weeklyHours)
      previousWeeklyHours = weeklyHours
      const dailyHours = course.hours / (weeks * 7)
      for (let day = start; day <= end; day += MS) {
        const iso = isoOf(day)
        scheduledHoursByDay.set(
          iso,
          (scheduledHoursByDay.get(iso) ?? 0) + dailyHours,
        )
      }
    }
  }
  const subjects = enabled.map(s => ({
    id: s.id,
    name: s.name,
    color: s.color,
    courses: s.courses.map((c, index) => {
      const student = planById.get(c.id)
      const weeklyHours = weeklyHoursById.get(c.id)!
      return {
        ...c,
        startDate: student?.startDate,
        followPrevious: !!student?.followPrevious && index > 0,
        followPreviousWeeklyHours:
          !!student?.followPreviousWeeklyHours && index > 0,
        weeklyHours,
        estimatedWeeks: estimatedWeeksFor(c.hours, weeklyHours),
        start: isoOf(starts.get(c.id)!),
        end: isoOf(ends.get(c.id)!),
      }
    }),
  }))
  const totalHours = subjects.reduce(
    (t, s) => t + s.courses.reduce((a, c) => a + c.hours, 0),
    0,
  )
  const eventDays = events.map(event => u(event.date))
  const firsts = [...starts.values(), ...eventDays]
  // ไม่มีคอร์สและวันสอบเลย (catalog ว่าง) → แกนเดือนเดียวของวันนี้ แทนการ throw
  const axis = axisOf(
    firsts.length ? Math.min(...firsts) : u(today),
    Math.max(u(today), ...ends.values(), ...eventDays),
  )
  return { today, subjects, totalHours, axis, scheduledHoursByDay, events }
}
