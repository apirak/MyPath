import { useState } from 'react'
import { MyPath, type StudentPlan } from '@learn/mypath'
// Option A: needed for verify:package against dist (in dev it duplicates
// the import index.ts already does).
import '@learn/mypath/style.css'
import BottomNav from '../components/BottomNav'
import ProgressTestPanel from '../dev/ProgressTestPanel'
import { TODAY, mypathData } from '../fixtures'

const SHOP_URL = 'https://shoponline.ondemand.in.th'

// Host tab 3: full-screen .mypath-layout. The SDK fills the remaining space;
// the tab bar belongs to the host.
export default function MyPathTab() {
  // Controlled: the SDK emits a new plan, the host stores and passes it back.
  const [plan, setPlan] = useState<StudentPlan>(mypathData.plan)
  // Editable from the test panel.
  const [progress, setProgress] = useState(mypathData.progress)
  const [today, setToday] = useState(TODAY)
  const data = { ...mypathData, plan, progress }
  return (
    <div className="mypath-layout">
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
      <ProgressTestPanel
        data={data}
        today={today}
        onProgressChange={setProgress}
        onTodayChange={setToday}
        onReset={() => {
          setProgress(mypathData.progress)
          setToday(TODAY)
        }}
      />
    </div>
  )
}
