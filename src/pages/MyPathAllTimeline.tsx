import type { CSSProperties } from 'react'
import PathHeader from '../components/PathHeader'
import { AXIS_END, AXIS_START, MS, TODAY, addDays, calendarBudgetForWeek, events, fmtDate, fmtShort, isoOf, scheduledHoursByDay, subjects, type Course, u, usePlanVersion } from '../mypath/plan'
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

function EventRow({ t, dayWidth }: { t: Timeline; dayWidth: number }) {
  const ends: number[] = []
  const shown = events.filter(event => u(event.date) >= u(t.start) && u(event.date) < u(t.end)).sort((a, b) => u(a.date) - u(b.date)).map(event => {
    const day = (u(event.date) - u(t.start)) / MS, half = Math.max(9, event.label.length * 1.1)
    let lane = ends.findIndex(end => end <= day - half)
    if (lane < 0) { lane = ends.length; ends.push(day + half) } else ends[lane] = day + half
    return { event, lane }
  })
  const height = Math.max(76, ends.length * 44 + 24)
  return <><b className="tp-label tp-events-label tp-load-label" style={{ minHeight: height }}>วันสำคัญ</b><Axis t={t} dayWidth={dayWidth} className="tp-events" style={{ minHeight: height }}>{shown.map(({ event, lane }) => <span key={event.id} className={`tp-event ${event.kind}${event.owned ? '' : ' no'}`} style={{ left: `${position(event.date, t)}%`, top: lane * 44 + 8, '--line': `${Math.max(8, height - lane * 44 - 55)}px` } as CSSProperties}>{event.label}<small>{fmtDate(event.date)}</small></span>)}{shown.map(({ event }) => <i key={`${event.id}-marker`} className={`tp-event-marker ${event.kind}${event.owned ? '' : ' no'}`} style={{ left: `${position(event.date, t)}%` }} />)}</Axis></>
}

function SubjectRow({ subject, t, dayWidth, open }: { subject: typeof subjects[number]; t: Timeline; dayWidth: number; open: (id: string) => void }) {
  const style = { '--subject': subject.color } as CSSProperties
  return <><b className="tp-label tp-subject" style={style}><i />{subject.name}</b><Axis t={t} dayWidth={dayWidth} style={style}>{subject.courses.length === 0 && <span className="tp-no-course">ยังไม่มีคอร์ส</span>}{subject.courses.filter(course => visible(course, t)).map(course => {
    const left = Math.max(0, position(course.start, t)), right = Math.min(100, position(addDays(course.end, 1), t))
    return <span key={course.id} className={`tp-course ${course.owned ? 'own' : ''}`} role="button" tabIndex={0} onClick={() => open(course.id)} onKeyDown={event => event.key === 'Enter' && open(course.id)} style={{ left: `calc(${left}% + 3px)`, width: `calc(${right - left}% - 6px)`, color: course.owned ? barText(subject.color) : undefined }} title={`${course.name} · ${fmtDate(course.start)} – ${fmtDate(course.end)}`}>{course.short}</span>
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

// หัววิชาของ timeline มือถือ — อยู่นอก .path-scroll ให้นิ่งคู่ header
function MobileHead() {
  return <div className="tp-mobile-head"><i />{subjects.map(subject => <b key={subject.name}><i style={{ background: subject.color }} />{subject.name}</b>)}</div>
}

function MobileTimeline({ t, open }: { t: Timeline; open: (id: string) => void }) {
  return <section className="tp-mobile"><div className="tp-mobile-months">{t.months.map(month => {
    const monthEvents = events.filter(event => u(event.date) >= u(month.start) && u(event.date) < u(month.end))
    const now = u(TODAY) >= u(month.start) && u(TODAY) < u(month.end)
    return <section key={month.start} className={`tp-mobile-month${now ? ' now' : ''}`}><b>{month.label}</b><div className="tp-mobile-month-content">{monthEvents.length > 0 && <div className="tp-mobile-events">{monthEvents.map(event => <span key={event.id} className={`tp-mobile-event ${event.kind}${event.owned ? '' : ' no'}`}>{event.label} · {fmtShort(event.date)}</span>)}</div>}<div className="tp-mobile-subjects" style={{ gridTemplateColumns: `repeat(${subjects.length},minmax(0,1fr))` }}>{subjects.map(subject => {
      const courses = subject.courses.filter(course => u(course.start) < u(month.end) && u(addDays(course.end, 1)) > u(month.start))
      const full = courses.some(course => u(course.start) <= u(month.start) && u(addDays(course.end, 1)) >= u(month.end))
      return <div key={subject.name} className={`tp-mobile-cell${full ? ' full-month' : ''}`} style={{ '--subject': subject.color } as CSSProperties}>{courses.map(course => <span key={course.id} className={`tp-mobile-course ${course.owned ? 'own' : 'own-no'}`} role="button" tabIndex={0} onClick={() => open(course.id)} onKeyDown={event => event.key === 'Enter' && open(course.id)} style={{ color: course.owned ? barText(subject.color) : undefined }}>{course.short}</span>)}</div>
    })}</div></div></section>
  })}</div></section>
}

export default function MyPathAllTimeline() {
  usePlanVersion()
  const t = allTimeline(), open = useOpenCourse()
  const header = <PathHeader active="all" period={t.label} showNavigation={false} />
  if (subjects.length === 0) return <main className="path-page tp-page"><div className="path-screen">{header}<div className="path-scroll"><PlanEmptyState /></div></div></main>
  return <main className="path-page tp-page"><div className="path-screen">{header}<MobileHead /><div className="path-scroll"><div className="tp-scroll"><section className="tp-grid" style={{ gridTemplateColumns: `176px ${monthColumns(t)}` }}><MonthHeader t={t} /><EventRow t={t} dayWidth={MONTH_DAY_WIDTH} />{subjects.map(subject => <SubjectRow key={subject.name} subject={subject} t={t} dayWidth={MONTH_DAY_WIDTH} open={open} />)}<WeeklyLoad t={t} dayWidth={MONTH_DAY_WIDTH} /></section></div><MobileTimeline t={t} open={open} /></div><CourseDetailOverlay /></div></main>
}
