import { type CSSProperties } from 'react'
import PathHeader from '../components/PathHeader'
import { AXIS_END, AXIS_START, MS, TODAY, addDays, calendarBudgetForWeek, events, fmtDate, fmtShort, isoOf, scheduledHoursByDay, setCourseStartDate, subjects, type Course, u, usePlanVersion } from '../mypath/plan'
import { CourseDetailOverlay, useOpenCourse } from '../mypath/CourseDetailOverlay'
import PlanEmptyState from '../mypath/PlanEmptyState'
import './MyPathAllTimeline.css'

type Month = { start: string; end: string; days: number; label: string }
type Timeline = { start: string; end: string; days: number; months: Month[]; label: string }

const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const MONTH_DAY_WIDTH = 2.2
const LOAD_PLOT = 34, LOAD_BASE = 1

function allTimeline(): Timeline {
  const months: Month[] = []
  for (let start = AXIS_START; u(start) < u(AXIS_END);) {
    const [year, month] = start.slice(0, 7).split('-').map(Number)
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
    const end = isoOf(Date.UTC(year, month, 1))
    months.push({ start, end, days, label: `${monthNames[month - 1]} ${String(year + 543).slice(2)}` })
    start = end
  }
  return { start: AXIS_START, end: AXIS_END, days: (u(AXIS_END) - u(AXIS_START)) / MS, months, label: 'ต.ค. 69 – เม.ย. 71' }
}

if (import.meta.env.DEV) {
  const check = allTimeline()
  if (check.months.reduce((total, month) => total + month.days, 0) !== check.days) throw new Error('prototype month axis is not continuous')
}

const position = (date: string, t: Timeline) => (u(date) - u(t.start)) / MS / t.days * 100
const visible = (course: Course, t: Timeline) => u(course.start) < u(t.end) && u(addDays(course.end, 1)) > u(t.start)
const monthColumns = (t: Timeline, dayWidth = MONTH_DAY_WIDTH) => t.months.map(month => `minmax(${month.days * dayWidth}px, ${month.days}fr)`).join(' ')
const barText = (hex: string) => {
  const value = parseInt(hex.slice(1), 16)
  return (0.2126 * (value >> 16) + .7152 * ((value >> 8) & 255) + .0722 * (value & 255)) / 255 > .55 ? '#212529' : '#fff'
}

function MonthBands({ t, dayWidth }: { t: Timeline; dayWidth: number }) {
  return <div className="tp-month-bands" aria-hidden="true" style={{ gridTemplateColumns: monthColumns(t, dayWidth) }}>
    {t.months.map((month, index) => <i key={month.start} className={index % 2 ? 'alternate' : ''} />)}
  </div>
}

function Axis({ children, t, dayWidth, className = '', style }: { children: React.ReactNode; t: Timeline; dayWidth: number; className?: string; style?: CSSProperties }) {
  return <div className={`tp-axis ${className}`} style={style}><MonthBands t={t} dayWidth={dayWidth} />{children}</div>
}

function MonthHeader({ t }: { t: Timeline }) {
  return <><b className="tp-label tp-month-label">แผนการเรียน</b>{t.months.map(month => <span key={month.start} className={`tp-month ${u(TODAY) >= u(month.start) && u(TODAY) < u(month.end) ? 'now' : ''}`}>{month.label}</span>)}</>
}

