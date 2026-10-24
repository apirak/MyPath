// PROTOTYPE — หน้ารายละเอียดคอร์ส แบบเดียวที่เหลือ (D ที่เจ้าของเลือก, 24 ต.ค. 69):
//   desktop ≥641px = แผงข้างขวา · มือถือ ≤640px = bottom sheet (สลับสดตาม viewport)
//   A/B/C + switcher ลบแล้ว — ดูผลการตัดสินที่ ai-knowledge/PAGES/MYPATH-COURSE-DETAIL-PROTOTYPE.md
// ข้อมูล: plan.ts (แผน/ชั่วโมง/วันที่/การซื้อ) + courseDetail.ts (แพ็ก/เล่ม/ExamGym — mirror SAMPLE_DATA)
// คลิกคอร์สบน /mypath และ /mypath/year → ตั้ง ?course=<รหัส> แล้ว overlay เปิดบนหน้าเดิม
import { useEffect, useState, type CSSProperties } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import HeaderButton from '../components/HeaderButton'
import { subjects, fmtDate, type Course, type Subject } from './plan'
import { getCourseDetail, prices, covers, ONDEMAND_URL, EXAMGYM_SYSTEMS } from './courseDetail'
import './CourseDetailPrototype.css'

/* ---------- helpers ที่ใช้ร่วม ---------- */

export type CourseRef = { subject: Subject; course: Course }
export const TODAY = '2026-12-05' // วันอ้างอิง mock — สอดคล้อง GLOSSARY "วันนี้"

export const findCourse = (id: string): CourseRef | undefined => {
  for (const subject of subjects) {
    const course = subject.courses.find(c => c.id === id)
    if (course) return { subject, course }
  }
  return undefined
}

export const statusOf = (c: Course): { label: string; key: 'now' | 'next' | 'done' } =>
  c.start <= TODAY && TODAY <= c.end ? { label: 'กำลังเรียน', key: 'now' }
    : c.end < TODAY ? { label: 'จบแล้ว', key: 'done' }
      : { label: 'ถัดไป', key: 'next' }

const fmtBaht = (n: number) => `฿${n.toLocaleString('th-TH')}`

function StatusPill({ course }: { course: Course }) {
  const s = statusOf(course)
  return <i className={`cdp-status ${s.key}`}>{s.label}</i>
}

function OwnBadge({ course }: { course: Course }) {
  return <i className={`cdp-own${course.owned ? '' : ' no'}`}>{course.owned ? 'ซื้อแล้ว' : 'ยังไม่ได้ซื้อ'}</i>
}

// ช่อง CTA ใต้ cover: ซื้อแล้ว = ปุ่มเริ่มเรียน · ยังไม่ซื้อ = ปุ่มหาซื้อ + ราคา
// ทุกปุ่มใช้ HeaderButton ตัวเดียวกับหน้า Profile (mock: ทั้งสองพาไปหน้าคอร์สบน OnDemand)
function CtaUnderCover({ course }: { course: Course }) {
  const price = prices[course.id]
  const go = () => window.open(ONDEMAND_URL, '_blank', 'noreferrer')
  if (course.owned) return <HeaderButton variant="primary" className="cdp-wide" onClick={go}>เริ่มเรียน</HeaderButton>
  return (
    <div className="cdp-buy">
      <HeaderButton className="cdp-wide" onClick={go}>หาซื้อบน OnDemand</HeaderButton>
      {price && <p>{fmtBaht(price.now)}{price.was ? ` <s>${fmtBaht(price.was)}</s>` : ''}</p>}
    </div>
  )
}

const CloseButton = ({ onClose }: { onClose: () => void }) =>
  <HeaderButton className="header-button--icon" aria-label="ปิด" onClick={onClose}><X size={20} /></HeaderButton>

/* ---------- มือถือ ≤640px: bottom sheet ---------- */

