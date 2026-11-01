# การนำ My Path SDK ไปใช้ใน Learn Anywhere

คู่มือสำหรับทีม Learn Anywhere (React web) ที่จะวาง My Path ไว้ในแท็บที่ 3. ที่มาของการตัดสินใจอยู่ใน [ADR-0001](adr/0001-mypath-as-react-sdk.md) แผนการทำ SDK อยู่ใน [mypath-sdk-plan.md](mypath-sdk-plan.md).

> **สถานะ:** SDK ยังไม่ได้ release. เวอร์ชันแรกจะเป็น `0.1.0` ช่องทางแจกตัดสินแล้ว (วิธี A ข้างล่าง) แต่ยังไม่เปิดใช้จนกว่าจะตกลงกับทีม Learn Anywhere ว่าจะเชื่อมกันอย่างไร

## ภาพรวม

```
Learn Anywhere (host)                         My Path SDK
─────────────────────                         ───────────
API ของ host ──► toMyPathData() ──► data ───► <MyPath>
                                    today ──►
URL ของ host ◄────────── view / onViewChange ◄─►   (ไม่บังคับ)
backend ◄── savePlan ◄──────────── onPlanChange
shop    ◄────────────────────────── onBuyCourse
player  ◄────────────────────────── onStartCourse
```

- host เป็นเจ้าของข้อมูลทั้งหมด SDK แค่แสดงผลและแจ้งว่าผู้ใช้แก้อะไร
- SDK ไม่ยิง API, ไม่ใช้ localStorage, ไม่ส่ง analytics
- ข้อกำหนด: React และ React DOM `^19.0.0` (peerDependencies ของ SDK) ไม่ต้องติดตั้ง react-router, Tailwind หรือ `lucide-react` เพิ่มเพื่อ SDK (ไอคอนที่ใช้ bundle มากับ SDK แล้ว)

## ขั้นที่ 1 — ติดตั้ง

เลือกวิธีใดวิธีหนึ่ง:

| วิธี | เหมาะกับ | ข้อดี | ข้อเสีย |
|---|---|---|---|
| **A. npm install tarball จาก GitHub Release** (แนะนำ) | ใช้งานจริง | ปักเวอร์ชันชัด, ได้ไฟล์ที่ build แล้ว, ไม่ต้องมี registry หรือ token | ขึ้นเวอร์ชันต้องแก้ URL เอง (`npm update` ใช้ไม่ได้) |
| **B. Git submodule** | ไม่อยากใช้ registry | ไม่ต้องมี registry, เห็น source ตรงๆ | CI ต้องดึง submodule และต้องมีสิทธิ์อ่าน repo นี้, host ต้อง compile source เอง |
| **C. `file:` link แบบ local** | dev ทั้งสอง repo พร้อมกัน | แก้ SDK แล้วเห็นผลใน host ทันที | ใช้บนเครื่อง dev เท่านั้น ห้ามใช้ build จริง |

### A. npm install tarball จาก GitHub Release

แต่ละเวอร์ชันมี tarball ที่ build แล้วแนบอยู่กับ Release ของ tag `mypath-vX.Y.Z`:

```bash
npm install https://github.com/apirak/MyPath/releases/download/mypath-v0.1.0/learn-mypath-0.1.0.tgz
```

ชื่อ package ยังเป็น `@learn/mypath` import ได้ตามปกติ. ไม่ต้องตั้ง `.npmrc` หรือ token เพราะ repo เป็น public. ถ้าวันหลัง repo ย้ายไปเป็น private ของบริษัท วิธีนี้จะเปลี่ยนเป็น registry และคู่มือนี้จะบอกวิธีใหม่.

### B. Git submodule (ไม่ใช้ npm registry)

ดึง repo นี้มาไว้ใน repo ของ Learn Anywhere แล้วปักไว้ที่ tag ของเวอร์ชันที่ต้องการ:

```bash
git submodule add git@github.com:apirak/MyPath.git vendor/mypath
```

```bash
git -C vendor/mypath checkout mypath-v0.1.0
```

```bash
git add .gitmodules vendor/mypath && git commit -m "chore: add My Path SDK v0.1.0"
```

ให้ host compile source ของ SDK ไปพร้อมกับโค้ดตัวเอง แบบเดียวกับที่ host จำลองใน repo นี้ทำ คือชี้ชื่อ package ไปที่ `index.ts`:

```ts
// vite.config.ts ของ host
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: { '@learn/mypath': fileURLToPath(new URL('./vendor/mypath/packages/mypath/src/index.ts', import.meta.url)) },
    dedupe: ['react', 'react-dom'],
  },
})
```

