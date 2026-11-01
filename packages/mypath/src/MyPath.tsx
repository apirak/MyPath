import type { MyPathProps } from './types'

// ยังเป็นหน้าเปล่า (UI เริ่มใบ 04) — แสดง "วันนี้" เพื่อพิสูจน์ว่าได้ข้อมูลจาก host จริง
export default function MyPath({ today }: MyPathProps) {
  return <div className="mypath-root">
    <p>My Path SDK ยังไม่มีหน้าจอ</p>
    <p>วันนี้: {today ?? 'ไม่ได้ส่งมา'}</p>
  </div>
}
