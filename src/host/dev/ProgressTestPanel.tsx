import { useState } from 'react'
import { Settings, X } from 'lucide-react'
import type { MyPathData } from '@learn/mypath'
import './ProgressTestPanel.css'

type Props = {
  data: MyPathData
  today: string
  onProgressChange: (progress: MyPathData['progress']) => void
  onTodayChange: (today: string) => void
  onReset: () => void
}

const addDays = (iso: string, n: number) =>
  new Date(Date.parse(iso) + n * 86_400_000).toISOString().slice(0, 10)

// ดัดแปลงจาก ProgressTestPanel ใน src/prototype/mypath/CourseProgress.tsx — แก้
// state ของ host (progress และวันนี้) ที่ส่งเข้า <MyPath>
// เพื่อพิสูจน์ว่าหน้าจอใน SDK เปลี่ยนตามข้อมูลจาก host · ปุ่มเฟืองมุมขวาล่าง
// อยู่นอกกล่องของ SDK
export default function ProgressTestPanel({
  data,
  today,
  onProgressChange,
  onTodayChange,
  onReset,
}: Props) {
  const courses = data.catalog.flatMap(group =>
    group.subjects.flatMap(subject =>
      subject.courses
        .filter(course => data.owned.includes(course.id))
        .map(course => ({ ...course, subject: subject.name })),
    ),
  )
  const [open, setOpen] = useState(false)
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '')
  const [step, setStep] = useState(10)
  const progressOf = (id: string) => data.progress[id] ?? 0
  const value = progressOf(courseId)
  const setProgress = (next: number) =>
    onProgressChange({
      ...data.progress,
      [courseId]: Math.max(0, Math.min(100, next)),
    })
  if (!open)
    return (
      <button
        type="button"
        className="progress-test-toggle"
        aria-label="เปิดแผงทดสอบ"
        onClick={() => setOpen(true)}
      >
        <Settings size={20} />
      </button>
    )
  return (
    <div
      className="progress-test-panel"
      role="dialog"
      aria-label="แผงทดสอบความคืบหน้า"
    >
      <header>
        <b>แผงทดสอบ</b>
        <button type="button" aria-label="ปิด" onClick={() => setOpen(false)}>
          <X size={16} />
        </button>
      </header>
      <label>
        คอร์ส
        <select value={courseId} onChange={e => setCourseId(e.target.value)}>
          {courses.map(c => (
            <option key={c.id} value={c.id}>
              {c.subject} · {c.name} ({progressOf(c.id)}%)
            </option>
          ))}
        </select>
      </label>
      <div className="row">
        <label>
          Step %
          <input
            type="number"
            min={1}
            max={100}
            value={step}
            onChange={e => setStep(Number(e.target.value) || 1)}
          />
        </label>
        <button type="button" onClick={() => setProgress(value - step)}>
          −{step}
        </button>
        <output>{value}%</output>
        <button type="button" onClick={() => setProgress(value + step)}>
          +{step}
        </button>
      </div>
      <label>
        วันนี้
        <input
          type="date"
          value={today}
          onChange={e => e.target.value && onTodayChange(e.target.value)}
        />
      </label>
      <div className="row">
        {[-7, -1, 1, 7].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onTodayChange(addDays(today, n))}
          >
            {n > 0 ? `+${n}` : n} วัน
          </button>
        ))}
      </div>
      <div className="row">
        <button type="button" onClick={onReset}>
          รีเซ็ตทั้งหมด
        </button>
      </div>
    </div>
  )
}
