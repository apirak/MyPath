// ไอคอนเป็น SVG ของ SDK เอง (SDK ไม่มี dependency นอกจาก react) — path เดียวกับ lucide-react ที่ prototype ใช้
import type { SVGProps } from 'react'

const Icon = ({ size = 24, children, ...props }: SVGProps<SVGSVGElement> & { size?: number }) =>
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>

export const ChevronLeft = () => <Icon><path d="m15 18-6-6 6-6" /></Icon>
export const ChevronRight = () => <Icon><path d="m9 18 6-6-6-6" /></Icon>
export const ArrowRight = ({ size }: { size?: number }) => <Icon size={size}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></Icon>
export const X = ({ size, strokeWidth = 2.5 }: { size?: number; strokeWidth?: number }) => <Icon size={size} strokeWidth={strokeWidth}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Icon>
export const CalendarDays = ({ size }: { size?: number }) => <Icon size={size}><path d="M8 2v3" /><path d="M16 2v3" /><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M8 13h.01" /><path d="M12 13h.01" /><path d="M16 13h.01" /><path d="M8 17h.01" /><path d="M12 17h.01" /><path d="M16 17h.01" /></Icon>
export const Plus = ({ size }: { size?: number }) => <Icon size={size}><path d="M5 12h14" /><path d="M12 5v14" /></Icon>
export const Trash2 = ({ size }: { size?: number }) => <Icon size={size}><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Icon>
