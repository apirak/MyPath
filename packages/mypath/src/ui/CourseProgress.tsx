import { usePlan, useStartCourse } from '../MyPathProvider'
import { fmtDate } from '../plan/dates'
import { GOALS, progressState } from '../plan/progress'
import flagIcon from '../assets/progress/flag.svg'
import trophyIcon from '../assets/progress/trophy.svg'
import checkedIcon from '../assets/progress/checked.svg'
import walkerIcon from '../assets/progress/walker.svg'
import confettiIcon from '../assets/progress/confetti.svg'
import eggIcon from '../assets/progress/egg-speak.svg'
import HeaderButton from './HeaderButton'
import { Play } from './icons'

// port จาก src/prototype/mypath/CourseProgress.tsx (class course-progress → mp-progress) — Figma 20-46258 (การ์ด) + 3-37233 (สถานะแต่ละ step)
// ต่างจาก prototype: % มาจาก data.progress, วันนี้มาจาก prop today ของ host, ปุ่มเรียนเรียก startCourse (ตรึงวันเริ่มเหมือนหน้ารายละเอียด) · แผงทดสอบอยู่ฝั่ง host
export default function CourseProgress({ course }: { course: { id: string; start: string; end: string } }) {
  const { plan, data } = usePlan()
  const startCourse = useStartCourse()
  // ไม่มีค่า/ไม่ใช่ตัวเลข (host ส่งผิดรูปตอน runtime, key ที่ได้จาก prototype ของ object) = ยังไม่เริ่ม · ค่านอก 0–100 บีบเข้าช่วงเหมือน setProgress ของ prototype
  const raw: unknown = Object.hasOwn(data.progress, course.id) ? data.progress[course.id] : 0
  const { value, next, passed, message } = progressState(course, Number.isFinite(raw) ? Math.max(0, Math.min(100, raw as number)) : 0, plan.today)
  const label = value === 0 ? 'เริ่มเรียน' : value === 100 ? 'ทบทวน' : 'เรียนต่อ'
  return <div className="mp-progress">
    <div className="mp-progress-track">
      {next !== undefined && <i className="mp-plan" style={{ width: `${next}%` }} />}
      <i className="mp-fill" style={{ width: `${value}%` }} />
      {GOALS.map((goal, i) => value !== goal && <b key={goal} className={`mp-progress-goal-line${passed[i] ? ' mp-passed' : ''}`} style={{ left: `${goal}%` }} />)}
      {GOALS.map((goal, i) => value !== goal && <span key={goal} className={`mp-progress-pin${i === 0 && !passed[0] ? ' mp-flag' : ''}`} style={{ left: `${goal}%` }}>
        <img src={passed[i] ? checkedIcon : i === 0 ? flagIcon : trophyIcon} alt="" />
      </span>)}
      {value < 100
        ? <span className={`mp-progress-pin mp-walker${(GOALS as readonly number[]).includes(value) ? ' mp-on-goal' : ''}${value === 0 ? ' mp-start' : ''}`} style={{ left: `${value}%` }}><img src={walkerIcon} alt="" /></span>
        : <span className="mp-progress-pin mp-end" style={{ left: '100%' }}><img src={confettiIcon} alt="" /></span>}
    </div>
    <div className="mp-progress-foot">
      <span>คืบหน้า <b>{value}%</b></span>
      <span className={`mp-progress-message mp-${message.tone}`}>
        {message.text}{message.date && <> <b>{fmtDate(message.date)}</b></>}
        {message.egg && <img src={eggIcon} alt="" />}
      </span>
      <HeaderButton variant="primary" className="mp-progress-start" onClick={() => startCourse(course.id)}>
        <Play size={14} />{label}
      </HeaderButton>
    </div>
  </div>
}
