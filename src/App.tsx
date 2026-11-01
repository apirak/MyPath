import { Routes, Route } from 'react-router-dom'
import Home from './host/pages/Home'
import Courses from './host/pages/Courses'
import Profile from './host/pages/Profile'
import MyPathTab from './host/pages/MyPathTab'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/mypath" element={<MyPathTab />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}
