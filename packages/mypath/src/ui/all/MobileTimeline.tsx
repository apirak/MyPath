import { useContext, type CSSProperties } from 'react'
import type { PlannedSubject } from '../../plan/buildPlan'
import { usePlan } from '../../MyPathProvider'
import { addDays, fmtShort, u } from '../../plan/dates'
import { OpenCourseContext, courseButton } from '../course/openCourse'
import { useOwned } from '../components/useOwned'
import { barText, inMonth, type Timeline } from './layout'

// Sticky to the top of .mp-scroll, which scrolls both axes, so it moves
// sideways with the subject columns.
function MobileHead({ subjects }: { subjects: PlannedSubject[] }) {
  return (
    <div className="mp-tp-mobile-head">
      <i />
      <div className="mp-tp-mobile-subjects">
        {subjects.map(subject => (
          <b key={subject.id}>
            <i style={{ background: subject.color }} />
            {subject.name}
          </b>
        ))}
      </div>
    </div>
  )
}

// Mobile layout of All: the timeline turned sideways, one row per month and
// one column per subject. CSS hides it on desktop.
export default function MobileTimeline({ t }: { t: Timeline }) {
  const {
      plan: { subjects, events, today },
    } = usePlan(),
    owned = useOwned(),
    open = useContext(OpenCourseContext)
  // Over 6 subjects: fixed columns showing ~5.5, so the cut-off half hints
  // that the row scrolls.
  const col = subjects.length > 6 ? 'calc((100vw - 78px - 30px) / 5.5)' : '0px'
  return (
    <section
      className="mp-tp-mobile"
      style={{ '--n': subjects.length, '--col': col } as CSSProperties}
    >
      <MobileHead subjects={subjects} />
      <div className="mp-tp-mobile-months">
        {t.months.map(month => {
          const monthEvents = events.filter(event => inMonth(event.date, month))
          return (
            <section
              key={month.start}
              className={
                'mp-tp-mobile-month' + (inMonth(today, month) ? ' now' : '')
              }
            >
              <b>{month.label}</b>
              <div className="mp-tp-mobile-month-content">
                {monthEvents.length > 0 && (
                  <div className="mp-tp-mobile-events">
                    {monthEvents.map(event => (
                      <span
                        key={event.id}
                        className={
                          'mp-tp-mobile-event ' +
                          event.kind +
                          (owned.event(event) ? '' : ' no')
                        }
                      >
                        {event.label} · {fmtShort(event.date)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mp-tp-mobile-subjects">
                  {subjects.map(subject => {
                    const courses = subject.courses.filter(
                      course =>
                        u(course.start) < u(month.end) &&
                        u(addDays(course.end, 1)) > u(month.start),
                    )
                    const full = courses.some(
                      course =>
                        u(course.start) <= u(month.start) &&
                        u(addDays(course.end, 1)) >= u(month.end),
                    )
                    return (
                      <div
                        key={subject.id}
                        className={
                          'mp-tp-mobile-cell' + (full ? ' full-month' : '')
                        }
                        style={{ '--subject': subject.color } as CSSProperties}
                      >
                        {courses.map(course => {
                          const own = owned.course(course.id)
                          return (
                            <span
                              key={course.id}
                              className={
                                'mp-tp-mobile-course ' +
                                (own ? 'own' : 'own-no') +
                                (course.followPrevious ||
                                u(course.start) < u(month.start)
                                  ? ' no-lead'
                                  : '')
                              }
                              {...courseButton(open, course.id)}
                              style={{
                                color: own ? barText(subject.color) : undefined,
                              }}
                            >
                              {course.short}
                            </span>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}
