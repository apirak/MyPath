import type { ExamEvent, StudyCalendar } from '../../types'
import type { Axis, PlannedCourse } from '../../plan/buildPlan'
import { MS, addDays, isoOf, u } from '../../plan/dates'
import { calendarBudgetForWeek } from '../../plan/timeline'

// Pure geometry for the All timeline: everything is a % of the axis width so
// rows line up regardless of screen size.

export type Month = { start: string; end: string; days: number; label: string }
export type Timeline = {
  start: string
  end: string
  days: number
  months: Month[]
}

// Minimum px per day before the grid starts scrolling horizontally.
export const MONTH_DAY_WIDTH = 2.2

export function timelineOf(axis: Axis): Timeline {
  let start = axis.start
  const months = axis.months.map(({ label, days }) => {
    const month = { start, end: addDays(start, days), days, label }
    start = month.end
    return month
  })
  return { start: axis.start, end: axis.end, days: axis.totalDays, months }
}

export const position = (date: string, t: Timeline) =>
  ((u(date) - u(t.start)) / MS / t.days) * 100
export const visible = (course: PlannedCourse, t: Timeline) =>
  u(course.start) < u(t.end) && u(addDays(course.end, 1)) > u(t.start)
export const inMonth = (iso: string, month: Month) =>
  u(iso) >= u(month.start) && u(iso) < u(month.end)

// Each month column grows with its day count but never below dayWidth px/day.
export const monthColumns = (t: Timeline, dayWidth = MONTH_DAY_WIDTH) =>
  t.months
    .map(month => `minmax(${month.days * dayWidth}px, ${month.days}fr)`)
    .join(' ')

// Dark or white label text, whichever reads better on the subject colour.
export const barText = (hex: string) => {
  const value = parseInt(hex.slice(1), 16)
  return (0.2126 * (value >> 16) +
    0.7152 * ((value >> 8) & 255) +
    0.0722 * (value & 255)) /
    255 >
    0.55
    ? '#212529'
    : '#fff'
}

// Stacks event flags into lanes so labels never overlap. Lane 0 sits on the
// grid; label width is estimated in px at the minimum day width.
export function eventLanes(events: ExamEvent[], t: Timeline, dayWidth: number) {
  const ends: number[] = []
  const shown = events
    .filter(event => u(event.date) >= u(t.start) && u(event.date) < u(t.end))
    .sort((a, b) => u(a.date) - u(b.date))
    .map(event => {
      const day = (u(event.date) - u(t.start)) / MS,
        half = (Math.min(118, event.label.length * 6.5 + 14) / 2 + 4) / dayWidth
      let lane = ends.findIndex(end => end <= day - half)
      if (lane < 0) {
        lane = ends.length
        ends.push(day + half)
      } else ends[lane] = day + half
      return { event, lane }
    })
  return { shown, lanes: ends.length }
}

export type Week = { start: number; end: number; demand: number; plan: number }

// Monday-to-Sunday weeks covering the axis: scheduled course hours (demand)
// vs the calendar budget (plan). The first week may start before the axis.
export function weeklyLoad(
  t: Timeline,
  scheduledHoursByDay: Map<string, number>,
  calendar: StudyCalendar,
): Week[] {
  const firstMonday =
    u(t.start) - ((new Date(u(t.start)).getUTCDay() + 6) % 7) * MS
  const weeks: Week[] = []
  for (let start = firstMonday; start < u(t.end); start += 7 * MS) {
    const end = Math.min(start + 7 * MS, u(t.end))
    const demand = Array.from(
      { length: (end - start) / MS },
      (_, day) => scheduledHoursByDay.get(isoOf(start + day * MS)) ?? 0,
    ).reduce((sum, value) => sum + value, 0)
    weeks.push({
      start,
      end,
      demand,
      plan: calendarBudgetForWeek(calendar, start),
    })
  }
  return weeks
}
