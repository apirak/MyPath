import { useState } from 'react'
import type { MyPathProps, MyPathView } from './types'
import { MyPathProvider } from './MyPathProvider'
import AllView from './ui/AllView'
import MonthView from './ui/MonthView'

// host ให้กล่องที่มีความสูงแน่นอน — .mypath-root เติมเต็มกล่อง header นิ่ง scroll อยู่ใน .mp-scroll
// Month/All และเดือนที่เลือกเป็น state ภายใน (ไม่ใช้ router) — เดือนอยู่ที่นี่จึงไม่หายตอนสลับไป All
export default function MyPath({ data, today, onPlanChange }: MyPathProps) {
  const [mode, setMode] = useState<MyPathView['mode']>('month')
  const [month, setMonth] = useState<string>() // ไม่มี = เดือนของวันนี้
  const [slide, setSlide] = useState(false)
  const onModeChange = (next: MyPathView['mode']) => { setMode(next); setSlide(true) }
  return <MyPathProvider data={data} today={today} onPlanChange={onPlanChange}>
    <div className="mypath-root">{mode === 'month'
      ? <MonthView selected={month} onSelect={setMonth} onModeChange={onModeChange} slide={slide} />
      : <AllView onModeChange={onModeChange} slide={slide} />}</div>
  </MyPathProvider>
}
