// helper วันที่ day-exact (copy จาก src/prototype/mypath/plan.ts) — ทำงานบน UTC กันเรื่อง DST
import type { ISODate } from '../types'

export const MS = 86_400_000
export const u = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) }
export const isoOf = (ms: number) => new Date(ms).toISOString().slice(0, 10)
export const addDays = (iso: string, n: number) => isoOf(u(iso) + n * MS)
// วันที่ผิดรูปถือว่าไม่มีค่านั้น (สัญญาข้อมูล "ข้อมูลไม่ครบหรือผิด")
export const isISODate = (iso?: string): iso is ISODate => !!iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(u(iso))
// "วันนี้" ตามเวลาไทยจากนาฬิกาเครื่อง เมื่อ host ไม่ส่ง today (en-CA = YYYY-MM-DD)
export const thaiToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date())

export const mn = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
export const be = (y: number) => String(y + 543).slice(2)
export const fmtDate = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${mn[m - 1]} ${be(y)}` }
export const fmtShort = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${mn[m - 1]}` }

const MONTHS_FULL = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
export const dayOf = (iso: string) => Number(iso.slice(8, 10))
export const monthShortOf = (iso: string) => mn[Number(iso.slice(5, 7)) - 1]
export const fmtMonth = (iso: string) => `${MONTHS_FULL[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(0, 4)) + 543}`
export const monthStartOf = (iso: string) => `${iso.slice(0, 7)}-01`
export const addMonths = (iso: string, n: number) => {
  const [y, m] = iso.split('-').map(Number)
  const t = y * 12 + (m - 1) + n
  return `${String(Math.floor(t / 12)).padStart(4, '0')}-${String((t % 12) + 1).padStart(2, '0')}-01`
}
