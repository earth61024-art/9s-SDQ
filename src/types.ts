export type ClassroomGrade = 'ป.1' | 'ป.2' | 'ป.3' | 'ป.4' | 'ป.5' | 'ป.6';

export type AcademicSemester = '1' | '2';

export interface Student {
  id: string;
  studentCode: string; // เลขประจำตัว
  nationalId: string;  // เลขประจำตัวประชาชน
  name: string;        // ชื่อ-ชื่อสกุล
  birthdate: string;   // วันเกิด เช่น "5 มิ.ย. 2562"
  classroom: ClassroomGrade;
  academicYear: string; // e.g. "2569"
  semester?: AcademicSemester; // ภาคเรียนที่ 1 หรือ 2 (default: '1')
  gender?: 'ชาย' | 'หญิง';
  orderNo?: number;     // เลขที่
}

export interface Answers9S {
  q1_hyperactive: boolean; // ซนเกินไป
  q2_inattentive: boolean; // ใจลอย
  q3_impulsive: boolean;   // รอคอยไม่ได้
  q4_stress: boolean;      // เครียด / หงุดหงิดง่าย
  q5_discouraged: boolean; // ท้อแท้เบื่อหน่าย
  q6_schoolRefusal: boolean; // ไม่อยากไปโรงเรียน
  q7_bully: boolean;       // แกล้งเพื่อน
  q8_bullied: boolean;     // ถูกเพื่อนแกล้ง
  q9_noFriends: boolean;   // ไม่มีเพื่อนสนิท
}

export interface Assessment9S {
  id: string;
  studentId: string;
  academicYear: string;
  semester: AcademicSemester;
  assessmentDate: string; // ISO date or "YYYY-MM-DD"
  assessmentTime?: string; // "HH:mm"
  assessorName: string;
  answers: Answers9S;
  // Computed Results
  behavioralPositive: boolean; // 3 ข้อแรก ตอบ "ใช่" อย่างน้อย 1 ข้อ
  emotionalPositive: boolean;  // 3 ข้อกลาง ตอบ "ใช่" อย่างน้อย 1 ข้อ
  socialPositive: boolean;     // 3 ข้อหลัง ตอบ "ใช่" 2 ข้อขึ้นไป หรือตอบ "ใช่" ในข้อ ไม่มีเพื่อนสนิท
  overallPositive: boolean;    // บวกอย่างน้อย 1 ด้าน
  recommendation: string;      // แนะนำให้ประเมิน SDQ ต่อ
  notes?: string;
  updatedAt: string;
}

export type SDQAssessorType = 'student' | 'teacher' | 'parent';

export interface SDQAnswers {
  [questionNumber: number]: number; // 1 to 25, value: 0 (ไม่จริง), 1 (ค่อนข้างจริง), 2 (จริง)
}

export interface SDQImpactAnswers {
  hasProblem: 'no' | 'minor' | 'definite' | 'severe'; // 1. คิดว่าตนเองมีปัญหาหรือไม่
  duration?: '<1month' | '1-5months' | '6-12months' | '>1year'; // 2. เกิดขึ้นมานานเท่าไหร่
  distress?: number; // 3. รู้สึกไม่สบายใจหรือไม่: 0 (ไม่เลย/เล็กน้อย), 1 (ค่อนข้างมาก), 2 (มาก)
  impactHome?: number; // 4.1 ความเป็นอยู่ที่บ้าน
  impactPeers?: number; // 4.2 การคบเพื่อน
  impactClassroom?: number; // 4.3 การเรียนในห้องเรียน
  impactLeisure?: number; // 4.4 กิจกรรมยามว่าง
  impactBurden?: number; // 5. เกิดความยุ่งยากต่อคนรอบข้างหรือไม่
}

export type SDQStatus = 'normal' | 'risk' | 'problem';
export type SDQProsocialStatus = 'strength' | 'no_strength';

export interface AssessmentSDQ {
  id: string;
  studentId: string;
  academicYear: string;
  semester: AcademicSemester;
  assessmentDate: string;
  assessmentTime?: string;
  assessorType: SDQAssessorType;
  assessorName: string;
  answers: SDQAnswers; // 1 to 25
  impact: SDQImpactAnswers;
  // Computed Scores
  emotionalScore: number;       // ข้อ 3, 8, 13, 16, 24
  emotionalStatus: SDQStatus;
  conductScore: number;         // ข้อ 5, 7(rev), 12, 18, 22
  conductStatus: SDQStatus;
  hyperactivityScore: number;   // ข้อ 2, 10, 15, 21(rev), 25(rev)
  hyperactivityStatus: SDQStatus;
  peerScore: number;            // ข้อ 6, 11(rev), 14(rev), 19, 23
  peerStatus: SDQStatus;
  totalDifficulties: number;    // รวม 4 ด้าน (เต็ม 40)
  totalStatus: SDQStatus;
  prosocialScore: number;       // ข้อ 1, 4, 9, 17, 20 (จุดแข็ง)
  prosocialStatus: SDQProsocialStatus;
  // Impact computed score
  impactTotalScore: number;
  impactStatus: SDQStatus;
  notes?: string;
  updatedAt: string;
}
