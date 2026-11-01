// Month view: Month window + agenda. Section rules are fixed in GLOSSARY.md.
// Cut-off R per month: Today's month → Today, past month → month end,
// future month → the day before the month starts.
import type { ExamEvent, ISODate } from '../types'
import type { Plan, PlannedCourse } from './buildPlan'
import { addDays, addMonths, monthStartOf, u } from './dates'

export type AgendaCourse = PlannedCourse & { subject: string; color: string }
export type AgendaGroup = {
  date: ISODate
  courses: AgendaCourse[]
  events: ExamEvent[]
}
export type Agenda = {
  monthStart: ISODate
  monthEnd: ISODate // exclusive
  isCurrent: boolean // window contains Today
  isPast: boolean
  inProgress: AgendaCourse[] // Today's month: courses spanning Today
  active: AgendaCourse[] // other months: courses overlapping the window
  // Grouped by start/exam date after R within the month (today's exams join
  // the Today group)
  upcoming: AgendaGroup[]
  finished: AgendaCourse[] // ended in this month before R
  pastEvents: ExamEvent[] // exams/Mocks in this month already past R
}

export function agendaFor(
  { subjects, events, today }: Plan,
  monthStartIso: ISODate,
): Agenda {
  const monthStart = monthStartOf(monthStartIso)
  const monthEnd = addMonths(monthStart, 1)
  const isCurrent = u(today) >= u(monthStart) && u(today) < u(monthEnd)
  const isPast = u(today) >= u(monthEnd)
  const R = isCurrent ? today : isPast ? monthEnd : addDays(monthStart, -1)
  const withSubject: AgendaCourse[] = subjects.flatMap(s =>
    s.courses.map(c => ({ ...c, subject: s.name, color: s.color })),
  )
  const inWin = (d: string) => d >= monthStart && d < monthEnd
  const inProgress = isCurrent
    ? withSubject.filter(c => u(c.start) <= u(today) && u(today) <= u(c.end))
    : []
  // A course that ends in the month before R goes to finished only, never
  // both lists.
  const active = isCurrent
    ? []
    : withSubject.filter(c => u(c.start) < u(monthEnd) && u(c.end) >= u(R))
  const finished = withSubject.filter(c => inWin(c.end) && u(c.end) < u(R))
  const byDate = new Map<string, AgendaGroup>()
  for (const c of withSubject) {
    const ok = isCurrent
      ? c.start > today && inWin(c.start)
      : !isPast && inWin(c.start)
    if (ok)
      (
        byDate.get(c.start) ??
        byDate
          .set(c.start, { date: c.start, courses: [], events: [] })
          .get(c.start)!
      ).courses.push(c)
  }
  for (const ev of events) {
    const ok = isCurrent
      ? u(ev.date) >= u(today) && inWin(ev.date)
      : !isPast && inWin(ev.date)
    if (ok)
      (
        byDate.get(ev.date) ??
        byDate
          .set(ev.date, { date: ev.date, courses: [], events: [] })
          .get(ev.date)!
      ).events.push(ev)
  }
  const upcoming = [...byDate.values()].sort((a, b) => u(a.date) - u(b.date))
  const pastEvents = events.filter(ev => inWin(ev.date) && u(ev.date) < u(R))
  return {
    monthStart,
    monthEnd,
    isCurrent,
    isPast,
    inProgress,
    active,
    upcoming,
    finished,
    pastEvents,
  }
}
