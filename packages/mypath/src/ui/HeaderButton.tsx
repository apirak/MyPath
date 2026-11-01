import type { ButtonHTMLAttributes } from 'react'

export type HeaderButtonVariant = 'secondary' | 'primary'

// copy จาก src/prototype/components/HeaderButton.tsx (class เปลี่ยนเป็น mp-) —
// ปุ่มดันได้ 2 ชั้น ขอบทึบอยู่กับที่ หน้าปุ่มเลื่อนขึ้นลง
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
      type="button"
      className={(
        `mp-header-button mp-header-button--${variant} ` + className
      ).trim()}
      {...props}
    >
      <span className="mp-header-button__edge" aria-hidden="true" />
      <span className="mp-header-button__front">{children}</span>
    </button>
  )
}
