import { useMemo, useState, type CSSProperties } from 'react'
import { CalendarDays, Plus, Trash2, X } from 'lucide-react'
import HeaderButton from '../components/HeaderButton'
import { setStudyCalendar, studyCalendar, usePlanVersion } from './plan'
import type { StudyCalendar } from './studentPlan'
import './StudyCalendarPanel.css'
import './StudyCalendarPanelOverrides.css'

const days = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
const dateLabel = (date: string) => new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: '2-digit', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
const addDays = (date: string, count: number) => {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + count)
  return value.toISOString().slice(0, 10)
}

function capacityFor(date: string, settings: StudyCalendar) {
  const special = settings.specialDays.find(day => day.date === date)
  if (special) return special.hours
  const schoolBreak = settings.breaks.find(period => period.start <= date && date <= period.end)
  if (schoolBreak) return schoolBreak.hours
  return [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay()) ? settings.weekendHours : settings.weekdayHours
}

function StepSlider({ label, value, min = 0, onChange }: { label: string; value: number; min?: number; onChange: (value: number) => void }) {
  const steps = Array.from({ length: 11 - min }, (_, index) => index + min)
  const progress = (value - min) / (10 - min)
  return <label className="scp-slider-control"><span>{label}<b>{value === 0 ? 'พัก' : `${value} ชม.`}</b></span><div className="scp-step-slider" style={{ '--progress': `${progress * 100}%` } as CSSProperties}>
    <i className="scp-step-track" aria-hidden="true"><i /></i>
    <input className="scp-step-input" aria-label={label} type="range" min={min} max="10" step="1" value={value} onChange={event => onChange(Number(event.target.value))} />
    <span className="scp-step-marks" aria-hidden="true">{steps.map(step => <i key={step} className={step === value ? 'active' : ''}><b>{step}</b></i>)}</span>
  </div></label>
}

function Calendar({ selected, settings, onSelect }: { selected: string; settings: StudyCalendar; onSelect: (date: string) => void }) {
  const start = '2026-11-30'
  return <div className="scp-calendar" aria-label="ปฏิทินเดือนธันวาคม 2569"><header><b>ธันวาคม 2569</b><span>เลือกวันเพื่อปรับเวลา</span></header><div className="scp-weekdays">{days.map(day => <i key={day}>{day}</i>)}</div><div className="scp-dates">{Array.from({ length: 35 }, (_, index) => {
    const date = addDays(start, index), inMonth = date.slice(5, 7) === '12', special = settings.specialDays.find(day => day.date === date), schoolBreak = settings.breaks.some(period => period.start <= date && date <= period.end)
    return <button key={date} className={`${inMonth ? '' : 'outside '}${date === selected ? 'selected ' : ''}${special ? 'special ' : ''}${schoolBreak ? 'break ' : ''}`} onClick={() => onSelect(date)}>{Number(date.slice(-2))}{special && <small className={special.hours > 9 ? 'two-digits' : ''}>{special.hours}</small>}</button>
  })}</div><p><i className="special" /> วันพิเศษ <i className="break" /> ช่วงปิดเทอม</p></div>
}

function WeekSummary({ settings }: { settings: StudyCalendar }) {
  const total = settings.weekdayHours * 5 + settings.weekendHours * 2
  return <section className="scp-summary"><span>เรียนสัปดาห์ละ</span><strong>{total} <small>ชม.</small></strong></section>
}

function BreakEditor({ settings, setSettings }: { settings: StudyCalendar; setSettings: (next: StudyCalendar) => void }) {
  const patch = (id: number, change: Partial<StudyCalendar['breaks'][number]>) => setSettings({ ...settings, breaks: settings.breaks.map(period => period.id === id ? { ...period, ...change } : period) })
  return <section className="scp-breaks"><div className="scp-section-title"><div><b>ปิดเทอม</b><span>กำหนดช่วงที่ไม่มีเวลาเรียนหรือเรียนได้มากขึ้น</span></div><HeaderButton className="header-button--icon scp-icon-button" aria-label="เพิ่มช่วงปิดเทอม" onClick={() => setSettings({ ...settings, breaks: [...settings.breaks, { id: Date.now(), start: '2027-01-10', end: '2027-01-17', hours: 2 }] })}><Plus size={18} /></HeaderButton></div>{settings.breaks.map(period => <article key={period.id}><div className="scp-break-dates"><input aria-label="วันเริ่มปิดเทอม" type="date" value={period.start} onChange={event => patch(period.id, { start: event.target.value })} /><span>ถึง</span><input aria-label="วันจบปิดเทอม" type="date" value={period.end} onChange={event => patch(period.id, { end: event.target.value })} /><button aria-label="ลบช่วงปิดเทอม" onClick={() => setSettings({ ...settings, breaks: settings.breaks.filter(item => item.id !== period.id) })}><Trash2 size={17} /></button></div><StepSlider label="เรียนได้ต่อวัน" value={period.hours} min={0} onChange={hours => patch(period.id, { hours })} /></article>)}</section>
}

