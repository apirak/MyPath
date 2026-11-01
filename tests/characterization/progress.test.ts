// Characterization: บันทึกข้อความความคืบหน้า (progressState) ทุก branch ไว้เป็นค่าอ้างอิง
// progress เป็น state ระดับ module → resetProgress() ก่อนทุกเคส
import { beforeEach, describe, expect, it } from 'vitest'
import { progressState, resetProgress, setProgress } from '../../src/prototype/mypath/progressStore'

// คอร์ส 30 วัน: เป้าแรก (30%) = 2027-01-10, เป้าสอง (70%) = 2027-01-22
const course = { id: 'CHAR.1', start: '2027-01-01', end: '2027-01-31' }

const cases: { name: string; value: number; today: string }[] = [
  { name: '0%', value: 0, today: '2027-01-05' },
  { name: 'ต่ำกว่าเป้าแรก ก่อนวันของเป้าแรก', value: 10, today: '2027-01-05' },
  { name: 'ต่ำกว่าเป้าแรก ตรงวันของเป้าแรก', value: 10, today: '2027-01-10' },
  { name: 'ต่ำกว่าเป้าแรก หลังวันของเป้าแรก', value: 10, today: '2027-01-11' },
  { name: 'ตรงเป้าแรกพอดี (30%)', value: 30, today: '2027-01-15' },
  { name: 'ระหว่างเป้าแรกกับเป้าสอง ก่อนวันของเป้าสอง', value: 50, today: '2027-01-15' },
  { name: 'ระหว่างเป้าแรกกับเป้าสอง ตรงวันของเป้าสอง', value: 50, today: '2027-01-22' },
  { name: 'ระหว่างเป้าแรกกับเป้าสอง หลังวันของเป้าสอง', value: 50, today: '2027-01-23' },
  { name: 'ตรงเป้าสองพอดี (70%)', value: 70, today: '2027-01-15' },
  { name: '70–99%', value: 85, today: '2027-01-15' },
  { name: '100%', value: 100, today: '2027-01-15' },
]

describe('progressState', () => {
  beforeEach(() => {
    resetProgress()
  })

  it.each(cases)('$name', ({ value, today }) => {
    setProgress(course.id, value)
    expect(progressState(course, today)).toMatchSnapshot()
  })
})
