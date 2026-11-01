import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { MyPathData, MyPathProps } from './types'
import { buildPlan, type Plan } from './plan/buildPlan'
import { isISODate, thaiToday } from './plan/dates'
import { withCourse } from './plan/timeline'

// Computed plan per <MyPath> instance. No module-level state, so several
// instances can be mounted at once without leaking into each other.
const PlanContext = createContext<{
  plan: Plan
  data: MyPathData
  onPlanChange: MyPathProps['onPlanChange']
  onStartCourse: MyPathProps['onStartCourse']
} | null>(null)

// shortcut: without a today prop the clock is read only on render, so Today
// does not roll over at midnight or on visibilitychange; add that once a real
// host omits today.
export function MyPathProvider({
  data,
  today,
  onPlanChange,
  onStartCourse,
  children,
}: Pick<MyPathProps, 'data' | 'today' | 'onPlanChange' | 'onStartCourse'> & {
  children: ReactNode
}) {
  const day = isISODate(today) ? today : thaiToday() // malformed = not sent
  const { catalog, plan: studentPlan, events } = data
  const plan = useMemo(
    () => buildPlan({ catalog, plan: studentPlan, events, today: day }),
    [catalog, studentPlan, events, day],
  )
  return (
    <PlanContext.Provider value={{ plan, data, onPlanChange, onStartCourse }}>
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() {
  const value = useContext(PlanContext)
  if (!value) throw new Error('usePlan() ต้องอยู่ใต้ <MyPathProvider>')
  return value
}

// Every "start learning" button (course detail, progress bar) goes through
// here. A course whose start still floats with Today or the previous volume
// (no valid start date) gets its current computed start pinned first, so it
// stops moving once the student begins (docs/mypath-sdk-plan.md, section on
// starting a course pinning the start date).
export function useStartCourse() {
  const { plan, data, onPlanChange, onStartCourse } = usePlan()
  return (courseId: string) => {
    const course = plan.subjects
      .flatMap(s => s.courses)
      .find(c => c.id === courseId)
    if (course && !isISODate(course.startDate) && !course.followPrevious)
      onPlanChange(withCourse(data.plan, courseId, { startDate: course.start }))
    onStartCourse(courseId)
  }
}
