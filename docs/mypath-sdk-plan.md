# แผนทำ My Path เป็น SDK

เหตุผลระดับสถาปัตยกรรมอยู่ใน [ADR-0001](adr/0001-mypath-as-react-sdk.md). วิธีที่ Learn Anywhere นำ SDK ไปใช้ (npm / git submodule / link แบบ local) อยู่ใน [mypath-integration.md](mypath-integration.md). เอกสารนี้คือแผนลงมือทำ: ลำดับขั้น เหตุผลของแต่ละขั้น และรายการ ticket.

## เป้าหมาย

Learn Anywhere ตัวจริง (React web) ติดตั้ง package แล้ววางไว้ในแท็บที่ 3:

```tsx
<MyPath
  data={{ catalog, plan, events, courseDetails, progress }}
  today="2026-12-05"
  onPlanChange={plan => save(plan)}         // ผู้ใช้แก้วันเริ่ม/ชั่วโมง/ปฏิทิน
  onBuyCourse={courseId => openShop(courseId)}
  onStartCourse={courseId => openPlayer(courseId)}
/>
```

- **Host เป็นเจ้าของข้อมูล:** แผนการเรียนเป็นแบบ controlled คือ SDK ส่งแผนใหม่ผ่าน `onPlanChange` แล้ว host เป็นคนบันทึกและส่งกลับเข้ามา
- **UI state อยู่ใน SDK:** Month/All, เดือนที่เลือก, คอร์สที่เปิดอยู่. ถ้า host ต้องการ deep link ค่อยเพิ่ม `view` / `onViewChange` เป็น prop ที่ไม่บังคับ
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

## Ticket

**Grill** = ต้องคุยให้ได้ข้อสรุปก่อนลงมือ เพราะเป็นการตัดสินใจที่แก้ภายหลังยาก (หน้าตาของ API หรือคนนอกทีมต้องใช้).

| # | Ticket | Grill ก่อน? | ขึ้นกับ | หมายเหตุ |
|---|---|---|---|---|
| T1 | ตาข่ายกันพลาด: tag + Vitest + characterization tests | ไม่ต้อง | – | ready-for-agent |
| T2 | สัญญาข้อมูล: type ของ `data` และ callback ทั้งหมด | **Grill** | – | เป็น public API แก้ทีหลังแล้ว host ต้องแก้ตาม. ประเด็น: host ส่ง progress เป็น % หรือเป็นรายบท, ส่ง `courseDetails` มากับ props หรือให้ SDK ดึงเอง, `onPlanChange` ส่งแผนทั้งก้อนหรือเฉพาะส่วนที่เปลี่ยน, ราคาคอร์สมาจากไหน |
| T3 | แยกบ้าน: ย้ายไป `src/prototype` + host shell + package เปล่า + ไฟล์ JSON ฝั่ง host + เทสต์ตรวจขอบเขต import | ไม่ต้อง | T1, T2 | ทำตามหัวข้อ "แยก host กับ SDK". ต้องแก้ลิงก์ BottomNav ของ prototype ให้ชี้ `/prototype/mypath` |
| T4 | `buildPlan` เป็นฟังก์ชันล้วน + เทสต์เทียบกับ prototype | ไม่ต้อง | T3 | |
| T5 | UI: header + หน้า Month | ไม่ต้อง | T4 | ชิ้นแรก เป็นตัวกำหนดแบบแผนของ CSS scope |
| T6 | UI: หน้า All timeline (รวมการลากและ snap วันจันทร์) | ไม่ต้อง | T5 | |
| T7 | UI: Course detail + ปุ่มซื้อ/เริ่มเรียน + view state (ไม่ใช้ router) | **Grill** | T5 | ประเด็น: host ต้องการ deep link / ปุ่ม back หรือไม่ ถ้าต้องการ หน้าตาของ `view` / `onViewChange` เป็นอย่างไร |
| T8 | UI: Study calendar panel | ไม่ต้อง | T5 | |
| T9 | UI: Course progress (แผงทดสอบอยู่ฝั่ง host) | ไม่ต้อง | T5 | ใช้ข้อสรุปเรื่อง progress จาก T2 |
| T10 | ตรวจว่าครบเท่า prototype + ลบ `src/prototype` | **Grill** (สั้น) | T6–T9 | ตกลงเกณฑ์ "ครบแล้ว" ก่อน ว่าจะเทียบหน้าไหน สถานะไหน ทั้ง desktop และ mobile. ready-for-human |
| T11 | Library build + publish | **Grill** | T10 | ต้องรักษาให้ host ใช้ผ่าน git submodule ได้ด้วย (ดู mypath-integration.md). ประเด็น: registry, การนับเวอร์ชัน, lucide-react ใส่ไปใน bundle หรือเป็น peer, ต้องใช้ React เวอร์ชันขั้นต่ำเท่าไร (ตอนนี้ใช้ 19) |

T6–T9 ทำพร้อมกันได้หลัง T5 เสร็จ.
