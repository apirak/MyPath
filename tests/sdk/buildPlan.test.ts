// buildPlan ของ SDK: วันนี้และข้อมูลที่ไม่ครบ (ผลของแผน mock ทั้งก้อนคุมด้วย tests/characterization/plan.test.ts)
import { describe, expect, it } from 'vitest'
import { buildPlan } from '../../packages/mypath/src/plan/buildPlan'
import { mypathData } from '../../src/host/fixtures'

describe('buildPlan: วันนี้และข้อมูลไม่ครบ', () => {
  const base = { catalog: mypathData.catalog, events: [], today: '2027-03-10' }
  const calendar = { ...mypathData.plan.calendar, subjects: ['tgat'] }

  it('คอร์สแรกที่ไม่มีวันเริ่มต้นเริ่มที่วันนี้', () => {
    const { subjects } = buildPlan({ ...base, plan: { calendar, courses: [] } })
    expect(subjects[0].courses[0].start).toBe('2027-03-10')
  })

  it('วันเริ่มต้นในอดีตไม่ถูกดันขึ้นมา และวันที่ผิดรูป = ไม่ได้ตั้ง', () => {
    expect(buildPlan({ ...base, plan: { calendar, courses: [{ courseId: 'TGAT.1', startDate: '2026-01-05' }] } }).subjects[0].courses[0].start).toBe('2026-01-05')
    expect(buildPlan({ ...base, plan: { calendar, courses: [{ courseId: 'TGAT.1', startDate: 'oops' }] } }).subjects[0].courses[0].start).toBe('2027-03-10')
    expect(buildPlan({ ...base, plan: { calendar, courses: [{ courseId: 'TGAT.1', startDate: '2026-02-31' }] } }).subjects[0].courses[0].start).toBe('2027-03-10') // วันที่ไม่มีจริง ไม่ถูกเลื่อนไป 3 มี.ค.
  })

  it('catalog ว่างไม่ throw และแกนครอบวันนี้', () => {
    const { subjects, axis } = buildPlan({ ...base, catalog: [], plan: { calendar, courses: [] } })
    expect(subjects).toEqual([])
    expect(axis.label).toBe('มี.ค. 70 – มี.ค. 70')
  })

  it('จังหวะเรียนนอกช่วง 1–10 ถูกบีบ (0 ไม่ทำให้ค้าง)', () => {
    const course = (weeklyHours: number) => buildPlan({ ...base, plan: { calendar, courses: [{ courseId: 'TGAT.1', weeklyHours }] } }).subjects[0].courses[0]
    expect(course(0)).toMatchObject({ weeklyHours: 1, estimatedWeeks: 15 }) // TGAT.1 = 15 ชม.
    expect(course(40).weeklyHours).toBe(10)
  })

  it('วันสอบผิดรูปถูกข้าม ไม่ทำให้แกนพัง', () => {
    const { events, axis } = buildPlan({ ...base, events: [{ id: 'X', date: '', label: 'x', kind: 'exam' }], plan: { calendar, courses: [] } })
    expect(events).toEqual([])
    expect(axis.start).toBe('2027-03-01')
  })
})
