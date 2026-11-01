import { useState } from 'react'
import type { StudentPlan } from '../../types'
import { MyPathProvider, usePlan } from '../../MyPathProvider'
import type { Axis } from '../../plan/buildPlan'
import { MS, u } from '../../plan/dates'
import { snapToMonday, withCourseStartDate } from '../../plan/timeline'
import PathHeader, { type ModeProps } from '../header/PathHeader'
import PlanEmptyState from '../components/PlanEmptyState'
import type { DragStart } from './SubjectRow'
import Timeline from './Timeline'

// The whole plan on one axis. Opens scrolled to today; scroll position is not
// kept across Month/All switches.
export default function AllView(mode: ModeProps) {
  const { plan, data, onPlanChange, onStartCourse } = usePlan()
  // While dragging: a draft plan (UI state only) and the axis frozen at drag
  // start, so columns don't shift under the pointer. Cleared on release.
  const [drag, setDrag] = useState<{ axis: Axis; plan: StudentPlan } | null>(
    null,
  )
  const axis = drag?.axis ?? plan.axis

  // Drag a course's grip to move its start date, snapped to Mondays.
  // onPlanChange fires once on release (ADR-0003); after that the screen shows
  // only what the host sends back.
  const dragStart: DragStart = (event, course) => {
    event.stopPropagation()
    // Capture on the subject row, not the grip: a bar dragged off-axis
    // unmounts along with its grip and pointerup would never arrive.
    const row = event.currentTarget.closest<HTMLElement>('.mp-tp-axis')!,
      startX = event.clientX,
      base = course.start,
      start = { axis, plan: data.plan }
    const pxPerDay = row.getBoundingClientRect().width / axis.totalDays
    let last = base,
      draft = start.plan
    row.setPointerCapture(event.pointerId)
    setDrag(start)
    row.onpointermove = move => {
      const next = snapToMonday(
        u(base) + ((move.clientX - startX) / pxPerDay) * MS,
      )
      if (next !== last) {
        last = next
        draft = withCourseStartDate(start.plan, course.id, next)
        setDrag({ ...start, plan: draft })
      }
    }
    // pointercancel (browser/OS aborted the gesture) discards the draft.
    const end = (commit: boolean) => {
      row.onpointermove = row.onpointerup = row.onpointercancel = null
      setDrag(null)
      if (commit && draft !== start.plan) onPlanChange(draft)
    }
    row.onpointerup = () => end(true)
    row.onpointercancel = () => end(false)
  }

  const header = (
    <PathHeader
      mode="all"
      {...mode}
      period={axis.label}
      showNavigation={false}
    />
  )
  if (plan.subjects.length === 0)
    return (
      <>
        {header}
        <div className="mp-scroll">
          <PlanEmptyState />
        </div>
      </>
    )
  // The nested provider is always mounted: remounting at drag start would
  // drop the grip's pointer capture. Every row, the mobile list and the load
  // chart then read the draft plan for free.
  return (
    <>
      {header}
      <MyPathProvider
        data={drag ? { ...data, plan: drag.plan } : data}
        today={plan.today}
        onPlanChange={onPlanChange}
        onStartCourse={onStartCourse}
      >
        <Timeline axis={axis} onDragStart={dragStart} />
      </MyPathProvider>
    </>
  )
}
