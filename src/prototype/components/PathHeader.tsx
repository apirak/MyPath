import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import HeaderButton from './HeaderButton'
import StudyCalendarPanel from '../mypath/StudyCalendarPanel'
import './PathHeader.css'

type PathHeaderProps = {
  active: 'month' | 'all'
  period: string
  now?: boolean // period นี้คือเดือนของ TODAY — ไฮไลต์ตัวหนังสือ
  showNavigation?: boolean
  canPrev?: boolean
  canNext?: boolean
  onPrev?: () => void
  onNext?: () => void
}

// แท็บที่แสดงล่าสุด — Month/All เป็นคนละหน้า header จึง mount ใหม่ เลื่อน pill เฉพาะตอนสลับแท็บ ไม่ใช่ตอนโหลดหน้า
let lastTab: PathHeaderProps['active'] | null = null

export default function PathHeader({ active, period, now = false, showNavigation = true, canPrev = false, canNext = false, onPrev, onNext }: PathHeaderProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const { search } = useLocation() // พก ?month= (และ query อื่น) ข้ามแท็บ
  const [slide] = useState(() => lastTab !== null && lastTab !== active) // ล็อกตอน mount — re-render ภายหลังต้องไม่ลบ class
  useEffect(() => { lastTab = active }, [active])
  return <header className="monthly-header path-header">
    <div className={slide ? 'monthly-tabs slide' : 'monthly-tabs'} data-active={active}>
      {active === 'month' ? <button className="active">Month</button> : <Link to={{ pathname: '/prototype/mypath', search }}>Month</Link>}
      {active === 'all' ? <button className="active">All</button> : <Link to={{ pathname: '/prototype/mypath/all', search }}>All</Link>}
    </div>
    <div className="month-picker">{showNavigation && <button aria-label="Previous period" onClick={onPrev} disabled={onPrev ? !canPrev : undefined}><ChevronLeft /></button>}<b className={now ? 'now' : ''}>{period}</b>{showNavigation && <button aria-label="Next period" onClick={onNext} disabled={onNext ? !canNext : undefined}><ChevronRight /></button>}</div>
    <HeaderButton className="study-calendar" onClick={() => setCalendarOpen(true)}><CalendarDays size={20} /><span>ปฏิทินการเรียน</span></HeaderButton>
    {calendarOpen && <StudyCalendarPanel onClose={() => setCalendarOpen(false)} />}
  </header>
}
