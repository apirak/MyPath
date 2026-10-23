import { useEffect, type CSSProperties } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// PROTOTYPE: Three yearly planning layouts, switchable via ?variant=A|B|C on /mypath/year-prototype.
const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
const subjects = [
  { name: 'TPAT3', color: '#a51d1d', courses: [[0, 2, 'ตะลุยโจทย์'], [8, 11, 'ทำข้อสอบ']] },
  { name: 'คณิต 1', color: '#0078c4', courses: [[0, 3, 'Applied Math Admissions TCAS เล่ม 1 (For Dek70)'], [4, 7, 'เล่ม 2'], [9, 11, 'ตะลุยโจทย์']] },
  { name: 'ฟิสิกส์', color: '#d72630', courses: [[1, 3, 'ปรับพื้นฐานฟิสิกส์ TCAS'], [4, 8, 'V-Series Physics TCAS'], [9, 11, 'ตะลุยโจทย์']] },
  { name: 'TGAT', color: '#ff6b17', courses: [[5, 8, 'อ่านเอง TGAT'], [9, 11, 'ทำโจทย์ TGAT']] },
  { name: 'เคมี', color: '#f5bd3d', courses: [[2, 5, 'เคมี TCAS เล่ม 1'], [6, 8, 'เล่ม 2'], [9, 11, 'ตะลุยโจทย์']] },
]
const events = [{ month: 1, label: 'Mock สนาม' }, { month: 9, label: 'Mock TGAT/TPAT' }, { month: 10, label: 'สอบ TGAT/TPAT' }, { month: 11, label: 'สอบ A-Level' }]
const labels = { A: 'Timeline grid', B: 'Subject strips', C: 'Milestone-led' } as const
type Variant = keyof typeof labels
const short = (name: string, width: number) => width < 2 ? name.replace(/เล่ม/g, 'ล.') : width < 3 ? name.replace(/Applied Math Admissions TCAS /, '') : name

function YearGrid({ dense = false }: { dense?: boolean }) { return <section className={`year-grid${dense ? ' dense' : ''}`}><div className="year-months">{months.map(m => <span key={m}>{m}</span>)}</div><div className="year-events">{events.map(e => <i key={e.label} style={{ gridColumn: e.month + 1 }}>{e.label}</i>)}</div>{subjects.map(s => <div className="year-row" key={s.name}><b><i style={{ background:s.color }} />{s.name}</b><div className="year-track">{s.courses.map(([start,end,name]) => <span key={name} style={{ gridColumn:`${start + 1} / ${end + 2}`, '--subject':s.color } as CSSProperties}>{short(name, end - start + 1)}</span>)}</div></div>)}</section> }
function VariantA() { return <><p className="year-intro">แผนปี 2569 · Course เรียงต่อกันตามช่วงเวลา</p><YearGrid /></> }
function VariantB() { return <section className="year-strips">{subjects.map(s => <article key={s.name}><header><i style={{ background:s.color }} />{s.name}</header><div>{s.courses.map(([start,end,name]) => <span key={name} style={{ marginLeft:`${start / 12 * 100}%`, width:`${(end-start+1)/12*100}%`, '--subject':s.color } as CSSProperties}>{short(name,end-start+1)}</span>)}</div></article>)}</section> }
function VariantC() { return <><div className="year-milestones">{events.map(e => <span key={e.label} style={{ left:`${(e.month / 11) * 100}%` }}>{e.label}</span>)}</div><YearGrid dense /></> }
function Switcher({ variant }: { variant: Variant }) { const nav=useNavigate(); const order=Object.keys(labels) as Variant[]; const move=(n:number)=>nav(`/mypath/year-prototype?variant=${order[(order.indexOf(variant)+n+3)%3]}`); useEffect(()=>{const f=(e:KeyboardEvent)=>{if(e.key==='ArrowLeft')move(-1);if(e.key==='ArrowRight')move(1)};addEventListener('keydown',f);return()=>removeEventListener('keydown',f)}); return <div className="prototype-switcher"><button onClick={()=>move(-1)}><ChevronLeft size={18}/></button><span><b>{variant}</b> · {labels[variant]}</span><button onClick={()=>move(1)}><ChevronRight size={18}/></button></div> }
export default function MyPathYearPrototype() { const [p]=useSearchParams(); const candidate=p.get('variant')?.toUpperCase(); const variant:Variant=candidate==='B'||candidate==='C'?candidate:'A'; return <main className="year-prototype"><header><h1>แผนการเรียน · ปี 2569</h1><p>Yearly prototype — Desktop: เดือนแนวนอน, Mobile: เดือนแนวตั้ง</p></header>{variant==='A'?<VariantA/>:variant==='B'?<VariantB/>:<VariantC/>}<details><summary>ข้อมูลที่ต้นแบบใช้</summary><pre>{JSON.stringify({subjects,events},null,2)}</pre></details><Switcher variant={variant}/></main> }
