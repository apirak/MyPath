// รายละเอียดคอร์ส mock ของ My Path — mirror ของ SAMPLE_DATA/
// (TCAS70_Math/TCAS70_Physic = แพ็ก V-Series, Exam_GYM_* = คลังโจทย์, _shared-* = ส่วนแชร์)
// โครงสร้าง: ระดับแพ็ก (PackInfo) → ระดับเล่ม (Volume) ผูกกับรหัสคอร์สใน plan.ts
// คอร์สที่ไม่มีใน courseDetails = กลุ่ม "ไม่มีรายละเอียด" → หน้า UI แสดงการ์ดย่อจาก plan.ts เท่านั้น

// ปุ่ม "หาซื้อบน OnDemand" ของคอร์สที่ยังไม่ได้ซื้อ — เปลี่ยนลิงก์ที่ตัวเดียว เปลี่ยนทุกปุ่ม
export const ONDEMAND_URL = 'https://shoponline.ondemand.in.th'

// ราคาจาก courses.md (มีเฉพาะคอร์สที่มีภาพคอร์ส) — now = ราคาปัจจุบัน, was = ราคาเดิม
export const prices: Record<string, { now: number; was?: number }> = {
  'MATH.1': { now: 3900, was: 4900 },
  'MATH.EX': { now: 4900, was: 6900 },
  'PHY.0': { now: 3900 },
  'PHY.EX': { now: 5900, was: 7900 },
}

// _shared-eggspace.md — 3 ระบบหลักของ Version eggspace (แชร์ทุกแพ็ก V-Series)
export const EGGSPACE_SYSTEMS = [
  { name: 'Level-up Mission', desc: 'เปลี่ยนการเรียนให้เป็นภารกิจ เก็บเลเวลทุกวัน โจทย์ไต่ระดับจากง่ายไปยาก เห็นพัฒนาการชัดในทุกบท' },
  { name: 'Step Solution', desc: 'เฉลยละเอียดแบบ Step-by-step ไม่ข้ามขั้นตอน ดูเฉลยได้ทันทีไม่ว่าตอบถูกหรือผิด' },
  { name: 'Mistake Hunter', desc: 'ดึงแนวโจทย์ที่เคยพลาดกลับมาฝึกใหม่ (ไม่ซ้ำข้อเดิม) + ปุ่ม "ไม่มั่นใจ" ป้องกันการเดาถูก' },
]
export const EGGSPACE_NOTES = ['เรียนได้จนถึงวันสอบ (หมดอายุ 31 มี.ค. 70)', 'แถม Mock ถึง 15 ธ.ค. 69']

// _shared-examgym.md — 4 ระบบของ ExamGym (แชร์ทุกวิชา)
export const EXAMGYM_SYSTEMS = [
  { name: 'คลังโจทย์ Unlimited', desc: 'โจทย์คุณภาพอิง Blueprint ล่าสุด ฝึกได้ไม่จำกัด พร้อมจับเวลาจำลองสนามสอบจริง' },
  { name: 'Clear Assistance', desc: 'โจทย์โต้ตอบได้ สงสัยตรงไหนพิมพ์ถามเจาะลึกได้ทันที' },
  { name: 'Personalized Quiz Feed', desc: 'Adaptive โจทย์ตามระดับเรา ไต่จากง่าย กลาง ยาก แต่ละคนได้โจทย์ไม่เหมือนกัน' },
  { name: 'Mastery Dashboard', desc: 'สรุปสถิติรายบท บทไหนแม่น บทไหนต้องซ่อม ก่อนวันสอบจริง' },
]
export const EXAMGYM_AUDIENCE = 'น้อง ม.ปลาย ทุกคน ทั้งพื้นฐานดี (ยิ่งเรียนยิ่งได้ฝึก) และพื้นฐานอ่อน (ยิ่งเรียนยิ่งเก่ง) — ถามได้ตอบได้เหมือนมีผู้ช่วยส่วนตัว'

// แพ็ก V-Series (TCAS70_*.md) — คอร์สใน plan.ts ที่เป็น "เล่ม" ของแพ็ก อ้างถึงแพ็กตัวเดียวกัน
export type Volume = { bookNo?: string; title?: string; eggspaceStart?: string; chapters: string[] }
export type PackInfo = {
  kind: 'pack'
  name: string
  teacher: string
  audience: string
  books: string
  highlights: string[]
  privileges: string[]
  notes?: string[]
}
export type ExamGymInfo = {
  kind: 'examgym'
  slogan: string
  painPoint: string
  sellingPoints: string[]
  notes?: string[]
}
export type CourseDetail = { pack?: PackInfo; volume?: Volume; examgym?: ExamGymInfo }

