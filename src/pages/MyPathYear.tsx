import { useState, type CSSProperties } from 'react'
import PathHeader from '../components/PathHeader'
import BottomNav from '../components/BottomNav'
import { MS, AXIS_START, AXIS_END, TODAY, u, isoOf, addDays, fmtDate, fmtShort, axisLabel, subjects, events, totalHours, studyCalendar, scheduledHoursByDay, usePlanVersion, type Course } from '../mypath/plan'
import { useOpenCourse, CourseDetailOverlay } from '../mypath/CourseDetailPrototype'
import './MyPathYear.css'

type Timeline = { start: string; end: string; months: { label: string; days: number; start: string }[]; days: number; label: string }
const names = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const thaiYear = (year: number) => String(year + 543).slice(2)

function timeline(start: string, end: string, label: string): Timeline {
  const months = []
  for (let cursor = start; u(cursor) < u(end);) {
    const [year, month] = cursor.slice(0, 7).split('-').map(Number)
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
    months.push({ label: `${names[month - 1]} ${thaiYear(year)}`, days, start: cursor })
    cursor = isoOf(Date.UTC(year, month, 1))
  }
  return { start, end, months, days: (u(end) - u(start)) / MS, label }
}

const allTimeline = () => timeline(AXIS_START, AXIS_END, axisLabel)
const yearTimeline = (year: number) => timeline(`${year}-01-01`, `${year + 1}-01-01`, String(year + 543))
const x = (date: string, t: Timeline) => (u(date) - u(t.start)) / MS / t.days * t.months.length
const x0 = (course: Course, t: Timeline) => Math.max(0, x(course.start, t))
const x1 = (course: Course, t: Timeline) => Math.min(t.months.length, x(addDays(course.end, 1), t))
const pct = (value: number, t: Timeline) => value / t.months.length * 100
const inRange = (date: string, t: Timeline) => u(date) >= u(t.start) && u(date) < u(t.end)
const nowLabel = (t: Timeline) => t.months.find(month => u(TODAY) >= u(month.start) && u(TODAY) < u(isoOf(u(month.start) + month.days * MS)))?.label
const labelFor = (course: Course, t: Timeline, compact = false) => { const span = x1(course, t) - x0(course, t); return span >= 3 ? (compact ? course.short : course.name) : span >= .9 ? course.short : course.abbr }
const barText = (hex: string) => { const n = parseInt(hex.slice(1), 16); return (0.2126 * (n >> 16) + .7152 * ((n >> 8) & 255) + .0722 * (n & 255)) / 255 > .55 ? '#212529' : '#fff' }
const columns = (t: Timeline, labels = true) => ({ gridTemplateColumns: `${labels ? '140px ' : ''}${t.months.map(month => `minmax(64px, ${month.days}fr)`).join(' ')}` })

function Bands({ t }: { t: Timeline }) { let left = 0; const now = nowLabel(t); return <>{t.months.map((month, index) => { const width = month.days / t.days * 100; const band = <span key={month.start} aria-hidden="true" className={`yp-month-band${index % 2 ? ' alternate' : ''}${month.label === now ? ' now' : ''}`} style={{ left: `${left}%`, width: `${width}%` }} />; left += width; return band })}</> }
function Lines({ t }: { t: Timeline }) { let days = 0; return <>{t.months.slice(0, -1).map(month => <i key={month.start} style={{ left: `${(days += month.days) / t.days * 100}%` }} />)}</> }

function EventRail({ t }: { t: Timeline }) {
  const visible = events.filter(event => inRange(event.date, t)), ends: number[] = []
  const items = visible.sort((a, b) => x(a.date, t) - x(b.date, t)).map(event => { const at = pct(x(event.date, t), t), width = (event.label.length * 5.6 + 16) / 10.4, half = width / 2 + 1; let lane = ends.findIndex(end => end <= at - half); if (lane < 0) { lane = ends.length; ends.push(at + half) } else ends[lane] = at + half; return { event, at, lane } })
  const height = ends.length * 33 + 18
  return <div className="yp-rail" style={{ height }}><Bands t={t} /><svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden="true">{items.map(({ event, at, lane }) => <line key={event.id} className={event.kind} x1={at} y1={lane * 33 + 29} x2={at} y2={height - 6} />)}</svg>{items.map(({ event, at, lane }) => <i key={event.id} className={event.kind + (event.owned ? '' : ' no')} style={{ left: `${at}%`, top: lane * 33, transform: 'translateX(-50%)' }}>{event.label}<small>{fmtDate(event.date)}</small></i>)}{visible.map(event => <em key={event.id} className={event.kind + (event.owned ? '' : ' no')} style={{ left: `${pct(x(event.date, t), t)}%` }} />)}</div>
}

function Desktop({ t }: { t: Timeline }) {
  const open = useOpenCourse(), now = nowLabel(t)
  return <div className="yp-desktop"><div className="yp-table"><div className="yp-table-inner"><div className="yp-months" style={columns(t)}><i />{t.months.map(month => <span key={month.start} className={month.label === now ? 'now' : ''}>{month.label}</span>)}</div><div className="yp-eventrow" style={columns(t)}><i /><EventRail t={t} /></div>{subjects.map(subject => <div className="yp-row" key={subject.name} style={{ ...columns(t), '--subject': subject.color } as CSSProperties}><b><i style={{ background: subject.color }} />{subject.name}</b><div className="yp-track"><Bands t={t} /><Lines t={t} />{subject.courses.filter(course => x0(course, t) < x1(course, t)).map(course => <span key={course.id} className={'yp-bar ' + (course.owned ? 'own' : 'own-no')} role="button" tabIndex={0} title={`${course.name} · ${fmtDate(course.start)} – ${fmtDate(course.end)}`} onClick={() => open(course.id)} onKeyDown={event => event.key === 'Enter' && open(course.id)} style={{ color: course.owned ? barText(subject.color) : undefined, left: `calc(${pct(x0(course, t), t)}% + 2px)`, width: `calc(${pct(x1(course, t) - x0(course, t), t)}% - 4px)` }}>{labelFor(course, t)}</span>)}</div></div>)}<Load t={t} /></div></div></div>
}

