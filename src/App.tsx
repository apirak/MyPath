import { Routes, Route, Outlet } from 'react-router-dom'
import Home from './host/pages/Home'
import Courses from './host/pages/Courses'
import Profile from './host/pages/Profile'
import MyPathTab from './host/pages/MyPathTab'
import MyPath from './prototype/pages/MyPath'
import MyPathAllTimeline from './prototype/pages/MyPathAllTimeline'
import BottomNav from './prototype/components/BottomNav'

// Tab bar อยู่นอกหน้า My Path — หน้าในแท็บนี้จะถูกย้ายไปวางในแอปจริงที่มี tab bar ของตัวเอง
function MyPathLayout() {
  return <div className="mypath-layout"><Outlet /><BottomNav active="mypath" /></div>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/mypath" element={<MyPathTab />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/prototype/mypath" element={<MyPathLayout />}>
        <Route index element={<MyPath />} />
        <Route path="all" element={<MyPathAllTimeline />} />
      </Route>
    </Routes>
  )
}
