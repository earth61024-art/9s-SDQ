import React, { useState } from 'react';
import { Student, Assessment9S, AssessmentSDQ, ClassroomGrade, AcademicSemester } from '../types';
import { formatToThaiDate } from '../utils/thaiDate';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Printer,
  ClipboardCheck,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Filter,
  User,
  Calendar,
  Upload,
} from 'lucide-react';

interface ClassroomViewProps {
  viewType: '9s' | 'sdq' | 'students';
  academicYear: string;
  semester: AcademicSemester;
  students: Student[];
  screenings9S: Record<string, Assessment9S>;
  assessmentsSDQ: Record<string, AssessmentSDQ>;
  selectedClassroom: ClassroomGrade | 'all';
  setSelectedClassroom: (grade: ClassroomGrade | 'all') => void;
  onOpen9SModal: (student: Student) => void;
  onOpenSDQModal: (student: Student) => void;
  onOpenStudentModal: (student?: Student) => void;
  onDeleteStudent: (student: Student) => void;
  onPrint9S: (student: Student, assessment: Assessment9S) => void;
  onPrintSDQ: (student: Student, assessment: AssessmentSDQ) => void;
  onPrintClassroomSummary: (classroom: ClassroomGrade) => void;
  onOpenImportModal: () => void;
}

