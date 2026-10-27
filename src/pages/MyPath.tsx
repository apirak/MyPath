import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { CSSProperties, ReactNode } from 'react'
import PathHeader from '../components/PathHeader'
import BottomNav from '../components/BottomNav'
// PROTOTYPE — คลิกการ์ดคอร์สเปิดรายละเอียด (desktop แผงขวา / มือถือ bottom sheet)
import PlanEmptyState from '../mypath/PlanEmptyState'
import { useOpenCourse, CourseDetailOverlay } from '../mypath/CourseDetailOverlay'
import { CourseProgress, ProgressTestPanel } from '../mypath/CourseProgress'
import {
  TODAY, AXIS_START, AXIS_END, u, addMonths, monthStartOf, dayOf, monthShortOf,
  fmtDate, fmtMonth, fmtShort, agendaFor, subjects, events, totalHours, KIND_COLOR, studyCalendar,
  usePlanVersion,
  type Agenda, type AgendaCourse, type ExamEvent,
} from '../mypath/plan'

// Monthly My Path: agenda generate จาก plan.ts ทั้งหมด (ไม่มี hardcode) — กติกา section ล็อกไว้ใน GLOSSARY.md
// ปุ่ม ‹ › เลื่อนหน้าต่างเดือนภายในแกน ต.ค. 69 – ก.พ. 71 · เดือนเริ่มต้น = เดือนของ TODAY

function Plate({ text, color, owned }: { text: string; color: string; owned: boolean }) {
  // ปกสำรอง: ทึบสีวิชา = ซื้อแล้ว · แผ่นอ่อนขอบประ = ยังไม่ได้ซื้อ (encoding เดียวกับ All)
  return <span className="monthly-plate" style={owned ? { background: color, color: '#fff' } : { background: `${color}1c`, color, boxShadow: `inset 0 0 0 2px ${color}` }}>{text}</span>
}

function CourseCard({ course, done = false }: { course: AgendaCourse; done?: boolean }) {
  const open = useOpenCourse()
  return <article className={`monthly-course${done ? ' done' : ''}${course.owned ? ' has-progress' : ''}`} style={{ '--subject': course.color } as CSSProperties} role="button" tabIndex={0} onClick={() => open(course.id)} onKeyDown={e => { if (e.key === 'Enter') open(course.id) }}>
    <div className="monthly-course-body">
      {course.cover ? <img src={course.cover} alt="" /> : <Plate text={course.short} color={course.color} owned={!!course.owned} />}
      <div>
        <div className="monthly-course-top"><b>{course.subject}</b><span>เรียน (ติวเข้ม)</span></div>
        <strong>{course.name}</strong>
        <small>{course.hours} ชม. · {fmtDate(course.start)} – {fmtDate(course.end)}{course.owned ? '' : ' · ยังไม่ได้ซื้อ'}</small>
      </div>
    </div>
    {course.owned && <CourseProgress course={course} />}
  </article>
}

function EventCard({ event, done = false }: { event: ExamEvent; done?: boolean }) {
  const color = KIND_COLOR[event.kind]
  const kindLabel = event.kind === 'exam' ? 'สอบจริง' : 'Mock'
  return <article className={`monthly-course${done ? ' done' : ''}`} style={{ '--subject': color } as CSSProperties}>
    <div className="monthly-course-body">
      <Plate text={kindLabel} color={color} owned={!!event.owned} />
      <div>
        <div className="monthly-course-top"><b>{kindLabel}</b><span>{fmtShort(event.date)}</span></div>
        <strong>{event.label}</strong>
        <small>สอบ 1 วัน{event.owned ? '' : ' · ยังไม่ได้ซื้อ'}</small>
      </div>
    </div>
  </article>
}

function SectionTitle({ title }: { title: string }) {
  return <div className="now-heading"><span>{title}</span></div>
}

function DateHeading({ iso }: { iso: string }) {
  return <div className="date-heading"><b>{dayOf(iso)}</b><span>{monthShortOf(iso)}</span><i /></div>
}

function Stack({ children }: { children: ReactNode }) {
  return <div className="course-stack">{children}</div>
}

