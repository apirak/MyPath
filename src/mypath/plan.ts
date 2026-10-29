// แผนเรียน mock ของ My Path — ข้อมูล + simulation คิดวันที่ + เรขาคณิตแกนเวลา day-exact
// ที่มา = SAMPLE_DATA/ (courses.md + study-plan.md สำหรับคอร์ส, exam-dates.md สำหรับสอบ) — mirror ด้วยมือ
import { courseCatalog, subjectGroups, type CatalogSubject, type CourseCatalogItem } from './courseCatalog'
import { studyCalendar, studentCourses } from './studentPlan'
import { useSyncExternalStore } from 'react'

// --- ปฏิทิน day-exact (ทำงานบน UTC กันเรื่อง DST) ---
export const MS = 86_400_000
export const u = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) }
export const isoOf = (ms: number) => new Date(ms).toISOString().slice(0, 10)
export const addDays = (iso: string, n: number) => isoOf(u(iso) + n * MS)
// แกนเดือนครอบทุกคอร์ส + วันสอบ: เริ่มต้นเดือนของสิ่งแรก ถึงสิ้นเดือนของสิ่งสุดท้าย (หรือ TODAY) — recalc ทุก rebuildPlan
export let AXIS_START = '2026-10-01'
export let AXIS_END = '2028-03-01' // exclusive
export let TOTAL_DAYS = (u(AXIS_END) - u(AXIS_START)) / MS
const DAY_START = u('2026-08-01') // วันเริ่ม simulation = วันเริ่มเร็วสุดที่ลากคอร์สไปได้
// เผื่อเวลาหลังแกน All เพื่อไม่ตัดคอร์สที่ยังเรียนไม่จบเมื่อปรับปฏิทิน
const DAY_LAST = u('2028-04-30')

// วันอ้างอิงของ mock (GLOSSARY.md: "วันนี้") — ค่าเดียว ทั้ง Month และ All ใช้ร่วมกัน
// แก้ค่านี้ทีเดียว → section ของทั้งสองหน้าขยับตาม (ไม่อ่านนาฬิกาเครื่อง)
export const TODAY = '2026-12-05'

export let N = 17
const mn = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const be = (y: number) => String(y + 543).slice(2)
export const fmtDate = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${mn[m - 1]} ${be(y)}` }
export const fmtShort = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${mn[m - 1]}` }

export let axisMonths: { label: string; days: number }[] = []
export let monthLines: number[] = []
export let axisLabel = ''

// ตำแหน่งวันบนแกน (หน่วย: เดือน 0..17, day-exact)
export const pos = (iso: string) => ((u(iso) - u(AXIS_START)) / MS / TOTAL_DAYS) * N
export const posMs = (ms: number) => ((ms - u(AXIS_START)) / MS / TOTAL_DAYS) * N
export const pct = (v: number) => (v / N) * 100

export type Course = CourseCatalogItem & {
  start: string
  end: string
  owned?: boolean
  startDate?: string
  followPrevious?: boolean
  followPreviousWeeklyHours?: boolean
  weeklyHours: number
  estimatedWeeks: number
}
export type Subject = { name: string; color: string; courses: Course[] }
export type ExamEvent = { id: string; date: string; label: string; kind: 'exam' | 'mock'; owned?: boolean }
export const scheduledHoursByDay = new Map<string, number>()

export const estimatedWeeksFor = (hours: number, weeklyHours: number) => Math.ceil(hours / weeklyHours)
const DEFAULT_WEEKLY_HOURS = 5
const weeklyHoursFor = (weeklyHours: number | undefined, followPrevious: boolean, previousWeeklyHours: number) =>
  followPrevious ? previousWeeklyHours : weeklyHours ?? DEFAULT_WEEKLY_HOURS
export const isFirstCourse = (courseId: string) => courseCatalog.some(subject => subject.courses[0]?.id === courseId)
const listeners = new Set<() => void>()
let planVersion = 0
const subscribe = (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener) }
export const usePlanVersion = () => useSyncExternalStore(subscribe, () => planVersion, () => planVersion)

export let subjects: Subject[] = []
export let totalHours = 0

export const calendarHoursForDay = (iso: string) => {
  const specialDay = studyCalendar.specialDays.find(day => day.date === iso)
  if (specialDay) return specialDay.hours
  const schoolBreak = studyCalendar.breaks.find(period => period.start <= iso && iso <= period.end)
  if (schoolBreak) return schoolBreak.hours
  return [0, 6].includes(new Date(u(iso)).getUTCDay()) ? studyCalendar.weekendHours : studyCalendar.weekdayHours
}

