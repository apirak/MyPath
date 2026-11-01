// The <MyPath> data contract. Must match the data contract section of
// docs/mypath-sdk-plan.md exactly.

// 'YYYY-MM-DD', a calendar day in Thai time (Asia/Bangkok). Malformed dates
// are treated as absent.
export type ISODate = string

export type MyPathProps = {
  data: MyPathData
  today?: ISODate // omitted = today in Thai time from the device clock
  onPlanChange: (plan: StudentPlan) => void // always the whole plan
  onBuyCourse: (courseId: string) => void
  onStartCourse: (courseId: string) => void
  // Omitted = the SDK keeps view state itself (docs/mypath-sdk-plan.md,
  // View state and deep link).
  view?: MyPathView
  onViewChange?: (view: MyPathView) => void
}

// month = 'YYYY-MM'
export type MyPathView = { mode: 'month' | 'all'; month: string }

export type MyPathData = {
  catalog: SubjectGroup[] // array order = display order
  plan: StudentPlan
  events: ExamEvent[] // only those relevant to this student
  owned: string[] // ids of purchased courses and Mocks
  progress: Record<string, number> // courseId → 0–100
  // courseId → whole THB
  prices: Record<string, { now: number; was?: number }>
  packs: Record<string, PackInfo> // packId → pack
  // courseId → detail (missing = a no-detail course)
  courseDetails: Record<string, CourseDetail>
}

// --- catalog ---
export type SubjectGroup = { name: string; subjects: CatalogSubject[] }
export type CatalogSubject = {
  id: string
  name: string
  color: string
  courses: CourseCatalogItem[]
} // courses in volume order
export type CourseCatalogItem = {
  id: string
  name: string
  short: string
  abbr: string
  hours: number
  cover?: string
}

// --- Student plan: what the student can edit, and all the SDK sends back ---
export type StudentPlan = { calendar: StudyCalendar; courses: StudentCourse[] }
export type StudyCalendar = {
  weekdayHours: number
  weekendHours: number
  specialDays: { date: ISODate; hours: number }[]
  breaks: { id: number; start: ISODate; end: ISODate; hours: number }[]
  subjects: string[] // ids of Enabled subjects
}
export type StudentCourse = {
  courseId: string
  startDate?: ISODate
  followPrevious?: boolean
  weeklyHours?: number // 1–10, missing = 5
  followPreviousWeeklyHours?: boolean
}

// --- exam dates ---
export type ExamEvent = {
  id: string
  date: ISODate
  label: string
  kind: 'exam' | 'mock'
}

// --- course detail ---
export type CourseDetail = {
  packId?: string
  volume?: Volume
  examgym?: ExamGymInfo
}
export type PackInfo = { name: string; teacher: string }
export type Volume = { chapters: string[] }
export type ExamGymInfo = { slogan: string }
