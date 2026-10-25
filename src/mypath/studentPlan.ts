// ตารางเฉพาะนักเรียนคนนี้: ไม่มีรายละเอียด catalog ซ้ำ และไม่มี start/end ที่ค้างจาก mock เดิม
export type StudyCalendar = {
  weekdayHours: number
  weekendHours: number
  specialDays: { date: string; hours: number }[]
  breaks: { id: number; start: string; end: string; hours: number }[]
}
export type StudentCourse = {
  courseId: string
  owned?: boolean
  startDate?: string
  followPrevious?: boolean
  weeklyHours?: number
}

// ค่าเริ่มต้นแบบโรงเรียนไทย แก้ได้ภายหลังจากหน้าปฏิทินการเรียน
export const studyCalendar: StudyCalendar = {
  weekdayHours: 1,
  weekendHours: 3,
  specialDays: [{ date: '2026-12-12', hours: 5 }],
  breaks: [{ id: 1, start: '2026-12-21', end: '2027-01-03', hours: 0 }],
}

export const studentCourses: StudentCourse[] = [
  { courseId: 'TPAT3.1', owned: true, startDate: '2026-10-01' },
  { courseId: 'TPAT3.2', startDate: '2027-12-01' },
  { courseId: 'MATH.1', owned: true, startDate: '2026-09-28' },
  ...['MATH.2', 'MATH.3', 'MATH.4', 'MATH.5', 'MATH.EX'].map(courseId => ({ courseId })),
  { courseId: 'MATH.UP', startDate: '2027-12-01' },
  { courseId: 'PHY.0', owned: true, startDate: '2026-10-01' },
  ...['PHY.1', 'PHY.2', 'PHY.3', 'PHY.4', 'PHY.5', 'PHY.6', 'PHY.7'].map(courseId => ({ courseId, owned: ['PHY.1', 'PHY.2', 'PHY.3', 'PHY.4'].includes(courseId) })),
  { courseId: 'PHY.EX', startDate: '2027-12-01' },
  { courseId: 'TGAT.1', startDate: '2027-08-01' },
  { courseId: 'CHEM.1', startDate: '2026-12-01' },
  ...['CHEM.2', 'CHEM.3', 'CHEM.5'].map(courseId => ({ courseId })),
  { courseId: 'CHEM.4', startDate: '2027-08-01' },
  { courseId: 'CHEM.EX', startDate: '2027-12-01' },
]
