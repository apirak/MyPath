# My Path — Course Detail Prototype

> **PROTOTYPE (throwaway)** — อยู่บน branch `prototype/course-detail` (worktree `../mypath-course-detail`) เท่านั้น ยังไม่รวมเข้า main · dev server ของ worktree: `npm run dev -- --port 5174`

## คำถามที่ prototype ตอบ

"คลิกคอร์สบนแผนแล้วเปิดรายละเอียดแบบไหน" — 3  variants สลับดูได้:

| Variant | ชื่อ | รูปแบบ | จุดต่างเชิงโครงสร้าง |
|---|---|---|---|
| **D** | **ผสม (เลือกแล้ว — ค่าเริ่มต้น)** | **desktop: drawer ขวาแบบ C · มือถือ: bottom sheet แบบ A** (สลับตาม viewport สด ๆ) | ตัวเลือกของเจ้าของ — เห็นแผนด้านซ้ายบน desktop / จอไม่เต็มบนมือถือ |
| A | ชีทรวดเร็ว | bottom sheet (มือถือ) / modal กลางจอ (เดสก์ท็อป) | อ่านเร็วจบในจอ: meta แถวเดียว + chips + CTA ติด footer |
| B | หน้าเต็ม | route `/mypath/course/:id` | hero สีวิชา + สองคอลัมน์ (เนื้อหา / sidebar แผน+แพ็ก+ซื้อ) |
| C | แผงข้าง | drawer ขวา (เดสก์ท็อป) / เต็มจอเลื่อนขึ้น (มือถือ) | แท็บ 2 ส่วน: แผนของน้อง / เนื้อหาคอร์ส |

## ผลการตัดสิน (24 ต.ค. 69)

เจ้าของเลือก **D = C บน desktop + A บนมือถือ** — เหตุผลที่ให้มา: desktop ชอบให้รายละเอียด "ออกมาด้านข้าง" (แผนยังอยู่เต็ม ๆ ซ้าย) ส่วนมือถือชอบให้ "ขึ้นมาจากด้านล่าง" (แบบ A ที่ไม่กินจอเต็ม) — D จึงใช้ DrawerC (แท็บ แผนของน้อง/เนื้อหาคอร์ส) บน ≥641px และ SheetA (chips + CTA ติด footer) บน ≤640px · ตรวจแล้วสลับสดตอน resize viewport

สลับด้วย **แถบดำล่างกลางจอ** (◀ ▶ หรือปุ่มลูกศรซ้าย-ขวาบนคีย์บอร์ด) — แถบแสดงเฉพาะ dev (`import.meta.env.DEV`) · URL พารามิเตอร์ `?variant=A|B|C|D` แชร์/รีเฟรชได้ · ไม่ใส่พารามิเตอร์ = D

## พฤติกรรมที่ล็อกไว้ (ตกลงกับเจ้าของ 24 ต.ค. 69)

- **รายละเอียดเป็นระดับเล่ม** + บริบทแพ็ก (ครู, สิทธิพิเศษ) — ไม่ใช่หน้าแพ็กเต็มของ OnDemand
- คอร์ส **ไม่มีรายละเอียด** (10/25 คอร์ส) → การ์ดย่อจากแผน + ข้อความ "ยังไม่มีรายละเอียดเนื้อหา"
- คอร์ส **ยังไม่ได้ซื้อ** → ปุ่ม "หาซื้อบน OnDemand ↗" เปิด `ONDEMAND_URL = https://shoponline.ondemand.in.th` (แก้ที่เดียวใน `courseDetail.ts`) + ราคาถ้ามีใน courses.md
- คลิกได้จาก **ทุกที่ที่คอร์สปรากฏ**: แถบ Year เดสก์ท็อป, เซลล์ Year มือถือ, การ์ด Month · ป้ายสอบ/Mock ไม่รวม
- **รูปปก**: คอร์สที่มี cover ในแอป (PHY.0–4, MATH.1, CHEM.1 — map ใน `covers` ของ courseDetail.ts) แสดง cover ทุก variant — A: แถบบนเนื้อหาชีท · B: มุมขวา hero (ขอบขาว) · C: แบนเนอร์ใต้หัว drawer · คอร์สไม่มี cover ไม่แสดง
- Variant A/C = overlay บนหน้าเดิม (`?course=<รหัส>`) · Variant B = ไป route `/mypath/course/:id` · บน route สลับเป็น A/C จะเห็นสไตล์ของ variant นั้นบนหน้า route ทันที
- สถานะเทียบ `TODAY = 2026-12-05` (mock): กำลังเรียน / ถัดไป / จบแล้ว ตามนิยามใน GLOSSARY

## ไฟล์

| ไฟล์ | หน้าที่ |
|---|---|
| `src/mypath/courseDetail.ts` | mock รายละเอียด — mirror ของ SAMPLE_DATA (แพ็ก MATH/PHY + ExamGym ×3 + ราคา + ส่วนแชร์ eggspace/ExamGym) |
| `src/mypath/CourseDetailPrototype.tsx` | variants A/B/C + `PrototypeSwitcher` + `CourseDetailOverlay` + `CourseDetailPage` + `useOpenCourse` |
| `src/mypath/CourseDetailPrototype.css` | สไตล์ทั้งหมด (`cdp-*`) + `cursor:pointer` ให้แถบ/การ์ดคอร์ส |
| `src/pages/MyPathYear.tsx` | เพิ่ม onClick แถบ (desktop) และเซลล์ (mobile) + mount overlay/switcher |
| `src/pages/MyPath.tsx` | การ์ดเพิ่ม `id` (MATH.1/PHY.0/CHEM.1) + onClick + mount overlay/switcher |
| `src/App.tsx` | route `/mypath/course/:id` |

ข้อมูลรายละเอียดแม็ป: MATH.1–5 ← TCAS70_Math · PHY.1–7 ← TCAS70_Physic · MATH.EX/PHY.EX/CHEM.EX ← Exam_GYM_* · ที่เหลือไม่มีรายละเอียด (ดู `SAMPLE_DATA/courses.md` § รายละเอียดคอร์ส)

## ข้อสังเกตระหว่างทดสอบ (24 ต.ค. 69)

- หน้า Month ยังใช้ข้อมูล hardcoded ม.ค. 69 ดั้งเดิม — สถานะในชีท (เทียบ plan.ts + TODAY 5 ธ.ค. 69) อาจขัดกับหัวข้อ "วันนี้" ของหน้า Month (เช่น MATH.1 โชว์ "จบแล้ว") — จะหายเมื่อ Month เป็น data-driven ตาม task ของอีก session
- ตรวจแล้วบน desktop 1280 + มือถือ 390: ทั้ง 3 variants, คอร์สมี/ไม่มีรายละเอียด, ซื้อแล้ว/ยังไม่ซื้อ, Esc ปิด, สลับ variant บนหน้า route

## เมื่อเลือกแบบแล้ว (ขั้นตอนถัดไป)

1. ~~ตัดสินใจ variant~~ — **เลือก D แล้ว** (24 ต.ค. 69)
2. ย้าย design ตัวชนะเข้า main แบบเขียนใหม่เป็นโค้ดจริง (prototype ไม่มี error handling)
3. ที่เหลือ (variants A/B/C + switcher) คงอยู่บน branch นี้เป็น primary source — อย่าลบ branch
