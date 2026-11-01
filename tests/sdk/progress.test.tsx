// @vitest-environment jsdom
// Progress on owned course cards in Month: driven by the host's
// data.progress and Today; the study button calls onStartCourse.
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { MyPath, type MyPathData } from '@learn/mypath'
import { TODAY, mypathData } from '../../src/host/fixtures'

afterEach(cleanup)

// Dec 2026: PHY.0 (owned, 20%, 10 Nov – 21 Dec) is current; PHY.1 (owned,
// 10%, starts 22 Dec) is next; MATH.2 is not owned.
const PHY0 = 'ปรับพื้นฐานฟิสิกส์ TCAS (ปูพื้น ครบทุกทักษะ ครบทุกแนว)'
const PHY1 = 'ฟิสิกส์ TCAS ล. 1'
const MATH2 = 'Applied Math Admissions TCAS เล่ม 2 (For Dek70)'
const card = (name: string) =>
  screen.getByText(name).closest('article') as HTMLElement
const withProgress = (progress: Record<string, number>): MyPathData => ({
  ...mypathData,
  progress: { ...mypathData.progress, ...progress },
})
const renderMyPath = (data: MyPathData = mypathData, today = TODAY) => {
  const props = {
    onPlanChange: vi.fn(),
    onBuyCourse: vi.fn(),
    onStartCourse: vi.fn(),
  }
  const view = render(<MyPath data={data} today={today} {...props} />)
  return {
    ...props,
    rerender: (next: MyPathData, day = today) =>
      view.rerender(<MyPath data={next} today={day} {...props} />),
  }
}

describe('ความคืบหน้าบนการ์ดคอร์สที่ซื้อแล้ว', () => {
  it('แสดง % และข้อความตามสถานะจาก data.progress และวันนี้', () => {
    renderMyPath()
    expect(card(PHY0).textContent).toContain('คืบหน้า 20%')
    // past the first target's date (22 Nov)
    expect(card(PHY0).textContent).toContain('ทำได้ดีแล้ว มาพยายามไปด้วยกันนะ')
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
    rerender(mypathData, '2026-11-15') // before the first target's date
    expect(card(PHY0).textContent).toContain('พิชิตเป้าหมายแรกภายใน 22 พ.ย. 69')
  })

  it('ไม่มีค่าใน data.progress = 0%', () => {
    renderMyPath({ ...mypathData, progress: {} })
    expect(card(PHY0).textContent).toContain('ยังไม่เริ่มเรียน')
  })

  it('ค่าที่ไม่ใช่ตัวเลข (ข้อมูลจาก host ตอน runtime) = 0%', () => {
    renderMyPath(
      withProgress({
        'PHY.0': 'abc' as unknown as number,
        'PHY.1': Number.NaN,
      }),
    )
    expect(card(PHY0).textContent).toContain('คืบหน้า 0%')
    expect(card(PHY1).textContent).toContain('คืบหน้า 0%')
  })

  it('ปุ่มเรียนไม่ซ้อนอยู่ในส่วนที่กดเปิดหน้ารายละเอียด', () => {
    renderMyPath()
    const opener = within(card(PHY0)).getByRole('button', {
      name: /ปรับพื้นฐานฟิสิกส์/,
    })
    expect(opener.querySelector('button')).toBeNull()
    expect(card(PHY0).getAttribute('role')).toBeNull()
  })

  it('คอร์สที่ยังไม่ซื้อไม่มีแถบความคืบหน้า', () => {
    renderMyPath()
    expect(card(MATH2).querySelector('.mp-progress')).toBeNull()
    expect(card(PHY0).querySelector('.mp-progress')).toBeTruthy()
  })

  it('ปุ่มเรียนเรียก onStartCourse และไม่เปิดหน้ารายละเอียด', () => {
    const { onStartCourse, onPlanChange } = renderMyPath()
    fireEvent.click(
      within(card(PHY0)).getByRole('button', { name: 'เรียนต่อ' }),
    )
    expect(onStartCourse).toHaveBeenCalledWith('PHY.0')
    expect(onPlanChange).not.toHaveBeenCalled() // start date already set
    expect(document.querySelector('.mp-cdp-sheet')).toBeNull()
  })

  it('กด Enter บนปุ่มเรียนไม่ทะลุไปเปิดหน้ารายละเอียดของการ์ด', () => {
    renderMyPath()
    fireEvent.keyDown(
      within(card(PHY0)).getByRole('button', { name: 'เรียนต่อ' }),
      { key: 'Enter' },
    )
    expect(document.querySelector('.mp-cdp-sheet')).toBeNull()
    fireEvent.keyDown(
      within(card(PHY0)).getByRole('button', { name: /ปรับพื้นฐานฟิสิกส์/ }),
      { key: 'Enter' },
    ) // the card's top area still opens it
    expect(document.querySelector('.mp-cdp-sheet')).toBeTruthy()
  })

  it(
    'ปุ่มเรียนของคอร์สที่ไม่มีวันเริ่มต้น:' +
      ' ตรึงวันเริ่มผ่าน onPlanChange ก่อน onStartCourse',
    () => {
      const plan = {
        ...mypathData.plan,
        courses: mypathData.plan.courses.map(c =>
          c.courseId === 'PHY.0' ? { courseId: 'PHY.0', weeklyHours: 3 } : c,
        ),
      }
      const { onStartCourse, onPlanChange } = renderMyPath({
        ...mypathData,
        plan,
      })
      fireEvent.click(
        within(card(PHY0)).getByRole('button', { name: 'เรียนต่อ' }),
      )
      expect(
        onPlanChange.mock.calls[0][0].courses.find(
          (c: { courseId: string }) => c.courseId === 'PHY.0',
        ),
        // first course with no start date starts Today
      ).toEqual({ courseId: 'PHY.0', weeklyHours: 3, startDate: TODAY })
      expect(onPlanChange.mock.invocationCallOrder[0]).toBeLessThan(
        onStartCourse.mock.invocationCallOrder[0],
      )
    },
  )
})
