// Builds the plan from host data as a pure function (no module state).
// There is no fixed start/end of the timeline: a first course with no start
// date starts on Today, and the Axis grows to fit (docs/mypath-sdk-plan.md,
// data contract: no time bounds).
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
// Clamp to the contract's 1–10: a 0 from a corrupt plan would make weeks
// Infinity and the per-day loop never end.
const weeklyHoursFor = (
  weeklyHours: number | undefined,
  followPrevious: boolean,
  previousWeeklyHours: number,
) =>
  followPrevious
    ? previousWeeklyHours
    : Math.min(10, Math.max(1, weeklyHours ?? DEFAULT_WEEKLY_HOURS))

// Axis: from the first of the earliest month to the end of the last month.
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

// Courses in a subject run back to back; a course week is always 7 calendar
// days. Enabled subjects follow catalog order; unknown ids are skipped.
export function buildPlan({
  catalog,
  plan,
  events: allEvents,
  today,
}: PlanInput): Plan {
  // An exam with a malformed date is dropped.
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
      // No start date: the first course starts Today, later volumes follow
      // the previous one. A past startDate is kept, not pushed to Today.
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
  // No courses or exams at all (empty catalog): one-month Axis on Today
  // instead of throwing.
  const axis = axisOf(
    firsts.length ? Math.min(...firsts) : u(today),
    Math.max(u(today), ...ends.values(), ...eventDays),
  )
  return { today, subjects, totalHours, axis, scheduledHoursByDay, events }
}
