---
status: accepted
---

# จัด `packages/mypath/src/ui/` ตาม feature และวาง CSS ข้าง component

`ui/` แบ่งเป็นโฟลเดอร์ตามหน้าที่: `components/` (ชิ้นที่หลาย view ใช้ร่วม เช่น `HeaderButton`, `icons`, `useModal`, `useOwned`, `PlanEmptyState`), `design/` (ฉากตกแต่งที่ไม่มี logic: `Sky`, `Grass`), และหนึ่งโฟลเดอร์ต่อ view ที่ถือชิ้นของตัวเอง (`header/`, `month/`, `all/`, `course/`, `calendar/`). ชิ้นที่ใช้แค่ view เดียวอยู่ในโฟลเดอร์ของ view นั้น ไม่ย้ายไป `components/` จนกว่าจะมี view ที่สองใช้. คณิตล้วนของหน้า All อยู่ใน `all/layout.ts` แยกจาก JSX เพื่อเทสต์ได้โดยไม่ render.

CSS ของแต่ละโฟลเดอร์อยู่ข้าง component (`month/MonthView.css`, `all/AllView.css`, …). `src/mypath.css` เหลือแค่รายการ `@import` และ **ลำดับ import คือลำดับ cascade** ซึ่งตรงกับไฟล์เดียวเดิม — หลาย rule มี specificity เท่ากันข้ามไฟล์ (เช่น `.mp-progress-start` กับ `.mp-header-button` บน element เดียวกัน) สลับลำดับแล้วหน้าตาเปลี่ยนได้.

## Considered Options

- **แยกตามชนิด (`ui/components/` เก็บทุกชิ้น, view อยู่ราก):** ไม่เลือก เพราะแก้ view หนึ่งต้องกระโดดหลายโฟลเดอร์ และ `components/` จะโตเป็นกองเดียวที่ไม่บอกว่าชิ้นไหนของใคร
- **ให้แต่ละ `.tsx` import CSS ของตัวเอง:** ไม่เลือก เพราะลำดับ cascade จะขึ้นกับลำดับ import ของ module graph ซึ่งเปลี่ยนเงียบๆ เมื่อย้าย import

## Consequences

- เพิ่ม CSS ไฟล์ใหม่ต้องเพิ่มบรรทัดใน `mypath.css` ด้วย ไม่งั้นไม่ถูก bundle (`tests/boundary.test.ts` ตรวจ selector ทุกไฟล์ `.css` ใน SDK แต่ไม่ตรวจว่าถูก import)
- ถ้าย้ายลำดับ import ต้องเทียบ computed style ทุกหน้า (Month, All, รายละเอียดคอร์ส, ปฏิทิน, empty state) ทั้ง desktop / 800px / mobile ก่อน merge
