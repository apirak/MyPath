import { useId } from 'react'
import { usePlan } from '../../MyPathProvider'
import { MS, fmtDate, isoOf } from '../../plan/dates'
import AxisRow from './AxisRow'
import { position, weeklyLoad, type Timeline } from './layout'

// Bar area height and baseline offset, in px.
const LOAD_PLOT = 34,
  LOAD_BASE = 1

// Weekly hours chart: scheduled course hours vs the calendar budget, with the
// overflow highlighted.
export default function WeeklyLoad({
  t,
  dayWidth,
}: {
  t: Timeline
  dayWidth: number
}) {
  const {
    plan: { scheduledHoursByDay },
    data: {
      plan: { calendar },
    },
  } = usePlan()
  // Unique per instance: several <MyPath> may share a page.
  const helpId = useId()
  const weeks = weeklyLoad(t, scheduledHoursByDay, calendar)
  const max = Math.max(...weeks.flatMap(week => [week.demand, week.plan]), 1),
    y = (hours: number) => (hours / max) * LOAD_PLOT
  return (
    <>
      <b className="mp-tp-label mp-tp-load-label mp-tp-week-label">
        ชั่วโมงเรียน/สัปดาห์
        <button
          type="button"
          className="mp-tp-help"
          popoverTarget={helpId}
          aria-label="วิธีอ่านกราฟชั่วโมงเรียนต่อสัปดาห์"
        >
          ?
        </button>
        <div id={helpId} className="mp-tp-help-pop" popover="auto">
          <b>วิธีอ่านกราฟนี้</b>
          <p>
            แต่ละแท่งคือจำนวนชั่วโมงเรียนรวมใน 1 สัปดาห์
            เทียบกับเวลาที่ลงไว้ในปฏิทินการเรียน
          </p>
          <ul>
            <li>
              <i className="ok" />
              เรียนตามแผน
            </li>
            <li>
              <i className="over" />
              ส่วนที่เรียนเกินแผน
            </li>
            <li>
              <i className="plan" />
              เวลาที่ลงไว้ในปฏิทินการเรียน
            </li>
          </ul>
          <p>ชี้ที่แท่งเพื่อดูจำนวนชั่วโมงของสัปดาห์นั้น</p>
        </div>
      </b>
      <AxisRow t={t} dayWidth={dayWidth} className="mp-tp-load">
        {weeks.map(week => {
          const left = Math.max(0, position(isoOf(week.start), t)),
            right = Math.min(100, position(isoOf(week.end), t)),
            over = week.demand - week.plan
          return (
            <span
              key={week.start}
              className="mp-tp-week"
              title={
                `${fmtDate(isoOf(week.start))} – ` +
                `${fmtDate(isoOf(week.end - MS))}` +
                ` · ลงไว้ ${week.plan.toFixed(1)} ชม.` +
                ` · เรียนจริง ${week.demand.toFixed(1)} ชม.` +
                (over > 0 ? ` · เกิน ${over.toFixed(1)} ชม.` : '')
              }
              style={{
                left: `${left}%`,
                width: `${Math.max(0.1, right - left)}%`,
              }}
            >
              <b
                className="mp-tp-bar"
                style={{
                  bottom: LOAD_BASE,
                  height: Math.max(3, y(week.demand)),
                }}
              >
                {over > 0 && <i className="over" style={{ height: y(over) }} />}
                <i className="ok" />
              </b>
              <i
                className="mp-tp-plan"
                style={{ bottom: LOAD_BASE + y(week.plan) }}
              />
            </span>
          )
        })}
      </AxisRow>
    </>
  )
}
