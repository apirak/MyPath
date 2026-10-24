import type { ButtonHTMLAttributes } from 'react'
import './HeaderButton.css'

export default function HeaderButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`header-button ${className}`.trim()} {...props} />
}
