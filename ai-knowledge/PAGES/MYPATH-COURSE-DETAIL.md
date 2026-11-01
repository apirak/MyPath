# My Path — Course Detail

> **SDK** — `packages/mypath/src/ui/course/CourseDetail.tsx` (ใบ 07 #10) เปิดบน `/mypath` · ต้นแบบ prototype รวมเข้า main ผ่าน PR #1 (24 ต.ค. 69) และถูกลบใน #13 หลังตรวจครบเท่า SDK แล้ว — โค้ดเดิมดูได้ที่ tag `mockup-v1` (`src/mypath/CourseDetailOverlay.tsx`, `courseDetail.ts`) และ branch `prototype/course-detail`

## ผลการตัดสินและสถานะปัจจุบัน

เจ้าของเลือกจาก 4 variants (A ชีทรวดเร็ว / B หน้าเต็ม / C แผงข้าง / D ผสม) → **ตัวสุดท้ายคือ D** แล้วลบ A/B/C และ switcher ออกจากโค้ด (ดูฉบับเทียบ 4 แบบใน git history ของ branch `prototype/course-detail`)

แบบที่ล็อก (24 ต.ค. 69 + ปรับเพิ่มวันเดียวกัน) ตามที่ SDK ทำอยู่:

- **Bottom sheet ทุกขนาดจอ:** desktop ≥641px อยู่กลางจอ กว้างไม่เกิน 960px (641–900px เป็นสองคอลัมน์) · มือถือ ≤640px เต็มความกว้าง (CSS `mp-cdp-*` ใน `packages/mypath/src/ui/course/CourseDetail.css` คือของจริง) · **กฎ layout:** header ของชีทเป็น `flex:none` ห้ามยืดหด ชีทสูงไม่เกิน `100vh - 32px` และ `overflow:auto` เป็น fallback ให้จอสั้นมาก (เลื่อนทั้งใบแทนการล้นทับ)
- **Cover** เป็นรูปย่อ 77×43 ข้างชื่อคอร์ส มาจาก `cover` ของคอร์สใน `data.catalog` (รูปเดียวกับการ์ด Month) · คอร์สที่ไม่มี `cover` ไม่แสดงรูป
- **แผง/sheet ไม่มี border** — เฉพาะเงา
- **ปุ่มเริ่มเรียน** (คอร์สที่ซื้อแล้ว = อยู่ใน `data.owned`) · คอร์สที่ยังไม่ซื้อเป็นปุ่ม "หาซื้อบน OnDemand" + ราคา — **ทุกปุ่มใช้ `HeaderButton` ของ SDK** (`packages/mypath/src/ui/components/HeaderButton.tsx`, copy จากของ host ที่หน้า Profile ใช้) · เริ่มเรียน = `variant="primary"` ส่วนที่เหลือเป็น secondary/ขาว (✕ ปิด = ไอคอน X ของ SDK ใน `ui/components/icons.tsx`)
- รายละเอียดเป็น **ระดับเล่ม** + บริบทแพ็ก (`data.courseDetails` → `data.packs`) · คอร์สที่ไม่มีใน `courseDetails` (10/25 ใน fixtures) แสดงการ์ดย่อ + ข้อความ "ยังไม่มีรายละเอียดเนื้อหาสำหรับคอร์สนี้"
- คลิกได้จากทุกที่ที่คอร์สปรากฏ: แถบ All, เซลล์ All มือถือ, การ์ด Month (ป้ายสอบ/Mock ไม่รวม)
- เปิดเป็น overlay บนหน้าเดิม · ปิดด้วย ✕ / คลิกฉากหลัง / Esc · สถานะเทียบ**วันนี้** (`today` ของ host; host จำลองส่ง `2026-12-05`)
- “ตาม Course ก่อนหน้า” ใช้ได้ทั้งวันเริ่มต้นและเวลาเรียนต่อสัปดาห์: เวลาเรียนจะคัดลอกค่าของคอร์สก่อนหน้าในวิชาเดียวกันและล็อก slider; การเปลี่ยนคอร์สต้นทางจึงอัปเดตทุกคอร์สที่ตามต่อเนื่องกันทันที. การปิดตัวเลือกคงค่าที่กำลังรับมาไว้เป็นค่าที่ผู้เรียนกำหนดเองและตัดสายการตามค่า; คอร์สแรกของวิชาไม่มีคอร์สก่อนหน้า จึงปิดตัวเลือกนี้ไว้. ไม่ใช้ปฏิทินการเรียนเป็นแหล่งเวลา เพราะหลายคอร์สอาจเรียนทับช่วงเดียวกัน.

## ต่างจาก mockup เดิม (tag `mockup-v1`)

ตรวจครบเท่าใน #13 (ดู `docs/mypath-sdk-plan.md` § ความต่างที่ยอมรับได้) หน้าตาเหมือนเดิมทุกขนาดจอ ต่างกันตรงนี้:

- **คอร์สที่เปิดเป็น state ภายใน `<MyPath>`** ไม่มี `?course=` และไม่แตะ history: ปุ่ม back ของ browser ออกจาก My Path ไม่ได้ปิดชีท. ปิดด้วย ✕ / คลิกฉากหลัง / Esc (animation ปิด 280ms) และ**สลับ Month/All แล้วชีทปิด** (ข้อสรุป #4) · ชีทเป็น modal (`aria-modal`, hook `useModal`): เปิดแล้วโฟกัสย้ายเข้าชีท Tab วนอยู่ในชีท ปิดแล้วโฟกัสกลับการ์ด/แถบที่เปิด
- **การตั้งค่าส่งแผนทั้งก้อนผ่าน `onPlanChange`** (helper ล้วน `withCourse` ใน `packages/mypath/src/plan/timeline.ts`) หน้าจอเปลี่ยนเมื่อ host ส่งแผนกลับ. คอร์สที่ไม่มีใน `plan.courses` (host ไม่ต้องส่งทุกคอร์ส) ตั้งค่าแล้วจะเพิ่มคอร์สนั้นต่อท้ายแผน — ต่างจาก mockup ที่ no-op; ลากใน All ก็เหมือนกัน
- **ปุ่มไปผ่าน callback:** "หาซื้อบน OnDemand" → `onBuyCourse(courseId)`, "เริ่มเรียน" → `useStartCourse()` → `onStartCourse(courseId)`; SDK ไม่ `window.open` (mockup เปิด `ONDEMAND_URL`; host จำลองใน `MyPathTab.tsx` เปิดร้านค้าตอนซื้อ และ log ตอนเริ่มเรียน). กดเริ่มเรียนคอร์สที่ไม่มีวันเริ่มต้นและไม่ได้ตาม Course ก่อนหน้า = ตรึง `startDate` ที่วันเริ่มที่คิดได้ด้วย `onPlanChange` ก่อน
- ราคาเดิม (`was`) เป็นตัวขีดฆ่าจริง (mockup แสดง `<s>` เป็นข้อความ) · ข้อมูลแพ็ก/เล่ม/ExamGym/ราคา/cover มาจาก `data` ของ host
- **Cover มาจาก `cover` ใน catalog** (รูปเดียวกับการ์ด Month) — mockup ใช้ map `covers` แยก เป็นรูป placeholder `physics-1..4.png` (MATH.1, CHEM.1, PHY.0–4) และคอร์สอื่นไม่มีปก (เจ้าของ repo ตัดสินใน PR #27)
- เทสต์: `tests/sdk/courseDetail.test.tsx`

## ไฟล์

| ไฟล์ | หน้าที่ |
|---|---|
| `packages/mypath/src/ui/course/CourseDetail.tsx` | bottom sheet |
| `packages/mypath/src/ui/course/openCourse.ts` | `OpenCourseContext` / `courseButton` ที่การ์ด Month และแถบ/เซลล์ All ใช้เปิดชีท |
| `packages/mypath/src/MyPath.tsx` | เก็บคอร์สที่เปิดอยู่เป็น state แล้ว mount `<CourseDetail>` |
| `packages/mypath/src/MyPathProvider.tsx` | `useStartCourse()` ที่ปุ่มเริ่มเรียนใช้ร่วมกับแถบความคืบหน้า |
| `packages/mypath/src/ui/components/useModal.ts` | โฟกัส/Esc/animation ปิด ใช้ร่วมกับแผงปฏิทินการเรียน |
| `packages/mypath/src/ui/course/CourseDetail.css` | สไตล์ `mp-cdp-*` ใต้ `.mypath-root` — ปุ่มไม่มีสไตล์เอง ใช้ `HeaderButton` ของ SDK |
| `packages/mypath/src/ui/components/HeaderButton.tsx` | ปุ่มกลาง — pushable (ขอบทึบ + หน้าปุ่มลอย) + variant primary/secondary |
| `src/host/fixtures/mypath.json` | `courseDetails` / `packs` / `prices` / `catalog[].cover` — mirror ของ SAMPLE_DATA (แพ็ก MATH/PHY + ExamGym ×3 + ราคา) |

แม็ปข้อมูล: MATH.1–5 ← TCAS70_Math · PHY.1–7 ← TCAS70_Physic · EX ×3 ← Exam_GYM_* · ที่เหลือไม่มีรายละเอียด (ดู `SAMPLE_DATA/courses.md` § รายละเอียดคอร์ส)

## ข้อสังเกต

- (ประวัติ, สมัย prototype) หน้า Month บน main ถูกเขียนใหม่เป็น data-driven โดยอีก session — ตอน merge `MyPath.tsx` ชนกัน แก้แล้ว (เอาฝั่ง data-driven เป็นฐาน + port onClick/overlay กลับ, 24 ต.ค. 69)
- (ประวัติ, สมัย prototype 24 ต.ค. 69) ตรวจแล้ว desktop 1280 + มือถือ 390: แผง/sheet สลับสด, cover 16:9 เต็ม (460×259), ไม่มี border, ปุ่มทุกดวงเป็น HeaderButton, ซื้อแล้ว→เริ่มเรียน / ยังไม่ซื้อ→หาซื้อ+ราคา, Esc ปิด — ภายหลัง cover เปลี่ยนเป็นรูปย่อข้างชื่อคอร์สแล้ว (ทั้ง prototype ตอนตรวจ #13 และ SDK)
