import { useEffect, useRef, useState } from 'react'

// Modal behaviour shared by the course detail and the study calendar panel:
// focus moves in on open and back to the opener on close, Tab is trapped,
// Esc closes, and onClose fires after the 280ms close animation.
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
  // Listen on window: when the focused button disappears (e.g. deleting a
  // School break) focus falls to body, and the next Tab must still pull it
  // back inside.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') return close()
      if (event.key !== 'Tab' || !ref.current) return
      const items = ref.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled])',
      )
      const first = items[0],
        last = items[items.length - 1],
        active = document.activeElement
      if (
        !ref.current.contains(active) ||
        (event.shiftKey
          ? active === first || active === ref.current
          : active === last)
      ) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })
  return { ref, closing, close }
}