function SpecialPicker({ selected, settings, setSettings }: Omit<CalendarProps, 'onSelect'>) {
  const existing = settings.specialDays.find(day => day.date === selected), hours = existing?.hours ?? capacityFor(selected, settings)
  const setSpecial = (nextHours: number) => setSettings({ ...settings, specialDays: [...settings.specialDays.filter(day => day.date !== selected), { date: selected, hours: nextHours }].sort((a, b) => a.date.localeCompare(b.date)) })
  return <section className="scp-special-editor"><header><span>วันที่เลือก</span><b>{dateLabel(selected)}</b></header><StepSlider label="เรียนได้" value={hours} min={0} onChange={setSpecial} />{existing && <button className="scp-text-button" onClick={() => setSettings({ ...settings, specialDays: settings.specialDays.filter(day => day.date !== selected) })}>ลบข้อยกเว้น</button>}</section>
}

function VariantD(props: CalendarProps) {
  const [showSpecial, setShowSpecial] = useState(false)
  return <div className="scp-layout scp-layout-d"><WeekSummary {...props} /><section className="scp-cards"><article><b>วันเรียนปกติ</b><span>จันทร์–ศุกร์</span><StepSlider label="เรียนได้ต่อวัน" value={props.settings.weekdayHours} onChange={weekdayHours => props.setSettings({ ...props.settings, weekdayHours })} /></article><article><b>วันหยุดประจำสัปดาห์</b><span>เสาร์, อาทิตย์ และวันหยุด</span><StepSlider label="เรียนได้ต่อวัน" value={props.settings.weekendHours} onChange={weekendHours => props.setSettings({ ...props.settings, weekendHours })} /></article></section><BreakEditor {...props} /><section className="scp-special-settings">{!showSpecial ? <HeaderButton onClick={() => setShowSpecial(true)}><CalendarDays size={18} />ตั้งค่าวันพิเศษ</HeaderButton> : <><header><div><b>ตั้งค่าวันพิเศษ</b><span>เลือกวัน แล้วกำหนดจำนวนชั่วโมง</span></div><HeaderButton className="header-button--icon scp-icon-button" aria-label="ซ่อนการตั้งค่าวันพิเศษ" onClick={() => setShowSpecial(false)}><X size={18} /></HeaderButton></header><div><Calendar {...props} /><SpecialPicker {...props} /></div></>}</section></div>
}

type CalendarProps = { selected: string; onSelect: (date: string) => void; settings: StudyCalendar; setSettings: (next: StudyCalendar) => void }

export default function StudyCalendarPanel({ onClose }: { onClose: () => void }) {
  usePlanVersion()
  const [selected, setSelected] = useState('2026-12-12'), [closing, setClosing] = useState(false)
  const props = useMemo(() => ({ selected, onSelect: setSelected, settings: studyCalendar, setSettings: setStudyCalendar }), [selected])
  const close = () => { if (!closing) { setClosing(true); window.setTimeout(onClose, 280) } }
  return <div className={`scp-overlay${closing ? ' closing' : ''}`}><div className="scp-backdrop" onClick={close} /><main className="scp-page scp-panel" role="dialog" aria-modal="true" aria-label="ปฏิทินการเรียน"><header className="scp-header"><div><h1><CalendarDays size={24} />ปฏิทินการเรียน</h1></div><HeaderButton className="header-button--icon scp-icon-button" aria-label="ปิดปฏิทินการเรียน" onClick={close}><X size={18} /></HeaderButton></header><div className="scp-content"><VariantD {...props} /></div></main></div>
}
