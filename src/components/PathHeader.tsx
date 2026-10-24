import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import HeaderButton from './HeaderButton'
import './PathHeader.css'

type PathHeaderProps = {
  active: 'month' | 'year'
  period: string
  now?: boolean // period นี้คือเดือนของ TODAY — ไฮไลต์ตัวหนังสือ
  canPrev?: boolean
  canNext?: boolean
  onPrev?: () => void
  onNext?: () => void
}

export default function PathHeader({ active, period, now = false, canPrev = false, canNext = false, onPrev, onNext }: PathHeaderProps) {
  return <header className="monthly-header path-header">
    <div className="monthly-tabs">
      <a href="/mypath">Week</a>
      {active === 'month' ? <button className="active">Month</button> : <a href="/mypath">Month</a>}
      {active === 'year' ? <a className="active" href="/mypath/year">Year</a> : <a href="/mypath/year">Year</a>}
    </div>
    <div className="month-picker">
      <button aria-label="Previous period" onClick={onPrev} disabled={onPrev ? !canPrev : undefined}><ChevronLeft /></button>
      <b className={now ? 'now' : ''}>{period}</b>
      <button aria-label="Next period" onClick={onNext} disabled={onNext ? !canNext : undefined}><ChevronRight /></button>
    </div>
    <HeaderButton className="study-calendar"><CalendarDays size={20} /><span>ปฏิทินการเรียน</span></HeaderButton>
  </header>
}
