// PROTOTYPE — หน้ารายละเอียดคอร์ส แบบเดียวที่เหลือ (D ที่เจ้าของเลือก, 24 ต.ค. 69):
//   desktop ≥641px = แผงข้างขวา · มือถือ ≤640px = bottom sheet (สลับสดตาม viewport)
//   A/B/C + switcher ลบแล้ว — ดูผลการตัดสินที่ ai-knowledge/PAGES/MYPATH-COURSE-DETAIL-PROTOTYPE.md
// ข้อมูล: plan.ts (แผน/ชั่วโมง/วันที่/การซื้อ) + courseDetail.ts (แพ็ก/เล่ม/ExamGym — mirror SAMPLE_DATA)
// คลิกคอร์สบน /mypath และ /mypath/year → ตั้ง ?course=<รหัส> แล้ว overlay เปิดบนหน้าเดิม
import { useEffect, useState, type CSSProperties } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import HeaderButton from '../components/HeaderButton'
import { subjects, setCourseFollowPrevious, setCourseStartDate, setCourseWeeklyHours, usePlanVersion, type Course, type Subject } from './plan'
import { getCourseDetail, prices, covers, ONDEMAND_URL } from './courseDetail'
import './CourseDetailPrototype.css'

/* ---------- helpers ที่ใช้ร่วม ---------- */

export type CourseRef = { subject: Subject; course: Course }
export const TODAY = '2026-12-05' // วันอ้างอิง mock — สอดคล้อง GLOSSARY "วันนี้"

export const findCourse = (id: string): CourseRef | undefined => {
  for (const subject of subjects) {
    const course = subject.courses.find(c => c.id === id)
    if (course) return { subject, course }
  }
  return undefined
}

export const statusOf = (c: Course): { label: string; key: 'now' | 'next' | 'done' } =>
  c.start <= TODAY && TODAY <= c.end ? { label: 'กำลังเรียน', key: 'now' }
    : c.end < TODAY ? { label: 'จบแล้ว', key: 'done' }
      : { label: 'ถัดไป', key: 'next' }

const fmtBaht = (n: number) => `฿${n.toLocaleString('th-TH')}`

// ช่อง CTA ใต้ cover: ซื้อแล้ว = ปุ่มเริ่มเรียน · ยังไม่ซื้อ = ปุ่มหาซื้อ + ราคา
// ทุกปุ่มใช้ HeaderButton ตัวเดียวกับหน้า Profile (mock: ทั้งสองพาไปหน้าคอร์สบน OnDemand)
function CtaUnderCover({ course }: { course: Course }) {
  const price = prices[course.id]
  const go = () => window.open(ONDEMAND_URL, '_blank', 'noreferrer')
  if (course.owned) return <HeaderButton variant="primary" className="cdp-wide" onClick={go}>เริ่มเรียน</HeaderButton>
  return (
    <div className="cdp-buy">
      <HeaderButton className="cdp-wide" onClick={go}>หาซื้อบน OnDemand</HeaderButton>
      {price && <p>{fmtBaht(price.now)}{price.was ? ` <s>${fmtBaht(price.was)}</s>` : ''}</p>}
    </div>
  )
}

function StepSlider({ course }: { course: Course }) {
  const progress = (course.weeklyHours - 1) / 9
  return <div className="cdp-step-slider" style={{ '--progress': `${progress * 100}%` } as CSSProperties}>
    <i className="cdp-step-track" aria-hidden="true"><i /></i>
    <input className="cdp-step-input" aria-label="ชั่วโมงต่อสัปดาห์" type="range" min="1" max="10" step="1" value={course.weeklyHours} onChange={event => setCourseWeeklyHours(course.id, Number(event.target.value))} />
    <span className="cdp-step-marks" aria-hidden="true">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <i key={n} className={n === course.weeklyHours ? 'active' : ''}><b>{n}</b></i>)}</span>
  </div>
}

