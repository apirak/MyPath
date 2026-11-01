import type { MyPathView } from '../types'
import { ChevronLeft, ChevronRight } from './icons'

export type ModeProps = {
  onModeChange: (mode: MyPathView['mode']) => void
  slide: boolean // สลับแท็บมาแล้ว — เลื่อน pill ตอน mount (ไม่เลื่อนตอนเปิดหน้าครั้งแรก)
}

type PathHeaderProps = ModeProps & {
  mode: MyPathView['mode']
  period: string
  now?: boolean // period นี้คือเดือนของวันนี้ — ไฮไลต์ตัวหนังสือ
  showNavigation?: boolean
  canPrev?: boolean
  canNext?: boolean
  onPrev?: () => void
  onNext?: () => void
}

// port จาก src/prototype/components/PathHeader.tsx — Month/All สลับ state ภายในแทน <Link>
// ปุ่มปฏิทินการเรียนยังไม่ render (ใบ 08)
export default function PathHeader({ mode, onModeChange, slide, period, now = false, showNavigation = true, canPrev = false, canNext = false, onPrev, onNext }: PathHeaderProps) {
  const tab = (to: MyPathView['mode'], label: string) => mode === to
    ? <button type="button" className="mp-active" aria-pressed="true">{label}</button>
    : <button type="button" aria-pressed="false" onClick={() => onModeChange(to)}>{label}</button>
  return <header className="mp-header">
    <div className={slide ? 'mp-tabs mp-slide' : 'mp-tabs'} data-active={mode}>{tab('month', 'Month')}{tab('all', 'All')}</div>
    <div className="mp-month-picker">
      {showNavigation && <button type="button" aria-label="Previous month" onClick={onPrev} disabled={!canPrev}><ChevronLeft /></button>}
      <b className={now ? 'mp-now' : ''}>{period}</b>
      {showNavigation && <button type="button" aria-label="Next month" onClick={onNext} disabled={!canNext}><ChevronRight /></button>}
    </div>
  </header>
}