export const calendarBudgetForWeek = (monday: number) =>
  Array.from({ length: 7 }, (_, day) => calendarHoursForDay(isoOf(monday + day * MS))).reduce((sum, hours) => sum + hours, 0)

// ระหว่างลากหัวคอร์ส แกนคงที่ (คอลัมน์ไม่กระโดดใต้เมาส์) — ปล่อยแล้วค่อยคิดแกนใหม่
let axisHeld = false
export const holdAxis = (hold: boolean) => {
  axisHeld = hold
  if (!hold) { rebuildPlan(); planVersion += 1; listeners.forEach(listener => listener()) }
}

const rebuildAxis = (first: number, lastDay: number) => {
  const last = new Date(lastDay)
  AXIS_START = `${isoOf(first).slice(0, 7)}-01`
  AXIS_END = isoOf(Date.UTC(last.getUTCFullYear(), last.getUTCMonth() + 1, 1))
  TOTAL_DAYS = (u(AXIS_END) - u(AXIS_START)) / MS
  const out: { label: string; days: number }[] = []
  for (let cursor = AXIS_START; u(cursor) < u(AXIS_END);) {
    const [y, m] = cursor.slice(0, 7).split('-').map(Number)
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate()
    out.push({ label: `${mn[m - 1]} ${be(y)}`, days })
    cursor = addDays(cursor, days)
  }
  axisMonths = out
  N = out.length
  axisLabel = `${out[0].label} – ${out.at(-1)!.label}`
  let daysBefore = 0
  monthLines = out.slice(0, -1).map(month => ((daysBefore += month.days) / TOTAL_DAYS) * 100)
}

// คอร์สในวิชาเดียวกันต่อกันวันถัดไป; หนึ่งสัปดาห์ของคอร์สยาว 7 วันปฏิทินเสมอ
// วิชาที่เรียน = เฉพาะวิชาที่เปิดในปฏิทินการเรียน เรียงตาม subjectGroups; วิชาที่ยังไม่มีคอร์สได้แถวว่างสีเทา
// ปิดวิชาไม่แตะ studentCourses → เปิดกลับมาแล้วคอร์สกลับมาพร้อมค่าเดิม
const enabledSubjects = (): CatalogSubject[] => subjectGroups.flatMap(group => group.subjects)
  .filter(name => studyCalendar.subjects.includes(name))
  .map(name => courseCatalog.find(subject => subject.name === name) ?? { name, color: '#adb5bd', courses: [] })

export const rebuildPlan = () => {
  const catalog = enabledSubjects()
  const planById = new Map(studentCourses.map(c => [c.courseId, c]))
  const starts = new Map<string, number>(), ends = new Map<string, number>()
  const weeklyHoursById = new Map<string, number>()
  scheduledHoursByDay.clear()
  for (const subject of catalog) {
    let nextStart = DAY_START
    let previousWeeklyHours = DEFAULT_WEEKLY_HOURS
    for (const [index, course] of subject.courses.entries()) {
      const student = planById.get(course.id)
      const followPrevious = !!student?.followPrevious && index > 0
      const start = Math.max(nextStart, !followPrevious && student?.startDate ? u(student.startDate) : DAY_START)
      const followPreviousWeeklyHours = !!student?.followPreviousWeeklyHours && index > 0
      const weeklyHours = weeklyHoursFor(student?.weeklyHours, followPreviousWeeklyHours, previousWeeklyHours)
      const weeks = estimatedWeeksFor(course.hours, weeklyHours)
      const end = start + weeks * 7 * MS - MS
      starts.set(course.id, start); ends.set(course.id, end); nextStart = end + MS
      weeklyHoursById.set(course.id, weeklyHours)
      previousWeeklyHours = weeklyHours
      const dailyHours = course.hours / (weeks * 7)
      for (let day = start; day <= end; day += MS) {
        const iso = isoOf(day)
        scheduledHoursByDay.set(iso, (scheduledHoursByDay.get(iso) ?? 0) + dailyHours)
      }
    }
  }
  subjects = catalog.map(s => ({ name: s.name, color: s.color, courses: s.courses.map((c, index) => {
    const student = planById.get(c.id)
    const followPreviousWeeklyHours = !!student?.followPreviousWeeklyHours && index > 0
    const weeklyHours = weeklyHoursById.get(c.id) ?? DEFAULT_WEEKLY_HOURS
    return { ...c, owned: student?.owned, startDate: student?.startDate, followPrevious: !!student?.followPrevious && index > 0, followPreviousWeeklyHours, weeklyHours, estimatedWeeks: estimatedWeeksFor(c.hours, weeklyHours), start: isoOf(starts.get(c.id) ?? DAY_LAST), end: isoOf(ends.get(c.id) ?? DAY_LAST) }
  }) }))
  totalHours = subjects.reduce((t, s) => t + s.courses.reduce((a, c) => a + c.hours, 0), 0)
  const eventDays = events.map(event => u(event.date))
  if (!axisHeld) rebuildAxis(Math.min(...starts.values(), ...eventDays), Math.max(u(TODAY), ...ends.values(), ...eventDays))
}

