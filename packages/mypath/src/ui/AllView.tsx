import { useContext, useId, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import type { ExamEvent, StudentPlan } from '../types'
import { MyPathProvider, usePlan } from '../MyPathProvider'
import type { Axis, PlannedCourse, PlannedSubject } from '../plan/buildPlan'
import { MS, addDays, fmtDate, fmtShort, isoOf, u } from '../plan/dates'
import { calendarBudgetForWeek, snapToMonday, withCourseStartDate } from '../plan/timeline'
import PathHeader, { type ModeProps } from './PathHeader'
import { OpenCourseContext, courseButton } from './CourseDetail'
import PlanEmptyState from './PlanEmptyState'

// port จาก src/prototype/pages/MyPathAllTimeline.tsx — อ่านทุกอย่างจาก usePlan() (ไม่มีตัวแปร module จึงวางหลายตัวพร้อมกันได้)
// ต่างจาก prototype: คลิกคอร์สเปิดรายละเอียดผ่าน OpenCourseContext (ไม่มี ?course=) และไม่จำตำแหน่ง scroll ข้ามการสลับ Month/All (เปิดทุกครั้งเลื่อนไปวันนี้)

type Month = { start: string; end: string; days: number; label: string }
type Timeline = { start: string; end: string; days: number; months: Month[] }

const MONTH_DAY_WIDTH = 2.2
const LOAD_PLOT = 34, LOAD_BASE = 1

function timelineOf(axis: Axis): Timeline {
  let start = axis.start
  const months = axis.months.map(({ label, days }) => { const month = { start, end: addDays(start, days), days, label }; start = month.end; return month })
  return { start: axis.start, end: axis.end, days: axis.totalDays, months }
}

const position = (date: string, t: Timeline) => (u(date) - u(t.start)) / MS / t.days * 100
const visible = (course: PlannedCourse, t: Timeline) => u(course.start) < u(t.end) && u(addDays(course.end, 1)) > u(t.start)
const monthColumns = (t: Timeline, dayWidth = MONTH_DAY_WIDTH) => t.months.map(month => `minmax(${month.days * dayWidth}px, ${month.days}fr)`).join(' ')
const barText = (hex: string) => {
  const value = parseInt(hex.slice(1), 16)
  return (0.2126 * (value >> 16) + .7152 * ((value >> 8) & 255) + .0722 * (value & 255)) / 255 > .55 ? '#212529' : '#fff'
}
const inMonth = (iso: string, month: Month) => u(iso) >= u(month.start) && u(iso) < u(month.end)

// ซื้อแล้ว: คอร์สและ Mock ดูจาก owned · สอบจริงไม่มีการซื้อ (เหมือน Month)
function useOwned() {
  const { owned } = usePlan().data
  return { course: (id: string) => owned.includes(id), event: (event: ExamEvent) => event.kind === 'exam' || owned.includes(event.id) }
}

function MonthBands({ t, dayWidth }: { t: Timeline; dayWidth: number }) {
  return <div className="mp-tp-month-bands" aria-hidden="true" style={{ gridTemplateColumns: monthColumns(t, dayWidth) }}>
    {t.months.map((month, index) => <i key={month.start} className={index % 2 ? 'alternate' : ''} />)}
  </div>
}

function AxisRow({ children, t, dayWidth, className = '', style }: { children: ReactNode; t: Timeline; dayWidth: number; className?: string; style?: CSSProperties }) {
  return <div className={`mp-tp-axis ${className}`} style={style}><MonthBands t={t} dayWidth={dayWidth} />{children}</div>
}

function MonthHeader({ t, today }: { t: Timeline; today: string }) {
  return <><b className="mp-tp-label mp-tp-month-label">แผนการเรียน</b>{t.months.map(month => <span key={month.start} className={`mp-tp-month ${inMonth(today, month) ? 'now' : ''}`}>{month.label}</span>)}</>
}

// ธงวันสำคัญอยู่เหนือหัวเดือน (ใน .mp-tp-events-strip — scroller เดียวกับตาราง) ชั้นแรกชิดตารางแล้วซ้อนขึ้น — กว้างประมาณเป็น px ที่ความกว้างวันต่ำสุด เลยไม่ทับกัน
function EventRow({ t, dayWidth }: { t: Timeline; dayWidth: number }) {
  const { events } = usePlan().plan, owned = useOwned()
  const ends: number[] = []
  const shown = events.filter(event => u(event.date) >= u(t.start) && u(event.date) < u(t.end)).sort((a, b) => u(a.date) - u(b.date)).map(event => {
    const day = (u(event.date) - u(t.start)) / MS, half = (Math.min(118, event.label.length * 6.5 + 14) / 2 + 4) / dayWidth
    let lane = ends.findIndex(end => end <= day - half)
    if (lane < 0) { lane = ends.length; ends.push(day + half) } else ends[lane] = day + half
    return { event, lane }
  })
  const height = Math.max(76, ends.length * 44 + 24)
  return <><b className="mp-tp-label mp-tp-events-label mp-tp-load-label" style={{ minHeight: height }}></b><AxisRow t={t} dayWidth={dayWidth} className="mp-tp-events mp-tp-events-top" style={{ minHeight: height }}>{shown.map(({ event, lane }) => <span key={event.id} className={`mp-tp-event ${event.kind}${owned.event(event) ? '' : ' no'}`} style={{ left: `${position(event.date, t)}%`, bottom: lane * 44 + 20, '--line': `${lane * 44 + 14}px` } as CSSProperties}>{event.label}<small>{fmtDate(event.date)}</small></span>)}{shown.map(({ event }) => <i key={`${event.id}-marker`} className={`mp-tp-event-marker ${event.kind}${owned.event(event) ? '' : ' no'}`} style={{ left: `${position(event.date, t)}%` }} />)}</AxisRow></>
}

type DragStart = (event: PointerEvent<HTMLElement>, course: PlannedCourse) => void

function SubjectRow({ subject, t, dayWidth, onDragStart }: { subject: PlannedSubject; t: Timeline; dayWidth: number; onDragStart: DragStart }) {
  const owned = useOwned(), open = useContext(OpenCourseContext)
  const style = { '--subject': subject.color } as CSSProperties
  return <><b className="mp-tp-label mp-tp-subject" style={style}><i />{subject.name}</b><AxisRow t={t} dayWidth={dayWidth} style={style}>{subject.courses.length === 0 && <span className="mp-tp-no-course">ยังไม่มีคอร์ส</span>}{subject.courses.filter(course => visible(course, t)).map(course => {
    const left = Math.max(0, position(course.start, t)), right = Math.min(100, position(addDays(course.end, 1), t)), own = owned.course(course.id)
    return <span key={course.id} className={`mp-tp-course${own ? ' own' : ''}${course.followPrevious ? ' no-lead' : ''}`} {...courseButton(open, course.id)} style={{ left: `calc(${left}% + 3px)`, width: `calc(${right - left}% - 6px)`, color: own ? barText(subject.color) : undefined }} title={`${course.name} · ${fmtDate(course.start)} – ${fmtDate(course.end)}`}>{!course.followPrevious && <i className="mp-tp-grip" aria-hidden="true" onPointerDown={event => onDragStart(event, course)} onClick={event => event.stopPropagation()} />}{course.short}</span>
  })}</AxisRow></>
}

function WeeklyLoad({ t, dayWidth }: { t: Timeline; dayWidth: number }) {
  const { plan: { scheduledHoursByDay }, data: { plan: { calendar } } } = usePlan()
  const helpId = useId() // id ของ popover ต้องไม่ชนเมื่อมีหลาย <MyPath>
  const firstMonday = u(t.start) - ((new Date(u(t.start)).getUTCDay() + 6) % 7) * MS
  const weeks = [] as { start: number; end: number; demand: number; plan: number }[]
  for (let start = firstMonday; start < u(t.end); start += 7 * MS) {
    const end = Math.min(start + 7 * MS, u(t.end))
    const demand = Array.from({ length: (end - start) / MS }, (_, day) => scheduledHoursByDay.get(isoOf(start + day * MS)) ?? 0).reduce((sum, value) => sum + value, 0)
    weeks.push({ start, end, demand, plan: calendarBudgetForWeek(calendar, start) })
  }
  const max = Math.max(...weeks.flatMap(week => [week.demand, week.plan]), 1), y = (hours: number) => hours / max * LOAD_PLOT
  return <><b className="mp-tp-label mp-tp-load-label mp-tp-week-label">ชั่วโมงเรียน/สัปดาห์<button type="button" className="mp-tp-help" popoverTarget={helpId} aria-label="วิธีอ่านกราฟชั่วโมงเรียนต่อสัปดาห์">?</button><div id={helpId} className="mp-tp-help-pop" popover="auto"><b>วิธีอ่านกราฟนี้</b><p>แต่ละแท่งคือจำนวนชั่วโมงเรียนรวมใน 1 สัปดาห์ เทียบกับเวลาที่ลงไว้ในปฏิทินการเรียน</p><ul><li><i className="ok" />เรียนตามแผน</li><li><i className="over" />ส่วนที่เรียนเกินแผน</li><li><i className="plan" />เวลาที่ลงไว้ในปฏิทินการเรียน</li></ul><p>ชี้ที่แท่งเพื่อดูจำนวนชั่วโมงของสัปดาห์นั้น</p></div></b><AxisRow t={t} dayWidth={dayWidth} className="mp-tp-load">{weeks.map(week => {
    const left = Math.max(0, position(isoOf(week.start), t)), right = Math.min(100, position(isoOf(week.end), t)), over = week.demand - week.plan
    return <span key={week.start} className="mp-tp-week" title={`${fmtDate(isoOf(week.start))} – ${fmtDate(isoOf(week.end - MS))} · ลงไว้ ${week.plan.toFixed(1)} ชม. · เรียนจริง ${week.demand.toFixed(1)} ชม.${over > 0 ? ` · เกิน ${over.toFixed(1)} ชม.` : ''}`} style={{ left: `${left}%`, width: `${Math.max(.1, right - left)}%` }}>
      <b className="mp-tp-bar" style={{ bottom: LOAD_BASE, height: Math.max(3, y(week.demand)) }}>{over > 0 && <i className="over" style={{ height: y(over) }} />}<i className="ok" /></b>
      <i className="mp-tp-plan" style={{ bottom: LOAD_BASE + y(week.plan) }} />
    </span>
  })}</AxisRow></>
}

// ฉากท้องฟ้าหลังธงวันสำคัญ — sticky ซ้าย, parallax ตาม --sx (scrollLeft): เมฆ 0.4 (ไกล 0.2), หญ้าเลื่อน 1:1 อยู่ใน strip
const CLOUDS = [{ left: -4, top: 34, scale: 1.1, dur: 30, far: false }, { left: 30, top: 10, scale: .6, dur: 40, far: true }, { left: 52, top: 46, scale: 1, dur: 34, far: false }, { left: 78, top: 16, scale: .7, dur: 44, far: true }, { left: 104, top: 40, scale: 1.2, dur: 32, far: false }, { left: 124, top: 8, scale: .6, dur: 42, far: true }]
const GRASS = [1, 4.5, 9, 13, 18.5, 22, 27, 31.5, 35, 40, 44.5, 48, 53, 57.5, 61, 66, 70.5, 74, 79, 83.5, 87, 92, 96, 99]
function Sky() {
  return <div className="mp-tp-sky-scene" aria-hidden="true">
    {[true, false].map(far => <div key={String(far)} className={`mp-tp-clouds${far ? ' far' : ''}`}>{CLOUDS.filter(c => c.far === far).map((c, i) => <svg key={i} className="mp-tp-cloud" viewBox="0 0 260 56" style={{ left: `${c.left}%`, top: c.top, width: 260 * c.scale, animationDuration: `${c.dur}s`, animationDelay: `${-i * 9}s` }}><path d="M0 56c6-14 26-20 44-14 6-18 32-26 50-12 12-24 52-26 66 0 10-8 28-6 36 6 14-6 32-2 44 12 8 0 16 4 20 8z" /></svg>)}</div>)}
  </div>
}
function Grass() {
  return <div className="mp-tp-grass-row" aria-hidden="true">{GRASS.map((left, i) => <svg key={left} className="mp-tp-grass" viewBox="0 0 20 10" style={{ left: `${left}%`, animationDelay: `${-i * .37}s`, scale: i % 3 ? '1' : '1.4' }}><path d="M1 10C3 6 4 4 4 0c2 3 3 6 3 10M6 10c1-4 3-6 7-8-2 3-3 5-3 8M10 10c2-3 5-5 9-5-3 2-5 3-6 5z" /></svg>)}</div>
}

// หัววิชาของ timeline มือถือ — sticky top ใน .mp-scroll (scroller เดียวทั้งสองแกน) เลื่อนแนวนอนพร้อมคอลัมน์วิชา
function MobileHead({ subjects }: { subjects: PlannedSubject[] }) {
  return <div className="mp-tp-mobile-head"><i /><div className="mp-tp-mobile-subjects">{subjects.map(subject => <b key={subject.id}><i style={{ background: subject.color }} />{subject.name}</b>)}</div></div>
}

function MobileTimeline({ t }: { t: Timeline }) {
  const { plan: { subjects, events, today } } = usePlan(), owned = useOwned(), open = useContext(OpenCourseContext)
  // เกิน 6 วิชา → คอลัมน์กว้างคงที่ เห็น ~5.5 คอลัมน์ (โผล่ครึ่งให้รู้ว่าเลื่อนต่อได้)
  const col = subjects.length > 6 ? 'calc((100vw - 78px - 30px) / 5.5)' : '0px'
  return <section className="mp-tp-mobile" style={{ '--n': subjects.length, '--col': col } as CSSProperties}><MobileHead subjects={subjects} /><div className="mp-tp-mobile-months">{t.months.map(month => {
    const monthEvents = events.filter(event => inMonth(event.date, month))
    return <section key={month.start} className={`mp-tp-mobile-month${inMonth(today, month) ? ' now' : ''}`}><b>{month.label}</b><div className="mp-tp-mobile-month-content">{monthEvents.length > 0 && <div className="mp-tp-mobile-events">{monthEvents.map(event => <span key={event.id} className={`mp-tp-mobile-event ${event.kind}${owned.event(event) ? '' : ' no'}`}>{event.label} · {fmtShort(event.date)}</span>)}</div>}<div className="mp-tp-mobile-subjects">{subjects.map(subject => {
      const courses = subject.courses.filter(course => u(course.start) < u(month.end) && u(addDays(course.end, 1)) > u(month.start))
      const full = courses.some(course => u(course.start) <= u(month.start) && u(addDays(course.end, 1)) >= u(month.end))
      return <div key={subject.id} className={`mp-tp-mobile-cell${full ? ' full-month' : ''}`} style={{ '--subject': subject.color } as CSSProperties}>{courses.map(course => {
        const own = owned.course(course.id)
        return <span key={course.id} className={`mp-tp-mobile-course ${own ? 'own' : 'own-no'}${course.followPrevious || u(course.start) < u(month.start) ? ' no-lead' : ''}`} {...courseButton(open, course.id)} style={{ color: own ? barText(subject.color) : undefined }}>{course.short}</span>
      })}</div>
    })}</div></div></section>
  })}</div></section>
}

// เปิด All แล้วเลื่อนไปวันนี้ — desktop วันนี้กลางจอ (browser clamp ที่ขอบเอง), มือถือเดือนนี้ชิดใต้หัววิชา
function useScrollToToday(t: Timeline, today: string) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const page = ref.current, grid = page?.querySelector<HTMLElement>('.mp-tp-scroll')
    if (!page || !grid) return
    if (grid.clientWidth) {
      const axis = grid.querySelector('.mp-tp-axis')!.getBoundingClientRect(), box = grid.getBoundingClientRect()
      const x = axis.left - box.left + grid.scrollLeft + position(today, t) / 100 * axis.width
      grid.scrollLeft = x - (176 + grid.clientWidth) / 2 // 176 = คอลัมน์ชื่อวิชา sticky
    } else {
      const now = page.querySelector('.mp-tp-mobile-month.now'), head = page.querySelector<HTMLElement>('.mp-tp-mobile-head')
      if (now && head) page.scrollTop += now.getBoundingClientRect().top - page.getBoundingClientRect().top - head.offsetHeight
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- ครั้งเดียวตอนเปิด เหมือน prototype
  return ref
}

function Timeline({ axis, onDragStart }: { axis: Axis; onDragStart: DragStart }) {
  const { plan } = usePlan()
  const t = timelineOf(axis)
  const scrollRef = useScrollToToday(t, plan.today)
  const columns = `176px ${monthColumns(t)}`
  return <div className="mp-scroll mp-tp-full" ref={scrollRef}>
    <div className="mp-tp-scroll" onScroll={e => e.currentTarget.style.setProperty('--sx', String(e.currentTarget.scrollLeft))}>
      <div className="mp-tp-sky"><Sky /><section className="mp-tp-grid mp-tp-events-strip" style={{ gridTemplateColumns: columns }}><EventRow t={t} dayWidth={MONTH_DAY_WIDTH} /><Grass /></section></div>
      <section className="mp-tp-grid" style={{ gridTemplateColumns: columns, '--rows': plan.subjects.length } as CSSProperties}>
        <MonthHeader t={t} today={plan.today} />
        {plan.subjects.map(subject => <SubjectRow key={subject.id} subject={subject} t={t} dayWidth={MONTH_DAY_WIDTH} onDragStart={onDragStart} />)}
        <b className="mp-tp-label mp-tp-spacer" /><AxisRow t={t} dayWidth={MONTH_DAY_WIDTH} className="mp-tp-spacer">{null}</AxisRow>
        <WeeklyLoad t={t} dayWidth={MONTH_DAY_WIDTH} />
      </section>
    </div>
    <MobileTimeline t={t} />
  </div>
}

export default function AllView(mode: ModeProps) {
  const { plan, data, onPlanChange } = usePlan()
  // ระหว่างลาก: แผนชั่วคราว (UI state) + แกนตอนเริ่มลาก (คอลัมน์ไม่กระโดดใต้เมาส์) — ปล่อยแล้วกลับไปใช้แผนของ host
  const [drag, setDrag] = useState<{ axis: Axis; plan: StudentPlan } | null>(null)
  const axis = drag?.axis ?? plan.axis

  // ลากเส้นหัวคอร์สซ้าย/ขวาเพื่อเลื่อนวันเริ่มทีละสัปดาห์ (เฉพาะคอร์สที่ไม่ได้ต่อจากคอร์สก่อน) — แปลง px เป็นวันจากความกว้าง axis
  // ยิง onPlanChange ครั้งเดียวตอนปล่อย (ADR-0003) หน้าจอหลังปล่อยแสดงแผนที่ host ส่งกลับมาเท่านั้น
  const dragStart: DragStart = (event, course) => {
    event.stopPropagation()
    // capture ที่แถวแกนของวิชา ไม่ใช่ grip — แท่งที่ลากหลุดแกนถูก unmount พร้อม grip แล้ว pointerup จะไม่มาถึง
    const row = event.currentTarget.closest<HTMLElement>('.mp-tp-axis')!, startX = event.clientX, base = course.start, start = { axis, plan: data.plan }
    const pxPerDay = row.getBoundingClientRect().width / axis.totalDays
    let last = base, draft = start.plan
    row.setPointerCapture(event.pointerId)
    setDrag(start)
    row.onpointermove = move => {
      const next = snapToMonday(u(base) + (move.clientX - startX) / pxPerDay * MS)
      if (next !== last) { last = next; draft = withCourseStartDate(start.plan, course.id, next); setDrag({ ...start, plan: draft }) }
    }
    // cancel (browser/OS ยกเลิก gesture) = ทิ้งแผนชั่วคราว ยิงเฉพาะตอนปล่อยจริง
    const end = (commit: boolean) => {
      row.onpointermove = row.onpointerup = row.onpointercancel = null
      setDrag(null)
      if (commit && draft !== start.plan) onPlanChange(draft)
    }
    row.onpointerup = () => end(true)
    row.onpointercancel = () => end(false)
  }

  const header = <PathHeader mode="all" {...mode} period={axis.label} showNavigation={false} />
  if (plan.subjects.length === 0) return <>{header}<div className="mp-scroll"><PlanEmptyState /></div></>
  // provider ซ้อนอยู่ตลอด (ไม่ remount ตอนเริ่มลาก ไม่งั้น grip หลุด pointer capture) — ทุกแถว มือถือ และกราฟชั่วโมงคิดจากแผนชั่วคราวเอง
  return <>{header}<MyPathProvider data={drag ? { ...data, plan: drag.plan } : data} today={plan.today} onPlanChange={onPlanChange}>
    <Timeline axis={axis} onDragStart={dragStart} />
  </MyPathProvider></>
}
