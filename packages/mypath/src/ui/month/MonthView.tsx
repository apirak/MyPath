import { usePlan } from '../../MyPathProvider'
import { agendaFor } from '../../plan/agenda'
import { addMonths, fmtMonth, monthStartOf } from '../../plan/dates'
import PathHeader, { type ModeProps } from '../header/PathHeader'
import PlanEmptyState from '../components/PlanEmptyState'
import Agenda from './Agenda'

// `selected` lives in <MyPath> so it survives a switch to All; undefined
// means today's month.
export default function MonthView({
  selected: picked,
  onSelect,
  ...mode
}: ModeProps & { selected?: string; onSelect: (month: string) => void }) {
  const { plan } = usePlan()
  const { axis, today } = plan
  const selected = picked ?? monthStartOf(today)
  // The axis is rebuilt on every plan change, so clamp the selected month to
  // it rather than jumping back to today's month.
  const lastMonth = addMonths(axis.end, -1)
  const month =
    selected < axis.start
      ? axis.start
      : selected > lastMonth
        ? lastMonth
        : selected
  const agenda = agendaFor(plan, month)
  // key={month} remounts the scroller so a new month starts at the top.
  return (
    <>
      <PathHeader
        mode="month"
        {...mode}
        period={fmtMonth(month)}
        now={agenda.isCurrent}
        canPrev={month > axis.start}
        canNext={month < lastMonth}
        onPrev={() => onSelect(addMonths(month, -1))}
        onNext={() => onSelect(addMonths(month, 1))}
      />
      <div className="mp-scroll" key={month}>
        <div className="mp-shell">
          {plan.subjects.length === 0 ? (
            <PlanEmptyState />
          ) : (
            <Agenda agenda={agenda} today={today} />
          )}
        </div>
      </div>
    </>
  )
}
