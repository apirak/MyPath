import { useContext, type CSSProperties, type PointerEvent } from 'react'
import type { PlannedCourse, PlannedSubject } from '../../plan/buildPlan'
import { addDays, fmtDate } from '../../plan/dates'
import { OpenCourseContext, courseButton } from '../course/openCourse'
import { useOwned } from '../components/useOwned'
import AxisRow from './AxisRow'
import { barText, position, visible, type Timeline } from './layout'

export type DragStart = (
  event: PointerEvent<HTMLElement>,
  course: PlannedCourse,
) => void

// One subject: its label plus a bar per course. Courses that start on their
// own date get a grip to drag the start date; followers move with them.
export default function SubjectRow({
  subject,
  t,
  dayWidth,
  onDragStart,
}: {
  subject: PlannedSubject
  t: Timeline
  dayWidth: number
  onDragStart: DragStart
}) {
  const owned = useOwned(),
    open = useContext(OpenCourseContext)
  const style = { '--subject': subject.color } as CSSProperties
  return (
    <>
      <b className="mp-tp-label mp-tp-subject" style={style}>
        <i />
        {subject.name}
      </b>
      <AxisRow t={t} dayWidth={dayWidth} style={style}>
        {subject.courses.length === 0 && (
          <span className="mp-tp-no-course">ยังไม่มีคอร์ส</span>
        )}
        {subject.courses
          .filter(course => visible(course, t))
          .map(course => {
            const left = Math.max(0, position(course.start, t)),
              right = Math.min(100, position(addDays(course.end, 1), t)),
              own = owned.course(course.id)
            return (
              <span
                key={course.id}
                className={
                  'mp-tp-course' +
                  (own ? ' own' : '') +
                  (course.followPrevious ? ' no-lead' : '')
                }
                {...courseButton(open, course.id)}
                style={{
                  left: `calc(${left}% + 3px)`,
                  width: `calc(${right - left}% - 6px)`,
                  color: own ? barText(subject.color) : undefined,
                }}
                title={
                  `${course.name} · ` +
                  `${fmtDate(course.start)} – ${fmtDate(course.end)}`
                }
              >
                {!course.followPrevious && (
                  <i
                    className="mp-tp-grip"
                    aria-hidden="true"
                    onPointerDown={event => onDragStart(event, course)}
                    // Dragging must not also open the course sheet.
                    onClick={event => event.stopPropagation()}
                  />
                )}
                {course.short}
              </span>
            )
          })}
      </AxisRow>
    </>
  )
}
