// ข้อมูล mock ที่ host ส่งเข้า <MyPath> — แปลงจาก src/prototype/mypath/* ตามสัญญาข้อมูล
import type { ExamEvent, MyPathData } from '@learn/mypath'
import json from './mypath.json'
import physics2 from '../../assets/home/physics-2.png'
import physics3 from '../../assets/home/physics-3.png'

// วันอ้างอิงของ host จำลอง (GLOSSARY.md: "วันนี้") ตรงกับ TODAY ของ prototype
export const TODAY = '2026-12-05'

// ปกที่เป็นรูป import (ไม่มีใน public/cover) — คอร์สที่มี cover ใน JSON แล้วใช้ค่านั้น
const importedCovers: Record<string, string> = { 'PHY.0': physics3, 'CHEM.1': physics2 }

// JSON ขยาย kind เป็น string — cast แค่ events ที่เหลือให้ TS ตรวจตามสัญญาจริง
const fromJson: MyPathData = { ...json, events: json.events as ExamEvent[] }

export const mypathData: MyPathData = {
  ...fromJson,
  catalog: fromJson.catalog.map(group => ({ ...group, subjects: group.subjects.map(subject => ({
    ...subject,
    courses: subject.courses.map(course => ({ ...course, cover: course.cover ?? importedCovers[course.id] })),
  })) })),
}