```jsonc
// tsconfig.json ของ host
{ "compilerOptions": { "paths": { "@learn/mypath": ["./vendor/mypath/packages/mypath/src/index.ts"] } } }
```

ถ้า host ใช้ Next.js แทน Vite ให้ใช้ `transpilePackages` และตั้ง alias ใน `webpack` / `turbopack` แทน.

สิ่งที่ต้องระวังเมื่อใช้ submodule:
- **CI:** ต้อง checkout submodule ด้วย (เช่น `actions/checkout` ตั้ง `submodules: true`) และ CI ต้องมีสิทธิ์อ่าน repo `apirak/MyPath` ผ่าน deploy key หรือ token
- **Dev คนใหม่:** clone ด้วย `git clone --recurse-submodules` หรือรัน `git submodule update --init` หลัง clone ไม่อย่างนั้นโฟลเดอร์ `vendor/mypath` จะว่าง
- **อัปเดตเวอร์ชัน:** `git -C vendor/mypath fetch --tags`, checkout tag ใหม่ แล้ว commit ตัวชี้ submodule. อ่าน changelog ก่อนขึ้นเวอร์ชันใหญ่
- **ห้ามแก้โค้ดใน `vendor/mypath` จาก repo host.** ถ้าต้องแก้ ให้แก้ใน repo นี้แล้วออก tag ใหม่

### C. `file:` link สำหรับ dev สองฝั่งพร้อมกัน

วาง repo ทั้งสองไว้ข้างกัน (`../MyPath` กับ `../learn-anywhere`) แล้วในเครื่อง dev:

```bash
npm install ../MyPath/packages/mypath
```

npm จะสร้าง symlink ไปที่โฟลเดอร์ SDK. ต้องตั้ง `resolve.dedupe: ['react', 'react-dom']` ใน Vite เหมือนวิธี B ไม่อย่างนั้นจะได้ React สองชุด และ hook จะ error (`Invalid hook call`). ก่อน commit ให้คืนค่า `package.json` กลับเป็นวิธี A หรือ B.

## ขั้นที่ 2 — วาง component ในแท็บที่ 3

```tsx
import { MyPath } from '@learn/mypath'
import '@learn/mypath/style.css'                    // วิธี A เท่านั้น — วิธี B/C ได้ CSS จาก index.ts อัตโนมัติ

export function MyPathTab() {
  const { data, isLoading } = useMyPathData()         // host ดึงจาก API ของตัวเอง แล้วแปลงด้วย toMyPathData()
  const savePlan = useSaveStudentPlan()

  if (isLoading) return <Spinner />
  return (
    <div className="h-full">                            {/* กล่องที่สูงแน่นอน SDK เติมเต็มและ scroll ข้างในเอง */}
      <MyPath
        data={data}
        // today="2026-12-05"                           // ไม่บังคับ: ส่งเมื่อทดสอบหรือต้องการยึดเวลา server
        onPlanChange={savePlan}
        onBuyCourse={id => navigate(`/shop/${id}`)}
        onStartCourse={id => navigate(`/learn/${id}`)}
      />
    </div>
  )
}
```

- SDK ไม่รู้ว่ามี tab bar หรือ header ของ host. host เป็นคนให้กล่องที่มีความสูงแน่นอน
- CSS ของ SDK อยู่ใต้ `.mypath-root` ทั้งหมด ไม่แตะ style ของ host. **ห้าม host เขียน style ทับ class ของ SDK** (`.mypath-root`, `mp-*`) class เหล่านี้เป็นของภายใน เปลี่ยนได้ทุกเวอร์ชันโดยไม่ถือเป็น breaking change
- รูปของ SDK ฝังมาเป็น data URI ถ้า host ตั้ง CSP ต้องอนุญาต `img-src data:`
- `today` ไม่บังคับ ถ้าไม่ส่ง SDK ใช้วันตามเวลาไทยจากนาฬิกาเครื่อง และเปลี่ยนวันเองเมื่อข้ามเที่ยงคืน ถ้าส่ง ให้เป็น `'YYYY-MM-DD'` ตามเวลาไทยที่ host แปลงจากเวลา server เอง SDK จะใช้ค่านั้นตายตัว
- `onBuyCourse` ส่งแค่ `courseId` host เป็นคนตัดสินว่าจะพาไปซื้อเล่มเดี่ยวหรือทั้งแพ็ก

## ขั้นที่ 3 — เขียนตัวแปลงข้อมูล (adapter)