// ธงวันสำคัญอยู่เหนือหัวเดือน (ใน .tp-events-strip — scroller เดียวกับตาราง) ชั้นแรกชิดตารางแล้วซ้อนขึ้น — กว้างประมาณเป็น px ที่ความกว้างวันต่ำสุด เลยไม่ทับกัน
function EventRow({ t, dayWidth }: { t: Timeline; dayWidth: number }) {
  const ends: number[] = []
  const shown = events.filter(event => u(event.date) >= u(t.start) && u(event.date) < u(t.end)).sort((a, b) => u(a.date) - u(b.date)).map(event => {
    const day = (u(event.date) - u(t.start)) / MS, half = (Math.min(118, event.label.length * 6.5 + 14) / 2 + 4) / dayWidth
    let lane = ends.findIndex(end => end <= day - half)
    if (lane < 0) { lane = ends.length; ends.push(day + half) } else ends[lane] = day + half
    return { event, lane }
  })
  const height = Math.max(76, ends.length * 44 + 24)
  return <><b className="tp-label tp-events-label tp-load-label" style={{ minHeight: height }}></b><Axis t={t} dayWidth={dayWidth} className="tp-events tp-events-top" style={{ minHeight: height }}>{shown.map(({ event, lane }) => <span key={event.id} className={`tp-event ${event.kind}${event.owned ? '' : ' no'}`} style={{ left: `${position(event.date, t)}%`, bottom: lane * 44 + 20, '--line': `${lane * 44 + 14}px` } as CSSProperties}>{event.label}<small>{fmtDate(event.date)}</small></span>)}{shown.map(({ event }) => <i key={`${event.id}-marker`} className={`tp-event-marker ${event.kind}${event.owned ? '' : ' no'}`} style={{ left: `${position(event.date, t)}%` }} />)}</Axis></>
}

// ลากเส้นขาวหัวคอร์สซ้าย/ขวาเพื่อเลื่อนวันเริ่ม (เฉพาะคอร์สที่ไม่ได้ต่อจากคอร์สก่อน) — แปลง px เป็นวันจากความกว้าง axis
function dragStart(event: React.PointerEvent<HTMLElement>, course: Course, t: Timeline) {
  event.stopPropagation()
  const grip = event.currentTarget, startX = event.clientX, base = course.start
  const pxPerDay = grip.closest('.tp-axis')!.getBoundingClientRect().width / t.days
  let last = 0
  grip.setPointerCapture(event.pointerId)
  grip.onpointermove = move => {
    const days = Math.round((move.clientX - startX) / pxPerDay)
    if (days !== last) { last = days; setCourseStartDate(course.id, addDays(base, days)) }
  }
  grip.onpointerup = grip.onpointercancel = () => { grip.onpointermove = grip.onpointerup = grip.onpointercancel = null }
}

function SubjectRow({ subject, t, dayWidth, open }: { subject: typeof subjects[number]; t: Timeline; dayWidth: number; open: (id: string) => void }) {
  const style = { '--subject': subject.color } as CSSProperties
  return <><b className="tp-label tp-subject" style={style}><i />{subject.name}</b><Axis t={t} dayWidth={dayWidth} style={style}>{subject.courses.length === 0 && <span className="tp-no-course">ยังไม่มีคอร์ส</span>}{subject.courses.filter(course => visible(course, t)).map(course => {
    const left = Math.max(0, position(course.start, t)), right = Math.min(100, position(addDays(course.end, 1), t))
    return <span key={course.id} className={`tp-course${course.owned ? ' own' : ''}${course.followPrevious ? ' no-lead' : ''}`} role="button" tabIndex={0} onClick={() => open(course.id)} onKeyDown={event => event.key === 'Enter' && open(course.id)} style={{ left: `calc(${left}% + 3px)`, width: `calc(${right - left}% - 6px)`, color: course.owned ? barText(subject.color) : undefined }} title={`${course.name} · ${fmtDate(course.start)} – ${fmtDate(course.end)}`}>{!course.followPrevious && <i className="tp-grip" aria-hidden="true" onPointerDown={event => dragStart(event, course, t)} onClick={event => event.stopPropagation()} />}{course.short}</span>
  })}</Axis></>
}

