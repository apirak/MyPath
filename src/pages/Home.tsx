import headerIllustration from '../assets/home/header-illustration.svg'
import { ArrowRight, Bell, ChevronLeft, ChevronRight, Coins, Hand, MessageCircle, Repeat2, ShoppingBag, Video } from 'lucide-react'
import physicsOne from '../assets/home/physics-3.png'
import physicsTwo from '../assets/home/physics-1.png'
import physicsThree from '../assets/home/physics-2.png'
import physicsFour from '../assets/home/physics-4.png'
import BottomNav from '../components/BottomNav'
import HeaderButton from '../components/HeaderButton'

const courses = [
  ['V-Series Physics TCAS เล่ม 1: กลุ่มกลศาสตร์ 1', physicsOne, '1', '75%'],
  ['V-Series Physics TCAS เล่ม 2: กลุ่มกลศาสตร์ 2', physicsTwo, '2', '75%'],
  ['V-Series Physics TCAS เล่ม 3: กลุ่มกลศาสตร์ 3', physicsThree, '3', '50%'],
  ['V-Series Physics TCAS เล่ม 4: กลุ่มสมบัติสาร', physicsFour, '4', '25%'],
]

function CourseCard({ course }: { course: string[] }) {
  const [title, image, , progress] = course
  return <article className="course-card"><img className="course-image" src={image} alt="" /><div className="course-copy"><span className="learn-tag"><Video size={14} /> เรียน</span><h3>{title}</h3><p>หมดอายุ 30 พ.ย. 69 | 23:59 น.</p><p>ดูได้อีก 20 ชั่วโมง 31 นาที</p><div className="progress-row"><span><i style={{ width: progress }} /></span><b>{progress}</b></div></div></article>
}

function WeeklyHours() {
  return <section className="weekly-card" aria-label="ชั่วโมงเรียนสัปดาห์นี้"><div className="weekly-title"><div><h3>ชั่วโมงเรียนสัปดาห์นี้</h3><p>18 พ.ค. - 24 พ.ค.</p></div><strong>0 <small>/ 26:00 ชม.</small></strong></div><div className="chart">{['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'].map((day, index) => <div className="chart-day" key={day + index}><span>{Array.from({ length: 10 }).map((_, hour) => <i className={hour === 7 ? 'planned' : ''} key={hour} />)}</span><b className={index === 4 ? 'today' : ''}>{day}</b></div>)}</div></section>
}

export default function Home() {
  return <main className="home-page"><header className="home-header"><img src={headerIllustration} alt="" className="header-art" /><div className="header-actions"><HeaderButton className="header-button--plain"><Coins size={18} /> 100</HeaderButton><HeaderButton className="header-button--plain"><ShoppingBag size={18} /> 1</HeaderButton><HeaderButton className="header-button--plain" aria-label="Notifications"><Bell size={20} /></HeaderButton></div><p className="greeting"><Hand size={18} /> วันนี้มาอยู่กับให้เต็มที่นะ</p></header><div className="home-body"><section className="latest"><div className="section-heading"><h1>คอร์สเรียนล่าสุด</h1><div className="desktop-only"><HeaderButton><ChevronLeft size={20} /></HeaderButton><HeaderButton><ChevronRight size={20} /></HeaderButton></div></div><div className="course-strip">{courses.map((course) => <CourseCard key={course[2]} course={course} />)}</div></section><section className="extensions"><h2>ส่วนเสริม</h2><div className="extension-links"><HeaderButton><MessageCircle size={20} /> <b>Clear คำถามกับทีมวิชาการ</b><span><ArrowRight size={20} /></span></HeaderButton><HeaderButton><Repeat2 size={20} /> <b>Guided Practice</b><em>1</em><span><ArrowRight size={20} /></span></HeaderButton></div><WeeklyHours /></section></div><BottomNav active="home" /></main>
}
