// แผนเรียน mock ของ My Path — ข้อมูล + simulation คิดวันที่ + เรขาคณิตแกนเวลา day-exact
// ที่มา = SAMPLE_DATA/ (courses.md + study-plan.md สำหรับคอร์ส, exam-dates.md สำหรับสอบ) — mirror ด้วยมือ
// แก้ hours ใน subjectsSpec ทีเดียว → วันเริ่ม-จบของทั้งแผนขยับเอง (ยกเว้น 3 แถบ fixed)

// --- ปฏิทิน day-exact (ทำงานบน UTC กันเรื่อง DST) ---
export const MS = 86_400_000
export const u = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) }
export const isoOf = (ms: number) => new Date(ms).toISOString().slice(0, 10)
export const addDays = (iso: string, n: number) => isoOf(u(iso) + n * MS)
export const AXIS_START = '2026-10-01'
export const AXIS_END = '2028-03-01' // exclusive = จบ ก.พ. 71
export const TOTAL_DAYS = (u(AXIS_END) - u(AXIS_START)) / MS
const DAY_START = u('2026-09-28') // วันเริ่ม simulation (จันทร์ที่เริ่มเล่ม 1)
const DAY_LAST = u('2028-02-28') // วันสุดท้ายของแผน (ก่อนสอบ A-Level จบแผน)

// วันอ้างอิงของ mock (GLOSSARY.md: "วันนี้") — ค่าเดียว ทั้ง Month และ Year ใช้ร่วมกัน
// แก้ค่านี้ทีเดียว → section ของทั้งสองหน้าขยับตาม (ไม่อ่านนาฬิกาเครื่อง)
export const TODAY = '2026-12-05'

export const N = 17
const mn = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const be = (y: number) => String(y + 543).slice(2)
export const fmtDate = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${mn[m - 1]} ${be(y)}` }
export const fmtShort = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${mn[m - 1]}` }

// เดือนบนแกน (ความยาวจริง 31/30/29 วัน) — ใช้ทำหัวตารางและเส้นแบ่งให้ตรงกับตำแหน่งวันจริง
export const axisMonths = (() => {
  const out: { label: string; days: number }[] = []
  let y = 2026, m = 10
  while (y < 2028 || m <= 2) {
    out.push({ label: `${mn[m - 1]} ${be(y)}`, days: new Date(Date.UTC(y, m, 0)).getUTCDate() })
    m += 1; if (m > 12) { m = 1; y += 1 }
  }
  return out
})()
// เส้นแบ่งเดือน (ตำแหน่ง % สะสมตามวันจริง ตัดเดือนแรกออก)
export const monthLines = (() => {
  const lines: number[] = []
  let acc = 0
  for (let i = 0; i < axisMonths.length - 1; i++) { acc += axisMonths[i].days; lines.push((acc / TOTAL_DAYS) * 100) }
  return lines
})()

// ตำแหน่งวันบนแกน (หน่วย: เดือน 0..17, day-exact)
export const pos = (iso: string) => ((u(iso) - u(AXIS_START)) / MS / TOTAL_DAYS) * N
export const posMs = (ms: number) => ((ms - u(AXIS_START)) / MS / TOTAL_DAYS) * N
export const pct = (v: number) => (v / N) * 100

type CourseSpec = { id: string; name: string; short: string; abbr: string; hours: number; owned?: boolean; anchor?: string; fixed?: { start: string; end: string }; cover?: string }
export type Course = CourseSpec & { start: string; end: string }
export type Subject = { name: string; color: string; courses: Course[] }
export type ExamEvent = { id: string; date: string; label: string; kind: 'exam' | 'mock'; owned?: boolean }

