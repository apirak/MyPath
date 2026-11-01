import { BookOpen, CalendarDays, CircleUserRound, House } from 'lucide-react'

export type NavKey = 'home' | 'courses' | 'mypath' | 'profile'

const items: { key: NavKey; label: string; href: string; Icon: typeof House }[] = [
  { key: 'home', label: 'หน้าแรก', href: '/', Icon: House },
  { key: 'courses', label: 'คอร์ส', href: '/courses', Icon: BookOpen },
  { key: 'mypath', label: 'แผนเรียน', href: '/prototype/mypath', Icon: CalendarDays },
  { key: 'profile', label: 'โปรไฟล์', href: '/profile', Icon: CircleUserRound },
]

export default function BottomNav({ active }: { active: NavKey }) {
  return <nav className="bottom-nav">
    {items.map(({ key, label, href, Icon }) => (
      <a className={key === active ? 'active' : ''} href={href} key={key}><Icon size={24} /><span>{label}</span></a>
    ))}
  </nav>
}
