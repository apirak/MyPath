// Pure plan edits and budget maths used by the All view and calendar.
import type {
  ISODate,
  StudentCourse,
  StudentPlan,
  StudyCalendar,
} from '../types'
import { MS, isISODate, isoOf, u } from './dates'

// Returns a new plan; never mutates. A course missing from the plan is
// appended, because hosts only store what the student has set
// (docs/mypath-integration.md).
export const withCourse = (
  plan: StudentPlan,
  courseId: string,
  patch: Partial<StudentCourse>,
): StudentPlan =>
  plan.courses.some(c => c.courseId === courseId)
    ? {
        ...plan,
        courses: plan.courses.map(c =>
          c.courseId === courseId ? { ...c, ...patch } : c,
        ),
      }
    : { ...plan, courses: [...plan.courses, { courseId, ...patch }] }

// Leaves courses untouched so disabling a subject and enabling it again
// restores its settings. Invalid School breaks (malformed, start after end,
// overlapping) return undefined so nothing bad reaches the host.
export const withStudyCalendar = (
  plan: StudentPlan,
  calendar: StudyCalendar,
): StudentPlan | undefined => {
  const periods = [...calendar.breaks].sort((a, b) =>
    a.start.localeCompare(b.start),
  )
  if (
    periods.some(
      (period, index) =>
        !isISODate(period.start) ||
        !isISODate(period.end) ||
        period.start > period.end ||
        (index > 0 && periods[index - 1].end >= period.start),
    )
  )
    return undefined
  return { ...plan, calendar }
}

export const withCourseStartDate = (
  plan: StudentPlan,
  courseId: string,
  startDate: ISODate,
) => withCourse(plan, courseId, { startDate })

// Nearest Monday (rounds at 3.5 days) so starts align with the weekly bars.
export const snapToMonday = (ms: number): ISODate => {
  const monday = ms - ((new Date(ms).getUTCDay() + 6) % 7) * MS - (ms % MS)
  return isoOf(ms - monday >= 3.5 * MS ? monday + 7 * MS : monday)
}

// Calendar budget precedence: Special study day > School break >
// weekday/weekend.
export const calendarHoursForDay = (calendar: StudyCalendar, iso: ISODate) => {
  const specialDay = calendar.specialDays.find(day => day.date === iso)
  if (specialDay) return specialDay.hours
  const schoolBreak = calendar.breaks.find(
    period => period.start <= iso && iso <= period.end,
  )
  if (schoolBreak) return schoolBreak.hours
  return [0, 6].includes(new Date(u(iso)).getUTCDay())
    ? calendar.weekendHours
    : calendar.weekdayHours
}

export const calendarBudgetForWeek = (
  calendar: StudyCalendar,
  monday: number,
) =>
  Array.from({ length: 7 }, (_, day) =>
    calendarHoursForDay(calendar, isoOf(monday + day * MS)),
  ).reduce((sum, hours) => sum + hours, 0)