// จาก SAMPLE_DATA/courses.md + study-plan.md (25 คอร์ส, 554.5 ชม.) — start/end ของทุกคอร์ส "คำนวณจากชั่วโมง"
// ด้วย simulation รายวัน: อัตราเรียน 15 ชม./สปด. (1 ชม./วันธรรมดา + 5 ชม./เสาร์-อาทิตย์) แบ่งเท่า ๆ กัน
// ทุกวิชาที่เดินพร้อมกันในแต่ละวัน · คอร์สเริ่มวันถัดจากคอร์สก่อนหน้าในวิชาเดียวกันจบ (ไม่เร็วกว่า anchor ของตัวเอง)
// ยกเว้น 3 แถบ fixed: TGAT.1 (เรียนเบาทั้งแถบ 17 สปด.) และ MATH.UP + MATH.EX (ผูกฤดูสอบ split 13 สปด. ตามแถบภาพ)
// → แก้ hours ที่นี่ทีเดียว วันเริ่ม-จบทั้งแผนขยับให้เอง
const subjectsSpec: { name: string; color: string; courses: CourseSpec[] }[] = [
  { name: 'TPAT3', color: '#a51d1d', courses: [
    { id: 'TPAT3.1', name: 'ติวเข้มความถนัด วิศวะ (TPAT3)', short: 'ติวเข้ม TPAT3', abbr: 'ติวเข้ม', hours: 30, owned: true, anchor: '2026-10-01' },
    { id: 'TPAT3.2', name: 'ตะลุยโจทย์ TPAT3 · ทำข้อสอบเก่า', short: 'ทำข้อสอบเก่า', abbr: 'ทำข้อสอบ', hours: 18, anchor: '2027-12-01' },
  ]},
  { name: 'คณิต 1', color: '#0078c4', courses: [
    { id: 'MATH.1', name: 'Applied Math Admissions TCAS เล่ม 1 (For Dek70)', short: 'เล่ม 1', abbr: 'ล. 1', hours: 24, owned: true, anchor: '2026-09-28', cover: '/cover/Math_TCAS70_1.png' },
    { id: 'MATH.2', name: 'Applied Math Admissions TCAS เล่ม 2 (For Dek70)', short: 'เล่ม 2', abbr: 'ล. 2', hours: 24, owned: true, cover: '/cover/Math_TCAS70_2.png' },
    { id: 'MATH.3', name: 'Applied Math Admissions TCAS เล่ม 3', short: 'เล่ม 3', abbr: 'ล. 3', hours: 18, owned: true, cover: '/cover/Math_TCAS70_3.png' },
    { id: 'MATH.4', name: 'Applied Math Admissions TCAS เล่ม 4', short: 'เล่ม 4', abbr: 'ล. 4', hours: 21, cover: '/cover/Math_TCAS70_4.png' },
    { id: 'MATH.5', name: 'Applied Math Admissions TCAS เล่ม 5', short: 'เล่ม 5', abbr: 'ล. 5', hours: 24, cover: '/cover/Math_TCAS70_5.png' },
    { id: 'MATH.UP', name: 'Upskill คณิตศาสตร์ประยุกต์ 1 A-Level', short: 'Upskill คณิต', abbr: 'UP', hours: 64.5, fixed: { start: '2027-12-01', end: '2028-01-15' } },
    { id: 'MATH.EX', name: 'MATH TCAS ตะลุยโจทย์ข้อสอบ ครบทุกแนว (UPDATE Version 2026 · TCAS70)', short: 'ตะลุยโจทย์ MATH', abbr: 'ตะลุย', hours: 30, fixed: { start: '2028-01-16', end: '2028-02-28' }, cover: '/cover/Exam_Gym_Math.png' },
  ]},
  { name: 'ฟิสิกส์', color: '#d72630', courses: [
    { id: 'PHY.0', name: 'ปรับพื้นฐานฟิสิกส์ TCAS (ปูพื้น ครบทุกทักษะ ครบทุกแนว)', short: 'ปรับพื้นฐาน', abbr: 'ปูพื้น', hours: 18, owned: true, anchor: '2026-10-01' },
    { id: 'PHY.1', name: 'ฟิสิกส์ TCAS ล. 1', short: 'ล. 1', abbr: 'ล.1', hours: 24, owned: true, cover: '/cover/Physics_TCAS70_1.png' },
    { id: 'PHY.2', name: 'ฟิสิกส์ TCAS ล. 2 · กลศาสตร์วิเคราะห์ 2', short: 'ล. 2 · กลศาสตร์ 2', abbr: 'ล.2', hours: 21, owned: true, cover: '/cover/Physics_TCAS70_2.png' },
    { id: 'PHY.3', name: 'ฟิสิกส์ TCAS ล. 3', short: 'ล. 3', abbr: 'ล.3', hours: 15, owned: true, cover: '/cover/Physics_TCAS70_3.png' },
    { id: 'PHY.4', name: 'ฟิสิกส์ TCAS ล. 4', short: 'ล. 4', abbr: 'ล.4', hours: 18, owned: true, cover: '/cover/Physics_TCAS70_4.png' },
    { id: 'PHY.5', name: 'ฟิสิกส์ TCAS ล. 5', short: 'ล. 5', abbr: 'ล.5', hours: 12, cover: '/cover/Physics_TCAS70_5.png' },
    { id: 'PHY.6', name: 'ฟิสิกส์ TCAS ล. 6', short: 'ล. 6', abbr: 'ล.6', hours: 15, cover: '/cover/Physics_TCAS70_6.png' },
    { id: 'PHY.7', name: 'ฟิสิกส์ TCAS ล. 7', short: 'ล. 7', abbr: 'ล.7', hours: 15, cover: '/cover/Physics_TCAS70_7.png' },
    { id: 'PHY.EX', name: "PHYSICS TCAS Dek'70 ตะลุยโจทย์ข้อสอบ ครบทุกแนว (TCAS70)", short: 'ตะลุยโจทย์ฟิสิกส์', abbr: 'ตะลุย', hours: 24, anchor: '2027-12-01', cover: '/cover/Exam_Gym_Physic.png' },
  ]},
  { name: 'TGAT', color: '#ff6b17', courses: [
    { id: 'TGAT.1', name: 'ล่าแข่ง TGAT', short: 'ล่าแข่ง TGAT', abbr: 'ล่าแข่ง', hours: 15, fixed: { start: '2027-08-01', end: '2027-11-29' } },
  ]},
  { name: 'เคมี', color: '#f5bd3d', courses: [
    { id: 'CHEM.1', name: 'เคมี TCAS เล่ม 1 · กลุ่มอะตอมและตารางธาตุ', short: 'เล่ม 1', abbr: 'ล. 1', hours: 20, anchor: '2026-12-01' },
    { id: 'CHEM.2', name: 'เคมี TCAS เล่ม 2 · ปริมาณสัมพันธ์', short: 'เล่ม 2', abbr: 'ล. 2', hours: 20 },
    { id: 'CHEM.3', name: 'เคมี TCAS เล่ม 3 · พันธะเคมี', short: 'เล่ม 3', abbr: 'ล. 3', hours: 20 },
    { id: 'CHEM.4', name: 'เคมี TCAS เล่ม 4', short: 'เล่ม 4', abbr: 'ล. 4', hours: 20, anchor: '2027-08-01' },
    { id: 'CHEM.5', name: 'เคมี TCAS เล่ม 5', short: 'เล่ม 5', abbr: 'ล. 5', hours: 20 },
    { id: 'CHEM.EX', name: 'ตะลุยโจทย์ Upskill เคมี A-Level', short: 'ตะลุยโจทย์', abbr: 'ตะลุย', hours: 24, anchor: '2027-12-01', cover: '/cover/Exam_Gym_Chemistry.png' },
  ]},
]

