import { usePlan } from '../../MyPathProvider'
import type { EditorProps } from './StudyCalendar'

export default function SubjectPicker({ settings, setSettings }: EditorProps) {
  const { catalog } = usePlan().data
  const all = catalog.flatMap(group => group.subjects)
  // Ids missing from the catalog aren't counted but stay in the plan.
  const enabled = all.filter(subject =>
    settings.subjects.includes(subject.id),
  ).length
  const setSubjects = (ids: string[], on: boolean) =>
    setSettings({
      ...settings,
      subjects: on
        ? [...new Set([...settings.subjects, ...ids])]
        : settings.subjects.filter(id => !ids.includes(id)),
    })
  return (
    <section className="mp-scp-subjects">
      <div className="mp-scp-section-title">
        <div>
          <b>วิชาที่เรียน</b>
          <span>
            เปิด {enabled} จาก {all.length} วิชา
          </span>
        </div>
      </div>
      {catalog.map(group => {
        const ids = group.subjects.map(subject => subject.id)
        const allOn = ids.every(id => settings.subjects.includes(id))
        return (
          <div key={group.name} className="mp-scp-subject-group">
            <header>
              <b>{group.name}</b>
              <button type="button" onClick={() => setSubjects(ids, !allOn)}>
                {allOn ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
              </button>
            </header>
            <div>
              {group.subjects.map(subject => {
                const on = settings.subjects.includes(subject.id)
                return (
                  <button
                    type="button"
                    key={subject.id}
                    aria-pressed={on}
                    onClick={() => setSubjects([subject.id], !on)}
                  >
                    {subject.name}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </section>
  )
}
