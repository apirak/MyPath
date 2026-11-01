import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

// พฤติกรรม modal ที่หน้ารายละเอียดคอร์สและแผงปฏิทินการเรียนใช้ร่วมกัน:
// ย้ายโฟกัสเข้าตอนเปิด/คืนตอนปิด, วน Tab อยู่ข้างใน, Esc ปิด, และปิดหลัง animation 280ms
export function useModal<T extends HTMLElement>(onClose: () => void) {
  const [closing, setClosing] = useState(false)
  const ref = useRef<T>(null)
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    ref.current?.focus()
    return () => opener?.focus()
  }, [])
  const trapTab = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return
    const items = ref.current!.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])')
    const first = items[0], last = items[items.length - 1], active = document.activeElement
    if (event.shiftKey ? active === first || active === ref.current : active === last) {
      event.preventDefault()
      ;(event.shiftKey ? last : first).focus()
    }
  }
  const close = () => {
    if (closing) return
    setClosing(true)
    window.setTimeout(onClose, 280)
  }
  useEffect(() => {
    const esc = (event: globalThis.KeyboardEvent) => { if (event.key === 'Escape') close() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  })
  return { ref, closing, close, trapTab }
}
