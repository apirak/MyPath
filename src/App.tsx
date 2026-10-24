import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Courses from './pages/Courses'
import MyPath from './pages/MyPath'
import Profile from './pages/Profile'
import MyPathYear from './pages/MyPathYear'
// PROTOTYPE (throwaway) — หน้ารายละเอียดคอร์ส สลับ variants ด้วย ?variant=A|B|C
import { CourseDetailPage } from './mypath/CourseDetailPrototype'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/mypath" element={<MyPath />} />
      <Route path="/mypath/year" element={<MyPathYear />} />
      <Route path="/mypath/year-prototype" element={<MyPathYear />} />
      <Route path="/mypath/course/:id" element={<CourseDetailPage />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}
