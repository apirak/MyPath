// หน้า Month: หน้าต่างเดือน + agenda (copy agendaFor() จาก
// src/prototype/mypath/plan.ts — กติกา section ล็อกไว้ใน GLOSSARY.md)
// เส้นตัด R ของแต่ละเดือน: เดือนของวันนี้ → วันนี้ · เดือนอดีต → สิ้นเดือน ·
// เดือนอนาคต → ก่อนต้นเดือน
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
  isCurrent: boolean // หน้าต่างนี้ครอบวันนี้
  isPast: boolean
  inProgress: AgendaCourse[] // เดือนของวันนี้: คอร์สที่ครอบวันนี้
  active: AgendaCourse[] // เดือนอื่น: คอร์สที่ทับหน้าต่างเดือน
  // กลุ่มตามวันเริ่ม/วันสอบ หลัง R ภายในเดือน (สอบของวันนี้รวมกลุ่มวันนี้)
  upcoming: AgendaGroup[]
  finished: AgendaCourse[] // จบภายในเดือนก่อนถึง R
  pastEvents: ExamEvent[] // สอบ/Mock ในเดือนที่ผ่าน R ไปแล้ว
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
  // กำลังเรียนช่วงเดือน (เดือนอื่น): ทับหน้าต่างเดือนและยังไม่จบก่อน R —
  // คอร์สที่จบในเดือนนั้นไปอยู่ finished อย่างเดียว
  const active = isCurrent
    ? []
    : withSubject.filter(c => u(c.start) < u(monthEnd) && u(c.end) >= u(R))
  const finished = withSubject.filter(c => inWin(c.end) && u(c.end) < u(R))
  // กลุ่มถัดไป: รวมคอร์สที่เริ่มและสอบที่จัดหลัง R ภายในเดือน ตามวันที่
  // (สอบวันนี้อยู่กลุ่มวันนี้)
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
