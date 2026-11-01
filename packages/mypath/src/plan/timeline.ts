// ฟังก์ชันล้วนของหน้า All — copy สูตรจาก src/prototype/pages/MyPathAllTimeline.tsx (dragStart) และ src/prototype/mypath/plan.ts
import type { ISODate, StudentCourse, StudentPlan, StudyCalendar } from '../types'
import { MS, isoOf, u } from './dates'

// แผนใหม่ที่คอร์สนั้นแก้ตาม patch (แทน setCourse* ของ prototype ที่แก้ของเดิม)
// คอร์สที่ไม่มีในแผน: คืน object เดิม เหมือน prototype (ผู้เรียกเทียบ !== เพื่อรู้ว่าเปลี่ยนจริง)
export const withCourse = (plan: StudentPlan, courseId: string, patch: Partial<StudentCourse>): StudentPlan =>
  plan.courses.some(c => c.courseId === courseId)
    ? { ...plan, courses: plan.courses.map(c => c.courseId === courseId ? { ...c, ...patch } : c) }
    : plan

export const withCourseStartDate = (plan: StudentPlan, courseId: string, startDate: ISODate) => withCourse(plan, courseId, { startDate })

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
