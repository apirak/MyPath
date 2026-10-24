# My Path — Course Detail (Prototype)

> **PROTOTYPE** — อยู่บน branch `prototype/course-detail` (worktree `../mypath-course-detail`) ยังไม่รวม main · dev server ของ worktree: `npm run dev -- --port 5174`

## ผลการตัดสินและสถานะปัจจุบัน

เจ้าของเลือกจาก 4 variants (A ชีทรวดเร็ว / B หน้าเต็ม / C แผงข้าง / D ผสม) → **ตัวสุดท้ายคือ D** แล้วลบ A/B/C และ switcher ออกจากโค้ด (ดูฉบับเทียบ 4 แบบใน git history ของ branch นี้)

แบบที่ล็อก (24 ต.ค. 69 + ปรับเพิ่มวันเดียวกัน):

- **Desktop ≥641px** = แผงข้างขวา (slide-in) · **มือถือ ≤640px** = bottom sheet — สลับสดตาม viewport (`useIsMobile`, breakpoint เดียวกับแอป 640px) · **กฎ layout:** ส่วนตายของชีท (header/cover/CTA/footer) เป็น `flex:none` ห้ามยืดหด — มีแค่ body ที่ยืด/เลื่อนตามพื้นที่ที่เหลือ และชีท `overflow:auto` เป็น fallback ให้จอสั้นมาก (เลื่อนทั้งใบแทนการล้นทับ) — สแกน 6 ขนาดจอแล้วไม่มี overlap/spill
- **Cover เต็ม 16:9** (`aspect-ratio`) เต็มความกว้าง ไม่มี padding รอบ — แสดงเฉพาะคอร์สที่มีรูป (map `covers` ใน courseDetail.ts: PHY.0–4, MATH.1, CHEM.1 ตามที่หน้า Courses/Month ใช้จริง)
- **แผง/sheet ไม่มี border** — เฉพาะเงา
- **ปุ่มเริ่มเรียน ใต้ cover** (คอร์สที่ซื้อแล้ว) · คอร์สที่ยังไม่ซื้อเป็นปุ่ม "หาซื้อบน OnDemand" + ราคา — **ทุกปุ่มใช้ `HeaderButton` component ตัวเดียวกับหน้า Profile** (✕ ปิด = `header-button--icon` + ไอคอน X จาก lucide) — mock: ทั้งเริ่มเรียนและหาซื้อเปิด `ONDEMAND_URL`
- รายละเอียดเป็น **ระดับเล่ม** + บริบทแพ็ก · คอร์สไม่มีข้อมูล (10/25) แสดงการ์ดย่อ + ข้อความ "ยังไม่มีรายละเอียดเนื้อหา"
- คลิกได้จากทุกที่ที่คอร์สปรากฏ: แถบ Year, เซลล์ Year มือถือ, การ์ด Month (ป้ายสอบ/Mock ไม่รวม)
- เปิดเป็น overlay บนหน้าเดิม (`?course=<รหัส>`) · ปิดด้วย ✕ / คลิกฉากหลัง / Esc · สถานะเทียบ `TODAY = 2026-12-05`

## ไฟล์

| ไฟล์ | หน้าที่ |
|---|---|
| `src/mypath/courseDetail.ts` | mock รายละเอียด — mirror ของ SAMPLE_DATA (แพ็ก MATH/PHY + ExamGym ×3 + ราคา + covers + ส่วนแชร์) |
| `src/mypath/CourseDetailPrototype.tsx` | SheetMobile (มือถือ) + DrawerDesktop (desktop) + ResponsiveDetail + overlay |
| `src/mypath/CourseDetailPrototype.css` | สไตล์ (`cdp-*`) — ปุ่มไม่มีสไตล์เอง ใช้ HeaderButton ของแอป |
| `src/pages/MyPathYear.tsx` / `MyPath.tsx` | onClick แถบ/เซลล์/การ์ด + mount `<CourseDetailOverlay />` |
| `src/components/HeaderButton.tsx` | ปุ่มกลางของแอป (มีอยู่แล้ว — ใช้จาก Profile/PathHeader) |

แม็ปข้อมูล: MATH.1–5 ← TCAS70_Math · PHY.1–7 ← TCAS70_Physic · EX ×3 ← Exam_GYM_* · ที่เหลือไม่มีรายละเอียด (ดู `SAMPLE_DATA/courses.md` § รายละเอียดคอร์ส)

## ข้อสังเกต

- หน้า Month บน main ถูกเขียนใหม่เป็น data-driven โดยอีก session — ตอน merge คารวม `MyPath.tsx` ชนกัน (ฝั่งนี้เพิ่ม id + onClick ให้การ์ด)
- ตรวจแล้ว desktop 1280 + มือถือ 390: แผง/sheet สลับสด, cover 16:9 เต็ม (460×259), ไม่มี border, ปุ่มทุกดวงเป็น HeaderButton, ซื้อแล้ว→เริ่มเรียน / ยังไม่ซื้อ→หาซื้อ+ราคา, Esc ปิด

## ขั้นถัดไป

เขียนใหม่เป็นโค้ดจริงรวมเข้า main (prototype ไม่มี error handling) — ตัว prototype เต็ม ๆ คงอยู่บน branch นี้เป็น primary source
