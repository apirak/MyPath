import { useEffect, useRef, useState } from 'react'

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
  const close = () => {
    if (closing) return
    setClosing(true)
    window.setTimeout(onClose, 280)
  }
  // ฟังที่ window: ปุ่มที่โฟกัสอยู่หายไป (เช่น ลบช่วงปิดเทอม) โฟกัสตกไปที่ body แต่ Tab ถัดไปยังดึงกลับเข้ามา
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') return close()
      if (event.key !== 'Tab' || !ref.current) return
      const items = ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])')
      const first = items[0], last = items[items.length - 1], active = document.activeElement
      if (!ref.current.contains(active) || (event.shiftKey ? active === first || active === ref.current : active === last)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })
  return { ref, closing, close }
}
