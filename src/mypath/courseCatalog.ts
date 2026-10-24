// คอร์สกลาง: ใช้ร่วมกันได้กับนักเรียนทุกคน ไม่เก็บวันเรียนหรือสถานะการซื้อ
export type CourseCatalogItem = {
  id: string
  name: string
  short: string
  abbr: string
  hours: number
  cover?: string
}

export type CatalogSubject = { name: string; color: string; courses: CourseCatalogItem[] }

export const courseCatalog: CatalogSubject[] = [
  { name: 'TPAT3', color: '#a51d1d', courses: [
    { id: 'TPAT3.1', name: 'ติวเข้มความถนัด วิศวะ (TPAT3)', short: 'ติวเข้ม TPAT3', abbr: 'ติวเข้ม', hours: 30 },
    { id: 'TPAT3.2', name: 'ตะลุยโจทย์ TPAT3 · ทำข้อสอบเก่า', short: 'ทำข้อสอบเก่า', abbr: 'ทำข้อสอบ', hours: 18 },
  ]},
  { name: 'คณิต 1', color: '#0078c4', courses: [
    { id: 'MATH.1', name: 'Applied Math Admissions TCAS เล่ม 1 (For Dek70)', short: 'เล่ม 1', abbr: 'ล. 1', hours: 24, cover: '/cover/Math_TCAS70_1.png' },
    { id: 'MATH.2', name: 'Applied Math Admissions TCAS เล่ม 2 (For Dek70)', short: 'เล่ม 2', abbr: 'ล. 2', hours: 24, cover: '/cover/Math_TCAS70_2.png' },
    { id: 'MATH.3', name: 'Applied Math Admissions TCAS เล่ม 3', short: 'เล่ม 3', abbr: 'ล. 3', hours: 18, cover: '/cover/Math_TCAS70_3.png' },
    { id: 'MATH.4', name: 'Applied Math Admissions TCAS เล่ม 4', short: 'เล่ม 4', abbr: 'ล. 4', hours: 21, cover: '/cover/Math_TCAS70_4.png' },
    { id: 'MATH.5', name: 'Applied Math Admissions TCAS เล่ม 5', short: 'เล่ม 5', abbr: 'ล. 5', hours: 24, cover: '/cover/Math_TCAS70_5.png' },
    { id: 'MATH.UP', name: 'Upskill คณิตศาสตร์ประยุกต์ 1 A-Level', short: 'Upskill คณิต', abbr: 'UP', hours: 64.5 },
    { id: 'MATH.EX', name: 'MATH TCAS ตะลุยโจทย์ข้อสอบ ครบทุกแนว (UPDATE Version 2026 · TCAS70)', short: 'ตะลุยโจทย์ MATH', abbr: 'ตะลุย', hours: 30, cover: '/cover/Exam_Gym_Math.png' },
  ]},
  { name: 'ฟิสิกส์', color: '#d72630', courses: [
    { id: 'PHY.0', name: 'ปรับพื้นฐานฟิสิกส์ TCAS (ปูพื้น ครบทุกทักษะ ครบทุกแนว)', short: 'ปรับพื้นฐาน', abbr: 'ปูพื้น', hours: 18 },
    { id: 'PHY.1', name: 'ฟิสิกส์ TCAS ล. 1', short: 'ล. 1', abbr: 'ล.1', hours: 24, cover: '/cover/Physics_TCAS70_1.png' },
    { id: 'PHY.2', name: 'ฟิสิกส์ TCAS ล. 2 · กลศาสตร์วิเคราะห์ 2', short: 'ล. 2 · กลศาสตร์ 2', abbr: 'ล.2', hours: 21, cover: '/cover/Physics_TCAS70_2.png' },
    { id: 'PHY.3', name: 'ฟิสิกส์ TCAS ล. 3', short: 'ล. 3', abbr: 'ล.3', hours: 15, cover: '/cover/Physics_TCAS70_3.png' },
    { id: 'PHY.4', name: 'ฟิสิกส์ TCAS ล. 4', short: 'ล. 4', abbr: 'ล.4', hours: 18, cover: '/cover/Physics_TCAS70_4.png' },
    { id: 'PHY.5', name: 'ฟิสิกส์ TCAS ล. 5', short: 'ล. 5', abbr: 'ล.5', hours: 12, cover: '/cover/Physics_TCAS70_5.png' },
    { id: 'PHY.6', name: 'ฟิสิกส์ TCAS ล. 6', short: 'ล. 6', abbr: 'ล.6', hours: 15, cover: '/cover/Physics_TCAS70_6.png' },
    { id: 'PHY.7', name: 'ฟิสิกส์ TCAS ล. 7', short: 'ล. 7', abbr: 'ล.7', hours: 15, cover: '/cover/Physics_TCAS70_7.png' },
    { id: 'PHY.EX', name: "PHYSICS TCAS Dek'70 ตะลุยโจทย์ข้อสอบ ครบทุกแนว (TCAS70)", short: 'ตะลุยโจทย์ฟิสิกส์', abbr: 'ตะลุย', hours: 24, cover: '/cover/Exam_Gym_Physic.png' },
  ]},
  { name: 'TGAT', color: '#ff6b17', courses: [{ id: 'TGAT.1', name: 'ล่าแข่ง TGAT', short: 'ล่าแข่ง TGAT', abbr: 'ล่าแข่ง', hours: 15 }] },
  { name: 'เคมี', color: '#f5bd3d', courses: [
    { id: 'CHEM.1', name: 'เคมี TCAS เล่ม 1 · กลุ่มอะตอมและตารางธาตุ', short: 'เล่ม 1', abbr: 'ล. 1', hours: 20 },
    { id: 'CHEM.2', name: 'เคมี TCAS เล่ม 2 · ปริมาณสัมพันธ์', short: 'เล่ม 2', abbr: 'ล. 2', hours: 20 },
    { id: 'CHEM.3', name: 'เคมี TCAS เล่ม 3 · พันธะเคมี', short: 'เล่ม 3', abbr: 'ล. 3', hours: 20 },
    { id: 'CHEM.4', name: 'เคมี TCAS เล่ม 4', short: 'เล่ม 4', abbr: 'ล. 4', hours: 20 },
    { id: 'CHEM.5', name: 'เคมี TCAS เล่ม 5', short: 'เล่ม 5', abbr: 'ล. 5', hours: 20 },
    { id: 'CHEM.EX', name: 'ตะลุยโจทย์ Upskill เคมี A-Level', short: 'ตะลุยโจทย์', abbr: 'ตะลุย', hours: 24, cover: '/cover/Exam_Gym_Chemistry.png' },
  ]},
]
