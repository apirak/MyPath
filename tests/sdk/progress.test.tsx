// @vitest-environment jsdom
// ความคืบหน้าบนการ์ดคอร์สที่ซื้อแล้วในหน้า Month: อ่าน data.progress และวันนี้จาก host, ปุ่มเรียนเรียก onStartCourse
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MyPath, type MyPathData } from '@learn/mypath'
import { TODAY, mypathData } from '../../src/host/fixtures'

afterEach(cleanup)

// ธ.ค. 69: PHY.0 (ซื้อแล้ว 20%, 10 พ.ย. – 21 ธ.ค.) กำลังเรียน · PHY.1 (ซื้อแล้ว 10%, เริ่ม 22 ธ.ค.) ถัดไป · MATH.2 ยังไม่ซื้อ
const PHY0 = 'ปรับพื้นฐานฟิสิกส์ TCAS (ปูพื้น ครบทุกทักษะ ครบทุกแนว)'
const PHY1 = 'ฟิสิกส์ TCAS ล. 1'
const MATH2 = 'Applied Math Admissions TCAS เล่ม 2 (For Dek70)'
const card = (name: string) => screen.getByText(name).closest('article') as HTMLElement
const withProgress = (progress: Record<string, number>): MyPathData => ({ ...mypathData, progress: { ...mypathData.progress, ...progress } })
const renderMyPath = (data: MyPathData = mypathData, today = TODAY) => {
  const props = { onPlanChange: vi.fn(), onBuyCourse: vi.fn(), onStartCourse: vi.fn() }
  const view = render(<MyPath data={data} today={today} {...props} />)
  return { ...props, rerender: (next: MyPathData, day = today) => view.rerender(<MyPath data={next} today={day} {...props} />) }
}

describe('ความคืบหน้าบนการ์ดคอร์สที่ซื้อแล้ว', () => {
  it('แสดง % และข้อความตามสถานะจาก data.progress และวันนี้', () => {
    renderMyPath()
    expect(card(PHY0).textContent).toContain('คืบหน้า 20%')
    expect(card(PHY0).textContent).toContain('ทำได้ดีแล้ว มาพยายามไปด้วยกันนะ') // เลยวันของเป้าแรก (22 พ.ย.) แล้ว
    expect(card(PHY1).textContent).toContain('พิชิตเป้าหมายแรกภายใน 8 ม.ค. 70')
  })

  it('host เปลี่ยน progress หรือวันนี้ แล้วข้อความเปลี่ยนตาม', () => {
    const { rerender } = renderMyPath()
    rerender(withProgress({ 'PHY.0': 0 }))
    expect(card(PHY0).textContent).toContain('ยังไม่เริ่มเรียน')
    expect(card(PHY0).textContent).toContain('เริ่มเรียน')
    rerender(withProgress({ 'PHY.0': 100 }))
    expect(card(PHY0).textContent).toContain('ยินดีด้วย! เรียนจบแล้ว')
    expect(card(PHY0).textContent).toContain('ทบทวน')
    rerender(mypathData, '2026-11-15') // ก่อนวันของเป้าแรก
    expect(card(PHY0).textContent).toContain('พิชิตเป้าหมายแรกภายใน 22 พ.ย. 69')
  })

  it('ไม่มีค่าใน data.progress = 0%', () => {
    renderMyPath({ ...mypathData, progress: {} })
    expect(card(PHY0).textContent).toContain('ยังไม่เริ่มเรียน')
  })

  it('คอร์สที่ยังไม่ซื้อไม่มีแถบความคืบหน้า', () => {
    renderMyPath()
    expect(card(MATH2).querySelector('.mp-progress')).toBeNull()
    expect(card(PHY0).querySelector('.mp-progress')).toBeTruthy()
  })

  it('ปุ่มเรียนเรียก onStartCourse และไม่เปิดหน้ารายละเอียด', () => {
    const { onStartCourse, onPlanChange } = renderMyPath()
    fireEvent.click(within(card(PHY0)).getByRole('button', { name: 'เรียนต่อ' }))
    expect(onStartCourse).toHaveBeenCalledWith('PHY.0')
    expect(onPlanChange).not.toHaveBeenCalled() // มีวันเริ่มต้นแล้ว
    expect(document.querySelector('.mp-cdp-sheet')).toBeNull()
  })

  it('กด Enter บนปุ่มเรียนไม่ทะลุไปเปิดหน้ารายละเอียดของการ์ด', () => {
    renderMyPath()
    fireEvent.keyDown(within(card(PHY0)).getByRole('button', { name: 'เรียนต่อ' }), { key: 'Enter' })
    expect(document.querySelector('.mp-cdp-sheet')).toBeNull()
    fireEvent.keyDown(card(PHY0), { key: 'Enter' }) // คีย์บนการ์ดเองยังเปิดได้
    expect(document.querySelector('.mp-cdp-sheet')).toBeTruthy()
  })

  it('ปุ่มเรียนของคอร์สที่ไม่มีวันเริ่มต้น: ตรึงวันเริ่มผ่าน onPlanChange ก่อน onStartCourse', () => {
    const plan = { ...mypathData.plan, courses: mypathData.plan.courses.map(c => c.courseId === 'PHY.0' ? { courseId: 'PHY.0', weeklyHours: 3 } : c) }
    const { onStartCourse, onPlanChange } = renderMyPath({ ...mypathData, plan })
    fireEvent.click(within(card(PHY0)).getByRole('button', { name: 'เรียนต่อ' }))
    expect(onPlanChange.mock.calls[0][0].courses.find((c: { courseId: string }) => c.courseId === 'PHY.0')).toEqual({ courseId: 'PHY.0', weeklyHours: 3, startDate: TODAY }) // คอร์สแรกไม่มีวันเริ่ม = วันนี้
    expect(onPlanChange.mock.invocationCallOrder[0]).toBeLessThan(onStartCourse.mock.invocationCallOrder[0])
  })
})
