import type { ButtonHTMLAttributes } from 'react'
import './HeaderButton.css'

export type HeaderButtonVariant = 'secondary' | 'primary'

// Two-layer pushable button: the solid edge stays put while the front moves
// over it. Animation is transform-only; a blurred shadow was dropped because
// it made the button look fuzzy (verdict on branch prototype/button-shadow).
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
