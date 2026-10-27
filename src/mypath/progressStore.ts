import { useSyncExternalStore } from 'react'
import { TODAY, u, isoOf, subjects } from './plan'

// ความคืบหน้าการเรียนรายคอร์ส (mock, in-memory — reload แล้วกลับค่าตั้งต้น)
// Figma 3-37233 เขียนเป็น pack course แต่เราวัดทีละคอร์ส · เป้า 1 = 30% (ธง) · เป้า 2 = 70% (ถ้วย)
// กำหนดวันของแต่ละเป้า = start + 30% / 70% ของช่วงคอร์สในแผน
export const GOALS = [30, 70] as const

// ค่าตั้งต้นต่างกันต่อคอร์ส เพื่อให้เห็นหลายสถานะในหน้าเดียว
const SEED = [10, 0, 30, 50, 70, 100, 20]
const seedOf = (id: string) => SEED[[...id].reduce((s, c) => s + c.charCodeAt(0), 0) % SEED.length]

let progress = new Map<string, number>()
let simToday = TODAY
let version = 0
const listeners = new Set<() => void>()
const emit = () => { version += 1; listeners.forEach(listener => listener()) }
const subscribe = (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener) }
export const useProgressVersion = () => useSyncExternalStore(subscribe, () => version, () => version)

export const progressOf = (id: string) => progress.get(id) ?? seedOf(id)
export const setProgress = (id: string, value: number) => { progress.set(id, Math.max(0, Math.min(100, value))); emit() }
export const resetProgress = () => { progress = new Map(); emit() }
export const getSimToday = () => simToday
export const setSimToday = (iso: string) => { simToday = iso; emit() }
export const ownedCourses = () => subjects.flatMap(s => s.courses.filter(c => c.owned).map(c => ({ ...c, subject: s.name })))

export type ProgressMessage = { text: string; date?: string; tone: 'muted' | 'normal' | 'success'; egg?: boolean }
export type ProgressState = {
  value: number
  next?: number // เป้าถัดไป → แถบฟ้าอ่อนจาก value ถึงตรงนี้
  passed: [boolean, boolean] // ผ่านธง / ถ้วยแล้ว
  message: ProgressMessage
}

// กติกาตาม Figma 3-37233 (ลำดับการเปลี่ยนของแต่ละ step)
export function progressState(course: { id: string; start: string; end: string }, today = simToday): ProgressState {
  const value = progressOf(course.id)
  const span = u(course.end) - u(course.start)
  const goalDate = (pct: number) => isoOf(u(course.start) + Math.round(span * pct / 100 / 86_400_000) * 86_400_000)
  const [g1, g2] = GOALS.map(goalDate)
  const passed: [boolean, boolean] = [value >= GOALS[0], value >= GOALS[1]]
  if (value === 0) return { value, next: GOALS[0], passed, message: { text: 'ยังไม่เริ่มเรียน', tone: 'muted' } }
  if (value < GOALS[0]) return u(today) <= u(g1)
    ? { value, next: GOALS[0], passed, message: { text: 'พิชิตเป้าหมายแรกภายใน', date: g1, tone: 'normal' } }
    : { value, next: GOALS[0], passed, message: { text: 'ทำได้ดีแล้ว มาพยายามไปด้วยกันนะ', tone: 'normal', egg: true } }
  if (value < GOALS[1]) return u(today) <= u(g2)
    ? { value, next: GOALS[1], passed, message: { text: 'เก่งมาก! พิชิตเป้าหมายถัดไปภายใน', date: g2, tone: 'normal' } }
    : { value, next: GOALS[1], passed, message: { text: 'ใกล้สำเร็จแล้ว มาพิชิตเป้าหมายกันเถอะ', tone: 'normal', egg: true } }
  if (value < 100) return { value, passed, message: { text: 'ทำได้ดีมาก! พิชิตทุกเป้าหมายแล้ว', tone: 'success', egg: true } }
  return { value, passed, message: { text: 'ยินดีด้วย! เรียนจบแล้ว', tone: 'success', egg: true } }
}
