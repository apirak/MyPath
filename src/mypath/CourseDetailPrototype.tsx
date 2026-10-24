// PROTOTYPE (throwaway) — หน้ารายละเอียดคอร์ส 3  variants สลับดูได้ด้วย ?variant=A|B|C
//   A = ชีทรวดเร็ว (bottom sheet มือถือ / modal เดสก์ท็อป)
//   B = หน้าเต็ม (route /mypath/course/:id)
//   C = แผงข้าง (drawer ขวาเดสก์ท็อป / เต็มจอเลื่อนขึ้นมือถือ, แท็บ แผนของน้อง/เนื้อหา)
// ข้อมูล: plan.ts (แผน/ชั่วโมง/วันที่/การซื้อ) + courseDetail.ts (แพ็ก/เล่ม/ExamGym — mirror SAMPLE_DATA)
// คลิกคอร์สบน /mypath และ /mypath/year → variant A/C เปิดเป็น overlay (?course=), variant B ไป route
import { useEffect, type CSSProperties } from 'react'
import { useNavigate, useSearchParams, useParams, useLocation, Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { subjects, fmtDate, type Course, type Subject } from './plan'
import { getCourseDetail, prices, covers, ONDEMAND_URL, EGGSPACE_SYSTEMS, EGGSPACE_NOTES, EXAMGYM_SYSTEMS, EXAMGYM_AUDIENCE } from './courseDetail'
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

// คลิกคอร์สจากหน้าแผน — B ไปหน้าเต็ม, A/C ตั้ง ?course= ให้ overlay เปิดบนหน้าเดิม
export const openCourse = (navigate: ReturnType<typeof useNavigate>, pathname: string, search: string, id: string, variant: string) => {
  if (variant === 'B') { navigate(`/mypath/course/${id}?variant=B`); return }
  const p = new URLSearchParams(search); p.set('course', id)
  navigate({ pathname, search: `?${p}` })
}

// ใช้ในหน้าแผน: คืนฟังก์ชันคลิกที่อ่าน variant ปัจจุบันจาก URL ให้เอง
export function useOpenCourse() {
  const navigate = useNavigate()
  const loc = useLocation()
  const [sp] = useSearchParams()
  const variant = sp.get('variant') ?? 'A'
  return (id: string) => openCourse(navigate, loc.pathname, loc.search, id, variant)
}

function StatusPill({ course }: { course: Course }) {
  const s = statusOf(course)
  return <i className={`cdp-status ${s.key}`}>{s.label}</i>
}

function OwnBadge({ course }: { course: Course }) {
  return <i className={`cdp-own${course.owned ? '' : ' no'}`}>{course.owned ? 'ซื้อแล้ว' : 'ยังไม่ได้ซื้อ'}</i>
}

// ปุ่มหาซื้อ (คอร์สที่ยังไม่ได้ซื้อ) + ราคาถ้ามีใน courses.md
function BuyBox({ course, big = false }: { course: Course; big?: boolean }) {
  const price = prices[course.id]
  if (course.owned) return <p className="cdp-price owned">คอร์สนี้อยู่ในคลังของน้องแล้ว{price ? ` (${fmtBaht(price.now)})` : ''}</p>
  return (
    <div className={`cdp-buy${big ? ' big' : ''}`}>
      <a href={ONDEMAND_URL} target="_blank" rel="noreferrer">หาซื้อบน OnDemand ↗</a>
      {price && <p>{fmtBaht(price.now)}{price.was ? ` <s>${fmtBaht(price.was)}</s>` : ''}</p>}
    </div>
  )
}

/* ---------- Variant A — ชีทรวดเร็ว (sheet/modal) ---------- */

function SheetA({ ref: cr, onClose }: { ref: CourseRef; onClose: () => void }) {
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
            <button onClick={onClose} aria-label="ปิด">✕</button>
          </div>
          <div className="cdp-meta">
            <StatusPill course={course} />
            <span>{course.hours} ชม.</span>
            <span>แผน {fmtDate(course.start)} – {fmtDate(course.end)}</span>
          </div>
        </header>
        <div className="cdp-sheet-body">
          {cover && <img className="cdp-cover" src={cover} alt="" />}
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
        <footer><OwnBadge course={course} /><BuyBox course={course} /></footer>
      </section>
    </div>
  )
}

/* ---------- Variant B — หน้าเต็ม (route) ---------- */

