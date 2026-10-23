import { ArrowRight, BookOpen, CalendarDays, Check, CircleUserRound, House } from 'lucide-react'
import centerLand from '../assets/mypath/center-land.svg'
import cap from '../assets/mypath/cap.svg'

const navItems: [string, typeof House, string][] = [['หน้าแรก', House, '/'], ['คอร์ส', BookOpen, '/courses'], ['แผนเรียน', CalendarDays, '/mypath'], ['โปรไฟล์', CircleUserRound, '/profile']]
const days = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']

function WeeklyHours() {
  return <section className="mypath-weekly"><div className="mypath-weekly-head"><div><h2>ชั่วโมงเรียนสัปดาห์นี้</h2><p>18 พ.ค. - 24 พ.ค.</p></div><strong>10 <small>ชม.</small></strong></div><div className="mypath-chart">{days.map((day, index) => <div className="mypath-day" key={day}><div className="mypath-bar">{Array.from({ length: 10 }, (_, hour) => <i className={hour === 8 && index < 5 ? 'red' : hour === 9 && index < 5 ? 'blue' : ''} key={hour} />)}</div><b className={index === 4 ? 'today' : ''}>{day}</b></div>)}</div><div className="chart-legend"><span><i />คณิต</span><span><i />ฟิสิกส์</span></div></section>
}

export default function MyPath() {
  return <main className="mypath-page"><section className="mypath-hero"><div className="hero-stars">✦　　✧　　　　　　　　　✦　　　✧</div><h1>วางแผนการเรียนด้วย MyPath</h1><p>เครื่องมือช่วยวางแผนการเรียนที่เหมาะสมกับตัวน้อง</p><button className="mypath-cta"><span className="desktop-cta">วางแผนการเรียน <ArrowRight size={22} /></span><span className="mobile-cta">ใช้ Tablet / Desktop เพื่อวางแผน</span><img src={cap} alt="" /></button><img className="mypath-land" src={centerLand} alt="" /></section><div className="mypath-body"><h2>MyPath คืออะไร</h2><section className="mypath-about"><p><Check size={16} />แนะนำวิชาและคอร์สเรียนที่เหมาะสมกับเป้าหมายที่ตั้งไว้</p><p><Check size={16} />ปรับแต่งเวลาการเรียนให้เหมาะกับไลฟ์สไตล์</p><p><Check size={16} />คำนวณเวลาในแต่ละเทอมให้น้อง ๆ วางแผนและเรียนได้ทันเวลา</p></section><WeeklyHours /></div><nav className="bottom-nav">{navItems.map(([label, Icon, href], index) => <a className={index === 2 ? 'active' : ''} href={href} key={label}><Icon size={24} /><span>{label}</span></a>)}</nav></main>
}
