import type { CSSProperties } from 'react'
import { BookOpen, CalendarDays, ChevronLeft, ChevronRight, CircleUserRound, House } from 'lucide-react'

// PROTOTYPE — Yearly My Path (throwaway): ดีไซน์ที่เจ้าของเลือกแล้ว (เดิมชื่อ variant A · Timeline grid) บน /mypath/year-prototype
// ข้อตกลงที่ล็อกไว้ (2026-10-23):
//   1. Desktop: X = เดือน, Y = วิชา / Mobile (≤640px): พลิกแกน — Y = เดือน, X = วิชา
//   2. แถบคอร์สแยกทุกเล่ม ตาม "วันเริ่ม–วันจบ" ระดับวัน · เรียงต่อเนื่องในวิชา ไม่ซ้อนเวลา
//   3. start/end ทุกคอร์ส = คำนวณจากชั่วโมง (simulation รายวัน): อัตรา 15 ชม./สปด. แบ่งเท่ากันทุกวิชา
//      ที่เดินพร้อมกัน — แก้ hours ใน data block แล้ววันที่ทั้งแผนขยับเอง (ยกเว้น 3 แถบ fixed)
//   4. ชื่อในแถบ 3 ระดับตามพื้นที่: เต็ม → "เล่ม 1" → "ล. 1"
//   5. สอบ/Mock = เหตุการณ์ 1 วัน · รางป้าย 2 แถว ป้ายเรียงยาวได้ เลื่อนหนีกัน + เส้นจางชี้ลงหมุดวันจริง
//   6. สี = การซื้อ: แถบ/ป้ายสีเข้ม = ซื้อแล้ว, สีอ่อน = ยังไม่ได้ซื้อ (หัวแถบสีวิชาเสมอ)
//      รางสอบ: น้ำเงิน = สอบจริง, แดง = Mock (ซื้อครบยกเว้น Mock CBT)
//   7. แกนเวลา = ต.ค. 69 – ก.พ. 71 (17 เดือน day-exact) + แถบภาระรายสัปดาห์ (สัปดาห์จริง จันทร์–อาทิตย์)

// --- ปฏิทิน day-exact (ทำงานบน UTC กันเรื่อง DST) ---
const MS = 86_400_000
const u = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) }
const isoOf = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const addDays = (iso: string, n: number) => isoOf(u(iso) + n * MS)
const AXIS_START = '2026-10-01'
const AXIS_END = '2028-03-01' // exclusive = จบ ก.พ. 71
const TOTAL_DAYS = (u(AXIS_END) - u(AXIS_START)) / MS
const DAY_START = u('2026-09-28') // วันเริ่ม simulation (จันทร์ที่เริ่มเล่ม 1)
const DAY_LAST = u('2028-02-28') // วันสุดท้ายของแผน (ก่อนสอบ A-Level จบแผน)

const N = 17
const mn = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const be = (y: number) => String(y + 543).slice(2)
const fmtDate = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${mn[m - 1]} ${be(y)}` }
const fmtShort = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${mn[m - 1]}` }

// เดือนบนแกน (ความยาวจริง 31/30/29 วัน) — ใช้ทำหัวตารางและเส้นแบ่งให้ตรงกับตำแหน่งวันจริง
const axisMonths = (() => {
  const out: { label: string; days: number }[] = []
  let y = 2026, m = 10
  while (y < 2028 || m <= 2) {
    out.push({ label: `${mn[m - 1]} ${be(y)}`, days: new Date(Date.UTC(y, m, 0)).getUTCDate() })
    m += 1; if (m > 12) { m = 1; y += 1 }
  }
  return out
})()
// เส้นแบ่งเดือน (ตำแหน่ง % สะสมตามวันจริง ตัดเดือนแรกออก)
const monthLines = (() => {
  const lines: number[] = []
  let acc = 0
  for (let i = 0; i < axisMonths.length - 1; i++) { acc += axisMonths[i].days; lines.push((acc / TOTAL_DAYS) * 100) }
  return lines
})()

// ตำแหน่งวันบนแกน (หน่วย: เดือน 0..17, day-exact)
const pos = (iso: string) => ((u(iso) - u(AXIS_START)) / MS / TOTAL_DAYS) * N
const posMs = (ms: number) => ((ms - u(AXIS_START)) / MS / TOTAL_DAYS) * N
const pct = (v: number) => (v / N) * 100

