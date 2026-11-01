import type { MyPathProps } from './types'
import { MyPathProvider } from './MyPathProvider'
import MonthView from './ui/MonthView'

// host ให้กล่องที่มีความสูงแน่นอน — .mypath-root เติมเต็มกล่อง header นิ่ง scroll อยู่ใน .mp-scroll
export default function MyPath({ data, today }: MyPathProps) {
  return <MyPathProvider data={data} today={today}>
    <div className="mypath-root"><MonthView /></div>
  </MyPathProvider>
}
