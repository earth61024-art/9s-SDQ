import React from 'react';
import { Student, Assessment9S, AssessmentSDQ, ClassroomGrade, AcademicSemester } from '../types';
import { SchoolLogo } from './SchoolLogo';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ArrowRight,
  TrendingUp,
  Printer,
  ChevronRight,
  Sparkles,
  School,
  Upload,
} from 'lucide-react';

interface DashboardViewProps {
  academicYear: string;
  semester: AcademicSemester;
  students: Student[];
  screenings9S: Record<string, Assessment9S>;
  assessmentsSDQ: Record<string, AssessmentSDQ>;
  onSelectClassroom: (classroom: ClassroomGrade) => void;
  onOpen9S: (student: Student) => void;
  onOpenSDQ: (student: Student) => void;
  onPrintSchoolSummary: () => void;
  onOpenImportModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  academicYear,
  semester,
  students,
  screenings9S,
  assessmentsSDQ,
  onSelectClassroom,
  onOpen9S,
  onOpenSDQ,
  onPrintSchoolSummary,
  onOpenImportModal,
}) => {
  const totalStudents = students.length;
  const screened9SStudents = students.filter((s) => screenings9S[s.id]);
  const positive9SStudents = students.filter((s) => screenings9S[s.id]?.overallPositive);
  const assessedSDQStudents = students.filter((s) => assessmentsSDQ[s.id]);
  const riskSDQStudents = students.filter((s) => assessmentsSDQ[s.id]?.totalStatus === 'risk');
  const problemSDQStudents = students.filter(
    (s) => assessmentsSDQ[s.id]?.totalStatus === 'problem'
  );

  const pct9S = totalStudents > 0 ? Math.round((screened9SStudents.length / totalStudents) * 100) : 0;
  const pctSDQ = totalStudents > 0 ? Math.round((assessedSDQStudents.length / totalStudents) * 100) : 0;

  // 9S Symptom breakdown
  let countHyper = 0;
  let countEmotion = 0;
  let countSocial = 0;
  Object.values(screenings9S).forEach((sc) => {
    if (sc.behavioralPositive) countHyper++;
    if (sc.emotionalPositive) countEmotion++;
    if (sc.socialPositive) countSocial++;
  });

  // Students needing SDQ follow up: 9S positive but no SDQ yet
  const studentsNeedingSDQ = students.filter(
    (s) => screenings9S[s.id]?.overallPositive && !assessmentsSDQ[s.id]
  );

  const classList: ClassroomGrade[] = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0f2b48] via-[#163a61] to-[#0d9488] rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-semibold backdrop-blur-xs mb-3">
            <School className="w-3.5 h-3.5" />
            <span>โรงเรียนวัดใหม่อมตรส • ปีการศึกษา {academicYear} (ภาคเรียนที่ {semester})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ระบบดูแลสุขภาวะและพัฒนาการนักเรียน WMA CARE
          </h1>
          <p className="mt-2 text-sm text-slate-200 leading-relaxed">
            คัดกรองเบื้องต้นด้วยเครื่องมือ <span className="font-bold text-teal-300">9S (School Health HERO)</span> และประเมินละเอียดด้วยแบบประเมินจุดแข็งและจุดอ่อน <span className="font-bold text-teal-300">SDQ</span> เพื่อเฝ้าระวัง ดูแล และส่งเสริมสุขภาวะทางกาย จิตใจ พฤติกรรม และสังคม
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenImportModal}
              className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-950" />
              <span>อัปโหลดรายชื่อเทอมถัดไป / ปีถัดไป (Excel/CSV)</span>
            </button>
            <button
              type="button"
              onClick={onPrintSchoolSummary}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-lg border border-white/20 flex items-center gap-2 backdrop-blur-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-teal-300" />
              <span>พิมพ์รายงานสรุปภาพรวม</span>
            </button>
          </div>
        </div>

        {/* Official Logo Display */}
        <div className="relative z-10 shrink-0 flex flex-col items-center">
          <div className="p-1 rounded-full bg-white/20 backdrop-blur-xs shadow-xl ring-4 ring-white/10 hover:scale-105 transition-transform duration-300">
            <SchoolLogo size={120} className="shadow-lg" />
          </div>
          <span className="mt-2 text-[11px] font-bold tracking-wider text-teal-200 uppercase">
            โรงเรียนวัดใหม่อมตรส
          </span>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 rounded-full bg-teal-500/15 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">นักเรียนทั้งหมด</span>
            <div className="p-2.5 rounded-xl bg-slate-100 text-[#0f2b48]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-500">คน (ป.1 - ป.6)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>ฐานข้อมูลปีการศึกษา {academicYear}</span>
          </div>
        </div>

        {/* 9S Screened */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">คัดกรอง 9S แล้ว</span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-800">{screened9SStudents.length}</span>
            <span className="text-xs text-slate-500">/ {totalStudents} คน ({pct9S}%)</span>
          </div>
          <div className="mt-2.5 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#0d9488] h-full rounded-full transition-all duration-300"
              style={{ width: `${pct9S}%` }}
            />
          </div>
        </div>

        {/* 9S Positive Risk */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">9S พบความเสี่ยง (ผลบวก)</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700">{positive9SStudents.length}</span>
            <span className="text-xs text-slate-500">คน</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium">
            {positive9SStudents.length > 0
              ? 'ต้องการการประเมิน SDQ เพิ่มเติม'
              : 'ยังไม่พบนักเรียนในกลุ่มเสี่ยง 9S'}
          </div>
        </div>

        {/* SDQ Assessed */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ประเมิน SDQ ครบถ้วน</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-800">{assessedSDQStudents.length}</span>
            <span className="text-xs text-slate-500">คน ({pctSDQ}%)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            กลุ่มเสี่ยง {riskSDQStudents.length} คน • กลุ่มมีปัญหา {problemSDQStudents.length} คน
          </div>
        </div>
      </div>

      {/* Action Center: Students needing SDQ follow up */}
      {studentsNeedingSDQ.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-sm text-amber-950">
                นักเรียนที่ผลคัดกรอง 9S เป็นบวก และรอการประเมิน SDQ ({studentsNeedingSDQ.length} คน)
              </h2>
            </div>
            <span className="text-xs font-semibold text-amber-800">
              ตามเกณฑ์ School Health HERO ต้องประเมิน SDQ ต่อ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {studentsNeedingSDQ.map((s) => {
              const sc = screenings9S[s.id];
              return (
                <div
                  key={s.id}
                  className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">{s.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {s.classroom} • เลขที่ {s.orderNo ?? '-'} • รหัส {s.studentCode}
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {sc?.behavioralPositive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                          สมาธิสั้น
                        </span>
                      )}
                      {sc?.emotionalPositive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-medium">
                          อารมณ์
                        </span>
                      )}
                      {sc?.socialPositive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 font-medium">
                          การรังแก/เพื่อน
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenSDQ(s)}
                    className="p-2 bg-[#0f2b48] hover:bg-[#163a61] text-white rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer shrink-0 ml-2 shadow-xs"
                    title="เริ่มประเมิน SDQ"
                  >
                    <span>ทำ SDQ</span>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Classroom Progress Grid */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              สถานะการดูแลช่วยเหลือนักเรียนแยกตามชั้นเรียน (ป.1 - ป.6)
            </h2>
            <p className="text-xs text-slate-500">
              คลิกที่ระดับชั้นเพื่อเข้าไปดูรายชื่อและบันทึกผลการประเมิน
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            รวม 6 ชั้นเรียน
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classList.map((cls) => {
            const classStudents = students.filter((s) => s.classroom === cls);
            const class9S = classStudents.filter((s) => screenings9S[s.id]);
            const class9SPositive = classStudents.filter((s) => screenings9S[s.id]?.overallPositive);
            const classSDQ = classStudents.filter((s) => assessmentsSDQ[s.id]);
            const classSDQProblem = classStudents.filter(
              (s) => assessmentsSDQ[s.id]?.totalStatus === 'problem'
            );

            const cPct =
              classStudents.length > 0
                ? Math.round((class9S.length / classStudents.length) * 100)
                : 0;

            return (
              <div
                key={cls}
                onClick={() => onSelectClassroom(cls)}
                className="group border border-slate-200 rounded-xl p-4 hover:border-[#0d9488] hover:shadow-md transition cursor-pointer bg-slate-50/50 hover:bg-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#0f2b48] text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-[#0d9488] transition">
                      {cls}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">ชั้นประถมศึกษาปีที่ {cls.replace('ป.', '')}</h3>
                      <p className="text-xs text-slate-500">{classStudents.length} คน</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0d9488] transition" />
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>คัดกรอง 9S แล้ว:</span>
                    <span className="font-semibold text-slate-900">
                      {class9S.length}/{classStudents.length} ({cPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0d9488] h-full rounded-full"
                      style={{ width: `${cPct}%` }}
                    />
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-slate-200/80 text-[11px]">
                    <span className="text-slate-500">พบเสี่ยง 9S:</span>
                    <span
                      className={`font-bold ${
                        class9SPositive.length > 0 ? 'text-amber-600' : 'text-emerald-700'
                      }`}
                    >
                      {class9SPositive.length} คน
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">ประเมิน SDQ:</span>
                    <span className="font-semibold text-slate-800">
                      {classSDQ.length} คน {classSDQProblem.length > 0 && `(มีปัญหา ${classSDQProblem.length})`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 9S Symptom Group Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">1. กลุ่มพฤติกรรมสมาธิสั้น</span>
            <span className="text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold">
              3 ข้อแรก
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#0f2b48]">{countHyper} คน</div>
          <p className="text-xs text-slate-500 mt-1">
            ซนเกินไป • ใจลอย • รอคอยไม่ได้
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">2. กลุ่มอารมณ์และวิตกกังวล</span>
            <span className="text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold">
              3 ข้อกลาง
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#0f2b48]">{countEmotion} คน</div>
          <p className="text-xs text-slate-500 mt-1">
            เครียด/หงุดหงิด • ท้อแท้เบื่อหน่าย • ไม่อยากไปโรงเรียน
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">3. กลุ่มการรังแกและการเข้าสังคม</span>
            <span className="text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold">
              3 ข้อหลัง
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#0f2b48]">{countSocial} คน</div>
          <p className="text-xs text-slate-500 mt-1">
            แกล้งเพื่อน • ถูกเพื่อนแกล้ง • ไม่มีเพื่อนสนิท
          </p>
        </div>
      </div>
    </div>
  );
};
