import { ChevronLeft, ChevronRight } from './icons'

type PathHeaderProps = {
  monthLabel: string
  now?: boolean // เดือนนี้คือเดือนของวันนี้ — ไฮไลต์ตัวหนังสือ
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
}

// port จาก src/prototype/components/PathHeader.tsx
// ใบนี้มีแค่ Month: ปุ่ม All ซ่อนแบบ visibility เพื่อให้ segment กว้างเท่า prototype (ใบ 05 เปิด), ปุ่มปฏิทินการเรียนยังไม่ render (ใบ 08)
export default function PathHeader({ monthLabel, now = false, canPrev, canNext, onPrev, onNext }: PathHeaderProps) {
  return <header className="mp-header">
    <div className="mp-tabs" data-active="month">
      <button type="button" className="mp-active">Month</button>
      <button type="button" style={{ visibility: 'hidden' }} tabIndex={-1}>All</button>
    </div>
    <div className="mp-month-picker">
      <button type="button" aria-label="Previous month" onClick={onPrev} disabled={!canPrev}><ChevronLeft /></button>
      <b className={now ? 'mp-now' : ''}>{monthLabel}</b>
      <button type="button" aria-label="Next month" onClick={onNext} disabled={!canNext}><ChevronRight /></button>
    </div>
  </header>
}
