import type { ReactNode } from 'react'
import type { ExamEvent } from '../types'
import { usePlan } from '../MyPathProvider'
import { agendaFor, type Agenda as AgendaData, type AgendaCourse } from '../plan/agenda'
import { addMonths, dayOf, fmtDate, fmtMonth, fmtShort, monthShortOf, monthStartOf } from '../plan/dates'
import PathHeader, { type ModeProps } from './PathHeader'
import PlanEmptyState from './PlanEmptyState'

// port จาก src/prototype/pages/MyPath.tsx — agenda คิดจากแผนทั้งหมด (กติกา section ล็อกไว้ใน GLOSSARY.md)
// ต่างจาก prototype: เดือนที่เลือกเป็น state ภายในของ <MyPath> (ไม่มี ?month=), การ์ดยังกดไม่ได้ (ใบ 07) และไม่มีความคืบหน้า (ใบ 09)

// สีชนิดสอบ (encoding เดียวกับ All: น้ำเงิน = สอบจริง, แดง = Mock)
const KIND_COLOR = { exam: '#2b6cd4', mock: '#ef6268' } as const

function Plate({ text, color, owned }: { text: string; color: string; owned: boolean }) {
  // ปกสำรอง: ทึบสีวิชา = ซื้อแล้ว · แผ่นอ่อนขอบประ = ยังไม่ได้ซื้อ (encoding เดียวกับ All)
  return <span className="mp-plate" style={owned ? { background: color, color: '#fff' } : { background: `${color}1c`, color, boxShadow: `inset 0 0 0 2px ${color}` }}>{text}</span>
}

function CourseCard({ course, done = false }: { course: AgendaCourse; done?: boolean }) {
  const owned = usePlan().data.owned.includes(course.id)
  return <article className={`mp-course${done ? ' mp-done' : ''}`}>
    <div className="mp-course-body">
      {course.cover ? <img src={course.cover} alt="" /> : <Plate text={course.short} color={course.color} owned={owned} />}
      <div>
        <div className="mp-course-top"><b>{course.subject}</b><span>เรียน (ติวเข้ม)</span></div>
        <strong>{course.name}</strong>
        <small>{course.hours} ชม. · {fmtDate(course.start)} – {fmtDate(course.end)}{owned ? '' : ' · ยังไม่ได้ซื้อ'}</small>
      </div>
    </div>
  </article>
}

function EventCard({ event, done = false }: { event: ExamEvent; done?: boolean }) {
  // สอบจริงไม่มีการซื้อ จึงสีเข้มเสมอ; Mock ดูจาก owned
  const { owned: ownedIds } = usePlan().data
  const owned = event.kind === 'exam' || ownedIds.includes(event.id)
  const color = KIND_COLOR[event.kind]
  const kindLabel = event.kind === 'exam' ? 'สอบจริง' : 'Mock'
  return <article className={`mp-course${done ? ' mp-done' : ''}`}>
    <div className="mp-course-body">
      <Plate text={kindLabel} color={color} owned={owned} />
      <div>
        <div className="mp-course-top"><b>{kindLabel}</b><span>{fmtShort(event.date)}</span></div>
        <strong>{event.label}</strong>
        <small>สอบ 1 วัน{owned ? '' : ' · ยังไม่ได้ซื้อ'}</small>
      </div>
    </div>
  </article>
}

function SectionTitle({ title }: { title: string }) {
  return <div className="mp-now-heading"><span>{title}</span></div>
}

function DateHeading({ iso }: { iso: string }) {
  return <div className="mp-date-heading"><b>{dayOf(iso)}</b><span>{monthShortOf(iso)}</span><i /></div>
}

function Stack({ children }: { children: ReactNode }) {
  return <div className="mp-course-stack">{children}</div>
}

function Agenda({ agenda, today }: { agenda: AgendaData; today: string }) {
  const ongoing = agenda.isCurrent ? agenda.inProgress : agenda.active
  const empty = ongoing.length === 0 && agenda.upcoming.length === 0 && agenda.finished.length === 0 && agenda.pastEvents.length === 0
  return <section className="mp-agenda">
    {agenda.isCurrent && <div className="mp-today-callout">
      <span>วันนี้ · {fmtDate(today)}</span>
      <h2>{agenda.inProgress.length ? `เริ่มเรียนได้เลย ${agenda.inProgress.length} คอร์ส` : 'วันนี้ไม่มีคอร์ส — วันพัก'}</h2>
      <p>{agenda.inProgress.length ? 'เลือกวิชาที่สำคัญที่สุดก่อน แล้วค่อยเดินตามแผน' : 'ใช้วันนี้ทบทวน หรืออ่านล่วงหน้าได้ตามสบาย'}</p>
    </div>}
    {empty ? <div className="mp-agenda-empty">ไม่มีคอร์สหรือสอบในเดือนนี้ — ลองเลื่อนดูเดือนอื่น</div> : <>
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

// selected อยู่ที่ <MyPath> เพื่อไม่หายตอนสลับไป All · ไม่มี = เดือนของวันนี้
export default function MonthView({ selected: picked, onSelect, ...mode }: ModeProps & { selected?: string; onSelect: (month: string) => void }) {
  const { plan } = usePlan()
  const { axis, today } = plan
  const selected = picked ?? monthStartOf(today)
  // แกนคิดใหม่ทุกครั้งที่แผนเปลี่ยน → บีบเดือนที่เลือกเข้าขอบแกนที่ใกล้ที่สุด (ไม่กลับไปเดือนของวันนี้แบบ prototype)
  const lastMonth = addMonths(axis.end, -1)
  const month = selected < axis.start ? axis.start : selected > lastMonth ? lastMonth : selected
  const agenda = agendaFor(plan, month)
  // key={month}: เปลี่ยนเดือน = remount scroller → กลับขึ้นบนสุด
  return <>
    <PathHeader mode="month" {...mode} period={fmtMonth(month)} now={agenda.isCurrent}
      canPrev={month > axis.start} canNext={month < lastMonth}
      onPrev={() => onSelect(addMonths(month, -1))} onNext={() => onSelect(addMonths(month, 1))} />
    <div className="mp-scroll" key={month}>
      <div className="mp-shell">{plan.subjects.length === 0 ? <PlanEmptyState /> : <Agenda agenda={agenda} today={today} />}</div>
    </div>
  </>
}
