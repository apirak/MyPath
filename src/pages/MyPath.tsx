import type { CSSProperties } from 'react'
import mathCover from '../assets/home/physics-1.png'
import physicsCover from '../assets/home/physics-3.png'
import chemistryCover from '../assets/home/physics-2.png'
import PathHeader from '../components/PathHeader'
import BottomNav from '../components/BottomNav'

// Monthly My Path: agenda ดีไซน์ที่เจ้าของเลือกแล้ว (เดิมคือ variant C ในบรรดา A/B/C)
type Course = { subject: string; name: string; type: string; hours: string; start: string; end: string; color: string; cover: string }

const courses: Course[] = [
  { subject: 'คณิต 1', name: 'Applied Math Admissions TCAS เล่ม 1 (For Dek70)', type: 'เรียน (ติวเข้ม)', hours: '24 ชม.', start: '01 ม.ค. 69', end: '14 ก.พ. 69', color: '#0078c4', cover: mathCover },
  { subject: 'ฟิสิกส์', name: 'ปรับพื้นฐานฟิสิกส์ TCAS', type: 'เรียน (ติวเข้ม)', hours: '18 ชม.', start: '01 ม.ค. 69', end: '31 ม.ค. 69', color: '#d72630', cover: physicsCover },
  { subject: 'เคมี', name: 'เคมี TCAS: กลุ่มอะตอมและตารางธาตุ', type: 'เรียน (ติวเข้ม)', hours: '20 ชม.', start: '15 ม.ค. 69', end: '28 ก.พ. 69', color: '#f5bd3d', cover: chemistryCover },
]

function CourseCard({ course, compact = false }: { course: Course; compact?: boolean }) {
  return <article className={`monthly-course${compact ? ' compact' : ''}`} style={{ '--subject': course.color } as CSSProperties}>
    <div className="monthly-course-body"><img src={course.cover} alt="" /><div><div className="monthly-course-top"><b>{course.subject}</b><span>{course.type}</span></div><strong>{course.name}</strong><small>{course.hours} · {course.start} – {course.end}</small></div></div>
  </article>
}

function PageHeader() {
  return <PathHeader active="month" period="มกราคม 2569" />
}

function Agenda() {
  return <section className="monthly-agenda"><div className="today-callout"><span>วันนี้</span><h2>เริ่ม 2 คอร์สได้เลย</h2><p>เลือกวิชาที่สำคัญที่สุดก่อน แล้วค่อยเดินตามแผน</p></div><div className="agenda-now">{courses.slice(0, 2).map(course => <CourseCard course={course} key={course.name} compact />)}</div><div className="next-course"><div><span>ถัดไป</span><h2>15 มกราคม</h2></div><CourseCard course={courses[2]} /></div></section>
}

export default function MyPath() {
  return <main className="monthly-prototype"><div className="monthly-shell"><PageHeader /><Agenda /></div><BottomNav active="mypath" /></main>
}
