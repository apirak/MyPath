import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import HeaderButton from './HeaderButton'
import StudyCalendarPanel from '../mypath/StudyCalendarPanel'
import './PathHeader.css'

type PathHeaderProps = {
  active: 'month' | 'year' | 'all'
  period: string
  now?: boolean // period นี้คือเดือนของ TODAY — ไฮไลต์ตัวหนังสือ
  showNavigation?: boolean
  canPrev?: boolean
  canNext?: boolean
  onPrev?: () => void
  onNext?: () => void
}

export default function PathHeader({ active, period, now = false, showNavigation = true, canPrev = false, canNext = false, onPrev, onNext }: PathHeaderProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  return <header className="monthly-header path-header">
    <div className="monthly-tabs">
      {active === 'month' ? <button className="active">Month</button> : <a href="/mypath">Month</a>}
      {active === 'year' ? <button className="active">Year</button> : <a href="/mypath/year">Year</a>}
      {active === 'all' ? <button className="active">All</button> : <a href="/mypath/all">All</a>}
    </div>
    <div className="month-picker">{showNavigation && <button aria-label="Previous period" onClick={onPrev} disabled={onPrev ? !canPrev : undefined}><ChevronLeft /></button>}<b className={now ? 'now' : ''}>{period}</b>{showNavigation && <button aria-label="Next period" onClick={onNext} disabled={onNext ? !canNext : undefined}><ChevronRight /></button>}</div>
    <HeaderButton className="study-calendar" onClick={() => setCalendarOpen(true)}><CalendarDays size={20} /><span>ปฏิทินการเรียน</span></HeaderButton>
    {calendarOpen && <StudyCalendarPanel onClose={() => setCalendarOpen(false)} />}
  </header>
}
