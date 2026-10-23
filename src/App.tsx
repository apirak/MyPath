import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Courses from './pages/Courses'
import MyPath from './pages/MyPath'
import Profile from './pages/Profile'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/mypath" element={<MyPath />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}
