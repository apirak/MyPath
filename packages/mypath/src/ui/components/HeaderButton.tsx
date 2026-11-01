import type { ButtonHTMLAttributes } from 'react'

export type HeaderButtonVariant = 'secondary' | 'primary'

// Two-layer push button: the solid edge stays put while the face moves.
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
