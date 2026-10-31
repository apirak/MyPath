---
status: accepted
---

# My Path เป็น React SDK ที่ Learn Anywhere เป็นคนส่งข้อมูลให้

My Path (แท็บที่ 3) จะถูกส่งให้ Learn Anywhere ตัวจริง (React web) ใช้เป็น npm package ที่ export `<MyPath data today onPlanChange onBuyCourse onStartCourse />`. Host เป็นเจ้าของข้อมูลทั้งหมดและเป็นคนบันทึก ส่วน SDK เก็บไว้เฉพาะ UI state ของตัวเอง. SDK ไม่ยิง API, ไม่เก็บ localStorage, ไม่ส่ง analytics เพราะข้อมูลเป็นของนักเรียนที่ส่วนใหญ่ยังเป็นผู้เยาว์ (PDPA, [DP-001]) จึงให้ความรับผิดชอบเรื่องการจัดเก็บอยู่ที่ host ที่เดียว.

ระหว่างทำ SDK ใน repo นี้มีของสามชุดอยู่คู่กัน: `src/prototype` คือ mockup เดิมที่ถูกแช่แข็งไว้ (เปิดดูได้ที่ `/prototype/*`), `src/host` คือ Learn Anywhere จำลองที่ใช้ SDK แบบเดียวกับแอปจริง, และ `packages/mypath` คือตัว SDK. แผนลงมือทำอยู่ใน [docs/mypath-sdk-plan.md](../mypath-sdk-plan.md).

## Considered Options

- **แปลงโค้ดเดิมในที่เดิมทีละส่วน (in-place refactor):** ไม่เลือก เพราะระหว่างทำจะไม่มีหน้าที่ถูกต้องไว้เปิดเทียบ และพฤติกรรมที่ละเอียด (การ snap วันจันทร์, การต่อคอร์ส) อาจเพี้ยนไปโดยไม่มีใครเห็น
- **ตั้ง library build และ publish ให้ครบก่อน แล้วค่อยย้ายโค้ด:** ไม่เลือก เพราะโค้ดตอนนี้ยังผูกกับ react-router, ใช้ CSS แบบ global และมี state ระดับ module ชุดเดียวทั้งแอป ถ้าตั้ง build ตอนนี้จะพังหรือต้องรื้อตั้งใหม่ภายหลัง. ที่เลือกคือสร้างแค่โฟลเดอร์ package กับไฟล์ `index.ts` ที่เป็นทางเข้าทางเดียวไว้ก่อน แล้วค่อยทำ build ท้ายสุด
- **ฝังผ่าน WebView / Web Component:** ไม่จำเป็น เพราะ host เป็น React อยู่แล้ว

## Consequences

- ช่วงนี้จะมีโค้ดซ้ำระหว่าง prototype กับ SDK โดยตั้งใจ. ยอมรับได้เพราะ prototype เป็นแค่ของอ้างอิงที่ไม่แก้แล้ว. เมื่อ SDK ทำได้ครบเท่า prototype ให้ลบ `src/prototype` ออก (โค้ดยังเรียกคืนได้จาก tag `mockup-v1`)
- ฟังก์ชันคำนวณถูก copy ไปทั้งก้อน ไม่ได้เขียนใหม่. เทสต์จึงเทียบผลของ SDK กับของ prototype ได้ตรงๆ
- "วันนี้" ไม่ใช่ค่าคงที่ในโค้ดอีกต่อไป host ส่งเข้ามาได้ ถ้าไม่ส่ง SDK ใช้วันตามเวลาไทยจากนาฬิกาเครื่อง (แก้ตาม grill #3 ดู [สัญญาข้อมูล](../mypath-sdk-plan.md#สัญญาข้อมูล))
