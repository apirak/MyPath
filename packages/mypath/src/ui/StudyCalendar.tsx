import { useState, type CSSProperties } from 'react'
import type { StudyCalendar as Calendar } from '../types'
import { usePlan } from '../MyPathProvider'
import { addDays } from '../plan/dates'
import { withStudyCalendar } from '../plan/timeline'
import HeaderButton from './HeaderButton'
import { CalendarDays, Plus, Trash2, X } from './icons'
import { useModal } from './useModal'

// port จาก src/prototype/mypath/StudyCalendarPanel.tsx (class scp- → mp-scp-)
// ต่างจาก prototype: วิชามาจาก data.catalog (id แทนชื่อ), ทุกการแก้ส่งแผนทั้งก้อนผ่าน onPlanChange, Esc ปิดได้ และโฟกัสอยู่ในแผง

const days = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
const dateLabel = (date: string) => new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: '2-digit', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))

function capacityFor(date: string, settings: Calendar) {
  const special = settings.specialDays.find(day => day.date === date)
  if (special) return special.hours
  const schoolBreak = settings.breaks.find(period => period.start <= date && date <= period.end)
  if (schoolBreak) return schoolBreak.hours
  return [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay()) ? settings.weekendHours : settings.weekdayHours
}

type Props = { selected: string; onSelect: (date: string) => void; settings: Calendar; setSettings: (next: Calendar) => void }

function StepSlider({ label, value, min = 0, onChange }: { label: string; value: number; min?: number; onChange: (value: number) => void }) {
  const steps = Array.from({ length: 11 - min }, (_, index) => index + min)
  const progress = (value - min) / (10 - min)
  return <label className="mp-scp-slider-control"><span>{label}<b>{value === 0 ? 'พัก' : `${value} ชม.`}</b></span><div className="mp-scp-step-slider" style={{ '--progress': `${progress * 100}%` } as CSSProperties}>
    <i className="mp-scp-step-track" aria-hidden="true"><i /></i>
    <input className="mp-scp-step-input" aria-label={label} type="range" min={min} max="10" step="1" value={value} onChange={event => onChange(Number(event.target.value))} />
    <span className="mp-scp-step-marks" aria-hidden="true">{steps.map(step => <i key={step} className={step === value ? 'active' : ''}><b>{step}</b></i>)}</span>
  </div></label>
}

// shortcut: ปฏิทินวันพิเศษแสดง ธ.ค. 2569 เดือนเดียวเหมือน prototype (ไม่ตามวันนี้) — เปลี่ยนเมื่อ #13 ตรวจครบเท่า prototype แล้วมีแบบเลื่อนเดือน
function MonthGrid({ selected, settings, onSelect }: Omit<Props, 'setSettings'>) {
  const start = '2026-11-30'
  return <div className="mp-scp-calendar" aria-label="ปฏิทินเดือนธันวาคม 2569"><header><b>ธันวาคม 2569</b><span>เลือกวันเพื่อปรับเวลา</span></header><div className="mp-scp-weekdays">{days.map(day => <i key={day}>{day}</i>)}</div><div className="mp-scp-dates">{Array.from({ length: 35 }, (_, index) => {
    const date = addDays(start, index), inMonth = date.slice(5, 7) === '12', special = settings.specialDays.find(day => day.date === date), schoolBreak = settings.breaks.some(period => period.start <= date && date <= period.end)
    return <button type="button" key={date} className={`${inMonth ? '' : 'outside '}${date === selected ? 'selected ' : ''}${special ? 'special ' : ''}${schoolBreak ? 'break ' : ''}`} onClick={() => onSelect(date)}>{Number(date.slice(-2))}{special && <small className={special.hours > 9 ? 'two-digits' : ''}>{special.hours}</small>}</button>
  })}</div><p><i className="special" /> วันพิเศษ <i className="break" /> ช่วงปิดเทอม</p></div>
}

function SubjectPicker({ settings, setSettings }: Props) {
  const { catalog } = usePlan().data
  const all = catalog.flatMap(group => group.subjects)
  // id ที่ไม่มีใน catalog ไม่นับ แต่ยังอยู่ในแผนที่ส่งกลับ
  const enabled = all.filter(subject => settings.subjects.includes(subject.id)).length
  const setSubjects = (ids: string[], on: boolean) => setSettings({ ...settings, subjects: on ? [...new Set([...settings.subjects, ...ids])] : settings.subjects.filter(id => !ids.includes(id)) })
  return <section className="mp-scp-subjects"><div className="mp-scp-section-title"><div><b>วิชาที่เรียน</b><span>เปิด {enabled} จาก {all.length} วิชา</span></div></div>{catalog.map(group => {
    const ids = group.subjects.map(subject => subject.id)
    const allOn = ids.every(id => settings.subjects.includes(id))
    return <div key={group.name} className="mp-scp-subject-group"><header><b>{group.name}</b><button type="button" onClick={() => setSubjects(ids, !allOn)}>{allOn ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}</button></header><div>{group.subjects.map(subject => {
      const on = settings.subjects.includes(subject.id)
      return <button type="button" key={subject.id} aria-pressed={on} onClick={() => setSubjects([subject.id], !on)}>{subject.name}</button>
    })}</div></div>
  })}</section>
}

