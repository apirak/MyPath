import { MS, isoOf, u } from './dates'

// Pure: takes the value (data.progress) and Today directly, no module state.
// Goal 1 = 30% (flag), goal 2 = 70% (trophy). Each goal is due at start +
// 30% / 70% of the course's planned span.
export const GOALS = [30, 70] as const

export type ProgressMessage = {
  text: string
  date?: string
  tone: 'muted' | 'normal' | 'success'
  egg?: boolean
}
export type ProgressState = {
  value: number
  next?: number // next goal: light-blue bar runs from value to here
  passed: [boolean, boolean] // flag / trophy reached
  message: ProgressMessage
}

// Rules per Figma 3-37233 (state transitions for each step).
export function progressState(
  course: { start: string; end: string },
  value: number,
  today: string,
): ProgressState {
  const span = u(course.end) - u(course.start)
  const goalDate = (pct: number) =>
    isoOf(u(course.start) + Math.round((span * pct) / 100 / MS) * MS)
  const [g1, g2] = GOALS.map(goalDate)
  const passed: [boolean, boolean] = [value >= GOALS[0], value >= GOALS[1]]
  if (value === 0)
    return {
      value,
      next: GOALS[0],
      passed,
      message: { text: 'ยังไม่เริ่มเรียน', tone: 'muted' },
    }
  if (value < GOALS[0])
    return u(today) <= u(g1)
      ? {
          value,
          next: GOALS[0],
          passed,
          message: { text: 'พิชิตเป้าหมายแรกภายใน', date: g1, tone: 'normal' },
        }
      : {
          value,
          next: GOALS[0],
          passed,
          message: {
            text: 'ทำได้ดีแล้ว มาพยายามไปด้วยกันนะ',
            tone: 'normal',
            egg: true,
          },
        }
  if (value < GOALS[1])
    return u(today) <= u(g2)
      ? {
          value,
          next: GOALS[1],
          passed,
          message: {
            text: 'เก่งมาก! พิชิตเป้าหมายถัดไปภายใน',
            date: g2,
            tone: 'normal',
          },
        }
      : {
          value,
          next: GOALS[1],
          passed,
          message: {
            text: 'ใกล้สำเร็จแล้ว มาพิชิตเป้าหมายกันเถอะ',
            tone: 'normal',
            egg: true,
          },
        }
  if (value < 100)
    return {
      value,
      passed,
      message: {
        text: 'ทำได้ดีมาก! พิชิตทุกเป้าหมายแล้ว',
        tone: 'success',
        egg: true,
      },
    }
  return {
    value,
    passed,
    message: { text: 'ยินดีด้วย! เรียนจบแล้ว', tone: 'success', egg: true },
  }
}
