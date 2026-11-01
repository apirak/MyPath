import type { CSSProperties, ReactNode } from 'react'
import { monthColumns, type Timeline } from './layout'

function MonthBands({ t, dayWidth }: { t: Timeline; dayWidth: number }) {
  return (
    <div
      className="mp-tp-month-bands"
      aria-hidden="true"
      style={{ gridTemplateColumns: monthColumns(t, dayWidth) }}
    >
      {t.months.map((month, index) => (
        <i key={month.start} className={index % 2 ? 'alternate' : ''} />
      ))}
    </div>
  )
}

// One horizontal track of the timeline. Children are absolutely positioned
// by % of the axis (see layout.ts).
export default function AxisRow({
  children,
  t,
  dayWidth,
  className = '',
  style,
}: {
  children: ReactNode
  t: Timeline
  dayWidth: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={`mp-tp-axis ${className}`} style={style}>
      <MonthBands t={t} dayWidth={dayWidth} />
      {children}
    </div>
  )
}
