# แผนทำ My Path เป็น SDK

เหตุผลระดับสถาปัตยกรรมอยู่ใน [ADR-0001](adr/0001-mypath-as-react-sdk.md). วิธีที่ Learn Anywhere นำ SDK ไปใช้ (npm / git submodule / link แบบ local) อยู่ใน [mypath-integration.md](mypath-integration.md). เอกสารนี้คือแผนลงมือทำ: ลำดับขั้น เหตุผลของแต่ละขั้น และรายการ ticket.

## เป้าหมาย

Learn Anywhere ตัวจริง (React web) ติดตั้ง package แล้ววางไว้ในแท็บที่ 3:

```tsx
<MyPath
  data={{ catalog, plan, events, owned, progress, prices, packs, courseDetails }}
  today="2026-12-05"                        // ไม่บังคับ ไม่ส่ง = วันตามเวลาไทยจากนาฬิกาเครื่อง
  onPlanChange={plan => save(plan)}         // แผนทั้งก้อน เมื่อผู้ใช้แก้วันเริ่ม/ชั่วโมง/ปฏิทิน
  onBuyCourse={courseId => openShop(courseId)}
  onStartCourse={courseId => openPlayer(courseId)}
/>
```

- **Host เป็นเจ้าของข้อมูล:** แผนการเรียนเป็นแบบ controlled คือ SDK ส่งแผนใหม่ผ่าน `onPlanChange` แล้ว host เป็นคนบันทึกและส่งกลับเข้ามา
- **UI state อยู่ใน SDK:** Month/All, เดือนที่เลือก, คอร์สที่เปิดอยู่. host ที่ต้องการ deep link ส่ง `view` / `onViewChange` (ไม่บังคับ) ดู [View state และ deep link](#view-state-และ-deep-link)
- **SDK ไม่เก็บข้อมูลเอง:** ไม่ยิง API, ไม่ใช้ localStorage, ไม่ส่ง analytics (PDPA, [DP-001])
- **ยังไม่ทำ:** plugin system, ระบบธีมเต็มรูปแบบ, i18n รอให้ host ขอจริงก่อน

## โครงสร้าง repo ระหว่างทำ

ยังเป็น Vite app เดียว รัน dev server ตัวเดียว:

```
src/prototype/      ← mockup เดิมทั้งหมด ถูกแช่แข็งไว้ ไม่แก้   → /prototype/mypath, /prototype/mypath/all
src/host/           ← Learn Anywhere จำลอง                     → /, /courses, /mypath, /profile
packages/mypath/    ← SDK (index.ts = ทางเข้าทางเดียว)
```

host ใช้หน้า Home, Courses, Profile และ BottomNav ที่มีอยู่แล้ว เพราะหน้าเหล่านี้คือส่วน "Learn Anywhere เดิม" อยู่แล้ว.
**เหตุผล:** host จำลองใช้ SDK แบบเดียวกับแอปจริง ถ้า props ออกแบบมาใช้ยาก จะรู้ตั้งแต่ตอนนี้ ส่วน prototype ที่เปิดดูได้ตลอดใช้เทียบหน้าตา และใช้เป็นคำตอบอ้างอิงให้เทสต์

## กติกา

1. **`src/prototype` แก้ไม่ได้** ยกเว้นแก้ path/ลิงก์ตอนย้ายบ้าน. มีโค้ดซ้ำกับ SDK ได้ เพราะเราไม่ได้ดูแล prototype ต่อ
2. **SDK import จาก `src/prototype` หรือ `react-router` ไม่ได้** และ **host import SDK ได้เฉพาะผ่านชื่อ package** (`@learn/mypath`). ทั้งสองข้อตรวจด้วยเทสต์ที่ scan ดู import
   **เหตุผล:** ถ้ามีอะไรรั่วออกนอกขอบเขต package จะเห็นทันทีตอนเทสต์ ไม่ต้องรอไปพังตอน build library
3. **ฟังก์ชันคำนวณให้ copy ไปทั้งก้อน ไม่เขียนใหม่** (`plan.ts`, `progressStore.ts`) แล้วปรับให้เป็นฟังก์ชันล้วน. มีเทสต์ยืนยันว่าเมื่อได้ข้อมูลชุดเดียวกัน ผลต้องเท่ากับของ prototype
   **เหตุผล:** ในโค้ดมีรายละเอียดเยอะ (snap วันจันทร์, ต่อคอร์ส, ตามจังหวะเรียน) เขียนใหม่มีโอกาสเพี้ยนสูง
4. **ทุกขั้นต้องผ่าน:** `npm test` + `npm run build` และเปิดได้ทั้ง `/` กับ `/prototype/mypath` ก่อน commit
5. **วิธีทำ ticket:** ใบ implement ใช้ `/mattpocock-skills:implement issue #N` แล้ว review ก่อนเปิด PR ด้วย `/mattpocock-skills:code-review` (มาตรฐานของ repo + ตรงตาม issue) และ `/ponytail:ponytail-review` (ซับซ้อนเกินจำเป็น) ส่วนใบ grill ใช้ `/mattpocock-skills:grill-with-docs issue #N`
   **เหตุผล:** ทุกใบผ่านกระบวนการเดียวกัน และ review สองมุมจับปัญหาต่างกัน คือทำผิด spec กับทำเกินจำเป็น

## ลำดับขั้น

| ขั้น | ทำอะไร | ทำไมอยู่ตรงนี้ |
|---|---|---|
| 1. ตาข่ายกันพลาด | tag `mockup-v1`, ติดตั้ง Vitest, เขียน characterization test ที่บันทึกผลของ `rebuildPlan` / `progressState` ปัจจุบันไว้เป็นค่าอ้างอิง | ต้องมีก่อนย้ายโค้ดใดๆ ทั้งหมด |
| 2. แยกบ้าน | ย้ายโค้ดไป `src/prototype`, ทำ host shell ที่แท็บ 3 ว่าง, สร้าง package ที่มี type ตามสัญญาข้อมูล + `<MyPath>` เปล่าๆ, แยกข้อมูล mock เป็นไฟล์ JSON ฝั่ง host | ได้ขอบเขต package ตั้งแต่วันแรก และ prototype ยังเปิดได้ |
| 3. ย้ายส่วนคำนวณ | `buildPlan(catalog, plan, today)` เป็นฟังก์ชันล้วน + เทสต์เทียบกับ prototype | UI ทุกชิ้นใช้ส่วนนี้ จึงต้องนิ่งก่อน |
| 4. ปั้น UI ทีละชิ้น | header + Month → All timeline → Course detail → Study calendar → Progress. แต่ละชิ้นเขียน CSS แบบมี scope (`.mypath-root`, prefix `mp-`) ตั้งแต่แรก + smoke test | แต่ละชิ้นเสร็จแล้วใช้ได้ทันทีใน host. CSS ของ My Path เป็น CSS ธรรมดา ไม่ได้ใช้ Tailwind จึงไม่ต้องลากเอา Tailwind ไปด้วย |
| 5. ตัดสินว่าครบแล้ว | เมื่อ SDK ทำได้ครบเท่า prototype ให้ลบ `src/prototype` ออก | เลิกมีโค้ดซ้ำสองชุด |
| 6. Library build + publish | Vite library mode, ใส่ react เป็น peerDependencies, รวม CSS เป็นไฟล์เดียว, ใช้ npm workspaces, publish ไป private registry | ถึงตอนนี้โค้ดไม่ผูกกับอะไรแล้ว ตั้ง build ครั้งเดียวจบ |

ระหว่างขั้น 2–5 ใช้ path alias `@learn/mypath` ไปก่อน.

## แยก host กับ SDK (ใช้ตอนทำ T3)

หลักตัดสิน: ถ้า Learn Anywhere ตัวจริงจะไม่มีของชิ้นนั้น ต้องอยู่ใน SDK หรือส่งมาเป็นข้อมูล และ SDK ห้ามพึ่งของที่อยู่นอก package.

```
packages/mypath/            ← SDK (ไม่รู้จักโค้ดใน src/ เลย)
  src/index.ts              ← ทางเข้าทางเดียว: export <MyPath> + types
  src/plan/                 ← buildPlan, progress (ฟังก์ชันล้วน)
  src/ui/                   ← Month, AllTimeline, CourseDetail, StudyCalendar, Progress, PathHeader, HeaderButton
  src/assets/               ← ไอคอน + รูปที่ SDK ใช้เอง
  src/mypath.css            ← CSS ทั้งหมดของ SDK ครอบด้วย .mypath-root
src/host/                   ← Learn Anywhere จำลอง
  pages/                    ← Home, Courses, Profile, MyPathTab (แท็บ 3 = <MyPath data=… />)
  components/               ← BottomNav, HeaderButton
  fixtures/*.json           ← ข้อมูล mock ที่ host ส่งเข้า SDK
  index.css                 ← Tailwind + CSS ของหน้า host
src/prototype/              ← ของเดิม ไม่แก้ → /prototype/*
```

**กลไกแยก 3 ชั้น**

1. **แยกโฟลเดอร์** ตามโครงข้างบน
2. **Import ได้ทางเดียว: host → SDK.** ตอนนี้ตั้ง alias `@learn/mypath` ใน `vite.config.ts` และ `tsconfig.json` ให้ชี้ไป `packages/mypath/src/index.ts` ไฟล์เดียว path ลึกจึง resolve ไม่ได้. ตอนทำ T11 ย้ายไป npm workspaces + field `exports` ใน `package.json` การ import ไฟล์ภายในจะถูกปิดตั้งแต่ระดับ Node. SDK มีแค่ `react` / `react-dom` เป็น peerDependencies และใช้ `lucide-react` ส่วน `react-router` กับ Tailwind เป็นของ host เท่านั้น
3. **เทสต์ตรวจขอบเขต:** scan `packages/mypath/src` แล้ว fail ถ้าเจอ import ไป `src/`, `react-router` หรือ `/public` และ scan `src/host` แล้ว fail ถ้า import `packages/mypath` ด้วย path ตรงๆ

**จุดที่ตอนนี้ปนกันอยู่**

| ของ | ตอนนี้ | แยกเป็น |
|---|---|---|
| `src/index.css` | ไฟล์เดียวมีทั้ง Tailwind, CSS โครงแอป (`.mypath-layout`), CSS หน้า Month (`.path-*`, `monthly-*`) และ CSS หน้า My Path แบบเก่า | `.path-*` / `monthly-*` / `tp-*` ไป `mypath.css` ใต้ `.mypath-root` ส่วนที่เหลือเป็นของ host |
| โครงหน้าจอ | `.mypath-layout` เป็น `position: fixed` และจัดวาง BottomNav เอง | host ให้กล่องที่มีความสูงแน่นอน แล้ว SDK เติมเต็มกล่อง (`height: 100%`) และจัดการ scroll ข้างในเอง SDK ไม่รู้ว่ามี tab bar |
| `HeaderButton.tsx` | ใช้ร่วมกันทั้ง Home/Courses/Profile และ My Path | **copy** ไปไว้ใน SDK (ไฟล์เล็ก). ยังไม่ทำ package UI กลาง รอให้ Learn Anywhere จริงมี design system ก่อน |
| `public/mypath/*.png` (bg ของ header, รูปหมวก) | อ้างด้วย path `/mypath/...` | ย้ายเข้า `packages/mypath/src/assets` แล้ว import ตรงๆ ให้ bundle ไปกับ SDK เพราะ host ตัวจริงไม่มีไฟล์เหล่านี้ |
| `public/cover/*`, `assets/home/physics-*.png` | SDK อ้างรูปปกเอง | เป็นข้อมูลของ host ส่ง URL มากับ `catalog` / `courseDetails` |
| `PathHeader.tsx` | ใช้ `<Link to="/mypath">` | ย้ายเข้า SDK และเปลี่ยนปุ่ม Month/All ให้สลับ state ภายใน |
| `BottomNav.tsx` | ใช้ทั้ง prototype และหน้าอื่น | เป็นของ host |
| `BrowserRouter` ใน `main.tsx` | ครอบทั้งแอป | เป็นของ host SDK ไม่ต้องอยู่ใต้ router |

## สัญญาข้อมูล

ข้อสรุปจาก grill #3 ใบ 03 (#7) สร้าง type และ fixtures ตามนี้ทุกตัวอักษร. หัวข้อย่อยถัดจากภาพรวมคือเหตุผลของแต่ละข้อ

### ภาพรวม type

```ts
type ISODate = string   // 'YYYY-MM-DD' วันในปฏิทินตามเวลาไทย

type MyPathProps = {
  data: MyPathData
  today?: ISODate                                  // ไม่ส่ง = วันตามเวลาไทยจากนาฬิกาเครื่อง
  onPlanChange: (plan: StudentPlan) => void        // แผนทั้งก้อน
  onBuyCourse: (courseId: string) => void
  onStartCourse: (courseId: string) => void
  view?: MyPathView                                // ไม่ส่ง = SDK เก็บเอง (ดู View state และ deep link)
  onViewChange?: (view: MyPathView) => void
}

type MyPathView = { mode: 'month' | 'all'; month: string }   // month = 'YYYY-MM'

type MyPathData = {
  catalog: SubjectGroup[]                          // ลำดับใน array = ลำดับที่แสดง
  plan: StudentPlan
  events: ExamEvent[]                              // เฉพาะที่เกี่ยวกับนักเรียนคนนี้
  owned: string[]                                  // id ของคอร์สและ Mock ที่ซื้อแล้ว
  progress: Record<string, number>                 // courseId → 0–100
  prices: Record<string, { now: number; was?: number }>  // courseId → บาท จำนวนเต็ม
  packs: Record<string, PackInfo>                  // packId → แพ็ก
  courseDetails: Record<string, CourseDetail>      // courseId → รายละเอียด (ไม่มี = คอร์สไม่มีรายละเอียด)
}

// --- catalog ---
type SubjectGroup = { name: string; subjects: CatalogSubject[] }
type CatalogSubject = { id: string; name: string; color: string; courses: CourseCatalogItem[] }  // courses เรียงตามลำดับเล่ม
type CourseCatalogItem = { id: string; name: string; short: string; abbr: string; hours: number; cover?: string }

// --- แผนเรียน (สิ่งที่นักเรียนแก้ได้ และสิ่งเดียวที่ SDK ส่งกลับ) ---
type StudentPlan = { calendar: StudyCalendar; courses: StudentCourse[] }
type StudyCalendar = {
  weekdayHours: number
  weekendHours: number
  specialDays: { date: ISODate; hours: number }[]
  breaks: { id: number; start: ISODate; end: ISODate; hours: number }[]
  subjects: string[]                               // id ของวิชาที่เรียน
}
type StudentCourse = {
  courseId: string
  startDate?: ISODate
  followPrevious?: boolean
  weeklyHours?: number                             // 1–10, ไม่มี = 5
  followPreviousWeeklyHours?: boolean
}

// --- วันสอบ ---
type ExamEvent = { id: string; date: ISODate; label: string; kind: 'exam' | 'mock' }

// --- รายละเอียดคอร์ส ---
type CourseDetail = { packId?: string; volume?: Volume; examgym?: ExamGymInfo }
type PackInfo = { name: string; teacher: string }
type Volume = { chapters: string[] }
type ExamGymInfo = { slogan: string }
```

ไม่มี `schemaVersion` ใช้ semver ของ package อย่างเดียว (ดูหัวข้อสุดท้าย)

### การซื้อแยกออกจากแผน

```ts
type MyPathData = {
  owned: string[]   // id ของคอร์สและรอบ Mock ที่นักเรียนซื้อแล้ว
  // …
}
```

- `StudentCourse` และ `ExamEvent` ไม่มีฟิลด์ `owned` แล้ว
- **เหตุผล:** แผนเป็นของที่ SDK ส่งกลับผ่าน `onPlanChange` ถ้าการซื้ออยู่ในแผน SDK จะส่งสถานะการซื้อที่อาจค้างอยู่กลับไปทับค่าใหม่ของ host ทั้งที่นักเรียนแก้สถานะนี้จาก My Path ไม่ได้. id ของคอร์สกับ Mock ใช้รายการเดียวกันเพราะทั้งสองเป็นสินค้า. ยังไม่ใส่วันหมดอายุเพราะยังไม่มี UI ใช้ ดู [ADR-0002](adr/0002-ownership-separate-from-plan.md)

### `onPlanChange` ส่งแผนทั้งก้อน

```ts
type StudentPlan = { calendar: StudyCalendar; courses: StudentCourse[] }

type MyPathProps = {
  onPlanChange: (plan: StudentPlan) => void
  // …
}
```

- ส่งแผนทั้งก้อนโดยไม่แนบเหตุผล host แค่บันทึกแล้วส่งกลับเข้ามาใน `data.plan`
- ยิงเมื่อการแก้แต่ละครั้งจบแล้ว: slider, สวิตช์ และช่องวันที่ยิงทันที, การลากหัวคอร์สในหน้า All ยิงครั้งเดียวตอนปล่อย ระหว่างลาก SDK เก็บแผนชั่วคราวไว้เป็น UI state, ส่วนปฏิทินการเรียนยิงเฉพาะเมื่อค่าผ่านการตรวจแล้ว (เช่น ช่วงปิดเทอมไม่ซ้อนกัน)
- **เหตุผล:** ตรรกะการแก้แผนมีผลข้างเคียง เช่น ปิด "ตามจังหวะเรียน Course ก่อนหน้า" แล้วต้อง copy ชั่วโมงมาเก็บไว้ ถ้าส่งเฉพาะส่วนที่เปลี่ยน host จะต้องเขียนตรรกะชุดเดียวกันซ้ำ. ถ้าวันหลังต้องการรู้เหตุผลการเปลี่ยน ให้เพิ่มเป็น argument ตัวที่สองได้โดยไม่ทำให้ host เดิมพัง ดู [ADR-0003](adr/0003-plan-change-sends-whole-plan.md)

### วันนี้และรูปแบบวันที่

```ts
type ISODate = string   // 'YYYY-MM-DD' วันในปฏิทินตามเวลาไทย ไม่มีเวลาและเขตเวลา

type MyPathProps = {
  today?: ISODate
  // …
}
```

- ทุกวันที่ในสัญญาใช้ `ISODate` (`startDate`, วันสอบ, ช่วงปิดเทอม, วันพิเศษ, `today`)
- **ส่ง `today`:** SDK ใช้ค่านั้นตายตัวและไม่ดูนาฬิกาเลย host แปลงจากเวลา server เป็นวันตามเวลาไทยเอง ใช้ตอนทดสอบหรือเมื่อต้องการยึดเวลา server
- **ไม่ส่ง:** SDK ใช้วันตามเวลาไทย (Asia/Bangkok ผ่าน `Intl.DateTimeFormat`) จากนาฬิกาเครื่อง ไม่ว่าเครื่องตั้งเขตเวลาอะไร และคิดวันใหม่เมื่อแท็บกลับมาแสดงผล (`visibilitychange`) และตอนเที่ยงคืนเวลาไทย
- **เหตุผล:** production ไม่ต้องให้ทุก host แปลงเวลาเอง ส่วนเทสต์และ host จำลองส่งวันตายตัวได้. ใช้เวลาไทยเสมอเพื่อให้ "วันนี้" มีความหมายเดียวกันทั้งสองโหมด. นาฬิกาเครื่องที่ตั้งผิดกระทบแค่การแสดงผล (ข้อความความคืบหน้า, กลุ่มกำลังเรียน) ไม่มีอะไรถูกบันทึก จึงยอมรับได้. ข้อนี้แก้ข้อความเดิมใน ADR-0001 ที่ว่า host เป็นคนส่ง "วันนี้" เสมอ

### ไม่มีขอบเขตเวลาในสัญญา

- ลบ `DAY_START` / `DAY_LAST` ออก ไม่มีค่าเหล่านี้ใน `data` และไม่มีใน SDK
- คอร์สแรกของวิชาที่ไม่มี `startDate` เริ่มที่ **วันนี้** ส่วน `startDate` ในอดีตยังใช้ได้ตามปกติ (ไม่ถูกดันขึ้นมา)
- แกนของหน้า All ยังคำนวณจากคอร์สและวันสอบเหมือนเดิม
- **เหตุผล:** `DAY_START` (2026-08-01) เป็นวันในปีการศึกษาเดียว ถ้าเก็บไว้ ต้องมีคนเปลี่ยนทุกปี ส่วน `DAY_LAST` ไม่เคยมีผลจริงในโค้ด (เป็นแค่ค่าสำรองตอนหาวันไม่เจอ). ข้อเสียคือคอร์สที่ซื้อและเรียนไปแล้วแต่ไม่มี `startDate` จะเลื่อนตามวันนี้ (คุยต่อในหัวข้อความคืบหน้า)
- ใบ 04 (#8) ต้องเปลี่ยน characterization test ที่อิง `DAY_START` ให้ใช้ fixtures ที่คอร์สแรกทุกวิชามี `startDate` หรือบันทึกผลใหม่

### ความคืบหน้า

```ts
type MyPathData = {
  progress: Record<string, number>   // courseId → 0–100
  // …
}
```

- host คิด % เอง SDK ปัดค่าให้อยู่ในช่วง 0–100 และถือว่าคอร์สที่ไม่มีค่าเป็น 0
- SDK แสดงความคืบหน้าเฉพาะคอร์สที่ซื้อแล้ว ค่าของคอร์สที่ยังไม่ซื้อไม่ถูกใช้
- `GOALS` 30/70 (ธง/ถ้วย) และกติกาข้อความเป็นของ SDK host ปรับไม่ได้
- **เหตุผล:** วิธีคิด % (ถ่วงน้ำหนักบทหรือวิดีโอ) เป็นความรู้ของ backend ส่วนเป้า 30/70 ผูกกับไอคอนและข้อความใน Figma ถ้าจะเปลี่ยนก็ต้องออกแบบใหม่อยู่แล้ว

### "เริ่มเรียน" ตรึงวันเริ่ม

- เมื่อกด "เริ่มเรียน" ในคอร์สที่ไม่มี `startDate` และไม่ได้ "ตาม Course ก่อนหน้า" SDK ตั้ง `startDate` เป็นวันเริ่มที่คำนวณได้ตอนนั้น แล้วยิง `onPlanChange(plan)` ก่อน `onStartCourse(courseId)`
- คอร์สที่มี `startDate` แล้วหรือตาม Course ก่อนหน้า กดแล้วยิงแค่ `onStartCourse`
- **เหตุผล:** คอร์สแรกที่ไม่มีวันเริ่มต้นจะเลื่อนตามวันนี้ (ดูหัวข้อขอบเขตเวลา) ถ้าเรียนไปแล้วแต่ยังเลื่อนอยู่ เป้าธง/ถ้วยจะไม่มีวันเลยกำหนด. การกด "เริ่มเรียน" เป็นจังหวะเดียวที่รู้แน่ว่าเริ่มจริง และเป็นการกระทำของนักเรียนเอง ตรรกะจึงอยู่ใน SDK ที่เดียว
- ข้อจำกัด: ถ้าเริ่มเรียนจากหน้าอื่นของ Learn Anywhere วันเริ่มจะยังไม่ถูกตรึง host ตั้ง `startDate` ในแผนเองได้ถ้าต้องการ

### รายละเอียดคอร์สส่งมาตั้งแต่ต้น แยกแพ็กเป็นตาราง

```ts
type MyPathData = {
  packs: Record<string, PackInfo>                  // packId → แพ็ก
  courseDetails: Record<string, CourseDetail>      // courseId → รายละเอียด
  // …
}
type CourseDetail = { packId?: string; volume?: Volume; examgym?: ExamGymInfo }
```

- คอร์สที่ไม่อยู่ใน `courseDetails` = **คอร์สไม่มีรายละเอียด**
- วันที่ทุกตัวในรายละเอียดเป็น `ISODate` SDK จัดรูปแบบเอง (mockup เก็บ `eggspaceStart` เป็นข้อความไทย)
- **เหตุผล:** ข้อมูลรวมแค่ไม่กี่ KB ส่งมาตั้งแต่ต้นแล้ว SDK ไม่ต้องมีสถานะ loading/error และยังเป็น controlled ทั้งก้อนเหมือนส่วนอื่น. แยก `packs` เพราะครู สิทธิพิเศษ และนโยบายเป็นคุณสมบัติระดับแพ็ก (หนึ่งแพ็กมีหลายเล่ม) ถ้าฝังไว้ในแต่ละคอร์ส JSON จะมีแพ็กซ้ำหลายชุด. ถ้าวันหลังข้อมูลโตจนต้องโหลดทีหลัง ค่อยเพิ่ม callback แบบไม่บังคับ
- ฟิลด์ข้างใน `PackInfo` / `Volume` / `ExamGymInfo` ดูหัวข้อถัดไป

### รายละเอียดคอร์สมีเฉพาะฟิลด์ที่ UI แสดง

```ts
type PackInfo = { name: string; teacher: string }
type Volume = { chapters: string[] }
type ExamGymInfo = { slogan: string }
```

- ไม่มีข้อความการตลาดที่ใช้ร่วมกัน (`EGGSPACE_*`, `EXAMGYM_*`) ทั้งในสัญญาและใน SDK
- ตัดฟิลด์ที่ mockup เก็บไว้แต่ไม่มีหน้าจอไหนแสดงออก: `audience`, `books`, `highlights`, `privileges`, `notes`, `bookNo`, `title`, `eggspaceStart`, `painPoint`, `sellingPoints`
- **เหตุผล:** หน้ารายละเอียดคอร์สใช้แค่ `pack.name`, `pack.teacher`, `volume.chapters`, `examgym.slogan`. ฟิลด์ที่ไม่มีใครแสดงจะเป็นงาน backend ที่เปล่าประโยชน์ และข้อความบางตัวเปลี่ยนทุกปี (เช่น วันหมดอายุ) จึงไม่ควรฝังใน SDK. การเพิ่มฟิลด์ที่ไม่บังคับทีหลังเป็น minor version ไม่ทำให้ host พัง แต่การลบฟิลด์ทำให้พัง

### ราคาและการซื้อ

```ts
type MyPathData = {
  prices: Record<string, { now: number; was?: number }>   // courseId → บาท จำนวนเต็ม
  // …
}
type MyPathProps = {
  onBuyCourse: (courseId: string) => void
  // …
}
```

- คอร์สที่ไม่มีราคาไม่แสดงบรรทัดราคา, `was` แสดงแบบขีดฆ่าเมื่อมีค่า, SDK จัดรูปแบบ `฿3,900` เอง
- `onBuyCourse` ส่งแค่ `courseId` host แปลงเป็นสินค้าจริงเอง (เล่มเดี่ยวหรือทั้งแพ็ก) และ `ONDEMAND_URL` ออกจาก SDK
- **เหตุผล:** host รู้ว่าคอร์สไหนขายแบบไหน ถ้า SDK ส่ง `packId` ไปด้วยก็คือ SDK ตัดสินใจเรื่องการขายแทน. ราคาแยกจาก `courseDetails` เพราะคอร์สไม่มีรายละเอียดก็มีราคาได้ (เช่น `PHY.0`). ราคาเป็นข้อมูลที่นักเรียนเห็นบนร้านค้าอยู่แล้ว จึงไม่ใช่ข้อมูลภายใน แต่ host ต้องส่งราคาเดียวกับที่ร้านค้าแสดง

### วันสอบและ Mock

```ts
type ExamEvent = { id: string; date: ISODate; label: string; kind: 'exam' | 'mock' }
type MyPathData = {
  events: ExamEvent[]
  // …
}
```

- host ส่งเฉพาะรายการที่เกี่ยวกับนักเรียนคนนี้ SDK แสดงทุกรายการที่ได้รับโดยไม่กรองเอง
- การซื้อใช้กับ Mock เท่านั้น (ดูใน `owned`) สอบจริงแสดงสีเข้มเสมอ
- **เหตุผล:** สอบจริงจัดโดยหน่วยงานภายนอก ไม่มีการซื้อ ถ้าใช้ `owned` แทนคำว่า "สมัครสอบแล้ว" คำว่าการซื้อจะมีสองความหมาย. การเลือกว่าใครเห็นสอบไหนเป็นตรรกะธุรกิจที่ host รู้ดีกว่า (เช่น ผูกกับวิชาที่สมัคร)

### Catalog เป็นโครงเดียวจาก host

```ts
type CourseCatalogItem = { id: string; name: string; short: string; abbr: string; hours: number; cover?: string /* URL */ }
type CatalogSubject = { id: string; name: string; color: string; courses: CourseCatalogItem[] }  // courses เรียงตามลำดับเล่ม
type SubjectGroup = { name: string; subjects: CatalogSubject[] }
type MyPathData = {
  catalog: SubjectGroup[]   // ลำดับใน array = ลำดับที่แสดง
  // …
}
type StudyCalendar = { /* … */ subjects: string[] }   // id ของวิชา ไม่ใช่ชื่อ
```

- รวม `subjectGroups` กับ `courseCatalog` เป็นโครงเดียว วิชาที่ `courses` ว่างได้แถวว่าง
- ลำดับคอร์สในวิชาคือลำดับเล่ม ใช้ตัดสิน "คอร์สแรก" และ "ตาม Course ก่อนหน้า"
- `short`, `abbr`, `color` มาจาก host ทั้งหมด
- รูปปกมาจาก `cover` (URL) อย่างเดียว ลบ `covers` ที่ import รูปใน SDK
- **เหตุผล:** ชื่อย่อและสีประจำวิชาเป็นเนื้อหาของสินค้าที่คนเขียนเอง SDK สร้างจากชื่อเต็มไม่ได้. mockup ผูกสองชุดด้วยชื่อวิชาภาษาไทย ถ้ารวมเป็นโครงเดียวจะไม่มีวิชาที่หาคู่ไม่เจอ. แผนที่บันทึกแล้วอ้างวิชาด้วย `id` เพื่อให้เปลี่ยนชื่อที่แสดงได้โดยแผนเดิมไม่พัง

### ข้อมูลไม่ครบหรือผิด

- แผนเก็บเฉพาะค่าที่นักเรียนตั้ง ทุกคอร์สของวิชาที่เปิดอยู่ถูกวางแผนเสมอ คอร์สที่ไม่มี `StudentCourse` ใช้ค่าเริ่มต้น (5 ชม./สัปดาห์, ไม่มีวันเริ่มต้น)
- id ที่ไม่รู้จักใน `plan` / `owned` / `progress` / `prices` / `courseDetails` ถูกข้ามตอนแสดงผล แต่ **`onPlanChange` ส่งทุกรายการในแผนกลับไปครบ** รวมถึง `StudentCourse` และ id วิชาใน `calendar.subjects` ที่ไม่มีใน catalog
- วันที่ผิดรูปถือว่าไม่มีค่านั้น (เช่น `startDate` ผิด = ไม่ได้ตั้ง)
- catalog ว่าง = แสดงหน้าว่างพร้อมข้อความ ไม่ throw
- ระหว่าง dev แจ้งปัญหาผ่าน `console.warn` (มีแค่ id ไม่มีข้อมูลส่วนบุคคล) ไม่มี `onDataError`
- **เหตุผล:** นักเรียนไม่ควรเห็นจอพังเพราะคอร์สเดียวถูกถอดจาก catalog และ SDK ห้ามทำข้อมูลที่ host เป็นเจ้าของหายระหว่างส่งกลับ. `onDataError` เพิ่มเป็น prop ที่ไม่บังคับภายหลังได้โดยไม่ทำให้ host เดิมพัง

### เวอร์ชันของสัญญา

- ใช้ semver ของ package อย่างเดียว ไม่มี `schemaVersion` ใน `data` หรือ `StudentPlan`
- เพิ่มฟิลด์ที่ไม่บังคับหรือ prop ที่ไม่บังคับ = minor, ลบหรือเปลี่ยนความหมายของฟิลด์ = major
- ถ้า major version ไหนเปลี่ยนรูป `StudentPlan` SDK ต้องอ่านแผนรูปเก่าที่ host บันทึกไว้ได้ และเขียนไว้ใน changelog
- **เหตุผล:** host compile SDK ไปพร้อมโค้ดตัวเองทั้งวิธี npm และ submodule จึงไม่มีทางรันกันคนละเวอร์ชัน และ TypeScript เตือนที่ adapter อยู่แล้ว. ข้อมูลเดียวที่อยู่ข้ามเวอร์ชันคือแผนที่บันทึกไว้ ถ้าฟิลด์ใหม่เป็นแบบไม่บังคับ แผนเก่าที่ไม่มีฟิลด์นั้นก็ยังอ่านได้. ถ้าวันหลังต้องเปลี่ยนแบบอ่านรูปเก่าไม่ได้ ค่อยเพิ่ม `version` ใน `StudentPlan` (ไม่มี = รุ่นแรก)

## View state และ deep link

ข้อสรุปจาก grill #4. ใบ 07 (#10) และ 08 (#11) ทำตามหัวข้อนี้

### Deep link ได้แค่ Month รายเดือนกับ All

- host ลิงก์ตรงได้สองแบบ: **Month ของเดือนที่ระบุ** และ **All**
- **หน้ารายละเอียดคอร์ส** และ **แผงปฏิทินการเรียน** เป็น state ภายใน SDK host ไม่เห็นและลิงก์ตรงไม่ได้
- SDK ไม่รู้จัก URL host เป็นคนแปลง view เป็น URL เอง. host จำลองใช้ `/mypath?month=YYYY-MM` และ `/mypath/all` (route เดียว `/mypath/*` เพื่อไม่ให้ `<MyPath>` remount ตอนสลับ Month/All)
- **เหตุผล:** ยังไม่มีที่มาของลิงก์ที่ต้องเปิดคอร์สตรงๆ. view ที่ host ต้องรู้จักยิ่งน้อย type ก็ยิ่งเล็กและ host ทดสอบน้อยลง. ถ้าวันหลังต้องลิงก์ไปคอร์ส เพิ่มเป็นฟิลด์ที่ไม่บังคับได้ (minor). ใช้ path `/all` แทน `?all` เพราะ `month` มีความหมายเฉพาะใน Month และตรงกับ prototype

### ปุ่ม back ไม่ปิดหน้าภายใน

- SDK ไม่แตะ browser history (`pushState` / `popstate`) เลย
- **หน้ารายละเอียดคอร์ส** และ **แผงปฏิทินการเรียน** ปิดด้วยปุ่ม X, คลิกพื้นหลัง หรือ Esc. ถ้ากด back ขณะเปิดอยู่ ผู้ใช้ออกจาก My Path ไป URL ก่อนหน้าของ host
- ไม่ทำแบบ prototype ที่ปุ่ม X push URL ใหม่ (กด back หลังปิดแล้วหน้ากลับมาเปิดอีก)
- **เหตุผล:** สองหน้านี้เป็น state ภายในอยู่แล้ว ถ้า SDK push history เองจะชนกับ router ของ host (back สองครั้ง, `useBlocker` ทำงานผิด). ถ้า Learn Anywhere พบว่าผู้ใช้ Android ปัดออกโดยไม่ตั้งใจบ่อย ค่อยเพิ่ม prop ที่ไม่บังคับ เช่น `onOverlayChange(open)` ให้ host push history เอง (minor)

### เลื่อนเดือนไม่เข้า history สลับ Month/All เข้า

นี่คือพฤติกรรมที่ host ควรทำ (SDK ไม่ได้บังคับ ดู type ของ view)

- ‹ › เปลี่ยนเดือน = **replace** URL แสดงเดือนปัจจุบันเสมอ แต่ back ครั้งเดียวออกจาก My Path
- สลับ Month ↔ All = **push** กด back จาก All กลับมา Month
- กลับจาก All มา Month ได้ **เดือนล่าสุดที่ดูอยู่** เหมือน prototype
- **เหตุผล:** prototype push ทุกเดือน ถ้าเลื่อนไปดูเดือนสอบ 6 ครั้งต้องกด back 6 ครั้งกว่าจะออก. การสลับ Month/All เหมือนเปลี่ยนแท็บ ผู้ใช้คาดว่า back จะพากลับ และเป็นแค่ entry เดียว

### Type ของ view

```ts
type MyPathView = {
  mode: 'month' | 'all'
  month: string                                    // 'YYYY-MM' เดือนของ Month (ตอนอยู่ All = เดือนที่จะกลับไป)
}

type MyPathProps = {
  view?: MyPathView
  onViewChange?: (view: MyPathView) => void
  // …
}
```

- `month` มีเสมอทั้งสองโหมด host จำลองจึงพก `?month=` ไปบน `/mypath/all` ด้วยเหมือน prototype
- `onViewChange` ส่งแค่ view ใหม่ ไม่บอกว่าควร push หรือ replace. host ใช้กติกา **`mode` เปลี่ยน = push, `mode` เท่าเดิม = replace** ซึ่งได้ผลตามหัวข้อก่อนหน้า และครอบคลุมการแก้ค่าที่ผิดด้วย (แก้แค่ `month` เสมอ)
- `month` เป็น `'YYYY-MM'` ไม่ใช่ `ISODate` เพราะไม่มีวัน และใช้ใน URL ได้ตรงๆ
- **เหตุผล:** แบบ union (`{ mode: 'all' }` ไม่มีเดือน) แม่นกว่า แต่ SDK ต้องจำเดือนล่าสุดไว้นอก `view` ซึ่งขัดกับ props ในโหมด controlled และหายเมื่อ reload `/mypath/all`. ไม่ส่ง `{ replace }` เป็น argument ที่สอง เพราะ SDK ไม่ควรรู้เรื่อง history เลย และ host ตัดสินจาก `mode` ได้เองในบรรทัดเดียว

### ไม่ส่ง view = SDK เก็บเอง

- **ไม่ส่ง `view`:** SDK เก็บ state เอง เริ่มที่ `{ mode: 'month', month: เดือนของวันนี้ }` และยังเรียก `onViewChange` ถ้ามี. ไม่มีอะไรเข้า URL
- **ส่ง `view`:** controlled ทั้งก้อนเหมือน `plan` SDK แสดงตาม `view` เท่านั้น ถ้า host ไม่ส่งค่าใหม่กลับหลัง `onViewChange` หน้าจอไม่เปลี่ยน
- สลับระหว่างสองโหมดระหว่างที่ component ยังอยู่ไม่รองรับ ระหว่าง dev SDK เตือนผ่าน `console.warn`
- ไม่มี `defaultView` host ที่อยากเริ่มที่ All หรือเดือนอื่นใช้แบบ controlled
- เดือนไม่เลื่อนเอง: ข้ามเที่ยงคืนเข้าเดือนใหม่ เดือนที่แสดงยังเท่าเดิม SDK เปลี่ยนเดือนเฉพาะเมื่อนักเรียนกด หรือเมื่อแก้ค่าที่ผิด
- **เหตุผล:** host ที่ไม่ต้องการ deep link ไม่ต้องเขียนอะไรเพิ่ม ส่วน host ที่ต้องการได้ URL กับหน้าจอที่ไม่มีวันเพี้ยนกัน. `defaultView` เพิ่มเป็น prop ที่ไม่บังคับภายหลังได้ (minor)

### view ที่ผิด SDK แก้เองแล้วแจ้งกลับ

- `mode` ไม่รู้จัก → `'month'`
- `month` ผิดรูป (ไม่ใช่ `YYYY-MM`) → เดือนของ **วันนี้** ที่บีบให้อยู่ในแกน
- `month` อยู่นอกแกน → **บีบเข้าขอบแกนที่ใกล้ที่สุด** (ไม่กลับไปเดือนของวันนี้แบบ prototype)
- SDK แสดงค่าที่แก้แล้วทันที แล้วเรียก `onViewChange(ค่าที่แก้)` ใน effect **ครั้งเดียวต่อค่าผิดหนึ่งค่าที่ได้รับ** ถ้า host ไม่ส่งกลับก็ไม่วนซ้ำ. host replace URL ตามกติกา `mode` เท่าเดิม
- ใช้กติกาเดียวกันในโหมด uncontrolled
- dev เตือนผ่าน `console.warn` เฉพาะค่าผิดรูป ส่วนเดือนนอกแกนเป็นเรื่องปกติ ไม่เตือน
- **เหตุผล:** แกนคำนวณใหม่ทุกครั้งที่แผนเปลี่ยน เดือนที่ดูอยู่จึงหลุดแกนได้แม้ host ไม่ได้ส่งค่าผิด (เช่น ดูเดือนสุดท้ายแล้วย่นคอร์สให้จบเร็วขึ้น). บีบเข้าขอบทำให้นักเรียนอยู่ใกล้ที่เดิม ไม่กระโดดกลับไปวันนี้. ลิงก์เก่าจาก LINE ที่เดือนก่อนเริ่มแผนก็ได้เดือนแรกของแผน. ข้อนี้ต่างจาก prototype ต้องระบุในเกณฑ์ "ครบเท่า prototype" (#5)

### เปลี่ยนโหมดแล้วหน้าภายในปิด

- `mode` เปลี่ยน (จาก host หรือผู้ใช้) → SDK ปิด **หน้ารายละเอียดคอร์ส** และ **แผงปฏิทินการเรียน**
- `month` เปลี่ยนอย่างเดียว → ไม่ปิด
- **เหตุผล:** ถ้าเปิดคอร์สจาก All แล้วกด back host จะพากลับ Month ถ้าหน้าคอร์สยังค้างอยู่ ผู้ใช้จะรู้สึกว่า back ไม่ทำงาน. ส่วนเดือนเปลี่ยนได้ระหว่างที่หน้าเปิดอยู่จากการแก้ค่าเท่านั้น (เช่น ย่นคอร์สจนแกนหด) นักเรียนควรยังเห็นคอร์สที่เพิ่งแก้. prototype พก `?course=` ข้ามแท็บ แต่สลับแท็บได้แค่จากปุ่มที่ถูกหน้าคอร์สบังอยู่ จึงไม่เคยเกิดกรณีนี้

## Ticket

Ticket อยู่ใน GitHub Issues ของ `apirak/MyPath` (ชื่อขึ้นต้นด้วย "My Path SDK NN") และผูก blocked-by ด้วยระบบ dependency ของ GitHub. ตารางนี้เป็นภาพรวม รายละเอียดและ acceptance criteria อยู่ใน issue.

**Grill** = ต้องคุยให้ได้ข้อสรุปก่อนลงมือ เพราะเป็นการตัดสินใจที่แก้ภายหลังยาก (หน้าตาของ API หรือคนนอกทีมต้องใช้). ใบ grill แยกจากใบลงมือทำและติด label `ready-for-human`.

| ใบ | Issue | Ticket | Label | Blocked by |
|---|---|---|---|---|
| 01 | #2 | ตาข่ายกันพลาด: tag + Vitest + characterization tests | ready-for-agent | – |
| 02 | #3 | [Grill] สัญญาข้อมูลของ `<MyPath>` | ready-for-human | – |
| 03 | #7 | แยกบ้าน: prototype ที่ /prototype + host จำลอง + package เปล่า | ready-for-agent | #2, #3 |
| 04 | #8 | ชิ้นแรกที่ใช้ได้จริง: หน้า Month ใน SDK (รวม buildPlan) | ready-for-agent | #7 |
| 05 | #9 | หน้า All timeline | ready-for-agent | #8 |
| 06 | #4 | [Grill] view state และ deep link | ready-for-human | – |
| 07 | #10 | หน้ารายละเอียดคอร์ส + ปุ่มซื้อ/เริ่มเรียน | ready-for-agent | #8, #4 |
| 08 | #11 | แผงปฏิทินการเรียน | ready-for-agent | #8 |
| 09 | #12 | ความคืบหน้ารายคอร์ส | ready-for-agent | #8 |
| 10 | #5 | [Grill] เกณฑ์ "ครบเท่า prototype" | ready-for-human | – |
| 11 | #13 | ตรวจว่าครบเท่า prototype + ลบ prototype | ready-for-human | #9, #10, #11, #12, #5 |
| 12 | #6 | [Grill] build และ publish (ต้องรองรับ git submodule ด้วย) | ready-for-human | – |
| 13 | #14 | Library build + publish `@learn/mypath` | ready-for-agent | #13, #6 |

เริ่มได้ทันที: #2, #3, #4, #5, #6. หลัง #8 เสร็จ #9, #11, #12 ทำพร้อมกันได้ (#10 ต้องรอ #4 ด้วย).
