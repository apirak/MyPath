import headerIllustration from '../assets/home/header-illustration.svg'
import type { ComponentType } from 'react'
import { ArrowRight, Bell, BookOpen, CalendarDays, ChevronLeft, ChevronRight, CircleUserRound, Coins, Hand, House, MessageCircle, Repeat2, ShoppingBag, Video } from 'lucide-react'
import physicsOne from '../assets/home/physics-3.png'
import physicsTwo from '../assets/home/physics-1.png'
import physicsThree from '../assets/home/physics-2.png'
import physicsFour from '../assets/home/physics-4.png'

const courses = [
  ['V-Series Physics TCAS เล่ม 1: กลุ่มกลศาสตร์ 1', physicsOne, '1', '75%'],
  ['V-Series Physics TCAS เล่ม 2: กลุ่มกลศาสตร์ 2', physicsTwo, '2', '75%'],
  ['V-Series Physics TCAS เล่ม 3: กลุ่มกลศาสตร์ 3', physicsThree, '3', '50%'],
  ['V-Series Physics TCAS เล่ม 4: กลุ่มสมบัติสาร', physicsFour, '4', '25%'],
]
const navItems: [string, ComponentType<{ size?: number }>, string][] = [['หน้าแรก', House, '/'], ['คอร์ส', BookOpen, '/courses'], ['แผนเรียน', CalendarDays, '/mypath'], ['โปรไฟล์', CircleUserRound, '/profile']]

function CourseCard({ course }: { course: string[] }) {
  const [title, image, , progress] = course
  return <article className="course-card"><img className="course-image" src={image} alt="" /><div className="course-copy"><span className="learn-tag"><Video size={14} /> เรียน</span><h3>{title}</h3><p>หมดอายุ 30 พ.ย. 69 | 23:59 น.</p><p>ดูได้อีก 20 ชั่วโมง 31 นาที</p><div className="progress-row"><span><i style={{ width: progress }} /></span><b>{progress}</b></div></div></article>
}

function WeeklyHours() {
  return <section className="weekly-card" aria-label="ชั่วโมงเรียนสัปดาห์นี้"><div className="weekly-title"><div><h3>ชั่วโมงเรียนสัปดาห์นี้</h3><p>18 พ.ค. - 24 พ.ค.</p></div><strong>0 <small>/ 26:00 ชม.</small></strong></div><div className="chart">{['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'].map((day, index) => <div className="chart-day" key={day + index}><span>{Array.from({ length: 10 }).map((_, hour) => <i className={hour === 7 ? 'planned' : ''} key={hour} />)}</span><b className={index === 4 ? 'today' : ''}>{day}</b></div>)}</div></section>
}

export default function Home() {
  return <main className="home-page"><header className="home-header"><img src={headerIllustration} alt="" className="header-art" /><div className="header-actions"><button><Coins size={18} /> 100</button><button><ShoppingBag size={18} /> 1</button><button aria-label="Notifications"><Bell size={20} /></button></div><p className="greeting"><Hand size={18} /> วันนี้มาอยู่กับให้เต็มที่นะ</p></header><div className="home-body"><section className="latest"><div className="section-heading"><h1>คอร์สเรียนล่าสุด</h1><div className="desktop-only"><button><ChevronLeft size={20} /></button><button><ChevronRight size={20} /></button></div></div><div className="course-strip">{courses.map((course) => <CourseCard key={course[2]} course={course} />)}</div></section><section className="extensions"><h2>ส่วนเสริม</h2><div className="extension-links"><button><MessageCircle size={20} /> <b>Clear คำถามกับทีมวิชาการ</b><span><ArrowRight size={20} /></span></button><button><Repeat2 size={20} /> <b>Guided Practice</b><em>1</em><span><ArrowRight size={20} /></span></button></div><WeeklyHours /></section></div><nav className="bottom-nav">{navItems.map(([label, Icon, href], index) => <a className={index === 0 ? 'active' : ''} href={href} key={label}><Icon size={24} /><span>{label}</span></a>)}</nav></main>
}
