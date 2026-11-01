import { useState } from 'react'
import type { MyPathView } from '../types'
import HeaderButton from './HeaderButton'
import { CalendarDays, ChevronLeft, ChevronRight } from './icons'
import StudyCalendar from './StudyCalendar'

export type ModeProps = {
  onModeChange: (mode: MyPathView['mode']) => void
  slide: boolean // สลับแท็บมาแล้ว — เลื่อน pill ตอน mount (ไม่เลื่อนตอนเปิดหน้าครั้งแรก)
}

type PathHeaderProps = ModeProps & {
  mode: MyPathView['mode']
  period: string
  now?: boolean // period นี้คือเดือนของวันนี้ — ไฮไลต์ตัวหนังสือ
  showNavigation?: boolean
  canPrev?: boolean
  canNext?: boolean
  onPrev?: () => void
  onNext?: () => void
}

// port จาก src/prototype/components/PathHeader.tsx — Month/All สลับ state ภายในแทน <Link>
// แผงปฏิทินการเรียนเป็น state ของ header: สลับ Month/All = header ของอีกโหมด mount ใหม่ แผงจึงปิด (View state และ deep link)
export default function PathHeader({ mode, onModeChange, slide, period, now = false, showNavigation = true, canPrev = false, canNext = false, onPrev, onNext }: PathHeaderProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const tab = (to: MyPathView['mode'], label: string) => mode === to
    ? <button type="button" className="mp-active" aria-pressed="true">{label}</button>
    : <button type="button" aria-pressed="false" onClick={() => onModeChange(to)}>{label}</button>
  return <header className="mp-header">
    <div className={slide ? 'mp-tabs mp-slide' : 'mp-tabs'} data-active={mode}>{tab('month', 'Month')}{tab('all', 'All')}</div>
    <div className="mp-month-picker">
      {showNavigation && <button type="button" aria-label="Previous month" onClick={onPrev} disabled={!canPrev}><ChevronLeft /></button>}
      <b className={now ? 'mp-now' : ''}>{period}</b>
      {showNavigation && <button type="button" aria-label="Next month" onClick={onNext} disabled={!canNext}><ChevronRight /></button>}
    </div>
    <HeaderButton className="mp-study-calendar" onClick={() => setCalendarOpen(true)}><CalendarDays size={20} /><span>ปฏิทินการเรียน</span></HeaderButton>
    {calendarOpen && <StudyCalendar onClose={() => setCalendarOpen(false)} />}
  </header>
}
