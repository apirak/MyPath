// สัญญาข้อมูลของ <MyPath> — ตามหัวข้อ "สัญญาข้อมูล" ใน docs/mypath-sdk-plan.md
// ทุกตัวอักษร
export type ISODate = string // 'YYYY-MM-DD' วันในปฏิทินตามเวลาไทย

export type MyPathProps = {
  data: MyPathData
  today?: ISODate // ไม่ส่ง = วันตามเวลาไทยจากนาฬิกาเครื่อง
  onPlanChange: (plan: StudentPlan) => void // แผนทั้งก้อน
  onBuyCourse: (courseId: string) => void
  onStartCourse: (courseId: string) => void
  view?: MyPathView // ไม่ส่ง = SDK เก็บเอง (ดู View state และ deep link)
  onViewChange?: (view: MyPathView) => void
}

// month = 'YYYY-MM'
export type MyPathView = { mode: 'month' | 'all'; month: string }

export type MyPathData = {
  catalog: SubjectGroup[] // ลำดับใน array = ลำดับที่แสดง
  plan: StudentPlan
  events: ExamEvent[] // เฉพาะที่เกี่ยวกับนักเรียนคนนี้
  owned: string[] // id ของคอร์สและ Mock ที่ซื้อแล้ว
  progress: Record<string, number> // courseId → 0–100
  // courseId → บาท จำนวนเต็ม
  prices: Record<string, { now: number; was?: number }>
  packs: Record<string, PackInfo> // packId → แพ็ก
  // courseId → รายละเอียด (ไม่มี = คอร์สไม่มีรายละเอียด)
  courseDetails: Record<string, CourseDetail>
}

// --- catalog ---
export type SubjectGroup = { name: string; subjects: CatalogSubject[] }
export type CatalogSubject = {
  id: string
  name: string
  color: string
  courses: CourseCatalogItem[]
} // courses เรียงตามลำดับเล่ม
export type CourseCatalogItem = {
  id: string
  name: string
  short: string
  abbr: string
  hours: number
  cover?: string
}

// --- แผนเรียน (สิ่งที่นักเรียนแก้ได้ และสิ่งเดียวที่ SDK ส่งกลับ) ---
export type StudentPlan = { calendar: StudyCalendar; courses: StudentCourse[] }
export type StudyCalendar = {
  weekdayHours: number
  weekendHours: number
  specialDays: { date: ISODate; hours: number }[]
  breaks: { id: number; start: ISODate; end: ISODate; hours: number }[]
  subjects: string[] // id ของวิชาที่เรียน
}
export type StudentCourse = {
  courseId: string
  startDate?: ISODate
  followPrevious?: boolean
  weeklyHours?: number // 1–10, ไม่มี = 5
  followPreviousWeeklyHours?: boolean
}

// --- วันสอบ ---
export type ExamEvent = {
  id: string
  date: ISODate
  label: string
  kind: 'exam' | 'mock'
}

// --- รายละเอียดคอร์ส ---
export type CourseDetail = {
  packId?: string
  volume?: Volume
  examgym?: ExamGymInfo
}
export type PackInfo = { name: string; teacher: string }
export type Volume = { chapters: string[] }
export type ExamGymInfo = { slogan: string }
