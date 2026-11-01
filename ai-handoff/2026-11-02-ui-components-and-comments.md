# Handoff: ปรับ component ที่แตกออกมา + เก็บงาน comment

วันที่ 2026-11-02 · branch `sdk-13-library-build` · PR [apirak/MyPath#29](https://github.com/apirak/MyPath/pull/29) (เปิดอยู่ ยังไม่มีคน review)

## สถานะตอนส่งต่อ

งานแยก `packages/mypath/src/ui/` เป็นโฟลเดอร์ตาม feature และแปลง comment เป็นภาษาอังกฤษ **commit แล้ว** (`92fc844`) อ่านรายละเอียดจากที่เหล่านี้ อย่าเขียนซ้ำ:

- เหตุผลและกติกาของโครงโฟลเดอร์ + ลำดับ CSS: [docs/adr/0004-ui-folders-by-feature.md](../docs/adr/0004-ui-folders-by-feature.md)
- แผนผังโฟลเดอร์และหลักฐานที่ verify แล้ว: เนื้อหา PR #29
- แผนที่โค้ดแต่ละหน้า: หัวข้อ "Code layout" ใน [ai-knowledge/PAGES/MYPATH.md](../ai-knowledge/PAGES/MYPATH.md)

ใน branch นี้ test ผ่าน 142/142 รวมถึง typecheck, lint และ build ด้วย หน้าตาเหมือนเดิมทุก pixel

## งานที่ session ถัดไปทำต่อได้

### 1. ปรับ component ที่แตกออกมา

- **StepSlider มี 2 ตัว**: [course/CourseDetail.tsx:19](../packages/mypath/src/ui/course/CourseDetail.tsx) (เป็น local function) กับ [calendar/StepSlider.tsx](../packages/mypath/src/ui/calendar/StepSlider.tsx) ทั้งสองโครงคล้ายกันแต่ใช้ CSS คนละชุด รอบนี้เลยยังไม่รวม ถ้าจะรวมต้องรวม CSS ให้หน้าตาเหมือนเดิม 1:1 (ยังเป็นเฟส 1 ห้าม redesign) ถ้ารวมได้ ให้ย้ายไปไว้ที่ `components/`
- **CourseDetail.tsx 228 บรรทัด** เป็นไฟล์ใหญ่สุด ถ้าดึง StepSlider ออกได้ไฟล์ก็จะเล็กลงเอง
- ลองไล่ดูว่ามี component ไหนเป็น **shallow** (interface ใหญ่พอ ๆ กับ implementation) ที่ควรรวมกลับเข้าไปในตัวที่เรียกใช้ หรือ prop ที่ส่งต่อกันหลายชั้นจนควรใช้ context แทน ตัวที่น่าดูก่อนคือ `EditorProps` ใน [calendar/StudyCalendar.tsx](../packages/mypath/src/ui/calendar/StudyCalendar.tsx) และ `DragStart` ใน [all/SubjectRow.tsx](../packages/mypath/src/ui/all/SubjectRow.tsx)
- กติกาจาก ADR-0004: ชิ้นที่ใช้แค่ view เดียวให้อยู่ในโฟลเดอร์ของ view นั้น จะย้ายไป `components/` ได้ก็ต่อเมื่อมี view ที่สองใช้

### 2. เก็บงาน comment

ทุก comment เป็นภาษาอังกฤษแล้ว งานที่เหลือคือตรวจคุณภาพตามเกณฑ์ที่ผู้ใช้ตั้งไว้ คือมีน้อย อ่านเร็ว และบอก **ทำไม** ไม่ใช่บอกว่าโค้ด **ทำอะไร**

- ไฟล์ที่มีบรรทัด comment เยอะสุด: `ui/components/icons.tsx` (48), `tests/sdk/all.test.tsx`, `tests/boundary.test.ts`, `plan/buildPlan.ts`, `ui/all/AllView.tsx`, `tests/characterization/plan.test.ts`
- ห้ามแปลง **ชื่อ test** (`it('...')`) และ **ข้อความ UI** เป็นภาษาอังกฤษ ผู้ใช้ต้องการให้เป็นภาษาไทยต่อไป
- ภาษาไทยที่ [tests/boundary.test.ts:1](../tests/boundary.test.ts) ตั้งใจเก็บไว้ เพราะอ้างชื่อหัวข้อภาษาไทยใน doc
- comment ใน CSS ที่อธิบายเรื่อง specificity หรือลำดับ cascade ต้องเก็บไว้

## วิธี verify (ต้องทำทุกครั้งที่แตะ UI/CSS)

1. รัน `pnpm typecheck && pnpm lint && pnpm test && pnpm build` ทั้งหมด ตอน pre-commit hook จะรัน typecheck กับ lint และตอน pre-push จะรัน typecheck กับ test
2. **เทียบ computed style แบบ A/B ใน session เดียวกัน** เพราะ baseline ข้าม session ไม่ตรงกันด้วยเหตุผลของ environment:
   - เก็บค่าจากโค้ดเดิมก่อน แล้วรันซ้ำเพื่อยืนยันว่าต่างกัน 0 จุด
   - จากนั้นสลับเป็นโค้ดใหม่แล้วเทียบอีกรอบ
   - ทำครบ 7 หน้าจอ (month, monthDetail, all, allDetail, calendar, allEmpty, monthEmpty) × 1280 / 800 / 375 px
   - หน้า empty ต้องล้าง subjects ให้หมดก่อน
   - เสร็จแล้วให้ลบ localStorage key ที่ใส่ไว้ และคืนขนาด viewport
3. ถ้าย้ายไฟล์ CSS ต้องเช็กสองอย่าง:
   - `url(...)` แบบ relative ยังชี้ถูกที่ไหม เคยพังมาแล้วที่ `components/PlanEmptyState.css`
   - ได้เพิ่ม/แก้ `@import` ใน [mypath.css](../packages/mypath/src/mypath.css) แล้วหรือยัง ลำดับใน `mypath.css` คือลำดับ cascade ห้ามสลับ
4. ถ้าแก้แค่ comment ให้เทียบ token ของโค้ดที่ตัด comment ออกแล้วว่าเหมือนเดิม (ตัว scan อาจแจ้งเตือนผิดตรง template literal ให้ดูเองอีกที)

## ข้อควรรู้

- ก่อนแตะหน้าไหน อ่าน [AGENTS.md](../AGENTS.md) ก่อน: เป็น mockup ที่มีแต่ frontend, ตอนนี้เฟส 1 ต้องเหมือน as-is ทุกจุด และแก้หน้าเสร็จแล้วต้องอัปเดต `ai-knowledge/PAGES/<PAGE>.md`
- dev server อาจมีอีก session เปิดค้างอยู่ใน folder นี้ อย่าไปปิดหรือแก้ของ session นั้น
- skill `grill-with-docs` ไม่ได้ติดตั้งไว้ ถ้าจะ grill ให้ใช้ `mattpocock-skills:grilling` โดยอ้าง `GLOSSARY.md` กับ `docs/adr/`
- ศัพท์ของโปรเจกต์: "Grass" (ไม่ใช่ glass) คือฉากหญ้าใน `design/Grass.tsx`

## Suggested skills

- `mattpocock-skills:codebase-design` ใช้ตัดสินว่า component ไหน deep หรือ shallow และ seam ควรอยู่ตรงไหน
- `mattpocock-skills:grilling` ใช้ถามผู้ใช้ก่อนตัดสินใจเรื่องที่ทำแล้วเปลี่ยนหน้าตา เช่น การรวม StepSlider
- `mattpocock-skills:domain-modeling` ใช้เมื่อต้องแก้ `GLOSSARY.md` หรือเขียน ADR ใหม่
- `mattpocock-skills:tdd` ใช้เขียน test ก่อนแยก/รวม component
- `simplify` ใช้ตรวจความซ้ำซ้อนหลังปรับเสร็จ
- `mattpocock-skills:pr` ใช้เขียน PR body