function Load({ t }: { t: Timeline }) {
  const budget = studyCalendar.weekdayHours * 5 + studyCalendar.weekendHours * 2, firstMonday = u(t.start) - ((new Date(u(t.start)).getUTCDay() + 6) % 7) * MS, weeks: { start: number; end: number; demand: number; count: number }[] = []
  for (let start = firstMonday; start < u(t.end); start += 7 * MS) { const end = Math.min(start + 7 * MS, u(t.end)); const demand = Array.from({ length: (end - start) / MS }, (_, i) => scheduledHoursByDay.get(isoOf(start + i * MS)) ?? 0).reduce((a, b) => a + b, 0); const count = subjects.flatMap(subject => subject.courses).filter(course => u(course.start) < end && u(addDays(course.end, 1)) > start).length; weeks.push({ start, end, demand, count }) }
  const max = Math.max(...weeks.map(week => week.demand), 1)
  return <div className="yp-load"><div className="yp-load-grid"><span>ชม./สัปดาห์</span><div><Lines t={t} />{weeks.map(week => { const left = Math.max(0, (week.start - u(t.start)) / MS / t.days * t.months.length), right = Math.min(t.months.length, (week.end - u(t.start)) / MS / t.days * t.months.length), cls = week.count === 0 ? 'off' : week.demand > budget * 1.5 ? 'hot' : week.demand > budget ? 'warm' : ''; return <i key={week.start} className={cls} title={`${fmtDate(isoOf(week.start))} – ${fmtDate(isoOf(week.end - MS))} · ${week.demand.toFixed(1)} ชม./สัปดาห์`} style={{ left: `${pct(left, t)}%`, width: `${pct(Math.max(.02, right - left), t)}%`, height: `${week.count === 0 ? 2 : Math.max(2, week.demand / max * 8)}px` }} /> })}</div></div></div>
}

function Mobile({ t }: { t: Timeline }) {
  const open = useOpenCourse(), now = nowLabel(t)
  return <section className="yp-mobile"><div className="yp-mobile-head"><i />{subjects.map(subject => <b key={subject.name}><i style={{ background: subject.color }} />{subject.name}</b>)}</div><div className="yp-mobile-months">{t.months.map(month => { const end = isoOf(u(month.start) + month.days * MS); return <section key={month.start} className={'yp-mobile-month' + (month.label === now ? ' now' : '')}><b>{month.label}</b><div className="yp-mobile-month-content">{events.filter(event => u(event.date) >= u(month.start) && u(event.date) < u(end)).length > 0 && <div className="yp-mobile-events">{events.filter(event => u(event.date) >= u(month.start) && u(event.date) < u(end)).map(event => <span key={event.id} className={`yp-mobile-event ${event.kind}${event.owned ? '' : ' no'}`}>{event.label} · {fmtShort(event.date)}</span>)}</div>}<div className="yp-mobile-subjects">{subjects.map(subject => { const courses = subject.courses.filter(course => u(course.start) < u(end) && u(addDays(course.end, 1)) > u(month.start)), full = courses.some(course => u(course.start) <= u(month.start) && u(addDays(course.end, 1)) >= u(end)); return <div key={subject.name} className={`yp-mobile-cell${full ? ' full-month' : ''}`} style={{ '--subject': subject.color } as CSSProperties}>{courses.map(course => <span key={course.id} className={'yp-mobile-course ' + (course.owned ? 'own' : 'own-no')} role="button" tabIndex={0} onClick={() => open(course.id)} onKeyDown={event => event.key === 'Enter' && open(course.id)} style={{ color: course.owned ? barText(subject.color) : undefined }}>{labelFor(course, t, true)}</span>)}</div> })}</div></div></section> })}</div></section>
}

export default function MyPathYear({ mode = 'year' }: { mode?: 'year' | 'all' }) {
  usePlanVersion(); const currentYear = Number(TODAY.slice(0, 4)), [year, setYear] = useState(currentYear), t = mode === 'all' ? allTimeline() : yearTimeline(year), minYear = Number(AXIS_START.slice(0, 4)), maxYear = Number(AXIS_END.slice(0, 4))
  if (import.meta.env.DEV && mode === 'year' && t.months.length !== 12) throw new Error('Year view must contain 12 months')
  return <main className="yp-page"><div className="yp-shell"><PathHeader active={mode} period={t.label} showNavigation={mode === 'year'} canPrev={year > minYear} canNext={year < maxYear} onPrev={() => setYear(year - 1)} onNext={() => setYear(year + 1)} /><Desktop t={t} /><Mobile t={t} /><details className="yp-data"><summary>ข้อมูล mock (plan.ts)</summary><pre>{JSON.stringify({ range: t.label, months: t.months.length, totalHours, studyCalendar, subjects, events }, null, 2)}</pre></details><CourseDetailOverlay /></div><BottomNav active="mypath" /></main>
}
