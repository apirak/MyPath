import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Play, Settings, X } from 'lucide-react'
import { TODAY, addDays, fmtDate } from './plan'
import {
  GOALS, progressState, progressOf, setProgress, resetProgress, getSimToday, setSimToday, ownedCourses,
  useProgressVersion,
} from './progressStore'
import flagIcon from '../../assets/mypath/progress/flag.svg'
import trophyIcon from '../../assets/mypath/progress/trophy.svg'
import checkedIcon from '../../assets/mypath/progress/checked.svg'
import walkerIcon from '../../assets/mypath/progress/walker.svg'
import confettiIcon from '../../assets/mypath/progress/confetti.svg'
import eggIcon from '../../assets/mypath/progress/egg-speak.svg'
import HeaderButton from '../components/HeaderButton'
import './CourseProgress.css'

// แถบความคืบหน้าบนการ์ดคอร์สที่ซื้อแล้ว — Figma 20-46258 (การ์ด) + 3-37233 (สถานะแต่ละ step)
export function CourseProgress({ course }: { course: { id: string; start: string; end: string } }) {
  useProgressVersion()
  const state = progressState(course)
  const { value, next, passed, message } = state
  const label = value === 0 ? 'เริ่มเรียน' : value === 100 ? 'ทบทวน' : 'เรียนต่อ'
  // ปุ่ม mock: ยังไม่ลิงก์ไปห้องเรียน — กันคลิกทะลุไปเปิด Course Detail
  const stop = (e: MouseEvent) => e.stopPropagation()
  return <div className="course-progress">
    <div className="course-progress-track">
      {next !== undefined && <i className="plan" style={{ width: `${next}%` }} />}
      <i className="fill" style={{ width: `${value}%` }} />
      {GOALS.map((goal, i) => value !== goal && <b key={goal} className={`course-progress-goal-line${passed[i] ? ' passed' : ''}`} style={{ left: `${goal}%` }} />)}
      {GOALS.map((goal, i) => value !== goal && <span key={goal} className={`course-progress-pin${i === 0 && !passed[0] ? ' flag' : ''}`} style={{ left: `${goal}%` }}>
        <img src={passed[i] ? checkedIcon : i === 0 ? flagIcon : trophyIcon} alt="" />
      </span>)}
      {value < 100
        ? <span className={`course-progress-pin walker${(GOALS as readonly number[]).includes(value) ? ' on-goal' : ''}${value === 0 ? ' start' : ''}`} style={{ left: `${value}%` }}><img src={walkerIcon} alt="" /></span>
        : <span className="course-progress-pin end" style={{ left: '100%' }}><img src={confettiIcon} alt="" /></span>}
    </div>
    <div className="course-progress-foot">
      <span>คืบหน้า <b>{value}%</b></span>
      <span className={`course-progress-message ${message.tone}`}>
        {message.text}{message.date && <> <b>{fmtDate(message.date)}</b></>}
        {message.egg && <img src={eggIcon} alt="" />}
      </span>
      <HeaderButton type="button" variant="primary" className="course-progress-start" onClick={stop} onKeyDown={e => e.stopPropagation()}>
        <Play size={14} fill="currentColor" />{label}
      </HeaderButton>
    </div>
  </div>
}

// แผงทดสอบ (mock) — ปุ่มเฟืองมุมขวาล่าง · ปรับ % ทีละ step และวันนี้จำลอง (มีผลเฉพาะข้อความในแถบ progress)
export function ProgressTestPanel() {
  useProgressVersion()
  const [open, setOpen] = useState(false)
  const courses = ownedCourses()
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '')
  const [step, setStep] = useState(10)
  const today = getSimToday()
  const value = progressOf(courseId)
  if (!open) return <button type="button" className="progress-test-toggle" aria-label="เปิดแผงทดสอบ" onClick={() => setOpen(true)}><Settings size={20} /></button>
  return <div className="progress-test-panel" role="dialog" aria-label="แผงทดสอบความคืบหน้า">
    <header><b>แผงทดสอบ</b><button type="button" aria-label="ปิด" onClick={() => setOpen(false)}><X size={16} /></button></header>
    <label>คอร์ส
      <select value={courseId} onChange={e => setCourseId(e.target.value)}>
        {courses.map(c => <option key={c.id} value={c.id}>{c.subject} · {c.name} ({progressOf(c.id)}%)</option>)}
      </select>
    </label>
    <div className="row">
      <label>Step %<input type="number" min={1} max={100} value={step} onChange={e => setStep(Number(e.target.value) || 1)} /></label>
      <button type="button" onClick={() => setProgress(courseId, value - step)}>−{step}</button>
      <output>{value}%</output>
      <button type="button" onClick={() => setProgress(courseId, value + step)}>+{step}</button>
    </div>
    <label>วันนี้จำลอง <small>(มีผลเฉพาะข้อความในแถบ)</small>
      <input type="date" value={today} onChange={e => e.target.value && setSimToday(e.target.value)} />
    </label>
    <div className="row">
      {[-7, -1, 1, 7].map(n => <button key={n} type="button" onClick={() => setSimToday(addDays(today, n))}>{n > 0 ? `+${n}` : n} วัน</button>)}
    </div>
    <div className="row">
      <button type="button" onClick={() => { resetProgress(); setSimToday(TODAY) }}>รีเซ็ตทั้งหมด</button>
      <small>{fmtDate(today)}{today === TODAY ? ' (วันนี้)' : ''}</small>
    </div>
  </div>
}
