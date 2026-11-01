import type { ExamEvent } from '../../types'
import { fmtShort } from '../../plan/dates'
import { useOwned } from '../components/useOwned'
import Plate from './Plate'

// Same colours as the All timeline: blue = real exam, red = mock.
const KIND_COLOR = { exam: '#2b6cd4', mock: '#ef6268' } as const

export default function EventCard({
  event,
  done = false,
}: {
  event: ExamEvent
  done?: boolean
}) {
  const owned = useOwned().event(event)
  const color = KIND_COLOR[event.kind]
  const kindLabel = event.kind === 'exam' ? 'สอบจริง' : 'Mock'
  return (
    <article className={`mp-course${done ? ' mp-done' : ''}`}>
      <div className="mp-course-body">
        <Plate text={kindLabel} color={color} owned={owned} />
        <div>
          <div className="mp-course-top">
            <b>{kindLabel}</b>
            <span>{fmtShort(event.date)}</span>
          </div>
          <strong>{event.label}</strong>
          <small>สอบ 1 วัน{owned ? '' : ' · ยังไม่ได้ซื้อ'}</small>
        </div>
      </div>
    </article>
  )
}