export const setCourseWeeklyHours = (courseId: string, weeklyHours: number) => {
  const course = studentCourses.find(c => c.courseId === courseId)
  if (!course) return
  course.weeklyHours = weeklyHours
  rebuildPlan(); planVersion += 1; listeners.forEach(listener => listener())
}

export const setCourseFollowPreviousWeeklyHours = (courseId: string, followPreviousWeeklyHours: boolean) => {
  const course = studentCourses.find(c => c.courseId === courseId)
  if (!course) return
  const current = subjects.flatMap(subject => subject.courses).find(course => course.id === courseId)
  if (!followPreviousWeeklyHours && current?.followPreviousWeeklyHours) course.weeklyHours = current.weeklyHours
  course.followPreviousWeeklyHours = followPreviousWeeklyHours
  rebuildPlan(); planVersion += 1; listeners.forEach(listener => listener())
}

export const setCourseStartDate = (courseId: string, startDate?: string) => {
  const course = studentCourses.find(c => c.courseId === courseId)
  if (!course) return
  course.startDate = startDate
  rebuildPlan(); planVersion += 1; listeners.forEach(listener => listener())
}

export const setCourseFollowPrevious = (courseId: string, followPrevious: boolean) => {
  const course = studentCourses.find(c => c.courseId === courseId)
  if (!course) return
  course.followPrevious = !isFirstCourse(courseId) && followPrevious
  rebuildPlan(); planVersion += 1; listeners.forEach(listener => listener())
}

export const setStudyCalendar = (next: typeof studyCalendar) => {
  const periods = [...next.breaks].sort((a, b) => a.start.localeCompare(b.start))
  if (periods.some((period, index) => period.start > period.end || (index > 0 && periods[index - 1].end >= period.start))) return false
  Object.assign(studyCalendar, next)
  rebuildPlan(); planVersion += 1; listeners.forEach(listener => listener())
  return true
}


// จาก SAMPLE_DATA/exam-dates.md (เจ้าของจัดใหม่ตามภาพ Plan Canvas 20.37.58) — สอบจริง 2 + Mock 6, ทุกรายการ 1 วัน
// สีตามตำนานภาพ: น้ำเงิน = สอบจริง, แดง = Mock · เข้ม = ซื้อแล้ว, อ่อน = ยังไม่ได้ซื้อ (ซื้อครบยกเว้น Mock CBT)
export const events: ExamEvent[] = [
  { id: 'M1', date: '2026-12-20', label: 'Mock ลองสนาม', kind: 'mock', owned: true },
  { id: 'M2', date: '2027-08-16', label: 'Mock TGAT/TPAT', kind: 'mock', owned: true },
  { id: 'M3', date: '2027-08-30', label: 'Mock A-Level', kind: 'mock', owned: true },
  { id: 'M4', date: '2027-09-13', label: 'Mock CBT', kind: 'mock' },
  { id: 'M5', date: '2027-12-18', label: 'Mock 2 TGAT/TPAT', kind: 'mock', owned: true },
  { id: 'X1', date: '2028-01-16', label: 'สอบ TGAT/TPAT', kind: 'exam', owned: true },
  { id: 'M6', date: '2028-01-23', label: 'Mock 2 A-Level', kind: 'mock', owned: true },
  { id: 'X2', date: '2028-02-06', label: 'สอบ A-Level', kind: 'exam', owned: true },
]

// คิดแผนครั้งแรกหลังประกาศ events (แกนเดือนอ่านวันสอบด้วย)
rebuildPlan()
if (import.meta.env.DEV && (estimatedWeeksFor(30, 5) !== 6 || weeklyHoursFor(3, true, 7) !== 7 || !isFirstCourse('MATH.1') || isFirstCourse('MATH.2') || !studentCourses.some(c => c.courseId === 'MATH.2') || calendarBudgetForWeek(u('2026-12-07')) !== 13 || calendarBudgetForWeek(u('2026-12-21')) !== 14)) throw new Error('weekly course calculation failed')

export { courseCatalog, studyCalendar, studentCourses }

// --- สีชนิดสอบ (encoding เดียวกับ All: น้ำเงิน = สอบจริง, แดง = Mock) ---
export const KIND_COLOR = { exam: '#2b6cd4', mock: '#ef6268' } as const

