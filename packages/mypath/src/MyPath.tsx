import { useState } from 'react'
import type { MyPathProps, MyPathView } from './types'
import { MyPathProvider } from './MyPathProvider'
import AllView from './ui/AllView'
import CourseDetail, { OpenCourseContext } from './ui/CourseDetail'
import MonthView from './ui/MonthView'

// host ให้กล่องที่มีความสูงแน่นอน — .mypath-root เติมเต็มกล่อง header นิ่ง scroll อยู่ใน .mp-scroll
// Month/All, เดือนที่เลือก และคอร์สที่เปิดอยู่เป็น state ภายใน (ไม่ใช้ router) — เดือนอยู่ที่นี่จึงไม่หายตอนสลับไป All
export default function MyPath({ data, today, onPlanChange, onBuyCourse, onStartCourse }: MyPathProps) {
  const [mode, setMode] = useState<MyPathView['mode']>('month')
  const [month, setMonth] = useState<string>() // ไม่มี = เดือนของวันนี้
  const [course, setCourse] = useState<string>() // หน้ารายละเอียดคอร์สที่เปิดอยู่
  const [slide, setSlide] = useState(false)
  // เปลี่ยนโหมดแล้วหน้ารายละเอียดคอร์สปิด (View state และ deep link)
  const onModeChange = (next: MyPathView['mode']) => { setMode(next); setSlide(true); setCourse(undefined) }
  return <MyPathProvider data={data} today={today} onPlanChange={onPlanChange}>
    <OpenCourseContext.Provider value={setCourse}>
      <div className="mypath-root">{mode === 'month'
        ? <MonthView selected={month} onSelect={setMonth} onModeChange={onModeChange} slide={slide} />
        : <AllView onModeChange={onModeChange} slide={slide} />}
        {/* key: เปิดคอร์สใหม่ = เริ่ม animation เปิดใหม่ */}
        {course && <CourseDetail key={course} courseId={course} onClose={() => setCourse(undefined)} onBuyCourse={onBuyCourse} onStartCourse={onStartCourse} />}
      </div>
    </OpenCourseContext.Provider>
  </MyPathProvider>
}