function StudyRhythmControls({ course }: { course: Course }) {
  return <section className="cdp-rhythm" aria-label="กำหนดเวลาเรียน">
    <label>เวลาเรียนต่อสัปดาห์ <b>{course.weeklyHours} ชม.</b>
      <StepSlider course={course} />
    </label>
    <div className="cdp-start">
      <span>วันเริ่มต้น</span>
      <label className="cdp-follow"><input aria-label="ตาม Course ก่อนหน้า" type="checkbox" checked={!!course.followPrevious} onChange={e => setCourseFollowPrevious(course.id, e.target.checked)} /><i aria-hidden="true" />ตาม Course ก่อนหน้า</label>
      <input aria-label="วันเริ่มต้น" type="date" disabled={!!course.followPrevious} value={course.startDate ?? ''} onChange={e => setCourseStartDate(course.id, e.target.value || undefined)} />
    </div>
  </section>
}

const CloseButton = ({ onClose }: { onClose: () => void }) =>
  <HeaderButton className="header-button--icon cdp-close" aria-label="ปิด" onClick={onClose}><X size={16} strokeWidth={2.5} aria-hidden="true" /></HeaderButton>

function CourseDetailPanel({ ref: cr, onClose }: { ref: CourseRef; onClose: () => void }) {
  const [closing, setClosing] = useState(false)
  const { subject, course } = cr
  const d = getCourseDetail(course.id)
  const cover = covers[course.id]
  const close = () => {
    if (closing) return
    setClosing(true)
    window.setTimeout(onClose, 280)
  }
  useEffect(() => {
    const esc = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  })
  return (
    <div className={`cdp-a${closing ? ' closing' : ''}`}>
      <div className="cdp-backdrop" onClick={close} />
      <section className="cdp-sheet" style={{ '--subject': subject.color } as CSSProperties}>
        <header>
          <div className="cdp-sheet-top">
            <b><i className="dot" />{subject.name}</b>
            <CloseButton onClose={close} />
          </div>
        </header>
        <div className="cdp-layout">
          <div className="cdp-course">
            <div className="cdp-course-title">{cover && <img src={cover} alt="" />}<strong>{course.name}</strong></div>
            <CtaUnderCover course={course} />
          </div>
          <i className="cdp-divider" aria-hidden="true" />
          <StudyRhythmControls course={course} />
          <i className="cdp-divider" aria-hidden="true" />
          <div className="cdp-summary">
            {d?.pack && <p>แพ็ก: {d.pack.name} · ครู {d.pack.teacher}</p>}
            <p><b>คอร์สยาว {course.hours} ชม.</b> · ใช้เวลาประมาณ {course.estimatedWeeks} สัปดาห์</p>
            {d?.volume && <div className="cdp-topics">{d.volume.chapters.map(t => <span key={t}>{t}</span>)}</div>}
            {d?.examgym && <p>{d.examgym.slogan}</p>}
            {!d && <p className="cdp-empty">ยังไม่มีรายละเอียดเนื้อหาสำหรับคอร์สนี้</p>}
          </div>
        </div>
      </section>
    </div>
  )
}

// ใช้ในหน้าแผน: คืนฟังก์ชันคลิกที่ตั้ง ?course= ให้ overlay เปิดบนหน้าเดิม
export function useOpenCourse() {
  const navigate = useNavigate()
  const loc = useLocation()
  return (id: string) => {
    const p = new URLSearchParams(loc.search); p.set('course', id)
    navigate({ pathname: loc.pathname, search: `?${p}` })
  }
}

export function CourseDetailOverlay() {
  usePlanVersion()
  const [sp, setSp] = useSearchParams()
  const id = sp.get('course')
  const cr = id ? findCourse(id) : undefined
  const close = () => { sp.delete('course'); setSp(sp) }
  if (!cr) return null
  return <CourseDetailPanel ref={cr} onClose={close} />
}
