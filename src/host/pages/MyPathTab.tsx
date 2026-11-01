import { useState } from 'react'
import { MyPath, type StudentPlan } from '@learn/mypath'
import BottomNav from '../components/BottomNav'
import ProgressTestPanel from '../dev/ProgressTestPanel'
import { TODAY, mypathData } from '../fixtures'

const SHOP_URL = 'https://shoponline.ondemand.in.th'

// แท็บ 3 ของ host: .mypath-layout เต็มจอ — SDK เติมช่องที่เหลือ, tab bar เป็นของ host
export default function MyPathTab() {
  const [plan, setPlan] = useState<StudentPlan>(mypathData.plan) // controlled: SDK ส่งแผนใหม่ host เก็บแล้วส่งกลับ
  const [progress, setProgress] = useState(mypathData.progress) // แผงทดสอบแก้ได้
  const [today, setToday] = useState(TODAY)
  const data = { ...mypathData, plan, progress }
  return <div className="mypath-layout">
    <div style={{ flex: 1, minHeight: 0 }}>
      <MyPath
        data={data}
        today={today}
        onPlanChange={setPlan}
        onBuyCourse={() => window.open(SHOP_URL, '_blank', 'noopener')}
        onStartCourse={courseId => console.info('start course', courseId)}
      />
    </div>
    <BottomNav active="mypath" />
    <ProgressTestPanel data={data} today={today} onProgressChange={setProgress} onTodayChange={setToday}
      onReset={() => { setProgress(mypathData.progress); setToday(TODAY) }} />
  </div>
}
