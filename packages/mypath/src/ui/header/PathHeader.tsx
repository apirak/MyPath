import { useState } from 'react'
import type { MyPathView } from '../../types'
import HeaderButton from '../components/HeaderButton'
import { CalendarDays, ChevronLeft, ChevronRight } from '../components/icons'
import StudyCalendar from '../calendar/StudyCalendar'

export type ModeProps = {
  onModeChange: (mode: MyPathView['mode']) => void
  // Arrived via a tab switch: animate the pill on mount, but not on first load
  slide: boolean
}

type PathHeaderProps = ModeProps & {
  mode: MyPathView['mode']
  period: string
  now?: boolean // period is Today's month: highlight it
  showNavigation?: boolean
  canPrev?: boolean
  canNext?: boolean
  onPrev?: () => void
  onNext?: () => void
}

// The study calendar panel is header state on purpose: switching Month/All
// mounts the other mode's header, which closes the panel
// (docs/mypath-sdk-plan.md, View state and deep link).
export default function PathHeader({
  mode,
  onModeChange,
  slide,
  period,
  now = false,
  showNavigation = true,
  canPrev = false,
  canNext = false,
  onPrev,
  onNext,
}: PathHeaderProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const tab = (to: MyPathView['mode'], label: string) =>
    mode === to ? (
      <button type="button" className="mp-active" aria-pressed="true">
        {label}
      </button>
    ) : (
      <button
        type="button"
        aria-pressed="false"
        onClick={() => onModeChange(to)}
      >
        {label}
      </button>
    )
  return (
    <header className="mp-header">
      <div
        className={slide ? 'mp-tabs mp-slide' : 'mp-tabs'}
        data-active={mode}
      >
        {tab('month', 'Month')}
        {tab('all', 'All')}
      </div>
      <div className="mp-month-picker">
        {showNavigation && (
          <button
            type="button"
            aria-label="Previous month"
            onClick={onPrev}
            disabled={!canPrev}
          >
            <ChevronLeft />
          </button>
        )}
        <b className={now ? 'mp-now' : ''}>{period}</b>
        {showNavigation && (
          <button
            type="button"
            aria-label="Next month"
            onClick={onNext}
            disabled={!canNext}
          >
            <ChevronRight />
          </button>
        )}
      </div>
      <HeaderButton
        className="mp-study-calendar"
        aria-label="ปฏิทินการเรียน"
        onClick={() => setCalendarOpen(true)}
      >
        <CalendarDays size={20} />
        <span>ปฏิทินการเรียน</span>
      </HeaderButton>
      {calendarOpen && <StudyCalendar onClose={() => setCalendarOpen(false)} />}
    </header>
  )
}
