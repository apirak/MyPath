import { calendarHoursForDay } from '../../plan/timeline'
import StepSlider from './StepSlider'
import type { EditorProps } from './StudyCalendar'

const dateLabel = (date: string) =>
  new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))

export default function SpecialPicker({
  selected,
  settings,
  setSettings,
}: EditorProps) {
  const existing = settings.specialDays.find(day => day.date === selected),
    hours = existing?.hours ?? calendarHoursForDay(settings, selected)
  const setSpecial = (nextHours: number) =>
    setSettings({
      ...settings,
      specialDays: [
        ...settings.specialDays.filter(day => day.date !== selected),
        { date: selected, hours: nextHours },
      ].sort((a, b) => a.date.localeCompare(b.date)),
    })
  return (
    <section className="mp-scp-special-editor">
      <header>
        <span>วันที่เลือก</span>
        <b>{dateLabel(selected)}</b>
      </header>
      <StepSlider
        label="เรียนได้"
        value={hours}
        min={0}
        onChange={setSpecial}
      />
      {existing && (
        <button
          type="button"
          className="mp-scp-text-button"
          onClick={() =>
            setSettings({
              ...settings,
              specialDays: settings.specialDays.filter(
                day => day.date !== selected,
              ),
            })
          }
        >
          ลบข้อยกเว้น
        </button>
      )}
    </section>
  )
}