// TCAS70_Math.md
const mathPack: PackInfo = {
  kind: 'pack',
  name: 'Math Admissions TCAS (V-Series)',
  teacher: 'พี่แท็ป',
  audience: 'นักเรียน ม.ปลาย ที่เตรียมสอบแข่งขัน คณิตศาสตร์ A-Level',
  books: '5 เล่ม (8303–8307)',
  highlights: [
    'สรุปเนื้อหา ม.4–ม.6 เข้มข้น ครบทุกบทสำคัญตามโครงสร้างหลักสูตร',
    'แนวข้อสอบประยุกต์ตามหลักสูตร สสวท. รวมกว่า 3,000 ข้อ',
    'เทคนิคทำข้อสอบ "A Point" วิเคราะห์โจทย์เร็ว ทำได้ทุกแนว',
  ],
  privileges: ['ฟรี TCASTER Mock Exam: คณิตศาสตร์ A-Level'],
}

// TCAS70_Physic.md
const phyPack: PackInfo = {
  kind: 'pack',
  name: 'Pack V-Series Physics TCAS',
  teacher: 'พี่เต้ย · พี่เกรท · พี่เฟรนด์ ออนดีมานด์',
  audience: 'นักเรียน ม.ปลาย ที่เตรียมสอบแข่งขัน ฟิสิกส์ A-Level',
  books: '8 เล่ม (1301–1307, 1312)',
  highlights: [
    'สรุปเนื้อหาเข้มข้นครอบคลุมแนว TCAS + วิเคราะห์ข้อสอบเก่า อัปเดตแนวใหม่ล่าสุด',
    'โจทย์ในแพ็กกว่า 2,200 ข้อ + วิดีโอเสริมผ่าน QR Code',
    'เทคนิค Supermap เข้าใจโจทย์เร็ว · X-Map สรุปก่อนสอบ',
  ],
  privileges: [
    'ฟรี Extension รวมโจทย์กว่า 1,600 ข้อ',
    'ฟรี The Radar สรุปสูตรฉบับพกพา (แถมเฉพาะแพ็กเกจเรียน + ตำรา)',
    'ฟรี TCASTER Mock Exam: ฟิสิกส์ A-Level',
  ],
}

// Exam_GYM_*.md → คอร์ส EX ในแผน
const examgymMath: ExamGymInfo = {
  kind: 'examgym',
  slogan: 'คณิต A-Level โจทย์ยาว ถึก และซับซ้อนจนทำไม่ทัน!',
  painPoint: 'อ่านโจทย์แล้วตีความไม่ได้ ไม่รู้ว่าบทไหนผสมกับบทไหน อ่านเฉลยแล้วยังงงบรรทัดการแก้สมการ',
  sellingPoints: ['พิมพ์ถาม Clear ได้ว่า "จากบรรทัดนี้ไปบรรทัดนี้คิดยังไง?" + Mastery Dashboard บอกบทไหนคะแนนรั่ว'],
}
const examgymPhy: ExamGymInfo = {
  kind: 'examgym',
  slogan: 'มิติใหม่ของการซ้อม! โจทย์ที่ถามกลับได้ ซ่อมจุดอ่อนได้ตรงจุด',
  painPoint: 'ท่องสูตรได้ แต่ไม่รู้จะเริ่มวาดภาพหรือตั้งสมการยังไง อ่านเฉลยก็ยังงงว่าใช้สูตรนี้ทำไม',
  sellingPoints: ['Clear service แกะวิธีคิดทีละบรรทัดเหมือนพี่นั่งจับมือทำ + โจทย์ไล่ระดับตามระดับของแต่ละคน'],
}
const examgymChem: ExamGymInfo = {
  kind: 'examgym',
  slogan: 'โจทย์เคมีผสมทั้งจำและคำนวณ ทำไม่ทัน แถมชอบคิดเลขผิด!',
  painPoint: 'เจอโจทย์ซับซ้อน เช่น ปริมาณสารสัมพันธ์ หรือกรด-เบส แล้วสับสนขั้นตอนการคิด',
  sellingPoints: ['ไล่ Step การแก้โจทย์ทีละขั้น ติดตรงไหนถาม Clear ให้เช็กว่าคิดเลขผิดบรรทัดไหน'],
  notes: ['เริ่มใช้งานได้ เดือน พ.ย. 69'],
}