function WeeklyLoad({ t, dayWidth }: { t: Timeline; dayWidth: number }) {
  const firstMonday = u(t.start) - ((new Date(u(t.start)).getUTCDay() + 6) % 7) * MS
  const weeks = [] as { start: number; end: number; demand: number; plan: number }[]
  for (let start = firstMonday; start < u(t.end); start += 7 * MS) {
    const end = Math.min(start + 7 * MS, u(t.end))
    const demand = Array.from({ length: (end - start) / MS }, (_, day) => scheduledHoursByDay.get(isoOf(start + day * MS)) ?? 0).reduce((sum, value) => sum + value, 0)
    weeks.push({ start, end, demand, plan: calendarBudgetForWeek(start) })
  }
  const max = Math.max(...weeks.flatMap(week => [week.demand, week.plan]), 1), y = (hours: number) => hours / max * LOAD_PLOT
  return <><b className="tp-label tp-load-label tp-week-label">ชั่วโมงเรียน/สัปดาห์<button className="tp-help" popoverTarget="tp-load-help" aria-label="วิธีอ่านกราฟชั่วโมงเรียนต่อสัปดาห์">?</button><div id="tp-load-help" className="tp-help-pop" popover="auto"><b>วิธีอ่านกราฟนี้</b><p>แต่ละแท่งคือจำนวนชั่วโมงเรียนรวมใน 1 สัปดาห์ เทียบกับเวลาที่ลงไว้ในปฏิทินการเรียน</p><ul><li><i className="ok" />เรียนตามแผน</li><li><i className="over" />ส่วนที่เรียนเกินแผน</li><li><i className="plan" />เวลาที่ลงไว้ในปฏิทินการเรียน</li></ul><p>ชี้ที่แท่งเพื่อดูจำนวนชั่วโมงของสัปดาห์นั้น</p></div></b><Axis t={t} dayWidth={dayWidth} className="tp-load">{weeks.map(week => {
    const left = Math.max(0, position(isoOf(week.start), t)), right = Math.min(100, position(isoOf(week.end), t)), over = week.demand - week.plan
    return <span key={week.start} className="tp-week" title={`${fmtDate(isoOf(week.start))} – ${fmtDate(isoOf(week.end - MS))} · ลงไว้ ${week.plan.toFixed(1)} ชม. · เรียนจริง ${week.demand.toFixed(1)} ชม.${over > 0 ? ` · เกิน ${over.toFixed(1)} ชม.` : ''}`} style={{ left: `${left}%`, width: `${Math.max(.1, right - left)}%` }}>
      <b className="tp-bar" style={{ bottom: LOAD_BASE, height: Math.max(3, y(week.demand)) }}>{over > 0 && <i className="over" style={{ height: y(over) }} />}<i className="ok" /></b>
      <i className="tp-plan" style={{ bottom: LOAD_BASE + y(week.plan) }} />
    </span>
  })}</Axis></>
}

// ฉากท้องฟ้าหลังธงวันสำคัญ — sticky ซ้าย, parallax ตาม --sx (scrollLeft): เมฆ 0.4 (ไกล 0.2), หญ้าเลื่อน 1:1 อยู่ใน strip
const CLOUDS = [{ left: -4, top: 34, scale: 1.1, dur: 30, far: false }, { left: 30, top: 10, scale: .6, dur: 40, far: true }, { left: 52, top: 46, scale: 1, dur: 34, far: false }, { left: 78, top: 16, scale: .7, dur: 44, far: true }, { left: 104, top: 40, scale: 1.2, dur: 32, far: false }, { left: 124, top: 8, scale: .6, dur: 42, far: true }]
const GRASS = [1, 4.5, 9, 13, 18.5, 22, 27, 31.5, 35, 40, 44.5, 48, 53, 57.5, 61, 66, 70.5, 74, 79, 83.5, 87, 92, 96, 99]
function Sky() {
  return <div className="tp-sky-scene" aria-hidden="true">
    {[true, false].map(far => <div key={String(far)} className={`tp-clouds${far ? ' far' : ''}`}>{CLOUDS.filter(c => c.far === far).map((c, i) => <svg key={i} className="tp-cloud" viewBox="0 0 260 56" style={{ left: `${c.left}%`, top: c.top, width: 260 * c.scale, animationDuration: `${c.dur}s`, animationDelay: `${-i * 9}s` }}><path d="M0 56c6-14 26-20 44-14 6-18 32-26 50-12 12-24 52-26 66 0 10-8 28-6 36 6 14-6 32-2 44 12 8 0 16 4 20 8z" /></svg>)}</div>)}
  </div>
}
function Grass() {
  return <div className="tp-grass-row" aria-hidden="true">{GRASS.map((left, i) => <svg key={left} className="tp-grass" viewBox="0 0 20 10" style={{ left: `${left}%`, animationDelay: `${-i * .37}s`, scale: i % 3 ? '1' : '1.4' }}><path d="M1 10C3 6 4 4 4 0c2 3 3 6 3 10M6 10c1-4 3-6 7-8-2 3-3 5-3 8M10 10c2-3 5-5 9-5-3 2-5 3-6 5z" /></svg>)}</div>
}

