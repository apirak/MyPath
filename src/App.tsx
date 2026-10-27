import { Routes, Route, Outlet } from 'react-router-dom'
import Home from './pages/Home'
import Courses from './pages/Courses'
import MyPath from './pages/MyPath'
import Profile from './pages/Profile'
import MyPathAllTimeline from './pages/MyPathAllTimeline'
import BottomNav from './components/BottomNav'

// Tab bar อยู่นอกหน้า My Path — หน้าในแท็บนี้จะถูกย้ายไปวางในแอปจริงที่มี tab bar ของตัวเอง
function MyPathLayout() {
  return <div className="mypath-layout"><Outlet /><BottomNav active="mypath" /></div>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/mypath" element={<MyPathLayout />}>
        <Route index element={<MyPath />} />
        <Route path="all" element={<MyPathAllTimeline />} />
      </Route>
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}