// แผนที่รหัสคอร์ส (plan.ts) → รายละเอียด — สอดคล้อง courses.md § "รายละเอียดคอร์ส"
export const courseDetails: Record<string, CourseDetail> = {
  'MATH.1': { pack: mathPack, volume: { bookNo: '8303', eggspaceStart: '8 มี.ค. 69', chapters: ['เซต', 'ตรรกศาสตร์', 'จำนวนจริง', 'เรขาคณิตวิเคราะห์และภาคตัดกรวย'] } },
  'MATH.2': { pack: mathPack, volume: { bookNo: '8304', eggspaceStart: '27 มี.ค. 69', chapters: ['ความสัมพันธ์และฟังก์ชัน', 'Exponential & Logarithm', 'ฟังก์ชันตรีโกณมิติ'] } },
  'MATH.3': { pack: mathPack, volume: { bookNo: '8305', eggspaceStart: '7 พ.ค. 69', chapters: ['เมทริกซ์', 'เวกเตอร์', 'จำนวนเชิงซ้อน'] } },
  'MATH.4': { pack: mathPack, volume: { bookNo: '8306', eggspaceStart: '22 พ.ค. 69', chapters: ['ลำดับและอนุกรม', 'แคลคูลัส'] } },
  'MATH.5': { pack: mathPack, volume: { bookNo: '8307', eggspaceStart: '29 พ.ค. 69', chapters: ['สถิติ', 'ความน่าจะเป็น', 'ตัวแปรสุ่มและการแจกแจงความน่าจะเป็น'] } },
  'MATH.EX': { examgym: examgymMath },
  'PHY.1': { pack: phyPack, volume: { bookNo: '1301', title: 'กลศาสตร์ 1', eggspaceStart: '8 มี.ค. 69', chapters: ['บทนำและการวัด', 'การเคลื่อนที่แนวตรง', 'การเคลื่อนที่วิถีโค้ง'] } },
  'PHY.2': { pack: phyPack, volume: { bookNo: '1302', title: 'กลศาสตร์ 2', eggspaceStart: '20 มี.ค. 69', chapters: ['กฎการเคลื่อนที่ของนิวตัน', 'สมดุลกล', 'งานและพลังงาน', 'โมเมนตัม'] } },
  'PHY.3': { pack: phyPack, volume: { bookNo: '1303', title: 'กลศาสตร์ 3', eggspaceStart: '31 มี.ค. 69', chapters: ['การเคลื่อนที่วงกลมและดวงดาว', 'การเคลื่อนที่แบบ SHM'] } },
  'PHY.4': { pack: phyPack, volume: { bookNo: '1304', title: 'สมบัติสาร', eggspaceStart: '12 เม.ย. 69', chapters: ['แก๊สและทฤษฎีจลน์', 'ของเหลวและของไหล', 'ของแข็ง'] } },
  'PHY.5': { pack: phyPack, volume: { bookNo: '1305', title: 'ไฟฟ้า', eggspaceStart: '24 เม.ย. 69', chapters: ['ไฟฟ้าสถิต', 'กระแสตรง', 'แม่เหล็กไฟฟ้า', 'กระแสสลับ'] } },
  'PHY.6': { pack: phyPack, volume: { bookNo: '1306', title: 'คลื่น', eggspaceStart: '9 พ.ค. 69', chapters: ['คลื่น', 'เสียง', 'แสง'] } },
  'PHY.7': { pack: phyPack, volume: { bookNo: '1307', title: 'ฟิสิกส์แผนใหม่', eggspaceStart: '9 พ.ค. 69', chapters: ['คลื่นแม่เหล็กไฟฟ้า', 'ฟิสิกส์อะตอม', 'ฟิสิกส์นิวเคลียร์'] } },
  'PHY.EX': { examgym: examgymPhy },
  'CHEM.EX': { examgym: examgymChem },
}

export const getCourseDetail = (id: string) => courseDetails[id]
