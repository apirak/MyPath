import HeaderButton from './HeaderButton'
import { ArrowRight } from './icons'
import cap from '../assets/graduate-cap.png'

// copy จาก src/prototype/mypath/PlanEmptyState.tsx —
// ยังไม่ได้เลือกวิชาที่เรียน: ใช้แทนรายการ Month
// ลูกศรลายดินสอ "วางแผนด้วยตนเอง" ชี้ขึ้นไปที่ปุ่มปฏิทินการเรียน (มุมขวาบนของ
// PathHeader)
// แบนเนอร์ตาม Figma "MyPath / Header" (69:19093) — ระบบช่วยวางแผนยังไม่มี
// ปุ่มจึงยังไม่ทำอะไร
export default function PlanEmptyState() {
  return (
    <section className="mp-pes">
      <div className="mp-pes-hint">
        <b>วางแผนด้วยตนเอง</b>
        <svg viewBox="0 0 96 72" aria-hidden="true">
          <path d="M6 64c18 3 44-2 60-18 9-9 13-22 14-38" />
          <path d="M68 17c4-4 8-9 12-12 2 5 5 10 8 13" />
        </svg>
      </div>
      <div className="mp-pes-banners">
        <div className="mp-pes-banner">
          <h2>วางแผนการเรียนผ่านคณะที่เลือก</h2>
          <p>
            เลือกคณะเป้าหมาย และ มหาวิทยาลัยที่ชอบ จากนั้นพี่ไข่จะช่วยวางแผนให้
          </p>
          <div className="mp-pes-cta">
            <img src={cap} alt="" width="48" height="48" />
            <HeaderButton className="mp-header-button--plain" title="เร็วๆ นี้">
              วางแผนการเรียน กับพี่ไข่ <ArrowRight size={20} />
            </HeaderButton>
          </div>
        </div>
      </div>
    </section>
  )
}
