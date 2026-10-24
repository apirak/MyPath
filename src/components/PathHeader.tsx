import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import HeaderButton from './HeaderButton'
import './PathHeader.css'

type PathHeaderProps = { active: 'month' | 'year'; period: string }

export default function PathHeader({ active, period }: PathHeaderProps) {
  return <header className="monthly-header path-header">
    <div className="monthly-tabs">
      <a href="/mypath">Week</a>
      {active === 'month' ? <button className="active">Month</button> : <a href="/mypath">Month</a>}
      {active === 'year' ? <a className="active" href="/mypath/year-prototype">Year</a> : <a href="/mypath/year-prototype">Year</a>}
    </div>
    <div className="month-picker">
      <button aria-label="Previous period"><ChevronLeft /></button>
      <b>{period}</b>
      <button aria-label="Next period"><ChevronRight /></button>
    </div>
    <HeaderButton className="study-calendar"><CalendarDays size={20} /><span>ปฏิทินการเรียน</span></HeaderButton>
  </header>
}
