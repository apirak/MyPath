# My Path — Course Detail

> **PROTOTYPE** — รวมเข้า main แล้วผ่าน PR #1 (24 ต.ค. 69) · ต้นฉบับเต็มยังอยู่บน branch `prototype/course-detail` (worktree `../mypath-course-detail`)

## ผลการตัดสินและสถานะปัจจุบัน

เจ้าของเลือกจาก 4 variants (A ชีทรวดเร็ว / B หน้าเต็ม / C แผงข้าง / D ผสม) → **ตัวสุดท้ายคือ D** แล้วลบ A/B/C และ switcher ออกจากโค้ด (ดูฉบับเทียบ 4 แบบใน git history ของ branch นี้)

แบบที่ล็อก (24 ต.ค. 69 + ปรับเพิ่มวันเดียวกัน):

- **Bottom sheet ทุกขนาดจอ:** desktop ≥641px อยู่กลางจอ กว้างไม่เกิน 960px (641–900px เป็นสองคอลัมน์) · มือถือ ≤640px เต็มความกว้าง (ข้อความ "แผงข้างขวา" เดิมและคอมเมนต์บรรทัดแรกของ `CourseDetailOverlay.tsx` ล้าสมัยแล้ว โค้ดใน `CourseDetailOverlay.css` คือของจริง) · **กฎ layout:** ส่วนตายของชีท (header/cover/CTA/footer) เป็น `flex:none` ห้ามยืดหด — มีแค่ body ที่ยืด/เลื่อนตามพื้นที่ที่เหลือ และชีท `overflow:auto` เป็น fallback ให้จอสั้นมาก (เลื่อนทั้งใบแทนการล้นทับ) — สแกน 6 ขนาดจอแล้วไม่มี overlap/spill
- **Cover เต็ม 16:9** (`aspect-ratio`) เต็มความกว้าง ไม่มี padding รอบ — แสดงเฉพาะคอร์สที่มีรูป (map `covers` ใน courseDetail.ts: PHY.0–4, MATH.1, CHEM.1 ตามที่หน้า Courses/Month ใช้จริง)
- **แผง/sheet ไม่มี border** — เฉพาะเงา
- **ปุ่มเริ่มเรียน ใต้ cover** (คอร์สที่ซื้อแล้ว) · คอร์สที่ยังไม่ซื้อเป็นปุ่ม "หาซื้อบน OnDemand" + ราคา — **ทุกปุ่มใช้ `HeaderButton` component ตัวเดียวกับหน้า Profile** · เริ่มเรียน = `variant="primary"` (น้ำเงิน #0078c4) ส่วนที่เหลือเป็น secondary/ขาว (✕ ปิด = `header-button--icon` + ไอคอน X จาก lucide) — mock: ทั้งเริ่มเรียนและหาซื้อเปิด `ONDEMAND_URL`
- รายละเอียดเป็น **ระดับเล่ม** + บริบทแพ็ก · คอร์สไม่มีข้อมูล (10/25) แสดงการ์ดย่อ + ข้อความ "ยังไม่มีรายละเอียดเนื้อหา"
- คลิกได้จากทุกที่ที่คอร์สปรากฏ: แถบ All, เซลล์ All มือถือ, การ์ด Month (ป้ายสอบ/Mock ไม่รวม)
- เปิดเป็น overlay บนหน้าเดิม (`?course=<รหัส>`) · ปิดด้วย ✕ / คลิกฉากหลัง / Esc · สถานะเทียบ `TODAY = 2026-12-05`
- “ตาม Course ก่อนหน้า” ใช้ได้ทั้งวันเริ่มต้นและเวลาเรียนต่อสัปดาห์: เวลาเรียนจะคัดลอกค่าของคอร์สก่อนหน้าในวิชาเดียวกันและล็อก slider; การเปลี่ยนคอร์สต้นทางจึงอัปเดตทุกคอร์สที่ตามต่อเนื่องกันทันที. การปิดตัวเลือกคงค่าที่กำลังรับมาไว้เป็นค่าที่ผู้เรียนกำหนดเองและตัดสายการตามค่า; คอร์สแรกของวิชาไม่มีคอร์สก่อนหน้า จึงปิดตัวเลือกนี้ไว้. ไม่ใช้ปฏิทินการเรียนเป็นแหล่งเวลา เพราะหลายคอร์สอาจเรียนทับช่วงเดียวกัน.

## SDK version (`/mypath`, ใบ 07 #10)

port ไว้ที่ `packages/mypath/src/ui/CourseDetail.tsx` (CSS ใน `mypath.css` class `mp-cdp-*` ใต้ `.mypath-root` เฉพาะ rule ที่ใช้จริง) หน้าตาเหมือน prototype ทุกขนาดจอ ต่างกันตรงนี้:

- **คอร์สที่เปิดเป็น state ภายใน `<MyPath>`** ไม่มี `?course=` และไม่แตะ history: ปุ่ม back ของ browser ออกจาก My Path ไม่ได้ปิดชีท. ปิดด้วย ✕ / คลิกฉากหลัง / Esc (animation ปิด 280ms) และ**สลับ Month/All แล้วชีทปิด** (ข้อสรุป #4) · ชีทเป็น modal (`aria-modal`): เปิดแล้วโฟกัสย้ายเข้าชีท Tab วนอยู่ในชีท ปิดแล้วโฟกัสกลับการ์ด/แถบที่เปิด
- **การตั้งค่าส่งแผนทั้งก้อนผ่าน `onPlanChange`** (helper ล้วน `withCourse` ใน `plan/timeline.ts`) หน้าจอเปลี่ยนเมื่อ host ส่งแผนกลับ. คอร์สที่ไม่มีใน `plan.courses` (host ไม่ต้องส่งทุกคอร์ส) ตั้งค่าแล้วจะเพิ่มคอร์สนั้นต่อท้ายแผน — ต่างจาก prototype ที่ no-op; ลากใน All ก็เหมือนกัน
- **ปุ่มไปผ่าน callback:** "หาซื้อบน OnDemand" → `onBuyCourse(courseId)`, "เริ่มเรียน" → `onStartCourse(courseId)`; SDK ไม่ `window.open` (ลิงก์ร้านค้าอยู่ที่ host). กดเริ่มเรียนคอร์สที่ไม่มีวันเริ่มต้นและไม่ได้ตาม Course ก่อนหน้า = ตรึง `startDate` ที่วันเริ่มที่คิดได้ด้วย `onPlanChange` ก่อน
- ราคาเดิม (`was`) เป็นตัวขีดฆ่าจริง (prototype แสดง `<s>` เป็นข้อความ) · ข้อมูลแพ็ก/เล่ม/ExamGym/ราคา/cover มาจาก `data` ของ host
- เทสต์: `tests/sdk/courseDetail.test.tsx`

## ไฟล์

| ไฟล์ | หน้าที่ |
|---|---|
| `src/prototype/mypath/courseDetail.ts` | mock รายละเอียด — mirror ของ SAMPLE_DATA (แพ็ก MATH/PHY + ExamGym ×3 + ราคา + covers + ส่วนแชร์) |
| `src/prototype/mypath/CourseDetailOverlay.tsx` | SheetMobile (มือถือ) + DrawerDesktop (desktop) + ResponsiveDetail + overlay |
| `src/prototype/mypath/CourseDetailOverlay.css` | สไตล์ (`cdp-*`) — ปุ่มไม่มีสไตล์เอง ใช้ HeaderButton ของแอป |
| `src/prototype/pages/MyPathAllTimeline.tsx` / `MyPath.tsx` | onClick แถบ/เซลล์/การ์ด + mount `<CourseDetailOverlay />` |
| `src/prototype/components/HeaderButton.tsx` | ปุ่มกลางของแอป — pushable (ขอบทึบ + หน้าปุ่มลอย) + variant primary/secondary |

แม็ปข้อมูล: MATH.1–5 ← TCAS70_Math · PHY.1–7 ← TCAS70_Physic · EX ×3 ← Exam_GYM_* · ที่เหลือไม่มีรายละเอียด (ดู `SAMPLE_DATA/courses.md` § รายละเอียดคอร์ส)

## ข้อสังเกต

- หน้า Month บน main ถูกเขียนใหม่เป็น data-driven โดยอีก session — ตอน merge `MyPath.tsx` ชนกัน แก้แล้ว (เอาฝั่ง data-driven เป็นฐาน + port onClick/overlay กลับ, 24 ต.ค. 69)
- ตรวจแล้ว desktop 1280 + มือถือ 390: แผง/sheet สลับสด, cover 16:9 เต็ม (460×259), ไม่มี border, ปุ่มทุกดวงเป็น HeaderButton, ซื้อแล้ว→เริ่มเรียน / ยังไม่ซื้อ→หาซื้อ+ราคา, Esc ปิด

## ขั้นถัดไป

เขียนใหม่เป็นโค้ดจริงรวมเข้า main (prototype ไม่มี error handling) — ตัว prototype เต็ม ๆ คงอยู่บน branch นี้เป็น primary source
