// ข้อมูล mock ที่ host ส่งเข้า <MyPath> — แปลงจาก src/prototype/mypath/*
// ตามสัญญาข้อมูล
// ปกมาจาก public/cover เท่านั้น คอร์สที่ไม่มีปกไม่ใส่ cover
// เพื่อให้เห็นหน้าตาตอนไม่มีปก
// id วิชาเป็นรหัสจริงของ backend (a_lv_*, tgat, tpat*)
import type { ExamEvent, MyPathData } from '@learn/mypath'
import json from './mypath.json'

// วันอ้างอิงของ host จำลอง (GLOSSARY.md: "วันนี้") — ตรึงไว้เพราะวันที่ใน mock
// data ผูกกับ ธ.ค. 2569 (แผงทดสอบเปลี่ยนได้)
export const TODAY = '2026-12-05'

// JSON ขยาย kind เป็น string — cast แค่ events ที่เหลือให้ TS ตรวจตามสัญญาจริง
export const mypathData: MyPathData = {
  ...json,
  events: json.events as ExamEvent[],
}