export const ClassroomView: React.FC<ClassroomViewProps> = ({
  viewType,
  academicYear,
  semester,
  students,
  screenings9S,
  assessmentsSDQ,
  selectedClassroom,
  setSelectedClassroom,
  onOpen9SModal,
  onOpenSDQModal,
  onOpenStudentModal,
  onDeleteStudent,
  onPrint9S,
  onPrintSDQ,
  onPrintClassroomSummary,
  onOpenImportModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const classList: (ClassroomGrade | 'all')[] = ['all', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

  const filteredStudents = students.filter((s) => {
    const matchesClass = selectedClassroom === 'all' || s.classroom === selectedClassroom;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.studentCode.toLowerCase().includes(q) ||
      s.nationalId.toLowerCase().includes(q);
    return matchesClass && matchesQuery;
  });

  const getStatusBadge = (status?: string) => {
    if (!status) return <span className="text-slate-400 text-xs">ยังไม่ประเมิน</span>;
    if (status === 'normal') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          ปกติ
        </span>
      );
    }
    if (status === 'risk') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          กลุ่มเสี่ยง
        </span>
      );
    }
    if (status === 'problem') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          กลุ่มมีปัญหา
        </span>
      );
    }
    return <span className="text-xs">{status}</span>;
  };

  return (
    <div className="space-y-5">
      {/* Top Controller Bar */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Class Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            ชั้น:
          </span>
          {classList.map((cls) => {
            const isSelected = selectedClassroom === cls;
            const count =
              cls === 'all'
                ? students.length
                : students.filter((s) => s.classroom === cls).length;

            return (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClassroom(cls)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0f2b48] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{cls === 'all' ? 'ทุกชั้นเรียน' : cls}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Add Student, Import Files & Print Classroom Summary */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenImportModal}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0d9488] border border-teal-200 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            title="อัปโหลดไฟล์ Excel/CSV หรือเลื่อนชั้นปีใหม่"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>อัปโหลดรายชื่อ (Excel/CSV)</span>
          </button>

          {selectedClassroom !== 'all' && (
            <button
              type="button"
              onClick={() => onPrintClassroomSummary(selectedClassroom)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title={`พิมพ์สรุปผลชั้น ${selectedClassroom}`}
            >
              <Printer className="w-3.5 h-3.5 text-[#0d9488]" />
              <span>พิมพ์สรุป {selectedClassroom}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenStudentModal()}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0d9488] hover:bg-[#0f766e] text-white flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มนักเรียนใหม่</span>
          </button>
        </div>
      </div>

      {/* Search & Info Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, รหัสนักเรียน, หรือเลขประจำตัวประชาชน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] outline-none shadow-xs"
          />
        </div>

        <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
          <span>แสดง <span className="font-bold text-slate-900">{filteredStudents.length}</span> จาก {students.length} คน</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700 border border-slate-200">
            ปีการศึกษา {academicYear} • ภาคเรียนที่ {semester}
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0f2b48] text-white">
                <th className="py-3 px-3 w-12 text-center">เลขที่</th>
                <th className="py-3 px-2 w-16 text-center">ชั้น</th>
                <th className="py-3 px-3 w-24">เลขประจำตัว</th>
                <th className="py-3 px-3">ชื่อ - นามสกุล</th>
                {viewType === 'students' && (
                  <>
                    <th className="py-3 px-3">เลขประจำตัวประชาชน</th>
                    <th className="py-3 px-3">วันเกิด</th>
                  </>
                )}

                {viewType === '9s' && (
                  <>
                    <th className="py-3 px-3">วันที่คัดกรอง</th>
                    <th className="py-3 px-3 text-center">สมาธิสั้น</th>
                    <th className="py-3 px-3 text-center">อารมณ์</th>
                    <th className="py-3 px-3 text-center">รังแก/เพื่อน</th>
                    <th className="py-3 px-3 text-center">สรุปผล 9S</th>
                  </>
                )}

                {viewType === 'sdq' && (
                  <>
                    <th className="py-3 px-3">ผู้ประเมิน</th>
                    <th className="py-3 px-3 text-center">อารมณ์</th>
                    <th className="py-3 px-3 text-center">ความประพฤติ</th>
                    <th className="py-3 px-3 text-center">สมาธิสั้น</th>
                    <th className="py-3 px-3 text-center">เพื่อน</th>
                    <th className="py-3 px-3 text-center">รวม 4 ด้าน</th>
                    <th className="py-3 px-3 text-center">จุดแข็ง</th>
                  </>
                )}

                <th className="py-3 px-3 text-center w-36">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    ไม่พบข้อมูลนักเรียนที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const sc9 = screenings9S[s.id];
                  const sdq = assessmentsSDQ[s.id];

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 text-center font-semibold text-slate-600">
                        {s.orderNo ?? '-'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700 text-[11px]">
                          {s.classroom}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-800">
                        {s.studentCode}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {s.name}
                      </td>

                      {/* ViewType: Students */}
                      {viewType === 'students' && (
                        <>
                          <td className="py-3 px-3 font-mono text-slate-600 text-xs">
                            {s.nationalId}
                          </td>
                          <td className="py-3 px-3 text-slate-600">{s.birthdate}</td>
                        </>
                      )}

                      {/* ViewType: 9S Screening */}
                      {viewType === '9s' && (
                        <>
                          <td className="py-3 px-3 text-slate-600">
                            {sc9 ? formatToThaiDate(sc9.assessmentDate, sc9.assessmentTime) : (
                              <span className="text-slate-400 italic">ยังไม่ได้คัดกรอง</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {sc9 ? (
                              sc9.behavioralPositive ? (
                                <span className="text-amber-700 font-bold">ผลบวก</span>
                              ) : (
                                <span className="text-emerald-700">ปกติ</span>
                              )
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {sc9 ? (
                              sc9.emotionalPositive ? (
                                <span className="text-amber-700 font-bold">ผลบวก</span>
                              ) : (
                                <span className="text-emerald-700">ปกติ</span>
                              )
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {sc9 ? (
                              sc9.socialPositive ? (
                                <span className="text-amber-700 font-bold">ผลบวก</span>
                              ) : (
                                <span className="text-emerald-700">ปกติ</span>
                              )
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {sc9 ? (
                              sc9.overallPositive ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  พบเสี่ยง (ส่งต่อ SDQ)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  สุขภาวะปกติ
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </>
                      )}

                      {/* ViewType: SDQ Assessment */}
                      {viewType === 'sdq' && (
                        <>
                          <td className="py-3 px-3 text-slate-600 text-xs">
                            {sdq ? (
                              <span>
                                {sdq.assessorType === 'student'
                                  ? 'นักเรียน'
                                  : sdq.assessorType === 'parent'
                                  ? 'ผู้ปกครอง'
                                  : 'ครู'}{' '}
                                ({sdq.assessorName})
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">ยังไม่ประเมิน</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-medium">
                            {sdq ? `${sdq.emotionalScore}` : '-'}
                          </td>
                          <td className="py-3 px-3 text-center font-medium">
                            {sdq ? `${sdq.conductScore}` : '-'}
                          </td>
                          <td className="py-3 px-3 text-center font-medium">
                            {sdq ? `${sdq.hyperactivityScore}` : '-'}
                          </td>
                          <td className="py-3 px-3 text-center font-medium">
                            {sdq ? `${sdq.peerScore}` : '-'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {sdq ? (
                              <div>
                                <span className="font-bold text-slate-900">{sdq.totalDifficulties}</span>
                                <div className="mt-0.5">{getStatusBadge(sdq.totalStatus)}</div>
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {sdq ? (
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  sdq.prosocialStatus === 'strength'
                                    ? 'bg-teal-100 text-teal-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {sdq.prosocialScore} ({sdq.prosocialStatus === 'strength' ? 'มีจุดแข็ง' : 'ไม่มี'})
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </>
                      )}

                      {/* Actions Column */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 9S Button */}
                          <button
                            type="button"
                            onClick={() => onOpen9SModal(s)}
                            className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              sc9
                                ? 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                                : 'bg-[#0f2b48] text-white hover:bg-[#163a61]'
                            }`}
                            title={sc9 ? 'ดู/แก้ไขแบบคัดกรอง 9S' : 'บันทึกแบบคัดกรอง 9S'}
                          >
                            <ClipboardCheck className="w-4 h-4" />
                          </button>

                          {/* SDQ Button */}
                          <button
                            type="button"
                            onClick={() => onOpenSDQModal(s)}
                            className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              sdq
                                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                            title={sdq ? 'ดู/แก้ไขแบบประเมิน SDQ' : 'ประเมิน SDQ'}
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </button>

                          {/* Print 9S button if available */}
                          {sc9 && (
                            <button
                              type="button"
                              onClick={() => onPrint9S(s, sc9)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                              title="พิมพ์แบบ 9S"
                            >
                              <Printer className="w-3.5 h-3.5 text-teal-600" />
                            </button>
                          )}

                          {/* Print SDQ button if available */}
                          {sdq && (
                            <button
                              type="button"
                              onClick={() => onPrintSDQ(s, sdq)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                              title="พิมพ์แบบ SDQ"
                            >
                              <Printer className="w-3.5 h-3.5 text-blue-600" />
                            </button>
                          )}

                          {/* Edit Student Button */}
                          {viewType === 'students' && (
                            <>
                              <button
                                type="button"
                                onClick={() => onOpenStudentModal(s)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                title="แก้ไขข้อมูลนักเรียน"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteStudent(s)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="ลบรายชื่อนักเรียน"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
