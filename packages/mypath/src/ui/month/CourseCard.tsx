import { useContext } from 'react'
import type { AgendaCourse } from '../../plan/agenda'
import { fmtDate } from '../../plan/dates'
import { OpenCourseContext, courseButton } from '../course/openCourse'
import CourseProgress from '../course/CourseProgress'
import { useOwned } from '../components/useOwned'
import Plate from './Plate'

export default function CourseCard({
  course,
  done = false,
}: {
  course: AgendaCourse
  done?: boolean
}) {
  const owned = useOwned().course(course.id),
    open = useContext(OpenCourseContext)
  // The body opens the sheet; the progress bar (with its own button) is a
  // sibling, so no control is nested inside another.
  return (
    <article
      className={
        'mp-course' +
        (done ? ' mp-done' : '') +
        (owned ? ' mp-has-progress' : '')
      }
    >
      <div className="mp-course-body" {...courseButton(open, course.id)}>
        {course.cover ? (
          <img src={course.cover} alt="" />
        ) : (
          <Plate text={course.short} color={course.color} owned={owned} />
        )}
        <div>
          <div className="mp-course-top">
            <b>{course.subject}</b>
            <span>เรียน (ติวเข้ม)</span>
          </div>
          <strong>{course.name}</strong>
          <small>
            {course.hours} ชม. · {fmtDate(course.start)} – {fmtDate(course.end)}
            {owned ? '' : ' · ยังไม่ได้ซื้อ'}
          </small>
        </div>
      </div>
      {owned && <CourseProgress course={course} />}
    </article>
  )
}