API ของ Learn Anywhere คงไม่ได้ส่งข้อมูลรูปเดียวกับ `MyPathData` พอดี ให้เขียนฟังก์ชันแปลงไว้จุดเดียว:

```ts
import type { MyPathData } from '@learn/mypath'

export const toMyPathData = (res: LearnAnywhereMyPathResponse): MyPathData => ({
  catalog: /* กลุ่ม → วิชา (id, ชื่อ, สี) → คอร์สเรียงตามลำดับเล่ม */,
  plan: /* แผนเรียนที่บันทึกไว้ล่าสุด: { calendar, courses } */,
  events: /* สอบจริง / Mock เฉพาะที่เกี่ยวกับนักเรียนคนนี้ */,
  owned: /* id ของคอร์สและ Mock ที่ซื้อแล้ว */,
  progress: /* courseId → 0–100 */,
  prices: /* courseId → { now, was? } เป็นบาท ราคาเดียวกับร้านค้า */,
  packs: /* packId → { name, teacher } */,
  courseDetails: /* courseId → { packId?, volume?, examgym? } */,
})
```

type ทั้งหมดและเหตุผลของแต่ละฟิลด์อยู่ใน [สัญญาข้อมูล](mypath-sdk-plan.md#สัญญาข้อมูล). ถ้า SDK เปลี่ยนรูปข้อมูล TypeScript จะเตือนที่ฟังก์ชันนี้ที่เดียว.

ข้อควรรู้:
- ทุกวันที่เป็น `'YYYY-MM-DD'` ตามเวลาไทย
- วิชาอ้างด้วย `id` ไม่ใช่ชื่อ ทั้งใน catalog และ `plan.calendar.subjects`
- แผนเก็บเฉพาะค่าที่นักเรียนตั้ง ไม่ต้องสร้าง `StudentCourse` ให้ครบทุกคอร์ส คอร์สที่ไม่มีใช้ค่าเริ่มต้น
- ข้อมูลที่ SDK ไม่รู้จัก (เช่น id ที่ไม่มีใน catalog) จะไม่แสดง แต่ไม่ทำให้หน้าพัง ระหว่าง dev ดูคำเตือนได้ใน console

## ขั้นที่ 4 — รับการเปลี่ยนแปลงแล้วบันทึก

SDK รับแผนแบบ controlled เมื่อผู้ใช้แก้แผนเสร็จ SDK จะเรียก `onPlanChange(plan)` พร้อมแผนเรียนทั้งก้อน (`{ calendar, courses }`) ไม่ใช่เฉพาะส่วนที่เปลี่ยน แล้ว host ต้อง:

1. บันทึกลง backend
2. ส่งแผนใหม่กลับเข้า `data` (แนะนำให้อัปเดตหน้าจอทันทีก่อนรอผลจาก server เพื่อไม่ให้ UI ค้าง)

ถ้าไม่ส่งกลับ หน้าจอจะกลับไปเป็นแผนเดิม.

- แผนที่ส่งมาไม่มีการซื้อ วันสอบ หรือความคืบหน้า host เปลี่ยนค่าเหล่านี้เองฝ่ายเดียว
- การลากคอร์สในหน้า All ยิงครั้งเดียวตอนปล่อย ส่วน slider / สวิตช์ / ช่องวันที่ ยิงทันที
- กด "เริ่มเรียน" ในคอร์สที่ยังไม่มีวันเริ่มต้น SDK จะยิง `onPlanChange` (ตรึงวันเริ่ม) ก่อน `onStartCourse`
- SDK ส่งทุกรายการในแผนกลับไปครบ รวมถึงรายการที่ไม่รู้จัก บันทึกทับได้เลยโดยไม่ต้อง merge

## ขั้นที่ 5 — งานฝั่ง backend

ต้องมี endpoint สำหรับ: ดึง catalog คอร์ส, ดึงแผนของนักเรียน, ดึงวันสอบ, ดึงความคืบหน้า และบันทึกแผน.

**ความรับผิดชอบเรื่อง PDPA [DP-001]:** ข้อมูลนักเรียนทั้งหมดผ่าน host อย่างเดียว การจัดเก็บ สิทธิ์เข้าถึง และการขอความยินยอมจากผู้ปกครอง (กรณีผู้เยาว์) จึงเป็นหน้าที่ของ Learn Anywhere.

## Deep link / ปุ่ม back

ไม่บังคับ ถ้าไม่ส่ง `view` SDK เก็บเองว่าอยู่ Month หรือ All และเดือนไหน โดยไม่มีอะไรเข้า URL. ถ้าต้องการลิงก์ตรงหรือให้ back พาจาก All กลับ Month ให้ส่ง `view` / `onViewChange` แล้วเก็บค่าไว้ใน URL ของตัวเอง:

```ts
type MyPathView = { mode: 'month' | 'all'; month: string }   // month = 'YYYY-MM'
```

ตัวอย่างกับ react-router (route เดียว `/mypath/*` เพื่อไม่ให้ `<MyPath>` remount ตอนสลับ Month/All):

```tsx
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { MyPath, type MyPathView } from '@learn/mypath'

// <Route path="/mypath/*" element={<MyPathTab />} />
export function MyPathTab() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const view: MyPathView = {
    mode: pathname.endsWith('/all') ? 'all' : 'month',
    month: params.get('month') ?? '',               // ว่างหรือผิด SDK แก้เองแล้วแจ้งกลับ
  }
  const onViewChange = (next: MyPathView) => {
    const path = next.mode === 'all' ? '/mypath/all' : '/mypath'
    navigate(`${path}?month=${next.month}`, { replace: next.mode === view.mode })
  }

  return <MyPath data={data} view={view} onViewChange={onViewChange} /* … */ />
}
```

- **ลิงก์ตรงได้สองแบบ:** `/mypath?month=YYYY-MM` (Month ของเดือนนั้น) และ `/mypath/all`. หน้ารายละเอียดคอร์สและแผงปฏิทินการเรียนเป็น state ภายใน SDK ลิงก์ตรงไม่ได้
- **push หรือ replace host เป็นคนตัดสิน:** `mode` เปลี่ยน = push (back จาก All กลับ Month), `mode` เท่าเดิม = replace (เลื่อนเดือนกี่ครั้ง back ครั้งเดียวก็ออกจาก My Path)
- **ปุ่ม back ไม่ปิดหน้าภายใน:** SDK ไม่แตะ browser history เลย ถ้ากด back ขณะหน้ารายละเอียดคอร์สเปิดอยู่ ผู้ใช้ไปที่ URL ก่อนหน้าของ host. ถ้า back นั้นเปลี่ยน Month ↔ All หน้าภายในจะปิดให้เอง
- **ค่าผิด:** `month` ว่าง ผิดรูป หรืออยู่นอกแกนของแผน SDK แสดงเดือนที่ถูกต้องทันที แล้วเรียก `onViewChange` ครั้งเดียวเพื่อให้ host แก้ URL (เป็น replace ตามกติกาด้านบน)
- **controlled:** เมื่อส่ง `view` แล้ว SDK แสดงตาม `view` เท่านั้น ถ้าไม่อัปเดต `view` หลัง `onViewChange` หน้าจอไม่เปลี่ยน. อย่าสลับระหว่างส่งกับไม่ส่ง `view` ระหว่างที่ component ยังอยู่

เหตุผลของแต่ละข้ออยู่ใน [View state และ deep link](mypath-sdk-plan.md#view-state-และ-deep-link).

## เมื่อ SDK ออกเวอร์ชันใหม่

- อ่าน `packages/mypath/CHANGELOG.md` ก่อนทุกครั้ง แล้วแก้ URL ของ tarball (วิธี A) หรือ checkout tag ใหม่ใน submodule (วิธี B)
- **ระหว่าง `0.x`:** ขึ้น patch (`0.1.0` → `0.1.1`) อัปเดตได้เลย, ขึ้น minor (`0.1` → `0.2`) คือ breaking ต้องแก้ adapter ตาม changelog
- **ตั้งแต่ `1.0.0`:** minor / patch อัปเดตได้เลย, major คือ props หรือรูปข้อมูลเปลี่ยน ต้องแก้ adapter ตาม changelog. กติกาเต็มอยู่ใน [Build และ publish](mypath-sdk-plan.md#build-และ-publish)

## ข้อกำหนดที่ SDK ต้องรักษา (สำหรับทีม SDK)

เพื่อให้วิธี B และ C ใช้ได้:
- source ของ SDK ต้อง compile ได้ด้วย TypeScript + React ธรรมดา ห้ามพึ่ง Vite plugin หรือ macro พิเศษ
- `index.ts` ต้อง import `mypath.css` เอง เพื่อให้คนที่ compile จาก source ได้ CSS ไปด้วยโดยไม่ต้องตั้งค่าเพิ่ม
- ทุก release ต้องมี git tag `mypath-vX.Y.Z` ตรงกับเวอร์ชันใน `package.json`