function PageB({ cr, onBack }: { cr: CourseRef; onBack: () => void }) {
  const { subject, course } = cr
  const d = getCourseDetail(course.id)
  const s = statusOf(course)
  const cover = covers[course.id]
  return (
    <main className="cdp-page" style={{ '--subject': subject.color } as CSSProperties}>
      <div className="cdp-hero">
        <div className="cdp-hero-inner">
          <button onClick={onBack}>← กลับแผน</button>
          <div className="cdp-hero-copy">
            <p><i className="dot" />{subject.name}{d?.pack ? ` · แพ็ก ${d.pack.name}` : ''}{d?.examgym ? ' · ExamGym' : ''}</p>
            <h1>{course.name}</h1>
            <div className="cdp-meta">
              <StatusPill course={course} />
              <OwnBadge course={course} />
              <span>{course.hours} ชม.</span>
            </div>
          </div>
          {cover && <img className="cdp-cover hero" src={cover} alt="" />}
        </div>
      </div>
      <div className="cdp-page-body">
        <article>
          {d?.volume && <>
            <h3>เนื้อหาในเล่ม{d.volume.title ? ` · ${d.volume.title}` : ''}{d.volume.bookNo ? ` (เล่ม ${d.volume.bookNo})` : ''}</h3>
            <ol className="cdp-numbered">{d.volume.chapters.map(t => <li key={t}>{t}</li>)}</ol>
            {d.volume.eggspaceStart && <p className="cdp-egg">พร้อมเรียน (eggspace) ตั้งแต่ {d.volume.eggspaceStart} · แผนของน้องเริ่ม {fmtDate(course.start)}</p>}
            {d.pack && <>
              <h3>จุดเด่นของแพ็ก</h3>
              <ul className="cdp-bullets">{d.pack.highlights.map(t => <li key={t}>{t}</li>)}</ul>
              <h3>ระบบ Version eggspace</h3>
              <div className="cdp-systems">{EGGSPACE_SYSTEMS.map(x => <div key={x.name}><b>{x.name}</b><p>{x.desc}</p></div>)}</div>
            </>}
          </>}
          {d?.examgym && <>
            <h3>“{d.examgym.slogan}”</h3>
            <p className="cdp-pain">{d.examgym.painPoint}</p>
            <ul className="cdp-bullets">{d.examgym.sellingPoints.map(t => <li key={t}>{t}</li>)}</ul>
            <h3>4 ระบบของ ExamGym</h3>
            <div className="cdp-systems">{EXAMGYM_SYSTEMS.map(x => <div key={x.name}><b>{x.name}</b><p>{x.desc}</p></div>)}</div>
            <p className="cdp-egg">{EXAMGYM_AUDIENCE}</p>
            {d.examgym.notes && <ul className="cdp-bullets">{d.examgym.notes.map(t => <li key={t}>{t}</li>)}</ul>}
          </>}
          {!d && <p className="cdp-empty">ยังไม่มีรายละเอียดเนื้อหาสำหรับคอร์สนี้ — แสดงเฉพาะข้อมูลจากแผน</p>}
        </article>
        <aside>
          <div className="cdp-card plan">
            <h4>แผนของน้อง</h4>
            <dl>
              <div><dt>สถานะ</dt><dd><StatusPill course={course} /></dd></div>
              <div><dt>ชั่วโมง</dt><dd>{course.hours} ชม.</dd></div>
              <div><dt>เริ่มตามแผน</dt><dd>{fmtDate(course.start)}</dd></div>
              <div><dt>จบตามแผน</dt><dd>{fmtDate(course.end)}</dd></div>
              <div><dt>วิชา</dt><dd>{subject.name}</dd></div>
            </dl>
            <p className="cdp-hint">{s.key === 'now' ? 'เริ่มเรียนได้เลยตอนนี้' : s.key === 'next' ? 'ยังไม่ถึงคิวตามแผน' : 'เรียนจบไปแล้วตามแผน'}</p>
          </div>
          {d?.pack && <div className="cdp-card">
            <h4>แพ็ก {d.pack.name}</h4>
            <dl>
              <div><dt>ครูผู้สอน</dt><dd>{d.pack.teacher}</dd></div>
              <div><dt>หนังสือ</dt><dd>{d.pack.books}</dd></div>
              <div><dt>เหมาะสำหรับ</dt><dd>{d.pack.audience}</dd></div>
            </dl>
            {d.pack.privileges.length > 0 && <>
              <h5>สิทธิพิเศษ</h5>
              <ul className="cdp-bullets">{d.pack.privileges.map(t => <li key={t}>{t}</li>)}</ul>
            </>}
            <h5>หมายเหตุ</h5>
            <ul className="cdp-bullets">{[...(d.pack.notes ?? []), ...EGGSPACE_NOTES].map(t => <li key={t}>{t}</li>)}</ul>
          </div>}
          <div className="cdp-card buy"><BuyBox course={course} big /></div>
        </aside>
      </div>
      <BottomNav active="mypath" />
    </main>
  )
}

