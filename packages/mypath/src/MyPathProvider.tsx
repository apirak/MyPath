import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { MyPathData, MyPathProps } from './types'
import { buildPlan, type Plan } from './plan/buildPlan'
import { isISODate, thaiToday } from './plan/dates'
import { withCourse } from './plan/timeline'

// แผนที่คิดแล้วของ <MyPath> แต่ละตัว — ไม่มี state ระดับ module
// จึงวางหลายตัวพร้อมกันได้โดยไม่ปนกัน
const PlanContext = createContext<{
  plan: Plan
  data: MyPathData
  onPlanChange: MyPathProps['onPlanChange']
  onStartCourse: MyPathProps['onStartCourse']
} | null>(null)

// shortcut: ไม่ส่ง today = อ่านนาฬิกาตอน render เท่านั้น ยังไม่คิดวันใหม่ตอน
// visibilitychange/เที่ยงคืน — เพิ่มเมื่อ host จริงไม่ส่ง today
export function MyPathProvider({
  data,
  today,
  onPlanChange,
  onStartCourse,
  children,
}: Pick<MyPathProps, 'data' | 'today' | 'onPlanChange' | 'onStartCourse'> & {
  children: ReactNode
}) {
  const day = isISODate(today) ? today : thaiToday() // today ผิดรูป = ไม่ได้ส่ง
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

// ปุ่ม "เริ่มเรียน" ทุกจุด (หน้ารายละเอียด, แถบความคืบหน้า) —
// คอร์สที่ยังเลื่อนตามวันนี้/เล่มก่อน (ไม่มีวันเริ่มต้น
// หรือวันผิดรูปที่แผนไม่สนใจ)
// ตรึงวันเริ่มที่คิดได้ตอนนี้ก่อน (docs/mypath-sdk-plan.md "เริ่มเรียน"
// ตรึงวันเริ่ม)
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
