import type { ButtonHTMLAttributes } from 'react'
import './HeaderButton.css'

export type HeaderButtonVariant = 'secondary' | 'primary'

// ปุ่มดันได้ 2 ชั้น — ขอบทึบอยู่กับที่ หน้าปุ่ม (front)
// เลื่อนขึ้นลงเหนือขอบอิสระ
// แอนิเมชันทั้งหมดเป็น transform ล้วน (เงาเบลอถูกตัดออก — ทำปุ่มดูฟุ้ง, verdict
// บน branch prototype/button-shadow)
export default function HeaderButton({
  variant = 'secondary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: HeaderButtonVariant
}) {
  return (
    <button
      className={`header-button header-button--${variant} ${className}`.trim()}
      {...props}
    >
      <span className="header-button__edge" aria-hidden="true" />
      <span className="header-button__front">{children}</span>
    </button>
  )
}