// --- หน้า Month: หน้าต่างเดือน + agenda (กติกา section ล็อกไว้ใน GLOSSARY.md) ---
// เส้นตัด R ของแต่ละเดือน: เดือนของ TODAY → TODAY · เดือนอดีต → สิ้นเดือน · เดือนอนาคต → ก่อนต้นเดือน
// ทุก section คำนวณจากข้อมูลล้วน ๆ — แก้ plan.ts แล้ว agenda ของทุกเดือนคำนวณใหม่เอง
const MONTHS_FULL = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
export const dayOf = (iso: string) => Number(iso.slice(8, 10))
export const monthShortOf = (iso: string) => mn[Number(iso.slice(5, 7)) - 1]
export const fmtMonth = (iso: string) => `${MONTHS_FULL[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(0, 4)) + 543}`
export const monthStartOf = (iso: string) => `${iso.slice(0, 7)}-01`
export const addMonths = (iso: string, n: number) => {
  const [y, m] = iso.split('-').map(Number)
  const t = y * 12 + (m - 1) + n
  return `${String(Math.floor(t / 12)).padStart(4, '0')}-${String((t % 12) + 1).padStart(2, '0')}-01`
}

export type AgendaCourse = Course & { subject: string; color: string }
export type AgendaGroup = { date: string; courses: AgendaCourse[]; events: ExamEvent[] }
export type Agenda = {
  monthStart: string
  monthEnd: string // exclusive
  isCurrent: boolean // หน้าต่างนี้ครอบ TODAY
  isPast: boolean
  inProgress: AgendaCourse[] // เดือนของ TODAY: คอร์สที่ครอบวันนี้
  active: AgendaCourse[] // เดือนอื่น: คอร์สที่ทับหน้าต่างเดือน
  upcoming: AgendaGroup[] // กลุ่มตามวันเริ่ม/วันสอบ หลัง R ภายในเดือน (สอบของวัน TODAY รวมกลุ่มวันนี้)
  finished: AgendaCourse[] // จบภายในเดือนก่อนถึง R
  pastEvents: ExamEvent[] // สอบ/Mock ในเดือนที่ผ่าน R ไปแล้ว
}

export function agendaFor(monthStartIso: string, today: string = TODAY): Agenda {
  const monthStart = monthStartOf(monthStartIso)
  const monthEnd = addMonths(monthStart, 1)
  const isCurrent = u(today) >= u(monthStart) && u(today) < u(monthEnd)
  const isPast = u(today) >= u(monthEnd)
  const R = isCurrent ? today : isPast ? monthEnd : addDays(monthStart, -1)
  const withSubject: AgendaCourse[] = subjects.flatMap(s => s.courses.map(c => ({ ...c, subject: s.name, color: s.color })))
  const inWin = (d: string) => d >= monthStart && d < monthEnd
  const inProgress = isCurrent ? withSubject.filter(c => u(c.start) <= u(today) && u(today) <= u(c.end)) : []
  // กำลังเรียนช่วงเดือน (เดือนอื่น): ทับหน้าต่างเดือนและยังไม่จบก่อน R — คอร์สที่จบในเดือนนั้นไปอยู่ finished อย่างเดียว
  const active = isCurrent ? [] : withSubject.filter(c => u(c.start) < u(monthEnd) && u(c.end) >= u(R))
  const finished = withSubject.filter(c => inWin(c.end) && u(c.end) < u(R))
  // กลุ่มถัดไป: รวมคอร์สที่เริ่มและสอบที่จัดหลัง R ภายในเดือน ตามวันที่ (สอบวัน TODAY อยู่กลุ่มวันนี้)
  const byDate = new Map<string, AgendaGroup>()
  for (const c of withSubject) {
    const ok = isCurrent ? (c.start > today && inWin(c.start)) : (!isPast && inWin(c.start))
    if (ok) (byDate.get(c.start) ?? byDate.set(c.start, { date: c.start, courses: [], events: [] }).get(c.start)!).courses.push(c)
  }
  for (const ev of events) {
    const ok = isCurrent ? (u(ev.date) >= u(today) && inWin(ev.date)) : (!isPast && inWin(ev.date))
    if (ok) (byDate.get(ev.date) ?? byDate.set(ev.date, { date: ev.date, courses: [], events: [] }).get(ev.date)!).events.push(ev)
  }
  const upcoming = [...byDate.values()].sort((a, b) => u(a.date) - u(b.date))
  const pastEvents = events.filter(ev => inWin(ev.date) && u(ev.date) < u(R))
  return { monthStart, monthEnd, isCurrent, isPast, inProgress, active, upcoming, finished, pastEvents }
}
