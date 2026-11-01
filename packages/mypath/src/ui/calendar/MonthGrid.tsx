import { addDays } from '../../plan/dates'
import type { EditorProps } from './StudyCalendar'

const days = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']

// shortcut: fixed to Dec 2026 like the prototype (not today's month); add
// month paging once #13 reaches prototype parity.
export default function MonthGrid({
  selected,
  settings,
  onSelect,
}: Omit<EditorProps, 'setSettings'>) {
  const start = '2026-11-30'
  return (
    <div className="mp-scp-calendar" aria-label="ปฏิทินเดือนธันวาคม 2569">
      <header>
        <b>ธันวาคม 2569</b>
        <span>เลือกวันเพื่อปรับเวลา</span>
      </header>
      <div className="mp-scp-weekdays">
        {days.map(day => (
          <i key={day}>{day}</i>
        ))}
      </div>
      <div className="mp-scp-dates">
        {Array.from({ length: 35 }, (_, index) => {
          const date = addDays(start, index),
            inMonth = date.slice(5, 7) === '12',
            special = settings.specialDays.find(day => day.date === date),
            schoolBreak = settings.breaks.some(
              period => period.start <= date && date <= period.end,
            )
          return (
            <button
              type="button"
              key={date}
              className={
                (inMonth ? '' : 'outside ') +
                (date === selected ? 'selected ' : '') +
                (special ? 'special ' : '') +
                (schoolBreak ? 'break ' : '')
              }
              onClick={() => onSelect(date)}
            >
              {Number(date.slice(-2))}
              {special && (
                <small className={special.hours > 9 ? 'two-digits' : ''}>
                  {special.hours}
                </small>
              )}
            </button>
          )
        })}
      </div>
      <p>
        <i className="special" /> วันพิเศษ <i className="break" /> ช่วงปิดเทอม
      </p>
    </div>
  )
}