/* ---------- Variant C — แผงข้าง (drawer + แท็บ แผน/เนื้อหา) ---------- */

function DrawerC({ ref: cr, onClose }: { ref: CourseRef; onClose: () => void }) {
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
          <button onClick={onClose} aria-label="ปิด">✕</button>
        </header>
        {cover && <img className="cdp-cover" src={cover} alt="" />}
        <details open>
          <summary>แผนของน้อง</summary>
          <dl className="cdp-dl">
            <div><dt>สถานะ</dt><dd><StatusPill course={course} /></dd></div>
            <div><dt>การซื้อ</dt><dd><OwnBadge course={course} /></dd></div>
            <div><dt>ชั่วโมง</dt><dd>{course.hours} ชม.</dd></div>
            <div><dt>ช่วงเวลา</dt><dd>{fmtDate(course.start)} – {fmtDate(course.end)}</dd></div>
          </dl>
          <BuyBox course={course} />
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

/* ---------- เจ้าภาพกลาง: overlay บนหน้าแผน + หน้า route + switcher ---------- */

export function CourseDetailOverlay() {
  const [sp, setSp] = useSearchParams()
  const id = sp.get('course')
  const variant = sp.get('variant') ?? 'A'
  const cr = id ? findCourse(id) : undefined
  const close = () => { sp.delete('course'); setSp(sp) }
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  })
  if (!cr || variant === 'B') return null
  return variant === 'A' ? <SheetA ref={cr} onClose={close} /> : <DrawerC ref={cr} onClose={close} />
}

export function CourseDetailPage() {
  const { id = '' } = useParams()
  const [sp] = useSearchParams()
  const variant = sp.get('variant') ?? 'B'
  const navigate = useNavigate()
  const cr = findCourse(id)
  if (!cr) return <main className="cdp-page"><div className="cdp-page-body"><p className="cdp-empty">ไม่พบคอร์ส “{id}” — <Link to="/mypath/year">กลับแผนรายปี</Link></p></div><PrototypeSwitcher /></main>
  const back = () => navigate(-1)
  // บนหน้า route: B = หน้าเต็มตามดีไซน์ · A/C ยังคงสไตล์ของตัวเอง เพื่อให้สลับ variant แล้วเห็นผลทันที
  if (variant === 'A') return <main className="cdp-route-host"><SheetA ref={cr} onClose={back} /><PrototypeSwitcher /></main>
  if (variant === 'C') return <main className="cdp-route-host"><DrawerC ref={cr} onClose={back} /><PrototypeSwitcher /></main>
  return <><PageB cr={cr} onBack={back} /><PrototypeSwitcher /></>
}

const VARIANTS: { key: string; label: string }[] = [
  { key: 'A', label: 'A · ชีทรวดเร็ว' },
  { key: 'B', label: 'B · หน้าเต็ม' },
  { key: 'C', label: 'C · แผงข้าง' },
]

export function PrototypeSwitcher() {
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const loc = window.location
  const current = sp.get('variant') ?? 'A'
  const cycle = (dir: 1 | -1) => {
    const i = VARIANTS.findIndex(v => v.key === current)
    const next = VARIANTS[(i + dir + VARIANTS.length) % VARIANTS.length].key
    const p = new URLSearchParams(sp); p.set('variant', next)
    navigate({ pathname: loc.pathname, search: `?${p}` })
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return
      if (e.key === 'ArrowLeft') cycle(-1)
      if (e.key === 'ArrowRight') cycle(1)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })
  if (!import.meta.env.DEV) return null
  const label = VARIANTS.find(v => v.key === current)?.label ?? current
  return (
    <div className="cdp-switcher" role="toolbar" aria-label="สลับ prototype variant">
      <button onClick={() => cycle(-1)} aria-label="variant ก่อนหน้า">◀</button>
      <b>{label}</b>
      <button onClick={() => cycle(1)} aria-label="variant ถัดไป">▶</button>
    </div>
  )
}
