import type { ButtonHTMLAttributes } from 'react'
import './HeaderButton.css'

export type HeaderButtonVariant = 'secondary' | 'primary'

// ปุ่ม 3 ชั้นแบบ pushable (joshwcomeau.com/animation/3d-button) — เงา/ขอบอยู่กับที่
// หน้าปุ่มเป็นชั้นคู่กันเลื่อนขึ้นลงอิสระ แอนิเมชันทั้งหมดเป็น transform ล้วน
export default function HeaderButton({ variant = 'secondary', className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: HeaderButtonVariant }) {
  return (
    <button className={`header-button header-button--${variant} ${className}`.trim()} {...props}>
      <span className="header-button__shadow" aria-hidden="true" />
      <span className="header-button__edge" aria-hidden="true" />
      <span className="header-button__front">{children}</span>
    </button>
  )
}
