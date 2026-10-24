import type { CSSProperties } from 'react'
import PathHeader from '../components/PathHeader'
import BottomNav from '../components/BottomNav'
import { MS, N, TOTAL_DAYS, AXIS_START, AXIS_END, u, isoOf, addDays, fmtDate, fmtShort, axisMonths, monthLines, pos, posMs, pct, subjects, events, totalHours, type Course } from '../mypath/plan'
// PROTOTYPE — คลิกแถบคอร์สเปิดรายละเอียด (desktop แผงขวา / มือถือ bottom sheet)
import { useOpenCourse, CourseDetailOverlay } from '../mypath/CourseDetailPrototype'
import './MyPathYear.css'

// Yearly My Path: ดีไซน์ที่เจ้าของเลือกแล้ว (เดิมชื่อ variant A · Timeline grid) บน /mypath/year
// ข้อตกลงที่ล็อกไว้ (2026-10-23):
//   1. Desktop: X = เดือน, Y = วิชา / Mobile (≤640px): พลิกแกน — Y = เดือน, X = วิชา
//   2. แถบคอร์สแยกทุกเล่ม ตาม "วันเริ่ม–วันจบ" ระดับวัน · เรียงต่อเนื่องในวิชา ไม่ซ้อนเวลา
//   3. start/end ทุกคอร์ส = คำนวณจากชั่วโมง (simulation รายวัน): อัตรา 15 ชม./สปด. แบ่งเท่ากันทุกวิชา
//      ที่เดินพร้อมกัน — แก้ hours ใน src/mypath/plan.ts แล้ววันที่ทั้งแผนขยับเอง (ยกเว้น 3 แถบ fixed)
//   4. ชื่อในแถบ 3 ระดับตามพื้นที่: เต็ม → "เล่ม 1" → "ล. 1"
//   5. สอบ/Mock = เหตุการณ์ 1 วัน · รางป้าย 2 แถว ป้ายเรียงยาวได้ เลื่อนหนีกัน + เส้นจางชี้ลงหมุดวันจริง
//   6. สี = การซื้อ: แถบ/ป้ายสีเข้ม = ซื้อแล้ว, สีอ่อน = ยังไม่ได้ซื้อ (หัวแถบสีวิชาเสมอ)
//      รางสอบ: น้ำเงิน = สอบจริง, แดง = Mock (ซื้อครบยกเว้น Mock CBT)
//   7. แกนเวลา = ต.ค. 69 – ก.พ. 71 (17 เดือน day-exact) + แถบภาระรายสัปดาห์ (สัปดาห์จริง จันทร์–อาทิตย์)

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

const gridCols = (withLabel: boolean) => ({ gridTemplateColumns: withLabel ? `140px ${axisMonths.map(m => `${m.days}fr`).join(' ')}` : axisMonths.map(m => `${m.days}fr`).join(' ') })

/* ---------- shared pieces ---------- */

function MonthLines() {
  return <>{monthLines.map(p => <i key={p} style={{ left: `${p}%` }} />)}</>
}

function MonthBands() {
  let left = 0
  return <>{axisMonths.map((month, index) => {
    const width = (month.days / TOTAL_DAYS) * 100
    const band = <span aria-hidden="true" className={`yp-month-band${index % 2 ? ' alternate' : ''}`} key={month.label} style={{ left: `${left}%`, width: `${width}%` }} />
    left += width
    return band
  })}</>
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
      <MonthBands />
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
  const open = useOpenCourse()
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
              <MonthBands />
              <MonthLines />
              {s.courses.map(c => (
                <span key={c.id} className={'yp-bar' + (c.owned ? ' own' : ' own-no')} title={barTitle(c)} role="button" tabIndex={0}
                  onClick={() => open(c.id)} onKeyDown={e => { if (e.key === 'Enter') open(c.id) }}
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

const mobileMonthRanges = (() => {
  let daysBefore = 0
  return axisMonths.map(month => {
    const start = (daysBefore / TOTAL_DAYS) * N
    const startDate = addDays(AXIS_START, daysBefore)
    daysBefore += month.days
    return { ...month, start, end: (daysBefore / TOTAL_DAYS) * N, startDate, endDate: addDays(AXIS_START, daysBefore) }
  })
})()

/* Mobile พลิกแกน: หนึ่งแถวต่อเดือน — แถบสอบอยู่หัวเดือน, คอร์สอยู่ด้านล่าง */
function MobileYear() {
  const open = useOpenCourse()
  return (
    <section className="yp-mobile">
      <div className="yp-mobile-head">
        <i />
        {subjects.map(s => <b key={s.name}><i style={{ background: s.color }} />{s.name}</b>)}
      </div>
      <div className="yp-mobile-months">{mobileMonthRanges.map(month => {
        const monthEvents = events.filter(event => pos(event.date) >= month.start && pos(event.date) < month.end)
        return <section className="yp-mobile-month" key={month.label}>
          <b>{month.label}</b>
          <div className="yp-mobile-month-content">
            {monthEvents.length > 0 && <div className="yp-mobile-events">{monthEvents.map(event => <span key={event.id} className={`yp-mobile-event ${event.kind}${event.owned ? '' : ' no'}`}>{event.label} · {fmtShort(event.date)}</span>)}</div>}
            <div className="yp-mobile-subjects">{subjects.map(subject => {
              const courses = subject.courses.filter(course => x0(course) < month.end && x1(course) > month.start)
              const fillsMonth = courses.some(course => u(course.start) <= u(month.startDate) && u(addDays(course.end, 1)) >= u(month.endDate))
              return <div className={`yp-mobile-cell${fillsMonth ? ' full-month' : ''}`} key={subject.name} style={{ '--subject': subject.color } as CSSProperties}>{courses.map(course => <span key={course.id} className={'yp-mobile-course' + (course.owned ? ' own' : ' own-no')} role="button" tabIndex={0} onClick={() => open(course.id)} style={{ color: course.owned ? barText(subject.color) : undefined }}>{labelFor(course, true)}</span>)}</div>
            })}</div>
          </div>
        </section>
      })}</div>
    </section>
  )
}

/* ---------- shell ---------- */

export default function MyPathYear() {
  return (
    <main className="yp-page">
      <div className="yp-shell">
        <PathHeader active="year" period="ต.ค. 2569 – ก.พ. 2571" />
        <div className="yp-desktop"><YearTable /><LoadRow /></div>
        <MobileYear />
        <details className="yp-data">
          <summary>ข้อมูล mock (SAMPLE_DATA) + ข้อตกลงที่ล็อกไว้</summary>
          <pre>{JSON.stringify({ axis: 'ต.ค. 69 – ก.พ. 71 (17 เดือน)', totalHours, subjects, events }, null, 2)}</pre>
        </details>
        <CourseDetailOverlay />
      </div>
      <BottomNav active="mypath" />
    </main>
  )
}