type CourseSpec = { id: string; name: string; short: string; abbr: string; hours: number; owned?: boolean; anchor?: string; fixed?: { start: string; end: string } }
type Course = CourseSpec & { start: string; end: string }
type Subject = { name: string; color: string; courses: Course[] }
type ExamEvent = { id: string; date: string; label: string; kind: 'exam' | 'mock'; owned?: boolean }

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
    { id: 'MATH.1', name: 'Applied Math Admissions TCAS เล่ม 1 (For Dek70)', short: 'เล่ม 1', abbr: 'ล. 1', hours: 24, owned: true, anchor: '2026-09-28' },
    { id: 'MATH.2', name: 'Applied Math Admissions TCAS เล่ม 2 (For Dek70)', short: 'เล่ม 2', abbr: 'ล. 2', hours: 24, owned: true },
    { id: 'MATH.3', name: 'Applied Math Admissions TCAS เล่ม 3', short: 'เล่ม 3', abbr: 'ล. 3', hours: 18, owned: true },
    { id: 'MATH.4', name: 'Applied Math Admissions TCAS เล่ม 4', short: 'เล่ม 4', abbr: 'ล. 4', hours: 21 },
    { id: 'MATH.5', name: 'Applied Math Admissions TCAS เล่ม 5', short: 'เล่ม 5', abbr: 'ล. 5', hours: 24 },
    { id: 'MATH.UP', name: 'Upskill คณิตศาสตร์ประยุกต์ 1 A-Level', short: 'Upskill คณิต', abbr: 'UP', hours: 64.5, fixed: { start: '2027-12-01', end: '2028-01-15' } },
    { id: 'MATH.EX', name: 'MATH TCAS ตะลุยโจทย์ข้อสอบ ครบทุกแนว (UPDATE Version 2026 · TCAS70)', short: 'ตะลุยโจทย์ MATH', abbr: 'ตะลุย', hours: 30, fixed: { start: '2028-01-16', end: '2028-02-28' } },
  ]},
  { name: 'ฟิสิกส์', color: '#d72630', courses: [
    { id: 'PHY.0', name: 'ปรับพื้นฐานฟิสิกส์ TCAS (ปูพื้น ครบทุกทักษะ ครบทุกแนว)', short: 'ปรับพื้นฐาน', abbr: 'ปูพื้น', hours: 18, owned: true, anchor: '2026-10-01' },
    { id: 'PHY.1', name: 'ฟิสิกส์ TCAS ล. 1', short: 'ล. 1', abbr: 'ล.1', hours: 24, owned: true },
    { id: 'PHY.2', name: 'ฟิสิกส์ TCAS ล. 2 · กลศาสตร์วิเคราะห์ 2', short: 'ล. 2 · กลศาสตร์ 2', abbr: 'ล.2', hours: 21, owned: true },
    { id: 'PHY.3', name: 'ฟิสิกส์ TCAS ล. 3', short: 'ล. 3', abbr: 'ล.3', hours: 15, owned: true },
    { id: 'PHY.4', name: 'ฟิสิกส์ TCAS ล. 4', short: 'ล. 4', abbr: 'ล.4', hours: 18, owned: true },
    { id: 'PHY.5', name: 'ฟิสิกส์ TCAS ล. 5', short: 'ล. 5', abbr: 'ล.5', hours: 12 },
    { id: 'PHY.6', name: 'ฟิสิกส์ TCAS ล. 6', short: 'ล. 6', abbr: 'ล.6', hours: 15 },
    { id: 'PHY.7', name: 'ฟิสิกส์ TCAS ล. 7', short: 'ล. 7', abbr: 'ล.7', hours: 15 },
    { id: 'PHY.EX', name: "PHYSICS TCAS Dek'70 ตะลุยโจทย์ข้อสอบ ครบทุกแนว (TCAS70)", short: 'ตะลุยโจทย์ฟิสิกส์', abbr: 'ตะลุย', hours: 24, anchor: '2027-12-01' },
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
    { id: 'CHEM.EX', name: 'ตะลุยโจทย์ Upskill เคมี A-Level', short: 'ตะลุยโจทย์', abbr: 'ตะลุย', hours: 24, anchor: '2027-12-01' },
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

const subjects: Subject[] = subjectsSpec.map(s => ({
  name: s.name, color: s.color,
  courses: s.courses.map(c => ({ ...c, start: isoOf(simStart.get(c.id) ?? DAY_LAST), end: isoOf(simEnd.get(c.id) ?? DAY_LAST) }))
}))

// จาก SAMPLE_DATA/exam-dates.md (เจ้าของจัดใหม่ตามภาพ Plan Canvas 20.37.58) — สอบจริง 2 + Mock 6, ทุกรายการ 1 วัน
// สีตามตำนานภาพ: น้ำเงิน = สอบจริง, แดง = Mock · เข้ม = ซื้อแล้ว, อ่อน = ยังไม่ได้ซื้อ (ซื้อครบยกเว้น Mock CBT)
const events: ExamEvent[] = [
  { id: 'M1', date: '2026-12-20', label: 'Mock ลองสนาม', kind: 'mock', owned: true },
  { id: 'M2', date: '2027-08-16', label: 'Mock TGAT/TPAT', kind: 'mock', owned: true },
  { id: 'M3', date: '2027-08-30', label: 'Mock A-Level', kind: 'mock', owned: true },
  { id: 'M4', date: '2027-09-13', label: 'Mock CBT', kind: 'mock' },
  { id: 'M5', date: '2027-12-18', label: 'Mock 2 TGAT/TPAT', kind: 'mock', owned: true },
  { id: 'X1', date: '2028-01-16', label: 'สอบ TGAT/TPAT', kind: 'exam', owned: true },
  { id: 'M6', date: '2028-01-23', label: 'Mock 2 A-Level', kind: 'mock', owned: true },
  { id: 'X2', date: '2028-02-06', label: 'สอบ A-Level', kind: 'exam', owned: true },
]

const totalHours = subjects.reduce((t, s) => t + s.courses.reduce((a, c) => a + c.hours, 0), 0)

const x0 = (c: Course) => Math.max(0, pos(c.start))
const x1 = (c: Course) => Math.min(N, pos(addDays(c.end, 1)))
// ระดับชื่อตามความกว้างแถบ (เดือน): ≥3 = ชื่อเต็ม (มือถือใช้ชื่อย่อ), ≥0.9 = "เล่ม 1", ต่ำกว่า = "ล. 1"
const labelFor = (c: Course, compact = false) => {
  const span = x1(c) - x0(c)
  if (span >= 3) return compact ? c.short : c.name
  return span >= 0.9 ? c.short : c.abbr
}
const barTitle = (c: Course) => `${c.id} · ${c.name} · ${fmtDate(c.start)} – ${fmtDate(c.end)} · ${c.hours} ชม. · ${c.owned ? 'ซื้อแล้ว' : 'ยังไม่ได้ซื้อ'}`

// สีตัวอักษรบนแถบทึบ (ซื้อแล้ว): สีวิชาอ่อนใช้ตัวเข้ม สีเข้มใช้ขาว
const barText = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  const lum = (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return lum > 0.55 ? '#212529' : '#fff'
}

const navItems = [['หน้าแรก', House, '/'], ['คอร์ส', BookOpen, '/courses'], ['แผนเรียน', CalendarDays, '/mypath'], ['โปรไฟล์', CircleUserRound, '/profile']] as const

const gridCols = (withLabel: boolean) => ({ gridTemplateColumns: withLabel ? `140px ${axisMonths.map(m => `${m.days}fr`).join(' ')}` : axisMonths.map(m => `${m.days}fr`).join(' ') })

/* ---------- shared pieces ---------- */

function MonthLines() {
  return <>{monthLines.map(p => <i key={p} style={{ left: `${p}%` }} />)}</>
}

// ราง event: ป้าย 2 บรรทัด (ชื่อชั้นบน วันที่ชั้นล่าง) center ตรงกับวันจริงเสมอ — ป้ายที่จะทับกันไต่ลงแถวล่าง
// (จำนวนแถวโตตามจำเนียน) และมีเส้นจางๆ จากใต้ป้ายลงไปหาหมุดวงกลมที่ตำแหน่งวันจริงบนเส้นราง
function EventRail({ big = false }: { big?: boolean }) {
  const pillH = big ? 35 : 29
  const step = big ? 39 : 33
  const GAP = 1 // ช่องไฟระหว่างป้ายในแถวเดียวกัน (% ของความกว้างราง)
  const ends: number[] = [] // ขอบขวาของป้ายใบสุดท้ายในแต่ละแถว
  const items = [...events].sort((a, b) => pos(a.date) - pos(b.date)).map(ev => {
    const w = (ev.label.length * (big ? 6.3 : 5.6) + 16) / 10.4 // กว้างป้ายโดยประมาณ (ใช้จัดแถว ป้ายจริง center เอง)
    const x = pct(pos(ev.date))
    const half = w / 2 + GAP
    let lane = ends.findIndex(r => r <= x - half)
    if (lane === -1) { lane = ends.length; ends.push(x + half) } else ends[lane] = x + half
    return { ev, lane, x }
  })
  const railH = ends.length * step + 18
  const dotY = railH - 6
  return (
    <div className={big ? 'yp-rail big' : 'yp-rail'} style={{ height: railH }}>
      <svg viewBox={`0 0 100 ${railH}`} preserveAspectRatio="none" aria-hidden="true">
        {items.map(({ ev, lane, x }) => {
          const top = lane * step + pillH
          return <line key={ev.id} className={ev.kind} x1={x} y1={top} x2={x} y2={dotY} />
        })}
      </svg>
      {items.map(({ ev, lane, x }) => (
        <i key={ev.id} className={ev.kind + (ev.owned ? '' : ' no')}
          style={{ left: `${x}%`, top: lane * step, transform: 'translateX(-50%)' }}>
          {ev.label}<small>{fmtDate(ev.date)}</small>
        </i>
      ))}
      {events.map(ev => <em key={ev.id} className={ev.kind + (ev.owned ? '' : ' no')} style={{ left: `${pct(pos(ev.date))}%` }} />)}
    </div>
  )
}

function YearTable() {
  return (
    <div className="yp-table">
      <div className="yp-table-inner">
        <div className="yp-months" style={gridCols(true)}>
          <i />
          {axisMonths.map(m => <span key={m.label}>{m.label}</span>)}
        </div>
        <div className="yp-eventrow" style={gridCols(true)}>
          <i />
          <EventRail />
        </div>
        {subjects.map(s => (
          <div className="yp-row" key={s.name} style={{ ...gridCols(true), '--subject': s.color } as CSSProperties}>
            <b><i style={{ background: s.color }} />{s.name}</b>
            <div className="yp-track">
              <MonthLines />
              {s.courses.map(c => (
                <span key={c.id} className={'yp-bar' + (c.owned ? ' own' : ' own-no')} title={barTitle(c)}
                  style={{ color: c.owned ? barText(s.color) : undefined, left: `calc(${pct(x0(c))}% + 2px)`, width: `calc(${pct(x1(c) - x0(c))}% - 4px)` }}>
                  {labelFor(c)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// แถบภาระเรียนต่อสัปดาห์ — หน่วยเป็น "ชั่วโมงที่ต้องใช้" ไม่ใช่จำนวนคอร์ส:
// แต่ละคอร์สกระจายชั่วโมงลงทุกสัปดาห์ที่มันเปิดอยู่ (ชม. ÷ ความยาวคอร์ส) แล้วรวมกันเทียบงบ 15 ชม./สัปดาห์
// (วันธรรมดา 1 ชม./วัน + เสาร์อาทิตย์ 5 ชม./วัน) — เขียว = ไม่เกินงบ · ส้ม = เกิน · แดง = เกินกว่า 1.5 เท่า
function LoadRow() {
  const WEEK_BUDGET = 15
  const axisStartMs = u(AXIS_START)
  const firstMonday = axisStartMs - ((new Date(axisStartMs).getUTCDay() + 6) % 7) * MS
  const allCourses = subjects.flatMap(s => s.courses)
  const weeks: { s: number; e: number; n: number; demand: number }[] = []
  for (let s = firstMonday; s < u(AXIS_END); s += 7 * MS) {
    const e = Math.min(s + 7 * MS, u(AXIS_END))
    let demand = 0, n = 0
    for (const c of allCourses) {
      const cs = u(c.start), ce = u(addDays(c.end, 1))
      const ov = Math.max(0, Math.min(ce, e) - Math.max(cs, s))
      if (ov > 0) { n++; demand += c.hours * (ov / (ce - cs)) }
    }
    weeks.push({ s, e, n, demand })
  }
  const max = Math.max(...weeks.map(w => w.demand), 1)
  return (
    <div className="yp-load">
      <div className="yp-load-grid">
        <span>ชม./สัปดาห์</span>
        <div>
          {monthLines.map(p => <em key={p} style={{ left: `${p}%` }} />)}
          {weeks.map(w => {
            const cls = w.n === 0 ? 'off' : w.demand > WEEK_BUDGET * 1.5 ? 'hot' : w.demand > WEEK_BUDGET ? 'warm' : ''
            const title = `${fmtDate(isoOf(w.s))} – ${fmtDate(isoOf(w.e - MS))} · ${w.demand.toFixed(1)} ชม./สัปดาห์ (งบ 15 ชม.) · ${w.n} คอร์ส`
            const left = Math.max(0, posMs(w.s))
            return <i key={w.s} className={cls} title={title}
              style={{ left: `${pct(left)}%`, width: `${pct(Math.max(0.02, posMs(w.e) - left))}%`, height: `${w.n === 0 ? 8 : Math.max(20, (w.demand / max) * 100)}%` }} />
          })}
        </div>
      </div>
    </div>
  )
}

/* Mobile พลิกแกนตามข้อตกลง: Y = เดือน (17 แถว), X = วิชา, event 1 วัน = แถบคาดเต็มความกว้างคั่นทุกวิชา */
function MobileYear() {
  const rowH = 26
  // แถบสอบกว้างเต็มหน้าจอ สองแถบที่ห่างกัน <13px ต้องคนละชั้น (กองซ้อนทีละ 13px)
  const placed: { y: number; slot: number }[] = []
  const bands = events.map(ev => {
    const y = (pos(ev.date) / N) * (N * rowH)
    let slot = 0
    for (const p of placed) if (y - p.y < 13) slot = Math.max(slot, p.slot + 1)
    placed.push({ y, slot })
    return { ev, y, slot }
  })
  return (
    <section className="yp-mobile">
      <div className="yp-mobile-head">
        <i />
        {subjects.map(s => <b key={s.name}><i style={{ background: s.color }} />{s.name}</b>)}
      </div>
      <div className="yp-mobile-body">
        <div className="yp-months-col">{axisMonths.map(m => <span key={m.label}>{m.label}</span>)}</div>
        <div className="yp-mobile-tracks">
          {bands.map(({ ev, y, slot }) => (
            <i key={ev.id} className={`yp-band ${ev.kind}${ev.owned ? '' : ' no'}`}
              style={{ top: `${(y / (N * rowH)) * 100}%`, marginTop: slot * 20 }}>
              {ev.label} · {fmtShort(ev.date)}
            </i>
          ))}
          {subjects.map(s => (
            <div className="yp-col" key={s.name} style={{ '--subject': s.color } as CSSProperties}>
              {s.courses.map(c => (
                <span key={c.id} className={'yp-bar' + (c.owned ? ' own' : ' own-no')}
                  style={{ color: c.owned ? barText(s.color) : undefined, top: `calc(${(x0(c) / N) * 100}% + 3px)`, height: `calc(${((x1(c) - x0(c)) / N) * 100}% - 5px)` }}>
                  {labelFor(c, true)}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- shell ---------- */

export default function MyPathYearPrototype() {
  return (
    <main className="yp-page">
      <div className="yp-shell">
        <header className="monthly-header yp-header">
          <div className="monthly-tabs">
            <a href="/mypath">Week</a>
            <a href="/mypath">Month</a>
            <a className="active" href="/mypath/year-prototype">Year</a>
          </div>
          <div className="month-picker">
            <button aria-label="ย้อนกลับ"><ChevronLeft /></button>
            <b>ต.ค. 2569 – ก.พ. 2571</b>
            <button aria-label="ถัดไป"><ChevronRight /></button>
          </div>
          <button className="study-calendar"><CalendarDays size={20} /><span>ปฏิทินการเรียน</span></button>
        </header>
        <div className="yp-desktop"><YearTable /><LoadRow /></div>
        <MobileYear />
        <details className="yp-data">
          <summary>ข้อมูล mock (SAMPLE_DATA) + ข้อตกลงที่ล็อกไว้</summary>
          <pre>{JSON.stringify({ axis: 'ต.ค. 69 – ก.พ. 71 (17 เดือน)', totalHours, subjects, events }, null, 2)}</pre>
        </details>
      </div>
      <nav className="bottom-nav">
        {navItems.map(([label, Icon, href], index) => (
          <a className={index === 2 ? 'active' : ''} href={href} key={label}><Icon size={24} /><span>{label}</span></a>
        ))}
      </nav>
    </main>
  )
}
