import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import type { Axis } from '../../plan/buildPlan'
import { usePlan } from '../../MyPathProvider'
import Grass from '../design/Grass'
import Sky from '../design/Sky'
import AxisRow from './AxisRow'
import EventRow from './EventRow'
import MobileTimeline from './MobileTimeline'
import SubjectRow, { type DragStart } from './SubjectRow'
import WeeklyLoad from './WeeklyLoad'
import {
  MONTH_DAY_WIDTH,
  inMonth,
  monthColumns,
  position,
  timelineOf,
  type Timeline as TimelineData,
} from './layout'

// Width of the sticky subject-label column, in px. Must match the CSS grid.
const LABEL_WIDTH = 176

function MonthHeader({ t, today }: { t: TimelineData; today: string }) {
  return (
    <>
      <b className="mp-tp-label mp-tp-month-label">แผนการเรียน</b>
      {t.months.map(month => (
        <span
          key={month.start}
          className={`mp-tp-month ${inMonth(today, month) ? 'now' : ''}`}
        >
          {month.label}
        </span>
      ))}
    </>
  )
}

// Opens on today: desktop centres today (the browser clamps at the edges),
// mobile puts the current month just under the subject header.
function useScrollToToday(t: TimelineData, today: string) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const page = ref.current,
      grid = page?.querySelector<HTMLElement>('.mp-tp-scroll')
    if (!page || !grid) return
    // The desktop grid has zero width when CSS hides it on mobile.
    if (grid.clientWidth) {
      const axis = grid.querySelector('.mp-tp-axis')!.getBoundingClientRect(),
        box = grid.getBoundingClientRect()
      const x =
        axis.left -
        box.left +
        grid.scrollLeft +
        (position(today, t) / 100) * axis.width
      grid.scrollLeft = x - (LABEL_WIDTH + grid.clientWidth) / 2
    } else {
      const now = page.querySelector('.mp-tp-mobile-month.now'),
        head = page.querySelector<HTMLElement>('.mp-tp-mobile-head')
      if (now && head)
        page.scrollTop +=
          now.getBoundingClientRect().top -
          page.getBoundingClientRect().top -
          head.offsetHeight
    }
    // Only on open; re-centring on every plan change would fight the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return ref
}

// Desktop grid and mobile list are both rendered; CSS shows one.
export default function Timeline({
  axis,
  onDragStart,
}: {
  axis: Axis
  onDragStart: DragStart
}) {
  const { plan } = usePlan()
  const t = timelineOf(axis)
  const scrollRef = useScrollToToday(t, plan.today)
  const columns = `${LABEL_WIDTH}px ${monthColumns(t)}`
  return (
    <div className="mp-scroll mp-tp-full" ref={scrollRef}>
      <div
        className="mp-tp-scroll"
        onScroll={e =>
          e.currentTarget.style.setProperty(
            '--sx',
            String(e.currentTarget.scrollLeft),
          )
        }
      >
        <div className="mp-tp-sky">
          <Sky />
          <section
            className="mp-tp-grid mp-tp-events-strip"
            style={{ gridTemplateColumns: columns }}
          >
            <EventRow t={t} dayWidth={MONTH_DAY_WIDTH} />
            <Grass />
          </section>
        </div>
        <section
          className="mp-tp-grid"
          style={
            {
              gridTemplateColumns: columns,
              '--rows': plan.subjects.length,
            } as CSSProperties
          }
        >
          <MonthHeader t={t} today={plan.today} />
          {plan.subjects.map(subject => (
            <SubjectRow
              key={subject.id}
              subject={subject}
              t={t}
              dayWidth={MONTH_DAY_WIDTH}
              onDragStart={onDragStart}
            />
          ))}
          <b className="mp-tp-label mp-tp-spacer" />
          <AxisRow t={t} dayWidth={MONTH_DAY_WIDTH} className="mp-tp-spacer">
            {null}
          </AxisRow>
          <WeeklyLoad t={t} dayWidth={MONTH_DAY_WIDTH} />
        </section>
      </div>
      <MobileTimeline t={t} />
    </div>
  )
}
