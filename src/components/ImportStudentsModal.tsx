import React, { useState, useRef } from 'react';
import { Student, ClassroomGrade, AcademicSemester } from '../types';
import { parseStudentFile, generateStudentTemplateWorkbook, ParsedStudentRow } from '../utils/fileParser';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  Copy,
  GraduationCap,
} from 'lucide-react';

interface ImportStudentsModalProps {
  isOpen: boolean;
  currentAcademicYear: string;
  currentSemester: AcademicSemester;
  availableYears: string[];
  existingStudentsCurrentPeriod: Student[];
  allStudentsByPeriod: Record<string, Student[]>;
  onClose: () => void;
  onImportComplete: (
    targetYear: string,
    targetSemester: AcademicSemester,
    students: Student[],
    mode: 'merge' | 'replace' | 'promote'
  ) => void;
}

export const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({
  isOpen,
  currentAcademicYear,
  currentSemester,
  availableYears,
  existingStudentsCurrentPeriod,
  allStudentsByPeriod,
  onClose,
  onImportComplete,
}) => {
  // Target period selection
  const [targetYear, setTargetYear] = useState(currentAcademicYear);
  const [customYear, setCustomYear] = useState('');
  const [isNewYearMode, setIsNewYearMode] = useState(false);
  const [targetSemester, setTargetSemester] = useState<AcademicSemester>(currentSemester);

  // Import mode: 'file_merge' | 'file_replace' | 'promote_with_file' | 'copy_term'
  const [importMode, setImportMode] = useState<'file_merge' | 'file_replace' | 'promote_with_file' | 'copy_term'>('file_merge');

  // File parsing states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const effectiveYear = isNewYearMode && customYear.trim() ? customYear.trim() : targetYear;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setIsParsing(true);
    setParseError(null);
    try {
      const rows = await parseStudentFile(file);
      setParsedRows(rows);
    } catch (err: any) {
      console.error(err);
      setParseError(err.message || 'ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์');
      setParsedRows([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = generateStudentTemplateWorkbook();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'WMA_CARE_แม่แบบรายชื่อนักเรียน.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExecuteImport = () => {
    if (importMode === 'copy_term') {
      // Copy current roster to target semester
      const sourceYear = currentAcademicYear;
      const sourceSem: AcademicSemester = targetSemester === '2' ? '1' : '2';
      const sourceKey = `${sourceYear}_${sourceSem}`;
      const sourceStudents = allStudentsByPeriod[sourceKey] || existingStudentsCurrentPeriod;

      if (!sourceStudents || sourceStudents.length === 0) {
        setParseError(`ไม่พบข้อมูลนักเรียนในภาคเรียนที่ ${sourceSem} เพื่อคัดลอก`);
        return;
      }

      const duplicatedStudents: Student[] = sourceStudents.map((s) => ({
        ...s,
        id: `s-${effectiveYear}-${targetSemester}-${s.studentCode || Math.random().toString(36).substr(2, 5)}`,
        academicYear: effectiveYear,
        semester: targetSemester,
      }));

      onImportComplete(effectiveYear, targetSemester, duplicatedStudents, 'replace');
      onClose();
      return;
    }

    if (importMode === 'promote_with_file') {
      // Auto-promote existing students from currentAcademicYear to next academic year:
      // ป.1 -> ป.2, ป.2 -> ป.3, ป.3 -> ป.4, ป.4 -> ป.5, ป.5 -> ป.6, ป.6 สำเร็จการศึกษา
      const nextClassMap: Record<ClassroomGrade, ClassroomGrade | 'graduated'> = {
        'ป.1': 'ป.2',
        'ป.2': 'ป.3',
        'ป.3': 'ป.4',
        'ป.4': 'ป.5',
        'ป.5': 'ป.6',
        'ป.6': 'graduated',
      };

      const promotedStudents: Student[] = [];

      existingStudentsCurrentPeriod.forEach((s) => {
        const nextGrade = nextClassMap[s.classroom];
        if (nextGrade !== 'graduated') {
          promotedStudents.push({
            ...s,
            id: `s-${effectiveYear}-${targetSemester}-${s.studentCode || Math.random().toString(36).substr(2, 5)}`,
            classroom: nextGrade,
            academicYear: effectiveYear,
            semester: targetSemester,
          });
        }
      });

      // Also add newly parsed students (typically new ป.1 students from uploaded file)
      if (parsedRows.length > 0) {
        parsedRows
          .filter((r) => r.isValid)
          .forEach((r, idx) => {
            promotedStudents.push({
              id: `s-${effectiveYear}-${targetSemester}-${r.studentCode || Date.now() + idx}`,
              studentCode: r.studentCode,
              nationalId: r.nationalId,
              name: r.name,
              classroom: r.classroom,
              birthdate: r.birthdate,
              gender: r.gender,
              orderNo: r.orderNo,
              academicYear: effectiveYear,
              semester: targetSemester,
            });
          });
      }

      onImportComplete(effectiveYear, targetSemester, promotedStudents, 'promote');
      onClose();
      return;
    }

    // Standard file import (merge or replace)
    if (parsedRows.length === 0) {
      setParseError('กรุณาเลือกไฟล์รายชื่อนักเรียนก่อนดำเนินการ');
      return;
    }

    const validNewStudents: Student[] = parsedRows
      .filter((r) => r.isValid)
      .map((r, idx) => ({
        id: `s-${effectiveYear}-${targetSemester}-${r.studentCode || Date.now() + idx}`,
        studentCode: r.studentCode,
        nationalId: r.nationalId,
        name: r.name,
        classroom: r.classroom,
        birthdate: r.birthdate,
        gender: r.gender,
        orderNo: r.orderNo,
        academicYear: effectiveYear,
        semester: targetSemester,
      }));

    onImportComplete(
      effectiveYear,
      targetSemester,
      validNewStudents,
      importMode === 'file_replace' ? 'replace' : 'merge'
    );
    onClose();
  };

  // Class breakdown of parsed rows
  const classCounts = parsedRows.reduce((acc, r) => {
    acc[r.classroom] = (acc[r.classroom] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0f2b48] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                อัปเดตและนำเข้ารายชื่อนักเรียน (ต่อเนื่องรายเทอม / รายปี)
              </h3>
              <p className="text-xs text-slate-300">
                รองรับไฟล์ Excel (.xlsx, .xls), CSV และระบบเลื่อนชั้นปีการศึกษาใหม่อัตโนมัติ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Step 1: Target Academic Year & Semester */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <Calendar className="w-4 h-4 text-[#0d9488]" />
                1. เลือกปีการศึกษาและภาคเรียนเป้าหมายที่ต้องการอัปเดต
              </span>
              <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-semibold border border-teal-200">
                แยกข้อมูลแต่ละเทอม แต่ละปีอย่างอิสระ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Year Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ปีการศึกษาเป้าหมาย</label>
                <div className="flex items-center gap-2">
                  {!isNewYearMode ? (
                    <select
                      value={targetYear}
                      onChange={(e) => setTargetYear(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] outline-none font-bold text-slate-800"
                    >
                      {availableYears.map((y) => (
                        <option key={y} value={y}>
                          ปีการศึกษา {y}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="เช่น 2570, 2571"
                      value={customYear}
                      onChange={(e) => setCustomYear(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] outline-none font-bold text-slate-800"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewYearMode(!isNewYearMode);
                      if (!isNewYearMode && !customYear) {
                        const nextY = parseInt(targetYear, 10) + 1;
                        setCustomYear(String(nextY));
                      }
                    }}
                    className="px-2.5 py-2 text-[11px] font-semibold text-[#0f2b48] bg-slate-200 hover:bg-slate-300 rounded-lg whitespace-nowrap transition cursor-pointer"
                  >
                    {isNewYearMode ? 'เลือกปีเดิม' : '+ สร้างปีถัดไป'}
                  </button>
                </div>
              </div>

              {/* Semester Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ภาคเรียนเป้าหมาย</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetSemester('1')}
                    className={`py-2 px-3 rounded-lg font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      targetSemester === '1'
                        ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>ภาคเรียนที่ 1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetSemester('2')}
                    className={`py-2 px-3 rounded-lg font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      targetSemester === '2'
                        ? 'bg-[#0f2b48] text-white border-[#0f2b48] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>ภาคเรียนที่ 2</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Select Action / Import Mode */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
              2. เลือกรูปแบบการปรับปรุงรายชื่อนักเรียน
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Option 1: File Merge */}
              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  importMode === 'file_merge'
                    ? 'border-[#0d9488] bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="import_mode"
                    checked={importMode === 'file_merge'}
                    onChange={() => setImportMode('file_merge')}
                    className="mt-0.5 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900">อัปเดต / เพิ่มจากไฟล์ Excel/CSV</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      เพิ่มนักเรียนใหม่ หรืออัปเดตข้อมูลนักเรียนที่มีอยู่แล้วในเทอมนี้
                    </div>
                  </div>
                </div>
              </label>

              {/* Option 2: Auto Promote to Next Year */}
              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  importMode === 'promote_with_file'
                    ? 'border-[#0d9488] bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="import_mode"
                    checked={importMode === 'promote_with_file'}
                    onChange={() => {
                      setImportMode('promote_with_file');
                      if (!isNewYearMode) {
                        setIsNewYearMode(true);
                        setCustomYear(String(parseInt(currentAcademicYear, 10) + 1));
                      }
                      setTargetSemester('1');
                    }}
                    className="mt-0.5 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-teal-600" />
                      <span>เลื่อนชั้นปีการศึกษาใหม่อัตโนมัติ</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      เลื่อนชั้น ป.1 $\rightarrow$ ป.2 ถึง ป.5 $\rightarrow$ ป.6 (ป.6 จบการศึกษา) และรับ ป.1 ใหม่จากไฟล์
                    </div>
                  </div>
                </div>
              </label>

              {/* Option 3: Copy Current Roster to Term 2 */}
              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  importMode === 'copy_term'
                    ? 'border-[#0d9488] bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="import_mode"
                    checked={importMode === 'copy_term'}
                    onChange={() => {
                      setImportMode('copy_term');
                      setTargetSemester('2');
                    }}
                    className="mt-0.5 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Copy className="w-3.5 h-3.5 text-blue-600" />
                      <span>คัดลอกรายชื่อไปภาคเรียนถัดไป</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ใช้รายชื่อเดิมจากเทอม 1 ส่งต่อไปยังเทอม 2 โดยไม่ต้องอัปไฟล์ใหม่
                    </div>
                  </div>
                </div>
              </label>

              {/* Option 4: Full Replace */}
              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  importMode === 'file_replace'
                    ? 'border-[#0d9488] bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="import_mode"
                    checked={importMode === 'file_replace'}
                    onChange={() => setImportMode('file_replace')}
                    className="mt-0.5 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900">แทนที่รายชื่อทั้งหมดจากไฟล์</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ล้างรายชื่อเดิมในเทอมเป้าหมาย และใช้รายชื่อจากไฟล์ใหม่ทั้งหมด
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Step 3: File Upload Area (if not copy_term) */}
          {importMode !== 'copy_term' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                  3. เลือกไฟล์เอกสารรายชื่อนักเรียน (.xlsx, .xls, .csv)
                </label>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 text-xs text-[#0d9488] hover:text-[#0f766e] font-semibold underline underline-offset-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดไฟล์ตัวอย่างแม่แบบ Excel</span>
                </button>
              </div>

              {/* Drag & Drop Box */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                  selectedFile
                    ? 'border-teal-500 bg-teal-50/40'
                    : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>

                {selectedFile ? (
                  <div>
                    <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ขนาด {(selectedFile.size / 1024).toFixed(1)} KB • คลิกเพื่อเปลี่ยนไฟล์
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      ลากไฟล์มาวางที่นี่ หรือ <span className="text-[#0d9488] underline">คลิกเพื่อเลือกไฟล์</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      รองรับตารางข้อมูลจาก DMC, SGS, Excel, หรือ CSV ทุกรูปแบบ
                    </p>
                  </div>
                )}
              </div>

              {parseError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Preview of Parsed Data */}
          {parsedRows.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-xs text-slate-900">
                    ตรวจพบข้อมูลนักเรียนทั้งหมด {parsedRows.length} คน
                  </span>
                </div>
                {/* Classroom chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Object.entries(classCounts).map(([cls, count]) => (
                    <span
                      key={cls}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold"
                    >
                      {cls}: {count} คน
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample 5 rows */}
              <div className="overflow-x-auto max-h-40 overflow-y-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-1.5 px-2">เลขที่</th>
                      <th className="py-1.5 px-2">ชั้น</th>
                      <th className="py-1.5 px-2">เลขประจำตัว</th>
                      <th className="py-1.5 px-2">ชื่อ - สกุล</th>
                      <th className="py-1.5 px-2">วันเกิด</th>
                      <th className="py-1.5 px-2">เพศ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 10).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-1 px-2">{r.orderNo}</td>
                        <td className="py-1 px-2 font-bold text-slate-700">{r.classroom}</td>
                        <td className="py-1 px-2 font-mono">{r.studentCode}</td>
                        <td className="py-1 px-2 font-medium">{r.name}</td>
                        <td className="py-1 px-2 text-slate-500">{r.birthdate}</td>
                        <td className="py-1 px-2 text-slate-500">{r.gender}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 10 && (
                <p className="text-[10px] text-slate-400 text-center">
                  และอีก {parsedRows.length - 10} รายการที่พร้อมนำเข้า
                </p>
              )}
            </div>
          )}

          {/* Promotion explanation if mode is promote_with_file */}
          {importMode === 'promote_with_file' && (
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl text-xs space-y-1.5 text-teal-900">
              <div className="font-bold flex items-center gap-1.5 text-teal-950">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>สรุปผลการเลื่อนชั้นปีการศึกษาอัตโนมัติ:</span>
              </div>
              <p>• นักเรียน ป.1 ถึง ป.5 เดิม ({existingStudentsCurrentPeriod.filter(s => s.classroom !== 'ป.6').length} คน) จะถูกเลื่อนขึ้นชั้น ป.2 ถึง ป.6 ในปีการศึกษา {effectiveYear} ภาคเรียนที่ {targetSemester}</p>
              <p>• นักเรียน ป.6 เดิม ({existingStudentsCurrentPeriod.filter(s => s.classroom === 'ป.6').length} คน) จบการศึกษาและไม่นำเข้าในระดับประถม</p>
              {parsedRows.length > 0 ? (
                <p className="font-semibold text-teal-800">• นำเข้าและเพิ่มนักเรียนใหม่จากไฟล์ ({parsedRows.length} คน) เข้าสู่ปีการศึกษา {effectiveYear}</p>
              ) : (
                <p className="text-slate-600 italic">• คุณสามารถเลือกไฟล์รายชื่อ ป.1 ใหม่ได้ หรือกดดำเนินการทันทีแล้วค่อยเพิ่ม ป.1 ภายหลัง</p>
              )}
            </div>
          )}

          {/* Copy Term explanation */}
          {importMode === 'copy_term' && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-900">
              <div className="font-bold text-blue-950">
                คัดลอกรายชื่อจาก ภาคเรียนที่ {targetSemester === '2' ? '1' : '2'} $\rightarrow$ ภาคเรียนที่ {targetSemester}
              </div>
              <p>
                ระบบจะสร้างสำเนารายชื่อนักเรียนทั้งหมด ({existingStudentsCurrentPeriod.length} คน) เข้าสู่ภาคเรียนที่ {targetSemester} ปีการศึกษา {effectiveYear} โดยผลการประเมิน 9S และ SDQ ในเทอมใหม่จะเริ่มที่สถานะว่าง พร้อมให้ครูทำการประเมินติดตามผล
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            เป้าหมาย:{' '}
            <span className="font-bold text-slate-800">
              ปีการศึกษา {effectiveYear} • ภาคเรียนที่ {targetSemester}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={isParsing || (importMode !== 'copy_term' && importMode !== 'promote_with_file' && parsedRows.length === 0)}
              className="px-5 py-2 text-sm font-medium text-white bg-[#0d9488] hover:bg-[#0f766e] rounded-lg shadow-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>ยืนยันและนำเข้ารายชื่อ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
