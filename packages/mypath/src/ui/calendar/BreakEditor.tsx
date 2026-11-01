import type { StudyCalendar } from '../../types'
import HeaderButton from '../components/HeaderButton'
import { Plus, Trash2 } from '../components/icons'
import StepSlider from './StepSlider'
import type { EditorProps } from './StudyCalendar'

export default function BreakEditor({ settings, setSettings }: EditorProps) {
  const patch = (
    id: number,
    change: Partial<StudyCalendar['breaks'][number]>,
  ) =>
    setSettings({
      ...settings,
      breaks: settings.breaks.map(period =>
        period.id === id ? { ...period, ...change } : period,
      ),
    })
  return (
    <section className="mp-scp-breaks">
      <div className="mp-scp-section-title">
        <div>
          <b>ปิดเทอม</b>
          <span>กำหนดช่วงที่ไม่มีเวลาเรียนหรือเรียนได้มากขึ้น</span>
        </div>
        <HeaderButton
          className="mp-scp-icon-button"
          aria-label="เพิ่มช่วงปิดเทอม"
          onClick={() =>
            setSettings({
              ...settings,
              breaks: [
                ...settings.breaks,
                // shortcut: new breaks default to the prototype's dates;
                // derive from today when the calendar pages by month.
                {
                  id: Date.now(),
                  start: '2027-01-10',
                  end: '2027-01-17',
                  hours: 2,
                },
              ],
            })
          }
        >
          <Plus size={18} />
        </HeaderButton>
      </div>
      {settings.breaks.map(period => (
        <article key={period.id}>
          <div className="mp-scp-break-dates">
            <input
              aria-label="วันเริ่มปิดเทอม"
              type="date"
              value={period.start}
              onChange={event =>
                patch(period.id, { start: event.target.value })
              }
            />
            <span>ถึง</span>
            <input
              aria-label="วันจบปิดเทอม"
              type="date"
              value={period.end}
              onChange={event => patch(period.id, { end: event.target.value })}
            />
            <button
              type="button"
              aria-label="ลบช่วงปิดเทอม"
              onClick={() =>
                setSettings({
                  ...settings,
                  breaks: settings.breaks.filter(item => item.id !== period.id),
                })
              }
            >
              <Trash2 size={17} />
            </button>
          </div>
          <StepSlider
            label="เรียนได้ต่อวัน"
            value={period.hours}
            min={0}
            onChange={hours => patch(period.id, { hours })}
          />
        </article>
      ))}
    </section>
  )
}
