// Characterization: pins the progressState message for every branch.
// Snapshots were recorded from the prototype (tag mockup-v1); the SDK must
// still match them.
import { describe, expect, it } from 'vitest'
import { progressState } from '../../packages/mypath/src/plan/progress'

// 30-day course: first target (30%) = 2027-01-10, second (70%) = 2027-01-22
const course = { id: 'CHAR.1', start: '2027-01-01', end: '2027-01-31' }

const cases: { name: string; value: number; today: string }[] = [
  { name: '0%', value: 0, today: '2027-01-05' },
  { name: 'ต่ำกว่าเป้าแรก ก่อนวันของเป้าแรก', value: 10, today: '2027-01-05' },
  { name: 'ต่ำกว่าเป้าแรก ตรงวันของเป้าแรก', value: 10, today: '2027-01-10' },
  { name: 'ต่ำกว่าเป้าแรก หลังวันของเป้าแรก', value: 10, today: '2027-01-11' },
  { name: 'ตรงเป้าแรกพอดี (30%)', value: 30, today: '2027-01-15' },
  {
    name: 'ระหว่างเป้าแรกกับเป้าสอง ก่อนวันของเป้าสอง',
    value: 50,
    today: '2027-01-15',
  },
  {
    name: 'ระหว่างเป้าแรกกับเป้าสอง ตรงวันของเป้าสอง',
    value: 50,
    today: '2027-01-22',
  },
  {
    name: 'ระหว่างเป้าแรกกับเป้าสอง หลังวันของเป้าสอง',
    value: 50,
    today: '2027-01-23',
  },
  { name: 'ตรงเป้าสองพอดี (70%)', value: 70, today: '2027-01-15' },
  { name: '70–99%', value: 85, today: '2027-01-15' },
  { name: '100%', value: 100, today: '2027-01-15' },
]

describe('progressState', () => {
  it.each(cases)('$name', ({ value, today }) => {
    expect(progressState(course, value, today)).toMatchSnapshot()
  })
})