function Agenda({ agenda }: { agenda: Agenda }) {
  const ongoing = agenda.isCurrent ? agenda.inProgress : agenda.active
  const empty = ongoing.length === 0 && agenda.upcoming.length === 0 && agenda.finished.length === 0 && agenda.pastEvents.length === 0
  return <section className="monthly-agenda">
    {agenda.isCurrent && <div className="today-callout">
      <span>วันนี้ · {fmtDate(TODAY)}</span>
      <h2>{agenda.inProgress.length ? `เริ่มเรียนได้เลย ${agenda.inProgress.length} คอร์ส` : 'วันนี้ไม่มีคอร์ส — วันพัก'}</h2>
      <p>{agenda.inProgress.length ? 'เลือกวิชาที่สำคัญที่สุดก่อน แล้วค่อยเดินตามแผน' : 'ใช้วันนี้ทบทวน หรืออ่านล่วงหน้าได้ตามสบาย'}</p>
    </div>}
    {empty ? <div className="agenda-empty">ไม่มีคอร์สหรือสอบในเดือนนี้ — ลองเลื่อนดูเดือนอื่น</div> : <>
      {ongoing.length > 0 && <>
        <SectionTitle title={agenda.isCurrent ? 'วันนี้ · กำลังเรียน' : 'กำลังเรียนช่วงเดือนนี้'} />
        <Stack>{ongoing.map(course => <CourseCard key={course.id} course={course} />)}</Stack>
      </>}
      {agenda.upcoming.length > 0 && <>
        <SectionTitle title="ถัดไป" />
        {agenda.upcoming.map(group => <div key={group.date}>
          <DateHeading iso={group.date} />
          <Stack>
            {group.courses.map(course => <CourseCard key={course.id} course={course} />)}
            {group.events.map(event => <EventCard key={event.id} event={event} />)}
          </Stack>
        </div>)}
      </>}
      {agenda.finished.length > 0 && <>
        <SectionTitle title="จบแล้วในเดือนนี้" />
        <Stack>{agenda.finished.map(course => <CourseCard key={course.id} course={course} done />)}</Stack>
      </>}
      {agenda.pastEvents.length > 0 && <>
        <SectionTitle title="ผ่านมาแล้ว" />
        <Stack>{agenda.pastEvents.map(event => <EventCard key={event.id} event={event} done />)}</Stack>
      </>}
    </>}
  </section>
}

export default function MyPath() {
  usePlanVersion()
  const [params, setParams] = useSearchParams()
  // ?month=YYYY-MM คือเดือนที่เลือก · ไม่มี/ผิดรูป/นอกแกน → replace เป็นเดือนของ TODAY
  const raw = params.get('month')
  const valid = !!raw && /^\d{4}-(0[1-9]|1[0-2])$/.test(raw) && u(`${raw}-01`) >= u(AXIS_START) && u(`${raw}-01`) < u(AXIS_END)
  const month = valid ? `${raw}-01` : monthStartOf(TODAY)
  useEffect(() => {
    if (!valid) setParams(p => { const n = new URLSearchParams(p); n.set('month', month.slice(0, 7)); return n }, { replace: true })
  }, [valid, month, setParams])
  const go = (step: number) => setParams(p => { const n = new URLSearchParams(p); n.set('month', addMonths(month, step).slice(0, 7)); return n })
  const agenda = agendaFor(month)
  const canPrev = u(month) > u(AXIS_START)
  const canNext = u(addMonths(month, 1)) < u(AXIS_END)
  return <main className="monthly-prototype">
    <div className="monthly-shell">
      <PathHeader active="month" period={fmtMonth(month)} now={agenda.isCurrent}
        canPrev={canPrev} canNext={canNext}
        onPrev={() => go(-1)} onNext={() => go(1)} />
      {subjects.length === 0 ? <PlanEmptyState /> : <Agenda agenda={agenda} />}
      <CourseDetailOverlay />
      <details className="prototype-data">
        <summary>ข้อมูล mock (plan.ts · วันนี้ = {fmtDate(TODAY)})</summary>
        <pre>{JSON.stringify({ TODAY, totalHours, studyCalendar, subjects, events, agenda }, null, 2)}</pre>
      </details>
    </div>
    <ProgressTestPanel />
    <BottomNav active="mypath" />
  </main>
}
