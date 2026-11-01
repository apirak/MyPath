import type { CSSProperties } from 'react'
import type { MyPathProps, StudentCourse } from '../../types'
import { usePlan, useStartCourse } from '../../MyPathProvider'
import type { PlannedCourse } from '../../plan/buildPlan'
import { withCourse } from '../../plan/timeline'
import HeaderButton from '../components/HeaderButton'
import { X } from '../components/icons'
import { useModal } from '../components/useModal'

// Course sheet (bottom sheet on every screen size). Edits send the whole plan
// via onPlanChange (ADR-0003); buy/start call back into the host.
type Props = Pick<MyPathProps, 'onBuyCourse'> & {
  courseId: string
  onClose: () => void
}

const fmtBaht = (n: number) => `฿${n.toLocaleString('th-TH')}`

function StepSlider({
  course,
  disabled,
  onChange,
}: {
  course: PlannedCourse
  disabled: boolean
  onChange: (weeklyHours: number) => void
}) {
  const progress = (course.weeklyHours - 1) / 9
  return (
    <div
      className="mp-cdp-step-slider"
      style={{ '--progress': `${progress * 100}%` } as CSSProperties}
    >
      <i className="mp-cdp-step-track" aria-hidden="true">
        <i />
      </i>
      <input
        className="mp-cdp-step-input"
        aria-label="ชั่วโมงต่อสัปดาห์"
        type="range"
        min="1"
        max="10"
        step="1"
        disabled={disabled}
        value={course.weeklyHours}
        onChange={event => onChange(Number(event.target.value))}
      />
      <span className="mp-cdp-step-marks" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <i key={n} className={n === course.weeklyHours ? 'active' : ''}>
            <b>{n}</b>
          </i>
        ))}
      </span>
    </div>
  )
}

export default function CourseDetail({
  courseId,
  onClose,
  onBuyCourse,
}: Props) {
  const { plan, data, onPlanChange } = usePlan()
  const startCourse = useStartCourse()
  const { ref: sheet, closing, close } = useModal<HTMLElement>(onClose)
  const subject = plan.subjects.find(s =>
    s.courses.some(c => c.id === courseId),
  )
  const course = subject?.courses.find(c => c.id === courseId)
  // The host may drop the subject from the plan while the sheet is open.
  if (!subject || !course) return null

  const change = (patch: Partial<StudentCourse>) =>
    onPlanChange(withCourse(data.plan, course.id, patch))
  const firstCourse = subject.courses[0].id === course.id
  const noPrevious = firstCourse ? 'ไม่มี Course ก่อนหน้า' : undefined
  const owned = data.owned.includes(course.id)
  const price = data.prices[course.id]
  const detail = data.courseDetails[course.id]
  const pack = detail?.packId ? data.packs[detail.packId] : undefined

  return (
    <div className={`mp-cdp-a${closing ? ' closing' : ''}`}>
      <div className="mp-cdp-backdrop" onClick={close} />
      <section
        ref={sheet}
        className="mp-cdp-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={course.name}
        tabIndex={-1}
        style={{ '--subject': subject.color } as CSSProperties}
      >
        <header>
          <div className="mp-cdp-sheet-top">
            <b>
              <i className="mp-cdp-dot" />
              {subject.name}
            </b>
            <HeaderButton
              className="mp-cdp-close"
              aria-label="ปิด"
              onClick={close}
            >
              <X size={16} />
            </HeaderButton>
          </div>
        </header>
        <div className="mp-cdp-layout">
          <div className="mp-cdp-course">
            <div className="mp-cdp-course-title">
              {course.cover && <img src={course.cover} alt="" />}
              <strong>{course.name}</strong>
            </div>
            {owned ? (
              <HeaderButton
                variant="primary"
                className="mp-cdp-wide"
                onClick={() => startCourse(course.id)}
              >
                เริ่มเรียน
              </HeaderButton>
            ) : (
              <div className="mp-cdp-buy">
                <HeaderButton
                  className="mp-cdp-wide"
                  onClick={() => onBuyCourse(course.id)}
                >
                  หาซื้อบน OnDemand
                </HeaderButton>
                {price && (
                  <p>
                    {fmtBaht(price.now)}
                    {price.was !== undefined && <s>{fmtBaht(price.was)}</s>}
                  </p>
                )}
              </div>
            )}
          </div>
          <i className="mp-cdp-divider" aria-hidden="true" />
          <section className="mp-cdp-rhythm" aria-label="กำหนดเวลาเรียน">
            <div className="mp-cdp-weekly">
              <div>
                <span>เวลาเรียนต่อสัปดาห์</span>
                {/* Unfollowing keeps the inherited hours as this course's
                    own value, so the slider doesn't jump. */}
                <label className="mp-cdp-follow" title={noPrevious}>
                  <input
                    aria-label="ตาม Course ก่อนหน้า"
                    type="checkbox"
                    disabled={firstCourse}
                    checked={course.followPreviousWeeklyHours}
                    onChange={e =>
                      change(
                        e.target.checked
                          ? { followPreviousWeeklyHours: true }
                          : {
                              followPreviousWeeklyHours: false,
                              weeklyHours: course.weeklyHours,
                            },
                      )
                    }
                  />
                  <i aria-hidden="true" />
                  ตาม Course ก่อนหน้า
                </label>
              </div>
              <StepSlider
                course={course}
                disabled={course.followPreviousWeeklyHours}
                onChange={weeklyHours => change({ weeklyHours })}
              />
            </div>
            <div className="mp-cdp-start">
              <span>วันเริ่มต้น</span>
              <label className="mp-cdp-follow" title={noPrevious}>
                <input
                  aria-label="ตาม Course ก่อนหน้า"
                  type="checkbox"
                  disabled={firstCourse}
                  checked={course.followPrevious}
                  onChange={e => change({ followPrevious: e.target.checked })}
                />
                <i aria-hidden="true" />
                ตาม Course ก่อนหน้า
              </label>
              <input
                aria-label="วันเริ่มต้น"
                type="date"
                disabled={course.followPrevious}
                value={course.startDate ?? ''}
                onChange={e =>
                  change({ startDate: e.target.value || undefined })
                }
              />
            </div>
          </section>
          <i className="mp-cdp-divider" aria-hidden="true" />
          <div className="mp-cdp-summary">
            {pack && (
              <p>
                แพ็ก: {pack.name} · ครู {pack.teacher}
              </p>
            )}
            <p>
              <b>คอร์สยาว {course.hours} ชม.</b> · ใช้เวลาประมาณ{' '}
              {course.estimatedWeeks} สัปดาห์
            </p>
            {detail?.volume && (
              <div className="mp-cdp-topics">
                {detail.volume.chapters.map(t => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            )}
            {detail?.examgym && <p>{detail.examgym.slogan}</p>}
            {!detail && (
              <p className="mp-cdp-empty">
                ยังไม่มีรายละเอียดเนื้อหาสำหรับคอร์สนี้
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
