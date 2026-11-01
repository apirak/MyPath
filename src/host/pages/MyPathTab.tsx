import { useState } from 'react'
import { MyPath, type StudentPlan } from '@learn/mypath'
import BottomNav from '../components/BottomNav'
import { TODAY, mypathData } from '../fixtures'

const SHOP_URL = 'https://shoponline.ondemand.in.th'

// แท็บ 3 ของ host: โครงเดียวกับ MyPathLayout ของ prototype — SDK เติมช่องที่เหลือ, tab bar เป็นของ host
export default function MyPathTab() {
  const [plan, setPlan] = useState<StudentPlan>(mypathData.plan) // controlled: SDK ส่งแผนใหม่ host เก็บแล้วส่งกลับ
  return <div className="mypath-layout">
    <div style={{ flex: 1, minHeight: 0 }}>
      <MyPath
        data={{ ...mypathData, plan }}
        today={TODAY}
        onPlanChange={setPlan}
        onBuyCourse={() => window.open(SHOP_URL, '_blank', 'noopener')}
        onStartCourse={courseId => console.info('start course', courseId)}
      />
    </div>
    <BottomNav active="mypath" />
  </div>
}
