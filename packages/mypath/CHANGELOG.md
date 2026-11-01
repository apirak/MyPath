# Changelog

การเปลี่ยนแปลงของ `@learn/mypath` ทั้งหมดบันทึกไว้ที่นี่ รูปแบบตาม [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) และเลขเวอร์ชันตาม [Semantic Versioning](https://semver.org/) (กติกาช่วง `0.x` ดู `docs/mypath-sdk-plan.md` หัวข้อ "เวอร์ชัน")

## [0.1.0] - ยังไม่ release

### Added

- `<MyPath>` หน้า Month, All timeline, รายละเอียดคอร์ส, แผงปฏิทินการเรียน และความคืบหน้ารายคอร์ส ครบเท่า prototype `mockup-v1`
- สัญญาข้อมูล `MyPathData` / `StudentPlan` และ `view` / `onViewChange` สำหรับ deep link
- Library build: `dist/index.js` (ES module) + `.d.ts` + `dist/style.css`, `exports` เปิดแค่ `.` กับ `./style.css`
- peer `react` / `react-dom` `^19.0.0` ไม่มี dependency อื่น (ไอคอนเป็น SVG ของ SDK เอง) รูปฝังเป็น data URI
