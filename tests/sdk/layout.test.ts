// Pure geometry behind the All timeline (ui/all/layout.ts). Failures here
// point at the math, not at rendering.
import { describe, expect, it } from 'vitest'
import type { Axis } from '../../packages/mypath/src/plan/buildPlan'
import { calendarBudgetForWeek } from '../../packages/mypath/src/plan/timeline'
import type { ExamEvent, StudyCalendar } from '../../packages/mypath/src/types'
import { u } from '../../packages/mypath/src/plan/dates'
import {
  barText,
  eventLanes,
  monthColumns,
  position,
  timelineOf,
  weeklyLoad,
} from '../../packages/mypath/src/ui/all/layout'

// Oct–Nov 2026; 1 Oct is a Thursday.
const axis: Axis = {
  start: '2026-10-01',
  end: '2026-12-01',
  totalDays: 61,
  months: [
    { label: 'ต.ค.', days: 31 },
    { label: 'พ.ย.', days: 30 },
  ],
  label: 'ต.ค.–พ.ย. 69',
  monthLines: [],
}
const t = timelineOf(axis)

describe('timelineOf', () => {
  it('ต่อเดือนให้ end ของเดือนก่อนเป็น start ของเดือนถัดไป', () => {
    expect(t.months.map(m => [m.start, m.end])).toEqual([
      ['2026-10-01', '2026-11-01'],
      ['2026-11-01', '2026-12-01'],
    ])
    expect(t.days).toBe(61)
  })
})

describe('position / monthColumns / barText', () => {
  it('position เป็น % ของแกน', () => {
    expect(position('2026-10-01', t)).toBe(0)
    expect(position('2026-12-01', t)).toBe(100)
  })

  it('คอลัมน์เดือนกว้างตามจำนวนวัน และไม่แคบกว่า dayWidth', () => {
    expect(monthColumns(t, 2)).toBe('minmax(62px, 31fr) minmax(60px, 30fr)')
  })

  it('สีอ่อนใช้ตัวหนังสือเข้ม สีเข้มใช้ตัวหนังสือขาว', () => {
    expect(barText('#ffffff')).toBe('#212529')
    expect(barText('#000000')).toBe('#fff')
  })
})

describe('eventLanes', () => {
  const event = (id: string, date: string): ExamEvent => ({
    id,
    date,
    label: 'TGAT 2569',
    kind: 'exam',
  })

  it('ธงชนกันขึ้นชั้นใหม่ ธงที่ห่างพอกลับมาใช้ชั้นแรก', () => {
    const { shown, lanes } = eventLanes(
      [
        event('late', '2026-11-25'),
        event('a', '2026-10-10'),
        event('b', '2026-10-10'),
      ],
      t,
      2.2,
    )
    // Sorted by date before stacking.
    expect(shown.map(s => [s.event.id, s.lane])).toEqual([
      ['a', 0],
      ['b', 1],
      ['late', 0],
    ])
    expect(lanes).toBe(2)
  })

  it('ไม่แสดงธงนอกแกน (end เป็น exclusive)', () => {
    const { shown } = eventLanes(
      [event('before', '2026-09-30'), event('end', '2026-12-01')],
      t,
      2.2,
    )
    expect(shown).toEqual([])
  })
})

describe('weeklyLoad', () => {
  const calendar: StudyCalendar = {
    weekdayHours: 1,
    weekendHours: 2,
    specialDays: [],
    breaks: [],
    subjects: [],
  }

  it('สัปดาห์เริ่มวันจันทร์ก่อนแกน และรวมชั่วโมงรายวันของแต่ละสัปดาห์', () => {
    const hours = new Map([
      ['2026-09-28', 5], // Monday before the axis: still in week 1
      ['2026-10-02', 1.5],
      ['2026-10-05', 2],
    ])
    const weeks = weeklyLoad(t, hours, calendar)
    expect(weeks[0].start).toBe(u('2026-09-28'))
    expect(weeks.slice(0, 2).map(w => w.demand)).toEqual([6.5, 2])
    expect(weeks[0].plan).toBe(calendarBudgetForWeek(calendar, weeks[0].start))
  })

  it('สัปดาห์สุดท้ายตัดที่ปลายแกน', () => {
    const weeks = weeklyLoad(t, new Map(), calendar)
    expect(weeks.at(-1)!.end).toBe(u('2026-12-01'))
    expect(weeks.every(w => w.demand === 0)).toBe(true)
  })
})
