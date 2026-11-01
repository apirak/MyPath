import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { MyPathData, MyPathProps } from './types'
import { buildPlan, type Plan } from './plan/buildPlan'
import { isISODate, thaiToday } from './plan/dates'

// แผนที่คิดแล้วของ <MyPath> แต่ละตัว — ไม่มี state ระดับ module จึงวางหลายตัวพร้อมกันได้โดยไม่ปนกัน
const PlanContext = createContext<{ plan: Plan; data: MyPathData; onPlanChange: MyPathProps['onPlanChange'] } | null>(null)

// shortcut: ไม่ส่ง today = อ่านนาฬิกาตอน render เท่านั้น ยังไม่คิดวันใหม่ตอน visibilitychange/เที่ยงคืน — เพิ่มเมื่อ host จริงไม่ส่ง today
export function MyPathProvider({ data, today, onPlanChange, children }: Pick<MyPathProps, 'data' | 'today' | 'onPlanChange'> & { children: ReactNode }) {
  const day = isISODate(today) ? today : thaiToday() // today ผิดรูป = ไม่ได้ส่ง
  const { catalog, plan: studentPlan, events } = data
  const plan = useMemo(() => buildPlan({ catalog, plan: studentPlan, events, today: day }), [catalog, studentPlan, events, day])
  return <PlanContext.Provider value={{ plan, data, onPlanChange }}>{children}</PlanContext.Provider>
}

export function usePlan() {
  const value = useContext(PlanContext)
  if (!value) throw new Error('usePlan() ต้องอยู่ใต้ <MyPathProvider>')
  return value
}