// simulation รายวัน: เดินวันทีละวัน แบ่ง 15 ชม. ให้วิชาที่เดินอยู่เท่า ๆ กัน จนครบชั่วโมงของแต่ละคอร์ส
const simStart = new Map<string, number>()
const simEnd = new Map<string, number>()
{
  const acc = new Map<string, number>()
  const done = new Set<string>()
  const flat: { c: CourseSpec; prev: string | null }[] = []
  for (const s of subjectsSpec) s.courses.forEach((c, i) => flat.push({ c, prev: i ? s.courses[i - 1].id : null }))
  for (const { c } of flat) if (c.fixed) { simStart.set(c.id, u(c.fixed.start)); simEnd.set(c.id, u(c.fixed.end)); done.add(c.id) }
  let day = DAY_START
  while (day <= DAY_LAST && done.size < flat.length) {
    // เริ่มคอร์สที่คิวถึงแล้ว: คอร์สก่อนหน้าในวิชาเดียวกันจบแล้ว และถึงวัน anchor (ถ้ามี)
    for (const { c, prev } of flat) {
      if (simStart.has(c.id)) continue
      if ((prev === null || done.has(prev)) && (c.anchor === undefined || day >= u(c.anchor))) simStart.set(c.id, day)
    }
    // วิชาที่เดินอยู่วันนี้ (รวม fixed) แบ่งชั่วโมงเท่า ๆ กัน — อัตราต่อวัน = (15 ชม./สปด. ÷ 7) ÷ จำนวนวิชา
    const active = flat.filter(({ c }) =>
      c.fixed ? (day >= u(c.fixed.start) && day <= u(c.fixed.end)) : (simStart.has(c.id) && !done.has(c.id)))
    const rate = active.length ? 15 / (7 * active.length) : 0
    for (const { c } of active) {
      if (c.fixed) continue
      const a = (acc.get(c.id) ?? 0) + rate
      acc.set(c.id, a)
      if (a >= c.hours - 1e-9) { simEnd.set(c.id, day); done.add(c.id) }
    }
    day += MS
  }
}

export const subjects: Subject[] = subjectsSpec.map(s => ({
  name: s.name, color: s.color,
  courses: s.courses.map(c => ({ ...c, start: isoOf(simStart.get(c.id) ?? DAY_LAST), end: isoOf(simEnd.get(c.id) ?? DAY_LAST) }))
}))

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

export const totalHours = subjects.reduce((t, s) => t + s.courses.reduce((a, c) => a + c.hours, 0), 0)

// --- สีชนิดสอบ (encoding เดียวกับรางป้ายของ Year: น้ำเงิน = สอบจริง, แดง = Mock) ---
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
