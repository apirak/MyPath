// ไอคอนเป็น SVG ของ SDK เอง (SDK ไม่มี dependency นอกจาก react) — path เดียวกับ lucide-react ที่ prototype ใช้
import type { SVGProps } from 'react'

const Icon = ({ size = 24, children, ...props }: SVGProps<SVGSVGElement> & { size?: number }) =>
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>

export const ChevronLeft = () => <Icon><path d="m15 18-6-6 6-6" /></Icon>
export const ChevronRight = () => <Icon><path d="m9 18 6-6-6-6" /></Icon>
export const ArrowRight = ({ size }: { size?: number }) => <Icon size={size}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></Icon>
export const X = ({ size }: { size?: number }) => <Icon size={size} strokeWidth={2.5}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Icon>