// หัววิชาของ timeline มือถือ — sticky top ใน .path-scroll (scroller เดียวทั้งสองแกน) เลื่อนแนวนอนพร้อมคอลัมน์วิชา
function MobileHead() {
  return <div className="tp-mobile-head"><i /><div className="tp-mobile-subjects">{subjects.map(subject => <b key={subject.name}><i style={{ background: subject.color }} />{subject.name}</b>)}</div></div>
}

function MobileTimeline({ t, open }: { t: Timeline; open: (id: string) => void }) {
  // เกิน 6 วิชา → คอลัมน์กว้างคงที่ เห็น ~5.5 คอลัมน์ (โผล่ครึ่งให้รู้ว่าเลื่อนต่อได้)
  const col = subjects.length > 6 ? 'calc((100vw - 78px - 30px) / 5.5)' : '0px'
  return <section className="tp-mobile" style={{ '--n': subjects.length, '--col': col } as CSSProperties}><MobileHead /><div className="tp-mobile-months">{t.months.map(month => {
    const monthEvents = events.filter(event => u(event.date) >= u(month.start) && u(event.date) < u(month.end))
    const now = u(TODAY) >= u(month.start) && u(TODAY) < u(month.end)
    return <section key={month.start} className={`tp-mobile-month${now ? ' now' : ''}`}><b>{month.label}</b><div className="tp-mobile-month-content">{monthEvents.length > 0 && <div className="tp-mobile-events">{monthEvents.map(event => <span key={event.id} className={`tp-mobile-event ${event.kind}${event.owned ? '' : ' no'}`}>{event.label} · {fmtShort(event.date)}</span>)}</div>}<div className="tp-mobile-subjects">{subjects.map(subject => {
      const courses = subject.courses.filter(course => u(course.start) < u(month.end) && u(addDays(course.end, 1)) > u(month.start))
      const full = courses.some(course => u(course.start) <= u(month.start) && u(addDays(course.end, 1)) >= u(month.end))
      return <div key={subject.name} className={`tp-mobile-cell${full ? ' full-month' : ''}`} style={{ '--subject': subject.color } as CSSProperties}>{courses.map(course => <span key={course.id} className={`tp-mobile-course ${course.owned ? 'own' : 'own-no'}${course.followPrevious || u(course.start) < u(month.start) ? ' no-lead' : ''}`} role="button" tabIndex={0} onClick={() => open(course.id)} onKeyDown={event => event.key === 'Enter' && open(course.id)} style={{ color: course.owned ? barText(subject.color) : undefined }}>{course.short}</span>)}</div>
    })}</div></div></section>
  })}</div></section>
}

export default function MyPathAllTimeline() {
  usePlanVersion()
  const t = allTimeline(), open = useOpenCourse()
  const header = <PathHeader active="all" period={t.label} showNavigation={false} />
  if (subjects.length === 0) return <main className="path-page tp-page"><div className="path-screen">{header}<div className="path-scroll"><PlanEmptyState /></div></div></main>
  return <main className="path-page tp-page tp-full tp-sky-page"><div className="path-screen">{header}<div className="path-scroll"><div className="tp-scroll" onScroll={e => e.currentTarget.style.setProperty('--sx', String(e.currentTarget.scrollLeft))}><div className="tp-sky"><Sky /><section className="tp-grid tp-events-strip" style={{ gridTemplateColumns: `176px ${monthColumns(t)}` }}><EventRow t={t} dayWidth={MONTH_DAY_WIDTH} /><Grass /></section></div><section className="tp-grid" style={{ gridTemplateColumns: `176px ${monthColumns(t)}`, '--rows': subjects.length } as CSSProperties}><MonthHeader t={t} />{subjects.map(subject => <SubjectRow key={subject.name} subject={subject} t={t} dayWidth={MONTH_DAY_WIDTH} open={open} />)}<b className="tp-label tp-spacer" /><Axis t={t} dayWidth={MONTH_DAY_WIDTH} className="tp-spacer">{null}</Axis><WeeklyLoad t={t} dayWidth={MONTH_DAY_WIDTH} /></section></div><MobileTimeline t={t} open={open} /></div><CourseDetailOverlay /></div></main>
}
