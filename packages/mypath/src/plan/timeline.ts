// ฟังก์ชันล้วนของหน้า All — copy สูตรจาก src/prototype/pages/MyPathAllTimeline.tsx (dragStart) และ src/prototype/mypath/plan.ts
import type { ISODate, StudentPlan, StudyCalendar } from '../types'
import { MS, isoOf, u } from './dates'

// แผนใหม่ที่คอร์สนั้นมีวันเริ่มต้นใหม่ (แทน setCourseStartDate ที่แก้ของเดิม) — คอร์สที่ยังไม่มีในแผนได้รายการใหม่
export const withCourseStartDate = (plan: StudentPlan, courseId: string, startDate: ISODate): StudentPlan => ({
  ...plan,
  courses: plan.courses.some(c => c.courseId === courseId)
    ? plan.courses.map(c => c.courseId === courseId ? { ...c, startDate } : c)
    : [...plan.courses, { courseId, startDate }],
})

// วันจันทร์ที่ใกล้ที่สุด (ขอบที่ 3.5 วัน) ให้ตรงกับแท่งชั่วโมงเรียน/สัปดาห์
export const snapToMonday = (ms: number): ISODate => {
  const monday = ms - ((new Date(ms).getUTCDay() + 6) % 7) * MS - ms % MS
  return isoOf(ms - monday >= 3.5 * MS ? monday + 7 * MS : monday)
}

// งบปฏิทิน: วันพิเศษ > ช่วงปิดเทอม > วันธรรมดา/เสาร์-อาทิตย์
const calendarHoursForDay = (calendar: StudyCalendar, iso: ISODate) => {
  const specialDay = calendar.specialDays.find(day => day.date === iso)
  if (specialDay) return specialDay.hours
  const schoolBreak = calendar.breaks.find(period => period.start <= iso && iso <= period.end)
  if (schoolBreak) return schoolBreak.hours
  return [0, 6].includes(new Date(u(iso)).getUTCDay()) ? calendar.weekendHours : calendar.weekdayHours
}

export const calendarBudgetForWeek = (calendar: StudyCalendar, monday: number) =>
  Array.from({ length: 7 }, (_, day) => calendarHoursForDay(calendar, isoOf(monday + day * MS))).reduce((sum, hours) => sum + hours, 0)
