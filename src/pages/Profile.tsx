import { ArrowRight, BookDown, CircleHelp, MessageSquareWarning, Shirt, Share2, Settings, Sparkles, Star, TicketCheck } from 'lucide-react'
import oeLogo from '../assets/profile/oe-logo.png'
import igniteLogo from '../assets/profile/ignite-logo.png'
import assembledAvatar from '../assets/profile/assembled.png'
import HeaderButton from '../components/HeaderButton'
import BottomNav from '../components/BottomNav'

function Avatar() { return <div className="profile-avatar"><img src={assembledAvatar} alt="" /></div> }

const menu = [
  [BookDown, 'Online Solution', '(เฉลยละเอียด โหลดได้ทุกเมื่อ)'],
  [MessageSquareWarning, 'รายงานปัญหา', ''],
  [TicketCheck, 'ให้คะแนนเรา', ''],
  [CircleHelp, 'ช่องทางติดต่อ', ''],
] as const

export default function Profile() {
  return <main className="profile-page">
    <section className="profile-hero"><div className="profile-tools"><HeaderButton aria-label="แชร์"><Share2 size={20} /></HeaderButton><span><Star size={18} fill="#ffbf32" color="#ffbf32" />100</span><span><Sparkles size={18} fill="#ff9db0" color="#ff9db0" />1</span><HeaderButton aria-label="เสื้อผ้า"><Shirt size={20} /></HeaderButton></div><Avatar /></section>
    <section className="profile-body"><div className="profile-heading"><div><h1>[Name]</h1><p><img src={oeLogo} alt="" /><img src={igniteLogo} alt="" />Logged in with Ondemand / Ignite</p></div><HeaderButton className="header-button--icon" aria-label="ตั้งค่า"><Settings size={20} /></HeaderButton></div><div className="profile-menu">{menu.map(([Icon, title, detail]) => <HeaderButton key={title}><span><Icon size={20} /><b>{title}</b>{detail && <small>{detail}</small>}</span><ArrowRight size={20} /></HeaderButton>)}</div></section>
    <BottomNav active="profile" />
  </main>
}