function BreakEditor({ settings, setSettings }: Props) {
  const patch = (id: number, change: Partial<Calendar['breaks'][number]>) => setSettings({ ...settings, breaks: settings.breaks.map(period => period.id === id ? { ...period, ...change } : period) })
  return <section className="mp-scp-breaks"><div className="mp-scp-section-title"><div><b>ปิดเทอม</b><span>กำหนดช่วงที่ไม่มีเวลาเรียนหรือเรียนได้มากขึ้น</span></div><HeaderButton className="mp-scp-icon-button" aria-label="เพิ่มช่วงปิดเทอม" onClick={() => setSettings({ ...settings, breaks: [...settings.breaks, { id: Date.now(), start: '2027-01-10', end: '2027-01-17', hours: 2 }] })}><Plus size={18} /></HeaderButton></div>{settings.breaks.map(period => <article key={period.id}><div className="mp-scp-break-dates"><input aria-label="วันเริ่มปิดเทอม" type="date" value={period.start} onChange={event => patch(period.id, { start: event.target.value })} /><span>ถึง</span><input aria-label="วันจบปิดเทอม" type="date" value={period.end} onChange={event => patch(period.id, { end: event.target.value })} /><button type="button" aria-label="ลบช่วงปิดเทอม" onClick={() => setSettings({ ...settings, breaks: settings.breaks.filter(item => item.id !== period.id) })}><Trash2 size={17} /></button></div><StepSlider label="เรียนได้ต่อวัน" value={period.hours} min={0} onChange={hours => patch(period.id, { hours })} /></article>)}</section>
}

function SpecialPicker({ selected, settings, setSettings }: Props) {
  const existing = settings.specialDays.find(day => day.date === selected), hours = existing?.hours ?? capacityFor(selected, settings)
  const setSpecial = (nextHours: number) => setSettings({ ...settings, specialDays: [...settings.specialDays.filter(day => day.date !== selected), { date: selected, hours: nextHours }].sort((a, b) => a.date.localeCompare(b.date)) })
  return <section className="mp-scp-special-editor"><header><span>วันที่เลือก</span><b>{dateLabel(selected)}</b></header><StepSlider label="เรียนได้" value={hours} min={0} onChange={setSpecial} />{existing && <button type="button" className="mp-scp-text-button" onClick={() => setSettings({ ...settings, specialDays: settings.specialDays.filter(day => day.date !== selected) })}>ลบข้อยกเว้น</button>}</section>
}

function Layout(props: Props) {
  const [showSpecial, setShowSpecial] = useState(false)
  return <div className="mp-scp-layout"><SubjectPicker {...props} /><section className="mp-scp-cards"><article><b>วันเรียนปกติ</b><span>จันทร์–ศุกร์</span><StepSlider label="เรียนได้ต่อวัน" value={props.settings.weekdayHours} onChange={weekdayHours => props.setSettings({ ...props.settings, weekdayHours })} /></article><article><b>วันหยุดประจำสัปดาห์</b><span>เสาร์, อาทิตย์ และวันหยุด</span><StepSlider label="เรียนได้ต่อวัน" value={props.settings.weekendHours} onChange={weekendHours => props.setSettings({ ...props.settings, weekendHours })} /></article></section><BreakEditor {...props} /><section className="mp-scp-special-settings">{!showSpecial ? <HeaderButton onClick={() => setShowSpecial(true)}><CalendarDays size={18} />ตั้งค่าวันพิเศษ</HeaderButton> : <><header><div><b>ตั้งค่าวันพิเศษ</b><span>เลือกวัน แล้วกำหนดจำนวนชั่วโมง</span></div><HeaderButton className="mp-scp-icon-button" aria-label="ซ่อนการตั้งค่าวันพิเศษ" onClick={() => setShowSpecial(false)}><X size={18} strokeWidth={2} /></HeaderButton></header><div><MonthGrid {...props} /><SpecialPicker {...props} /></div></>}</section></div>
}

export default function StudyCalendar({ onClose }: { onClose: () => void }) {
  const { data, onPlanChange } = usePlan()
  const [selected, setSelected] = useState('2026-12-12')
  const { ref, closing, close, trapTab } = useModal<HTMLElement>(onClose)
  // ส่งเฉพาะปฏิทินที่ผ่านการตรวจ (ช่วงปิดเทอมไม่ซ้อนกัน) — ไม่ผ่าน = ช่องกลับเป็นค่าเดิมเพราะค่ามาจาก data.plan
  const setSettings = (calendar: Calendar) => { const next = withStudyCalendar(data.plan, calendar); if (next) onPlanChange(next) }
  return <div className={`mp-scp-overlay${closing ? ' closing' : ''}`}><div className="mp-scp-backdrop" onClick={close} /><section ref={ref} className="mp-scp-page mp-scp-panel" role="dialog" aria-modal="true" aria-label="ปฏิทินการเรียน" tabIndex={-1} onKeyDown={trapTab}><header className="mp-scp-header"><div><h1><CalendarDays size={24} />ปฏิทินการเรียน</h1></div><HeaderButton className="mp-scp-icon-button" aria-label="ปิดปฏิทินการเรียน" onClick={close}><X size={18} strokeWidth={2} /></HeaderButton></header><div className="mp-scp-content"><Layout selected={selected} onSelect={setSelected} settings={data.plan.calendar} setSettings={setSettings} /></div></section></div>
}