function SheetMobile({ ref: cr, onClose }: { ref: CourseRef; onClose: () => void }) {
  const { subject, course } = cr
  const d = getCourseDetail(course.id)
  const cover = covers[course.id]
  return (
    <div className="cdp-a">
      <div className="cdp-backdrop" onClick={onClose} />
      <section className="cdp-sheet" style={{ '--subject': subject.color } as CSSProperties}>
        <header>
          <i className="cdp-grab" aria-hidden="true" />
          <div className="cdp-sheet-top">
            <b><i className="dot" />{subject.name} · {course.short}</b>
            <CloseButton onClose={onClose} />
          </div>
          <div className="cdp-meta">
            <StatusPill course={course} />
            <span>{course.hours} ชม.</span>
            <span>แผน {fmtDate(course.start)} – {fmtDate(course.end)}</span>
          </div>
        </header>
        {cover && <img className="cdp-cover" src={cover} alt="" />}
        <div className="cdp-cta"><CtaUnderCover course={course} /></div>
        <div className="cdp-sheet-body">
          {d?.volume && <>
            <h4>หัวข้อในเล่ม{d.volume.title ? ` · ${d.volume.title}` : ''}</h4>
            <div className="cdp-chips">{d.volume.chapters.map(t => <i key={t}>{t}</i>)}</div>
            {d.volume.eggspaceStart && <p className="cdp-egg">พร้อมเรียน (eggspace) ตั้งแต่ {d.volume.eggspaceStart}</p>}
          </>}
          {d?.examgym && <>
            <h4>{d.examgym.slogan}</h4>
            <p className="cdp-pain">{d.examgym.painPoint}</p>
            <div className="cdp-chips">{EXAMGYM_SYSTEMS.map(s => <i key={s.name}>{s.name}</i>)}</div>
            <ul className="cdp-bullets">{d.examgym.sellingPoints.map(t => <li key={t}>{t}</li>)}</ul>
          </>}
          {!d && <p className="cdp-empty">ยังไม่มีรายละเอียดเนื้อหาสำหรับคอร์สนี้ — แสดงเฉพาะข้อมูลจากแผน</p>}
          {d?.pack && <>
            <h4>แพ็ก {d.pack.name}</h4>
            <ul className="cdp-bullets">
              <li>ครูผู้สอน: {d.pack.teacher}</li>
              {d.pack.privileges.map(t => <li key={t}>{t}</li>)}
            </ul>
          </>}
        </div>
        <footer><OwnBadge course={course} /></footer>
      </section>
    </div>
  )
}

/* ---------- เดสก์ท็อป ≥641px: แผงข้างขวา ---------- */

function DrawerDesktop({ ref: cr, onClose }: { ref: CourseRef; onClose: () => void }) {
  const { subject, course } = cr
  const d = getCourseDetail(course.id)
  const cover = covers[course.id]
  return (
    <div className="cdp-c">
      <div className="cdp-backdrop" onClick={onClose} />
      <aside className="cdp-drawer" style={{ '--subject': subject.color } as CSSProperties}>
        <header>
          <div>
            <b><i className="dot" />{subject.name}</b>
            <h3>{course.name}</h3>
          </div>
          <CloseButton onClose={onClose} />
        </header>
        {cover && <img className="cdp-cover" src={cover} alt="" />}
        <div className="cdp-cta"><CtaUnderCover course={course} /></div>
        <details open>
          <summary>แผนของน้อง</summary>
          <dl className="cdp-dl">
            <div><dt>สถานะ</dt><dd><StatusPill course={course} /></dd></div>
            <div><dt>การซื้อ</dt><dd><OwnBadge course={course} /></dd></div>
            <div><dt>ชั่วโมง</dt><dd>{course.hours} ชม.</dd></div>
            <div><dt>ช่วงเวลา</dt><dd>{fmtDate(course.start)} – {fmtDate(course.end)}</dd></div>
          </dl>
        </details>
        <details open>
          <summary>เนื้อหาคอร์ส</summary>
          {d?.volume && <>
            <p className="cdp-egg">{d.volume.title ? `${d.volume.title} · ` : ''}พร้อมเรียนตั้งแต่ {d.volume.eggspaceStart}</p>
            <ol className="cdp-numbered compact">{d.volume.chapters.map(t => <li key={t}>{t}</li>)}</ol>
            <p className="cdp-egg">แพ็ก: {d.pack?.name} · ครู {d.pack?.teacher}</p>
          </>}
          {d?.examgym && <>
            <p className="cdp-pain">{d.examgym.painPoint}</p>
            <div className="cdp-systems">{EXAMGYM_SYSTEMS.map(x => <div key={x.name}><b>{x.name}</b></div>)}</div>
          </>}
          {!d && <p className="cdp-empty">ยังไม่มีรายละเอียดเนื้อหา — แสดงเฉพาะข้อมูลจากแผน</p>}
        </details>
      </aside>
    </div>
  )
}

/* ---------- เจ้าภาพกลาง ---------- */

const useIsMobile = () => {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const fn = () => setMobile(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return mobile
}

function ResponsiveDetail({ ref: cr, onClose }: { ref: CourseRef; onClose: () => void }) {
  return useIsMobile() ? <SheetMobile ref={cr} onClose={onClose} /> : <DrawerDesktop ref={cr} onClose={onClose} />
}

// ใช้ในหน้าแผน: คืนฟังก์ชันคลิกที่ตั้ง ?course= ให้ overlay เปิดบนหน้าเดิม
export function useOpenCourse() {
  const navigate = useNavigate()
  const loc = useLocation()
  return (id: string) => {
    const p = new URLSearchParams(loc.search); p.set('course', id)
    navigate({ pathname: loc.pathname, search: `?${p}` })
  }
}

export function CourseDetailOverlay() {
  const [sp, setSp] = useSearchParams()
  const id = sp.get('course')
  const cr = id ? findCourse(id) : undefined
  const close = () => { sp.delete('course'); setSp(sp) }
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  })
  if (!cr) return null
  return <ResponsiveDetail ref={cr} onClose={close} />
}
