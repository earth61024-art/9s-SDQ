import * as XLSX from 'xlsx';
import { Student, ClassroomGrade, AcademicSemester } from '../types';

export interface ParsedStudentRow {
  orderNo?: number;
  studentCode: string;
  nationalId: string;
  name: string;
  classroom: ClassroomGrade;
  birthdate: string;
  gender?: 'ชาย' | 'หญิง';
  isValid: boolean;
  validationError?: string;
}

// Normalize Thai classroom strings: e.g. "1", "ป.1", "ประถมศึกษาปีที่ 1", "P1" -> "ป.1"
export function normalizeClassroom(raw: any, defaultClass: ClassroomGrade = 'ป.1'): ClassroomGrade {
  if (!raw) return defaultClass;
  const str = String(raw).trim();
  if (str.includes('6') || str === '6') return 'ป.6';
  if (str.includes('5') || str === '5') return 'ป.5';
  if (str.includes('4') || str === '4') return 'ป.4';
  if (str.includes('3') || str === '3') return 'ป.3';
  if (str.includes('2') || str === '2') return 'ป.2';
  if (str.includes('1') || str === '1') return 'ป.1';
  return defaultClass;
}

// Auto detect gender from name prefixes
export function detectGender(name: string, rawGender?: string): 'ชาย' | 'หญิง' {
  if (rawGender) {
    const g = String(rawGender).trim().toLowerCase();
    if (g.includes('หญิง') || g.includes('female') || g === 'f' || g === 'ญ') return 'หญิง';
    if (g.includes('ชาย') || g.includes('male') || g === 'm' || g === 'ช') return 'ชาย';
  }
  const trimmed = name.trim();
  if (
    trimmed.startsWith('ด.ญ.') ||
    trimmed.startsWith('ด.ญ') ||
    trimmed.startsWith('นางสาว') ||
    trimmed.startsWith('นาง')
  ) {
    return 'หญิง';
  }
  return 'ชาย';
}

// Find key in row that matches any aliases
function findColumnValue(row: Record<string, any>, aliases: string[]): any {
  const rowKeys = Object.keys(row);
  for (const alias of aliases) {
    const matchedKey = rowKeys.find(
      (k) => k.trim().toLowerCase() === alias.toLowerCase() || k.trim().toLowerCase().includes(alias.toLowerCase())
    );
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      return row[matchedKey];
    }
  }
  return undefined;
}

export async function parseStudentFile(file: File): Promise<ParsedStudentRow[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  
  // Use first worksheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert sheet to array of objects
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
  if (!rawRows || rawRows.length === 0) {
    throw new Error('ไม่พบข้อมูลในไฟล์ที่เลือก');
  }

  const parsedStudents: ParsedStudentRow[] = [];

  rawRows.forEach((row, index) => {
    // Aliases for each column
    const rawOrder = findColumnValue(row, ['เลขที่', 'ลำดับ', 'ที่', 'no', 'order', 'num']);
    const rawCode = findColumnValue(row, ['เลขประจำตัว', 'รหัสประจำตัว', 'รหัสนักเรียน', 'เลขประจำตัวนักเรียน', 'code', 'student_id', 'id']);
    const rawIdCard = findColumnValue(row, ['เลขประจำตัวประชาชน', 'เลขประชาชน', 'เลขบัตรประชาชน', 'บัตรประชาชน', 'citizen_id', 'id_card', 'national_id']);
    const rawName = findColumnValue(row, ['ชื่อ-สกุล', 'ชื่อ - สกุล', 'ชื่อ-นามสกุล', 'ชื่อ นามสกุล', 'ชื่อและนามสกุล', 'ชื่อ', 'name', 'fullname', 'student_name']);
    const rawClass = findColumnValue(row, ['ชั้น', 'ระดับชั้น', 'ชั้นเรียน', 'ห้อง', 'classroom', 'class', 'grade']);
    const rawBirthdate = findColumnValue(row, ['วันเกิด', 'วัน/เดือน/ปีเกิด', 'วันเดือนปีเกิด', 'birthday', 'birthdate', 'dob']);
    const rawGender = findColumnValue(row, ['เพศ', 'gender', 'sex']);

    // Check if empty row
    if (!rawName && !rawCode && !rawIdCard) return;

    const nameStr = rawName ? String(rawName).trim() : '';
    const codeStr = rawCode ? String(rawCode).trim() : `S${index + 1}`;
    const idCardStr = rawIdCard ? String(rawIdCard).trim() : '-';
    const birthdateStr = rawBirthdate ? String(rawBirthdate).trim() : '-';
    const orderNum = rawOrder ? parseInt(String(rawOrder), 10) : index + 1;
    const classroom = normalizeClassroom(rawClass, 'ป.1');
    const gender = detectGender(nameStr, rawGender);

    const isValid = Boolean(nameStr.length > 0);
    const validationError = !isValid ? 'ไม่มีชื่อนักเรียน' : undefined;

    parsedStudents.push({
      orderNo: isNaN(orderNum) ? index + 1 : orderNum,
      studentCode: codeStr,
      nationalId: idCardStr,
      name: nameStr,
      classroom,
      birthdate: birthdateStr,
      gender,
      isValid,
      validationError,
    });
  });

  return parsedStudents;
}

// Generate sample Excel template workbook for teachers
export function generateStudentTemplateWorkbook(): Blob {
  const sampleData = [
    {
      'เลขที่': 1,
      'ชั้น': 'ป.1',
      'เลขประจำตัว': '6169',
      'เลขประจำตัวประชาชน': '1-1008-01843-55-1',
      'ชื่อ - สกุล': 'ด.ช.ณัฏฐกานต์ มณีเมือง',
      'วันเกิด': '5 มิ.ย. 2562',
      'เพศ': 'ชาย',
    },
    {
      'เลขที่': 2,
      'ชั้น': 'ป.1',
      'เลขประจำตัว': '6170',
      'เลขประจำตัวประชาชน': '1-1002-02257-86-7',
      'ชื่อ - สกุล': 'ด.ญ.กัญญพัชร บุญประเสริฐ',
      'วันเกิด': '17 มิ.ย. 2562',
      'เพศ': 'หญิง',
    },
    {
      'เลขที่': 1,
      'ชั้น': 'ป.2',
      'เลขประจำตัว': '6158',
      'เลขประจำตัวประชาชน': '1-1008-01834-93-4',
      'ชื่อ - สกุล': 'ด.ช.กรวุฒิ เจนบดินทร์',
      'วันเกิด': '26 ก.ย. 2561',
      'เพศ': 'ชาย',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'รายชื่อนักเรียน');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
