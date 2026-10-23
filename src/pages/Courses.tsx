import { useState, type ComponentType } from 'react'
import { ArrowDownUp, BookOpen, CalendarDays, Check, CheckCircle2, ChevronUp, CircleUserRound, FileText, House, Lock, Search, Video, Wrench } from 'lucide-react'
import physicsOne from '../assets/home/physics-3.png'
import physicsTwo from '../assets/home/physics-1.png'
import physicsThree from '../assets/home/physics-2.png'
import physicsFour from '../assets/home/physics-4.png'

const cards = [
  ['V-Series Physics TCAS เล่ม 2: กลุ่มกลศาสตร์ 2', physicsTwo, '50%', 'เรียน'],
  ['V-Series Physics TCAS เล่ม 3: กลุ่มกลศาสตร์ 3', physicsThree, '75%', 'เรียน'],
  ['V-Series Physics TCAS เล่ม 4: กลุ่มสมบัติสาร', physicsFour, '25%', 'เรียน'],
  ['V-Series Physics TCAS เล่ม 1: กลุ่มกลศาสตร์ 1', physicsOne, '50%', 'ฝึกฝน'],
  ['V-Series Physics TCAS เล่ม 2: กลุ่มกลศาสตร์ 2', physicsTwo, '75%', 'ฝึกฝน'],
  ['V-Series Physics TCAS เล่ม 2: กลุ่มกลศาสตร์ 2', physicsTwo, '100%', 'E-Book'],
  ['V-Series Physics TCAS เล่ม 3: กลุ่มกลศาสตร์ 3', physicsThree, '0%', 'E-Book'],
  ['V-Series Physics TCAS เล่ม 4: กลุ่มสมบัติสาร', physicsFour, '100%', 'E-Book'],
  ['V-Series Physics TCAS เล่ม 1: กลุ่มกลศาสตร์ 1', physicsOne, '100%', 'เรียน'],
  ['V-Series Physics TCAS เล่ม 1: กลุ่มกลศาสตร์ 1', physicsOne, '100%', 'E-Book'],
]

const navItems: [string, ComponentType<{ size?: number }>, string][] = [['หน้าแรก', House, '/'], ['คอร์ส', BookOpen, '/courses'], ['แผนเรียน', CalendarDays, '/mypath'], ['โปรไฟล์', CircleUserRound, '/profile']]

function CourseCard({ card, index }: { card: string[]; index: number }) {
  const [title, image, progress, type] = card
  const done = progress === '100%'
  const expired = index > 7
  const TypeIcon = type === 'ฝึกฝน' ? Wrench : type === 'E-Book' ? FileText : Video
  return <article className={`library-card ${expired ? 'expired' : ''}`}><div className="library-image"><img src={image} alt="" />{expired && <span className="lock"><Lock size={28} /></span>}</div><div className="library-copy"><span className={`course-type ${type === 'ฝึกฝน' ? 'practice' : type === 'E-Book' ? 'ebook' : ''}`}><TypeIcon size={14} /> {type}</span><h3>{title}</h3><p className={expired ? 'expired-text' : ''}>{expired ? 'หมดอายุแล้ว' : 'หมดอายุ 30 พ.ย. 69 | 23:59 น.'}</p><p>ดูได้อีก 20 ชั่วโมง 31 นาที</p><div className="library-progress"><span><i className={done ? 'done' : ''} style={{ width: progress }} /></span><b>{done ? <><CheckCircle2 size={14} /> จบแล้ว</> : progress}</b></div></div></article>
}

function SubjectGroup({ title, cardsStart, count }: { title: string; cardsStart: number; count: number }) {
  return <section className="subject-group"><button className="subject-heading"><b>{title}</b><span><ChevronUp size={20} /></span></button><div className="library-grid">{Array.from({ length: count }, (_, i) => <CourseCard key={i} card={cards[(cardsStart + i) % cards.length]} index={cardsStart + i} />)}</div></section>
}

export default function Courses() {
  const [sortOpen, setSortOpen] = useState(false)
  return <main className="courses-page"><header className="courses-header"><div className="courses-header-inner"><h1>คอร์ส <small>(21)</small></h1><div className="course-tools"><div className="search-box"><Search size={20} /><span>ค้นหา</span></div><button className="sort-chip" onClick={() => setSortOpen((open) => !open)} aria-expanded={sortOpen}><ArrowDownUp size={20} />เรียง</button></div></div></header><nav className="course-tabs"><a className="active">ทั้งหมด</a><a>ฟิสิกส์</a><a>คณิต</a><a>อังกฤษ</a></nav><div className="course-body"><div className="status-filters">{['เรียน (8)', 'ฝึกฝน (5)', 'E-Book (8)', 'ยังไม่เริ่ม (9)', 'กำลังเรียน (3)', 'จบแล้ว (6)', 'หมดอายุ (2)'].map((item, i) => <button key={item}>{i === 0 ? <Video size={14} /> : i === 1 ? <Wrench size={14} /> : i === 2 ? <FileText size={14} /> : null}{item}</button>)}</div><div className={`sort-menu${sortOpen ? ' open' : ''}`}>{['ชื่อคอร์ส (A→Z, ก→ฮ)', 'ชื่อคอร์ส (Z→A, ฮ→ก)', 'วันที่ซื้อคอร์ส (ใหม่→เก่า)', 'วันที่ซื้อคอร์ส (เก่า→ใหม่)', 'ความคืบหน้า (มาก→น้อย)', 'ความคืบหน้า (น้อย→มาก)'].map((item, i) => <div className={i === 0 ? 'selected' : ''} key={item}>{item}{i === 0 && <Check size={16} />}</div>)}</div><SubjectGroup title="ฟิสิกส์ (14)" cardsStart={0} count={10} /><SubjectGroup title="คณิตศาสตร์ (6)" cardsStart={2} count={5} /><SubjectGroup title="ภาษาอังกฤษ (1)" cardsStart={3} count={1} /></div><nav className="bottom-nav">{navItems.map(([label, Icon, href], index) => <a className={index === 1 ? 'active' : ''} href={href} key={label}><Icon size={24} /><span>{label}</span></a>)}</nav></main>
}
