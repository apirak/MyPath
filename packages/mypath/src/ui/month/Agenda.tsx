import type { ReactNode } from 'react'
import type { Agenda as AgendaData } from '../../plan/agenda'
import { dayOf, fmtDate, monthShortOf } from '../../plan/dates'
import CourseCard from './CourseCard'
import EventCard from './EventCard'

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mp-now-heading">
      <span>{title}</span>
    </div>
  )
}

function DateHeading({ iso }: { iso: string }) {
  return (
    <div className="mp-date-heading">
      <b>{dayOf(iso)}</b>
      <span>{monthShortOf(iso)}</span>
      <i />
    </div>
  )
}

function Stack({ children }: { children: ReactNode }) {
  return <div className="mp-course-stack">{children}</div>
}

// One month of the plan, grouped by GLOSSARY.md section rules: ongoing, next
// (by start date), finished, past exams.
export default function Agenda({
  agenda,
  today,
}: {
  agenda: AgendaData
  today: string
}) {
  const ongoing = agenda.isCurrent ? agenda.inProgress : agenda.active
  const empty =
    ongoing.length === 0 &&
    agenda.upcoming.length === 0 &&
    agenda.finished.length === 0 &&
    agenda.pastEvents.length === 0
  return (
    <section className="mp-agenda">
      {agenda.isCurrent && (
        <div className="mp-today-callout">
          <span>วันนี้ · {fmtDate(today)}</span>
          <h2>
            {agenda.inProgress.length
              ? `เริ่มเรียนได้เลย ${agenda.inProgress.length} คอร์ส`
              : 'วันนี้ไม่มีคอร์ส — วันพัก'}
          </h2>
          <p>
            {agenda.inProgress.length
              ? 'เลือกวิชาที่สำคัญที่สุดก่อน แล้วค่อยเดินตามแผน'
              : 'ใช้วันนี้ทบทวน หรืออ่านล่วงหน้าได้ตามสบาย'}
          </p>
        </div>
      )}
      {empty ? (
        <div className="mp-agenda-empty">
          ไม่มีคอร์สหรือสอบในเดือนนี้ — ลองเลื่อนดูเดือนอื่น
        </div>
      ) : (
        <>
          {ongoing.length > 0 && (
            <>
              <SectionTitle
                title={
                  agenda.isCurrent
                    ? 'วันนี้ · กำลังเรียน'
                    : 'กำลังเรียนช่วงเดือนนี้'
                }
              />
              <Stack>
                {ongoing.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </Stack>
            </>
          )}
          {agenda.upcoming.length > 0 && (
            <>
              <SectionTitle title="ถัดไป" />
              {agenda.upcoming.map(group => (
                <div key={group.date}>
                  <DateHeading iso={group.date} />
                  <Stack>
                    {group.courses.map(course => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                    {group.events.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </Stack>
                </div>
              ))}
            </>
          )}
          {agenda.finished.length > 0 && (
            <>
              <SectionTitle title="จบแล้วในเดือนนี้" />
              <Stack>
                {agenda.finished.map(course => (
                  <CourseCard key={course.id} course={course} done />
                ))}
              </Stack>
            </>
          )}
          {agenda.pastEvents.length > 0 && (
            <>
              <SectionTitle title="ผ่านมาแล้ว" />
              <Stack>
                {agenda.pastEvents.map(event => (
                  <EventCard key={event.id} event={event} done />
                ))}
              </Stack>
            </>
          )}
        </>
      )}
    </section>
  )
}
