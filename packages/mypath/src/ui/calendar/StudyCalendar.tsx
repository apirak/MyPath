import { useState } from 'react'
import type { StudyCalendar as Calendar } from '../../types'
import { usePlan } from '../../MyPathProvider'
import { withStudyCalendar } from '../../plan/timeline'
import HeaderButton from '../components/HeaderButton'
import { CalendarDays, X } from '../components/icons'
import { useModal } from '../components/useModal'
import BreakEditor from './BreakEditor'
import MonthGrid from './MonthGrid'
import SpecialPicker from './SpecialPicker'
import StepSlider from './StepSlider'
import SubjectPicker from './SubjectPicker'

// Props every calendar section gets: the calendar to show, a setter that
// validates and sends it to the host, and the day picked in the month grid.
export type EditorProps = {
  selected: string
  onSelect: (date: string) => void
  settings: Calendar
  setSettings: (next: Calendar) => void
}

function Layout(props: EditorProps) {
  const [showSpecial, setShowSpecial] = useState(false)
  return (
    <div className="mp-scp-layout">
      <SubjectPicker {...props} />
      <section className="mp-scp-cards">
        <article>
          <b>วันเรียนปกติ</b>
          <span>จันทร์–ศุกร์</span>
          <StepSlider
            label="เรียนได้ต่อวัน"
            value={props.settings.weekdayHours}
            onChange={weekdayHours =>
              props.setSettings({ ...props.settings, weekdayHours })
            }
          />
        </article>
        <article>
          <b>วันหยุดประจำสัปดาห์</b>
          <span>เสาร์, อาทิตย์ และวันหยุด</span>
          <StepSlider
            label="เรียนได้ต่อวัน"
            value={props.settings.weekendHours}
            onChange={weekendHours =>
              props.setSettings({ ...props.settings, weekendHours })
            }
          />
        </article>
      </section>
      <BreakEditor {...props} />
      <section className="mp-scp-special-settings">
        {!showSpecial ? (
          <HeaderButton onClick={() => setShowSpecial(true)}>
            <CalendarDays size={18} />
            ตั้งค่าวันพิเศษ
          </HeaderButton>
        ) : (
          <>
            <header>
              <div>
                <b>ตั้งค่าวันพิเศษ</b>
                <span>เลือกวัน แล้วกำหนดจำนวนชั่วโมง</span>
              </div>
              <HeaderButton
                className="mp-scp-icon-button"
                aria-label="ซ่อนการตั้งค่าวันพิเศษ"
                onClick={() => setShowSpecial(false)}
              >
                <X size={18} strokeWidth={2} />
              </HeaderButton>
            </header>
            <div>
              <MonthGrid {...props} />
              <SpecialPicker {...props} />
            </div>
          </>
        )}
      </section>
    </div>
  )
}

// Study calendar panel (modal). Every edit sends the whole plan via
// onPlanChange (ADR-0003).
export default function StudyCalendar({ onClose }: { onClose: () => void }) {
  const { data, onPlanChange } = usePlan()
  // shortcut: opens on a fixed day in the fixed month (see MonthGrid).
  const [selected, setSelected] = useState('2026-12-12')
  const { ref, closing, close } = useModal<HTMLElement>(onClose)
  // Only valid calendars (no overlapping breaks) reach the host. An invalid
  // edit snaps back because inputs always read from data.plan.
  const setSettings = (calendar: Calendar) => {
    const next = withStudyCalendar(data.plan, calendar)
    if (next) onPlanChange(next)
  }
  return (
    <div className={`mp-scp-overlay${closing ? ' closing' : ''}`}>
      <div className="mp-scp-backdrop" onClick={close} />
      <section
        ref={ref}
        className="mp-scp-page mp-scp-panel"
        role="dialog"
        aria-modal="true"
        aria-label="ปฏิทินการเรียน"
        tabIndex={-1}
      >
        <header className="mp-scp-header">
          <div>
            <h1>
              <CalendarDays size={24} />
              ปฏิทินการเรียน
            </h1>
          </div>
          <HeaderButton
            className="mp-scp-icon-button"
            aria-label="ปิดปฏิทินการเรียน"
            onClick={close}
          >
            <X size={18} strokeWidth={2} />
          </HeaderButton>
        </header>
        <div className="mp-scp-content">
          <Layout
            selected={selected}
            onSelect={setSelected}
            settings={data.plan.calendar}
            setSettings={setSettings}
          />
        </div>
      </section>
    </div>
  )
}
