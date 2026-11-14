import { Student, Assessment9S, AssessmentSDQ, ClassroomGrade, AcademicSemester } from '../types';
import { QUESTIONS_9S, SDQ_QUESTIONS, getRawQuestionScore } from '../utils/assessmentScoring';
import { formatToThaiDate, formatToThaiDateFull } from '../utils/thaiDate';
import { SchoolLogo } from './SchoolLogo';
import { Printer, X } from 'lucide-react';

export type PrintMode =
  | '9s_individual'
  | 'sdq_individual'
  | 'classroom_summary'
  | 'school_summary';

interface PrintViewProps {
  mode: PrintMode;
  student?: Student | null;
  assessment9S?: Assessment9S | null;
  assessmentSDQ?: AssessmentSDQ | null;
  classroom?: ClassroomGrade;
  academicYear: string;
  semester?: AcademicSemester;
  students?: Student[];
  all9S?: Record<string, Assessment9S>;
  allSDQ?: Record<string, AssessmentSDQ>;
  onClose: () => void;
}

export const PrintView: React.FC<PrintViewProps> = ({
  mode,
  student,
  assessment9S,
  assessmentSDQ,
  classroom,
  academicYear,
  semester = '1',
  students = [],
  all9S = {},
  allSDQ = {},
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-start overflow-y-auto p-4 sm:p-6 print:static print:block print:overflow-visible print:h-auto print:w-full print:p-0 print:bg-white print:backdrop-blur-none">
      {/* Non-printable action bar */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-3.5 mb-4 flex items-center justify-between print:hidden border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-[#0f2b48]">
            มุมมองก่อนพิมพ์รายงาน (Print Preview)
          </span>
          <span className="text-xs text-slate-500">
            ระบบจัดรูปแบบสำหรับกระดาษ A4 มาตรฐาน
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน (Print)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Sheet (White A4 page style) */}
      <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-sm print:shadow-none print:rounded-none print:m-0 print:p-2 print:min-h-0 print:w-full print:max-w-none text-[12px] leading-relaxed font-sans">
        {/* ==================================================== */}
        {/* Mode 1: แบบสังเกตอาการ 9S รายบุคคล (Official 9S Form) */}
        {/* ==================================================== */}
        {mode === '9s_individual' && student && (
          <div className="space-y-4">
            <div className="text-center pb-2 border-b-2 border-slate-800">
              <div className="flex justify-center mb-1">
                <SchoolLogo size={48} />
              </div>
              <h1 className="text-lg font-bold text-slate-900">แบบสังเกตอาการ 9S</h1>
              <p className="text-xs text-slate-600">
                ระบบดูแลสุขภาวะและพัฒนาการนักเรียน โรงเรียนวัดใหม่อมตรส (Wat Mai Amataros Student Care System)
              </p>
              <p className="text-[11px] text-slate-500">
                ปีการศึกษา {student.academicYear || academicYear} (ภาคเรียนที่ {student.semester || semester})
              </p>
            </div>

            {/* Student Info Line */}
            <div className="grid grid-cols-2 gap-y-1.5 text-xs pt-2">
              <div>
                <span className="font-semibold">ชื่อ-สกุล: </span>
                <span>{student.name}</span>
              </div>
              <div>
                <span className="font-semibold">ชั้นเรียน: </span>
                <span>{student.classroom} เลขที่ {student.orderNo ?? '-'}</span>
              </div>
              <div>
                <span className="font-semibold">เลขประจำตัว: </span>
                <span className="font-mono">{student.studentCode}</span>
                <span className="ml-3 font-semibold">เลขประชาชน: </span>
                <span className="font-mono">{student.nationalId}</span>
              </div>
              <div>
                <span className="font-semibold">วันเกิด: </span>
                <span>{student.birthdate}</span>
                <span className="ml-3 font-semibold">เพศ: </span>
                <span>{student.gender || 'ชาย'}</span>
              </div>
              <div>
                <span className="font-semibold">วันที่คัดกรอง: </span>
                <span>
                  {assessment9S
                    ? formatToThaiDate(assessment9S.assessmentDate, assessment9S.assessmentTime)
                    : '-'}
                </span>
              </div>
              <div>
                <span className="font-semibold">ครูผู้สังเกต/คัดกรอง: </span>
                <span>{assessment9S?.assessorName || 'ครูประจำชั้น'}</span>
              </div>
            </div>

            {/* 9S Questions Table */}
            <table className="w-full border-collapse border border-slate-800 text-xs mt-3">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-slate-800 py-1.5 px-3 w-1/3">กลุ่มอาการ</th>
                  <th className="border border-slate-800 py-1.5 px-3">อาการ</th>
                  <th className="border border-slate-800 py-1.5 px-2 w-16">ใช่</th>
                  <th className="border border-slate-800 py-1.5 px-2 w-16">ไม่ใช่</th>
                </tr>
              </thead>
              <tbody>
                {/* 1. กลุ่มพฤติกรรมสมาธิสั้น */}
                <tr>
                  <td
                    rowSpan={3}
                    className="border border-slate-800 p-2 font-semibold align-middle text-center bg-slate-50"
                  >
                    กลุ่มพฤติกรรมสมาธิสั้น
                  </td>
                  <td className="border border-slate-800 p-2">ซนเกินไป</td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S?.answers.q1_hyperactive ? '✓' : ''}
                  </td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S && !assessment9S.answers.q1_hyperactive ? '✓' : ''}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-2">ใจลอย</td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S?.answers.q2_inattentive ? '✓' : ''}
                  </td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S && !assessment9S.answers.q2_inattentive ? '✓' : ''}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-2">รอคอยไม่ได้</td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S?.answers.q3_impulsive ? '✓' : ''}
                  </td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S && !assessment9S.answers.q3_impulsive ? '✓' : ''}
                  </td>
                </tr>

                {/* 2. กลุ่มอารมณ์ซึมเศร้าและวิตกกังวล */}
                <tr>
                  <td
                    rowSpan={3}
                    className="border border-slate-800 p-2 font-semibold align-middle text-center bg-slate-50"
                  >
                    กลุ่มอารมณ์ซึมเศร้าและวิตกกังวล
                  </td>
                  <td className="border border-slate-800 p-2">เครียด หงุดหงิดง่าย</td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S?.answers.q4_stress ? '✓' : ''}
                  </td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S && !assessment9S.answers.q4_stress ? '✓' : ''}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-2">ท้อแท้ เบื่อหน่าย</td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S?.answers.q5_discouraged ? '✓' : ''}
                  </td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S && !assessment9S.answers.q5_discouraged ? '✓' : ''}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-2">ไม่อยากไปโรงเรียน</td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S?.answers.q6_schoolRefusal ? '✓' : ''}
                  </td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S && !assessment9S.answers.q6_schoolRefusal ? '✓' : ''}
                  </td>
                </tr>

                {/* 3. กลุ่มการกลั่นแกล้งรังแกและปัญหาการเข้าสังคม */}
                <tr>
                  <td
                    rowSpan={3}
                    className="border border-slate-800 p-2 font-semibold align-middle text-center bg-slate-50"
                  >
                    กลุ่มการกลั่นแกล้งรังแกและปัญหาการเข้าสังคม
                  </td>
                  <td className="border border-slate-800 p-2">แกล้งเพื่อน</td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S?.answers.q7_bully ? '✓' : ''}
                  </td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S && !assessment9S.answers.q7_bully ? '✓' : ''}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-2">ถูกเพื่อนแกล้ง</td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S?.answers.q8_bullied ? '✓' : ''}
                  </td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S && !assessment9S.answers.q8_bullied ? '✓' : ''}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-2">ไม่มีเพื่อนสนิท</td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S?.answers.q9_noFriends ? '✓' : ''}
                  </td>
                  <td className="border border-slate-800 text-center p-2 font-bold">
                    {assessment9S && !assessment9S.answers.q9_noFriends ? '✓' : ''}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Official Scoring Rules & Results */}
            <div className="p-3 border border-slate-800 rounded bg-slate-50 text-[11px] space-y-1">
              <div className="font-bold text-xs underline">เกณฑ์การคิดคะแนนและการแปลผล:</div>
              <div>• 3 ข้อแรก: ซนเกินไป ใจลอย รอคอยไม่ได้ เป็นบวกเมื่อตอบ "ใช่" 1 ข้อ [{assessment9S?.behavioralPositive ? 'พบผลบวก (เสี่ยง)' : 'ปกติ'}]</div>
              <div>• 3 ข้อกลาง: เครียด/หงุดหงิดง่าย ท้อแท้เบื่อหน่าย ไม่อยากไปโรงเรียน เป็นบวกเมื่อตอบ "ใช่" 1 ข้อ [{assessment9S?.emotionalPositive ? 'พบผลบวก (เสี่ยง)' : 'ปกติ'}]</div>
              <div>• 3 ข้อหลัง: ถูกเพื่อนแกล้ง แกล้งเพื่อน ไม่มีเพื่อน เป็นบวกเมื่อตอบ "ใช่" 2 ข้อ หรือตอบ "ใช่" ข้อไม่มีเพื่อนสนิท [{assessment9S?.socialPositive ? 'พบผลบวก (เสี่ยง)' : 'ปกติ'}]</div>
              <div className="pt-2 font-bold text-xs">
                สรุปผลการคัดกรอง 9S:{' '}
                {assessment9S?.overallPositive ? (
                  <span className="text-rose-700 font-extrabold underline">
                    พบสัญญาณความเสี่ยง (เป็นบวกอย่างน้อย 1 ด้าน) → แนะนำให้ประเมินจุดแข็งจุดอ่อน (SDQ) ต่อ
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold">
                    ปกติ (ไม่พบความเสี่ยง)
                  </span>
                )}
              </div>
            </div>

            {/* Instructions & Guidelines */}
            <div className="text-[10px] text-slate-600 space-y-0.5 pt-1">
              <div className="font-bold text-slate-800">ข้อกำหนด และคำชี้แจงการใช้เครื่องมือ 9S:</div>
              <div>1. เป็นข้อคำถามสั้นๆ เพื่อช่วยให้ครูมีแนวทางในการสังเกตอาการนักเรียนที่อาจมีปัญหาด้านพฤติกรรม อารมณ์ สังคม</div>
              <div>2. ใช้สังเกตอาการนักเรียนอายุ 6 – 15 ปี</div>
              <div>3. ครูผู้สังเกตอาการควรรู้จักนักเรียนมาแล้วอย่างน้อย 3 เดือน</div>
              <div>4. หากสังเกตอาการแล้วมีปัญหาด้านพฤติกรรม อารมณ์ สังคม อย่างน้อยหนึ่งด้านเป็นบวก แนะนำให้ครูใช้แบบประเมินจุดแข็งจุดอ่อน (SDQ) ต่อ เพื่อประเมินปัญหาให้ละเอียดยิ่งขึ้น</div>
            </div>

            {/* Teacher Sign-off */}
            <div className="pt-6 flex justify-end text-xs">
              <div className="text-center w-64 space-y-2">
                <div>ลงชื่อ..............................................................ครูผู้ประเมิน</div>
                <div>({assessment9S?.assessorName || '..............................................................'})</div>
                <div>วันที่ {formatToThaiDateFull(assessment9S?.assessmentDate)}</div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* Mode 2: แบบประเมิน SDQ รายบุคคล (Official SDQ Form)   */}
        {/* ==================================================== */}
        {mode === 'sdq_individual' && student && (
          <div className="space-y-4">
            <div className="text-center pb-2 border-b-2 border-slate-800">
              <div className="flex justify-center mb-1">
                <SchoolLogo size={46} />
              </div>
              <h1 className="text-lg font-bold text-slate-900">
                แบบประเมินพฤติกรรมนักเรียน (SDQ)
              </h1>
              <p className="text-xs font-semibold text-slate-700">
                {assessmentSDQ?.assessorType === 'student'
                  ? '(ฉบับนักเรียนประเมินตนเอง)'
                  : assessmentSDQ?.assessorType === 'parent'
                  ? '(ฉบับผู้ปกครองเป็นผู้ประเมินนักเรียน)'
                  : '(ฉบับครูเป็นผู้ประเมินนักเรียน)'}
              </p>
              <p className="text-xs text-slate-600">
                โรงเรียนวัดใหม่อมตรส ปีการศึกษา {student.academicYear || academicYear}
              </p>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 gap-y-1 text-xs">
              <div>
                <span className="font-semibold">ชื่อ-สกุล: </span>
                <span>{student.name}</span>
              </div>
              <div>
                <span className="font-semibold">ชั้น: </span>
                <span>{student.classroom} เลขที่ {student.orderNo ?? '-'}</span>
              </div>
              <div>
                <span className="font-semibold">เลขประจำตัว: </span>
                <span className="font-mono">{student.studentCode}</span>
                <span className="ml-3 font-semibold">วันเกิด: </span>
                <span>{student.birthdate}</span>
              </div>
              <div>
                <span className="font-semibold">ผู้ประเมิน: </span>
                <span>{assessmentSDQ?.assessorName || 'ครูที่ปรึกษา'}</span>
                <span className="ml-3 font-semibold">วันที่: </span>
                <span>{formatToThaiDate(assessmentSDQ?.assessmentDate)}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 italic">
              คำชี้แจง: ให้ทำเครื่องหมาย ✓ ในช่องท้ายแต่ละข้อให้ครบทุกข้อ กรุณาตอบให้ตรงกับลักษณะของเด็กในช่วง 6 เดือนที่ผ่านมา
            </p>

            {/* Questions Table */}
            <table className="w-full border-collapse border border-slate-800 text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-slate-800 py-1 px-1.5 w-8">ข้อ</th>
                  <th className="border border-slate-800 py-1 px-2 text-left">พฤติกรรมประเมิน</th>
                  <th className="border border-slate-800 py-1 px-1.5 w-12">ไม่จริง</th>
                  <th className="border border-slate-800 py-1 px-1.5 w-14">ค่อนข้างจริง</th>
                  <th className="border border-slate-800 py-1 px-1.5 w-12">จริง</th>
                </tr>
              </thead>
              <tbody>
                {SDQ_QUESTIONS.map((q) => {
                  const val = assessmentSDQ?.answers[q.no];
                  const text =
                    assessmentSDQ?.assessorType === 'student' ? q.textStudent : q.textAdult;
                  return (
                    <tr key={q.no}>
                      <td className="border border-slate-800 text-center py-0.5 px-1">{q.no}</td>
                      <td className="border border-slate-800 py-0.5 px-2">{text}</td>
                      <td className="border border-slate-800 text-center py-0.5 font-bold">
                        {val === 0 ? '✓' : ''}
                      </td>
                      <td className="border border-slate-800 text-center py-0.5 font-bold">
                        {val === 1 ? '✓' : ''}
                      </td>
                      <td className="border border-slate-800 text-center py-0.5 font-bold">
                        {val === 2 ? '✓' : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Score Summary Box */}
            <div className="p-3 border border-slate-800 rounded bg-slate-50 text-[11px] space-y-1.5">
              <div className="font-bold underline text-xs">สรุปคะแนนและการแปลผล SDQ:</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div>
                  1. ด้านอารมณ์:{' '}
                  <span className="font-bold">{assessmentSDQ?.emotionalScore ?? 0}</span> คะแนน
                  {' '}[{assessmentSDQ?.emotionalStatus === 'normal' ? 'ปกติ' : assessmentSDQ?.emotionalStatus === 'risk' ? 'เสี่ยง' : 'มีปัญหา'}]
                </div>
                <div>
                  2. ด้านความประพฤติ/เกเร:{' '}
                  <span className="font-bold">{assessmentSDQ?.conductScore ?? 0}</span> คะแนน
                  {' '}[{assessmentSDQ?.conductStatus === 'normal' ? 'ปกติ' : assessmentSDQ?.conductStatus === 'risk' ? 'เสี่ยง' : 'มีปัญหา'}]
                </div>
                <div>
                  3. ด้านสมาธิสั้น/อยู่ไม่นิ่ง:{' '}
                  <span className="font-bold">{assessmentSDQ?.hyperactivityScore ?? 0}</span> คะแนน
                  {' '}[{assessmentSDQ?.hyperactivityStatus === 'normal' ? 'ปกติ' : assessmentSDQ?.hyperactivityStatus === 'risk' ? 'เสี่ยง' : 'มีปัญหา'}]
                </div>
                <div>
                  4. ด้านความสัมพันธ์กับเพื่อน:{' '}
                  <span className="font-bold">{assessmentSDQ?.peerScore ?? 0}</span> คะแนน
                  {' '}[{assessmentSDQ?.peerStatus === 'normal' ? 'ปกติ' : assessmentSDQ?.peerStatus === 'risk' ? 'เสี่ยง' : 'มีปัญหา'}]
                </div>
                <div className="col-span-2 pt-1 font-bold text-slate-900 border-t border-slate-300">
                  รวม 4 ด้านที่เป็นปัญหา (เต็ม 40 คะแนน):{' '}
                  <span className="text-xs">{assessmentSDQ?.totalDifficulties ?? 0} คะแนน</span>
                  {' '}— จัดอยู่ในกลุ่ม{' '}
                  <span className="underline">
                    {assessmentSDQ?.totalStatus === 'normal' ? 'ปกติ' : assessmentSDQ?.totalStatus === 'risk' ? 'เสี่ยง' : 'มีปัญหา'}
                  </span>
                </div>
                <div className="col-span-2">
                  5. ด้านสัมพันธภาพทางสังคม (จุดแข็ง เต็ม 10 คะแนน):{' '}
                  <span className="font-bold">{assessmentSDQ?.prosocialScore ?? 0} คะแนน</span>
                  {' '}—{' '}
                  <span>
                    {assessmentSDQ?.prosocialStatus === 'strength' ? 'มีจุดแข็ง (4-10)' : 'ไม่มีจุดแข็ง (0-3)'}
                  </span>
                </div>
                {assessmentSDQ?.impact && (
                  <div className="col-span-2 text-[10px] text-slate-600">
                    ผลกระทบต่อชีวิตประจำวัน (ด้านหลัง): {assessmentSDQ.impactTotalScore} คะแนน ({assessmentSDQ.impactStatus === 'normal' ? 'ปกติ' : assessmentSDQ.impactStatus === 'risk' ? 'เสี่ยง' : 'มีปัญหา'})
                  </div>
                )}
              </div>
            </div>

            {/* Signature */}
            <div className="pt-4 flex justify-end text-xs">
              <div className="text-center w-64 space-y-2">
                <div>ลงชื่อ..............................................................ผู้ประเมิน</div>
                <div>({assessmentSDQ?.assessorName || '..............................................................'})</div>
                <div>วันที่ {formatToThaiDateFull(assessmentSDQ?.assessmentDate)}</div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* Mode 3: ตารางสรุปผลประจำห้องเรียน (Classroom Summary)  */}
        {/* ==================================================== */}
        {mode === 'classroom_summary' && (
          <div className="space-y-4">
            <div className="text-center pb-2 border-b-2 border-slate-800">
              <div className="flex justify-center mb-1">
                <SchoolLogo size={46} />
              </div>
              <h1 className="text-base font-bold text-slate-900">
                ตารางสรุปผลการคัดกรอง 9S และแบบประเมิน SDQ ประจำชั้นเรียน {classroom}
              </h1>
              <p className="text-xs text-slate-600">
                โรงเรียนวัดใหม่อมตรส ปีการศึกษา {academicYear} (ภาคเรียนที่ {semester})
              </p>
            </div>

            <table className="w-full border-collapse border border-slate-800 text-[10px]">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-slate-800 py-1 px-1 w-8">เลขที่</th>
                  <th className="border border-slate-800 py-1 px-1.5 w-16">รหัสนักเรียน</th>
                  <th className="border border-slate-800 py-1 px-2 text-left">ชื่อ - สกุล</th>
                  <th className="border border-slate-800 py-1 px-1 w-16">ผล 9S</th>
                  <th className="border border-slate-800 py-1 px-1 w-14">อารมณ์</th>
                  <th className="border border-slate-800 py-1 px-1 w-14">ความประพฤติ</th>
                  <th className="border border-slate-800 py-1 px-1 w-14">สมาธิสั้น</th>
                  <th className="border border-slate-800 py-1 px-1 w-14">เพื่อน</th>
                  <th className="border border-slate-800 py-1 px-1.5 w-16">รวม SDQ 4 ด้าน</th>
                  <th className="border border-slate-800 py-1 px-1.5 w-14">จุดแข็ง</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const sc9 = all9S[s.id];
                  const sdq = allSDQ[s.id];

                  return (
                    <tr key={s.id} className="text-center">
                      <td className="border border-slate-800 py-1 px-1">{s.orderNo ?? '-'}</td>
                      <td className="border border-slate-800 py-1 px-1 font-mono">{s.studentCode}</td>
                      <td className="border border-slate-800 py-1 px-2 text-left font-medium">
                        {s.name}
                      </td>
                      <td className="border border-slate-800 py-1 px-1">
                        {sc9 ? (
                          sc9.overallPositive ? (
                            <span className="font-bold text-rose-700">ผลบวก (เสี่ยง)</span>
                          ) : (
                            <span className="text-emerald-700">ปกติ</span>
                          )
                        ) : (
                          <span className="text-slate-400">ยังไม่คัดกรอง</span>
                        )}
                      </td>
                      <td className="border border-slate-800 py-1 px-1">
                        {sdq ? `${sdq.emotionalScore}` : '-'}
                      </td>
                      <td className="border border-slate-800 py-1 px-1">
                        {sdq ? `${sdq.conductScore}` : '-'}
                      </td>
                      <td className="border border-slate-800 py-1 px-1">
                        {sdq ? `${sdq.hyperactivityScore}` : '-'}
                      </td>
                      <td className="border border-slate-800 py-1 px-1">
                        {sdq ? `${sdq.peerScore}` : '-'}
                      </td>
                      <td className="border border-slate-800 py-1 px-1 font-bold">
                        {sdq ? (
                          <span>
                            {sdq.totalDifficulties}{' '}
                            <span className="text-[9px]">
                              ({sdq.totalStatus === 'normal' ? 'ปกติ' : sdq.totalStatus === 'risk' ? 'เสี่ยง' : 'มีปัญหา'})
                            </span>
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="border border-slate-800 py-1 px-1">
                        {sdq ? (
                          sdq.prosocialStatus === 'strength' ? (
                            'มีจุดแข็ง'
                          ) : (
                            'ไม่มี'
                          )
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary statistics */}
            <div className="pt-2 text-xs flex justify-between items-center text-slate-700">
              <div>
                จำนวนนักเรียนทั้งหมด: <span className="font-bold">{students.length}</span> คน |
                คัดกรอง 9S แล้ว:{' '}
                <span className="font-bold">{students.filter((s) => all9S[s.id]).length}</span> คน |
                ประเมิน SDQ แล้ว:{' '}
                <span className="font-bold">{students.filter((s) => allSDQ[s.id]).length}</span> คน
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-8 flex justify-between text-xs">
              <div className="text-center w-56 space-y-2">
                <div>ลงชื่อ..............................................................</div>
                <div>(..............................................................)</div>
                <div>ครูประจำชั้น {classroom}</div>
              </div>
              <div className="text-center w-56 space-y-2">
                <div>ลงชื่อ..............................................................</div>
                <div>(..............................................................)</div>
                <div>ผู้อำนวยการโรงเรียนวัดใหม่อมตรส</div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* Mode 4: สรุปภาพรวมระดับโรงเรียน (Executive Summary)   */}
        {/* ==================================================== */}
        {mode === 'school_summary' && (
          <div className="space-y-4">
            <div className="text-center pb-2 border-b-2 border-slate-800">
              <div className="flex justify-center mb-1">
                <SchoolLogo size={52} />
              </div>
              <h1 className="text-lg font-bold text-slate-900">
                รายงานสรุปภาพรวมสุขภาวะและพัฒนาการนักเรียน โรงเรียนวัดใหม่อมตรส
              </h1>
              <p className="text-xs text-slate-600">
                WMA CARE: ระบบคัดกรอง 9S และแบบประเมิน SDQ ประจำปีการศึกษา {academicYear} (ภาคเรียนที่ {semester})
              </p>
            </div>

            {/* Class Breakdown Table */}
            <table className="w-full border-collapse border border-slate-800 text-xs">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-slate-800 py-1.5 px-2">ระดับชั้น</th>
                  <th className="border border-slate-800 py-1.5 px-2">นักเรียนทั้งหมด</th>
                  <th className="border border-slate-800 py-1.5 px-2">คัดกรอง 9S แล้ว</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-rose-700">9S ผลบวก (เสี่ยง)</th>
                  <th className="border border-slate-800 py-1.5 px-2">ประเมิน SDQ แล้ว</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-amber-700">SDQ กลุ่มเสี่ยง</th>
                  <th className="border border-slate-800 py-1.5 px-2 text-rose-700">SDQ กลุ่มมีปัญหา</th>
                </tr>
              </thead>
              <tbody>
                {(['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'] as ClassroomGrade[]).map((cls) => {
                  const classStudents = students.filter((s) => s.classroom === cls);
                  const screened9S = classStudents.filter((s) => all9S[s.id]);
                  const positive9S = classStudents.filter((s) => all9S[s.id]?.overallPositive);
                  const assessedSDQ = classStudents.filter((s) => allSDQ[s.id]);
                  const riskSDQ = classStudents.filter((s) => allSDQ[s.id]?.totalStatus === 'risk');
                  const problemSDQ = classStudents.filter(
                    (s) => allSDQ[s.id]?.totalStatus === 'problem'
                  );

                  return (
                    <tr key={cls} className="text-center hover:bg-slate-50">
                      <td className="border border-slate-800 py-1.5 px-2 font-bold">{cls}</td>
                      <td className="border border-slate-800 py-1.5 px-2">{classStudents.length}</td>
                      <td className="border border-slate-800 py-1.5 px-2">{screened9S.length}</td>
                      <td className="border border-slate-800 py-1.5 px-2 font-bold text-rose-700">
                        {positive9S.length}
                      </td>
                      <td className="border border-slate-800 py-1.5 px-2">{assessedSDQ.length}</td>
                      <td className="border border-slate-800 py-1.5 px-2 text-amber-700">
                        {riskSDQ.length}
                      </td>
                      <td className="border border-slate-800 py-1.5 px-2 font-bold text-rose-700">
                        {problemSDQ.length}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Recommendations & Action Plan */}
            <div className="p-4 border border-slate-800 rounded bg-slate-50 text-xs space-y-2">
              <div className="font-bold text-slate-900 underline">
                แนวทางการดำเนินงานระบบดูแลช่วยเหลือนักเรียน:
              </div>
              <p>
                1. นักเรียนที่มีผลคัดกรอง 9S เป็นบวก ให้ครูที่ปรึกษาดำเนินการประเมินจุดแข็งและจุดอ่อน (SDQ) ทั้งฉบับครูและฉบับผู้ปกครองเพื่อประเมินเชิงลึก
              </p>
              <p>
                2. นักเรียนกลุ่มเสี่ยง (Risk) ให้ครูจัดกิจกรรมเสริมสร้างทักษะชีวิต และให้คำปรึกษาเบื้องต้นในสถานศึกษา
              </p>
              <p>
                3. นักเรียนกลุ่มมีปัญหา (Problem) ให้ประสานงานร่วมกับผู้ปกครอง และส่งต่อข้อมูลไปยังศูนย์บริการสาธารณสุข หรือระบบ School Health HERO เพื่อการดูแลเฉพาะทางต่อไป
              </p>
            </div>

            {/* School Signature Block */}
            <div className="pt-10 flex justify-end text-xs">
              <div className="text-center w-64 space-y-2">
                <div>ลงชื่อ..............................................................</div>
                <div>(..............................................................)</div>
                <div>ผู้อำนวยการโรงเรียนวัดใหม่อมตรส</div>
                <div>วันที่..............................................................</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
