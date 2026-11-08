import React, { useState } from 'react';
import { Student, Assessment9S, AssessmentSDQ, ClassroomGrade, AcademicSemester } from '../types';
import { exportToGoogleSheets, saveSummaryReportToDrive } from '../services/workspaceService';
import { hasAccessToken } from '../services/firebaseAuth';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  HardDrive,
  Printer,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  Calendar,
  School,
  Share2,
} from 'lucide-react';

interface ReportsViewProps {
  academicYear: string;
  semester: AcademicSemester;
  students: Student[];
  screenings9S: Record<string, Assessment9S>;
  assessmentsSDQ: Record<string, AssessmentSDQ>;
  currentUser: User | null;
  onSignInWithGoogle: () => void;
  onPrintClassroom: (classroom: ClassroomGrade) => void;
  onPrintSchoolSummary: () => void;
  onConfirmModal: (opts: {
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'primary' | 'danger' | 'success';
  }) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  academicYear,
  semester,
  students,
  screenings9S,
  assessmentsSDQ,
  currentUser,
  onSignInWithGoogle,
  onPrintClassroom,
  onPrintSchoolSummary,
  onConfirmModal,
}) => {
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [sheetsResultUrl, setSheetsResultUrl] = useState<string | null>(null);

  const [isSavingDrive, setIsSavingDrive] = useState(false);
  const [driveResultLink, setDriveResultLink] = useState<string | null>(null);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const classList: ClassroomGrade[] = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

  const handleExportSheets = () => {
    if (!currentUser) {
      onSignInWithGoogle();
      return;
    }

    const modalMsg = hasAccessToken()
      ? `ระบบจะสร้าง Google Sheet ใหม่ชื่อ "WMA CARE - สรุปผลคัดกรอง 9S & SDQ ปีการศึกษา ${academicYear} ภาคเรียนที่ ${semester}" ใน Google Drive บัญชี ${currentUser.email} พร้อมข้อมูลนักเรียนและการประเมินทั้งหมด (${students.length} รายการ)`
      : `ระบบจะขอสิทธิ์เข้าถึง Google Workspace ในบัญชี ${currentUser.email} เพื่อสร้าง Google Sheet สรุปผลคัดกรอง 9S & SDQ ปีการศึกษา ${academicYear} ภาคเรียนที่ ${semester}`;

    onConfirmModal({
      title: 'สร้าง Google Spreadsheet ใหม่ในบัญชีของคุณ?',
      message: modalMsg,
      variant: 'primary',
      onConfirm: async () => {
        setIsExportingSheets(true);
        setStatusMessage(null);
        setErrorMessage(null);
        try {
          const res = await exportToGoogleSheets(
            academicYear,
            semester,
            students,
            screenings9S,
            assessmentsSDQ
          );
          if (res.success && res.spreadsheetUrl) {
            setSheetsResultUrl(res.spreadsheetUrl);
            setStatusMessage('ส่งออกไปยัง Google Sheets เรียบร้อยแล้ว!');
          } else {
            setErrorMessage(res.error || 'ไม่สามารถส่งออก Google Sheets ได้');
          }
        } catch (err: any) {
          setErrorMessage(err?.message || 'เกิดข้อผิดพลาดในการส่งออก Google Sheets');
        } finally {
          setIsExportingSheets(false);
        }
      },
    });
  };

  const handleSaveToDrive = () => {
    if (!currentUser) {
      onSignInWithGoogle();
      return;
    }

    // Build plain text summary
    const summaryText = `รายงานสรุปภาพรวมสุขภาวะและพัฒนาการนักเรียน WMA CARE
โรงเรียนวัดใหม่อมตรส
ปีการศึกษา: ${academicYear} ภาคเรียนที่: ${semester}
วันที่จัดทำ: ${new Date().toLocaleDateString('th-TH')}

1. สถิติภาพรวม:
- จำนวนนักเรียนทั้งหมด: ${students.length} คน
- ผ่านการคัดกรอง 9S: ${Object.keys(screenings9S).length} คน
- ผลคัดกรอง 9S เป็นบวก (เสี่ยง): ${Object.values(screenings9S).filter((s) => s.overallPositive).length} คน
- ผ่านการประเมิน SDQ: ${Object.keys(assessmentsSDQ).length} คน
- SDQ กลุ่มเสี่ยง: ${Object.values(assessmentsSDQ).filter((s) => s.totalStatus === 'risk').length} คน
- SDQ กลุ่มมีปัญหา: ${Object.values(assessmentsSDQ).filter((s) => s.totalStatus === 'problem').length} คน

2. แยกตามชั้นเรียน:
${classList
  .map((c) => {
    const cs = students.filter((s) => s.classroom === c);
    const c9 = cs.filter((s) => screenings9S[s.id]);
    const c9Pos = cs.filter((s) => screenings9S[s.id]?.overallPositive);
    const cSdq = cs.filter((s) => assessmentsSDQ[s.id]);
    return `ชั้น ${c}: นักเรียน ${cs.length} คน, 9S ${c9.length} คน (เสี่ยง ${c9Pos.length}), SDQ ${cSdq.length} คน`;
  })
  .join('\n')}
`;

    const driveModalMsg = hasAccessToken()
      ? `ระบบจะบันทึกไฟล์ข้อความสรุปผลภาพรวม "WMA_CARE_รายงานสรุป_ปีการศึกษา_${academicYear}_ภาคเรียนที่_${semester}.txt" ลงใน Google Drive ของบัญชี ${currentUser.email}`
      : `ระบบจะขอสิทธิ์เข้าถึง Google Drive ในบัญชี ${currentUser.email} เพื่อบันทึกรายงานสรุปผล`;

    onConfirmModal({
      title: 'บันทึกไฟล์รายงานสรุปไปยัง Google Drive?',
      message: driveModalMsg,
      variant: 'primary',
      onConfirm: async () => {
        setIsSavingDrive(true);
        setStatusMessage(null);
        setErrorMessage(null);
        try {
          const res = await saveSummaryReportToDrive(
            academicYear,
            semester,
            'WMA_CARE_รายงานสรุป',
            summaryText
          );
          if (res.success && res.webViewLink) {
            setDriveResultLink(res.webViewLink);
            setStatusMessage('บันทึกรายงานลง Google Drive เรียบร้อยแล้ว!');
          } else {
            setErrorMessage(res.error || 'ไม่สามารถบันทึก Google Drive ได้');
          }
        } catch (err: any) {
          setErrorMessage(err?.message || 'เกิดข้อผิดพลาดในการบันทึก Google Drive');
        } finally {
          setIsSavingDrive(false);
        }
      },
    });
  };

  const handleExportJSON = () => {
    const backupData = {
      academicYear,
      exportedAt: new Date().toISOString(),
      school: 'โรงเรียนวัดใหม่อมตรส',
      students,
      screenings9S,
      assessmentsSDQ,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WMA_CARE_Backup_${academicYear}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">
          ศูนย์พิมพ์รายงาน และส่งออกข้อมูล Google Workspace
        </h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          พิมพ์แบบฟอร์มราชการและตารางสรุปผลสำหรับเอกสารโรงเรียนวัดใหม่อมตรส หรือส่งออกข้อมูลแบบ Real-time ไปยัง Google Sheets และ Google Drive ในบัญชีของคุณ
        </p>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-900">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-600 shrink-0" />
            <span className="font-semibold">{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-teal-700 hover:text-teal-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:text-rose-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Google Workspace Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Google Sheets Export Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-500 transition">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              ส่งออกไปยัง Google Sheets
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              สร้าง Google Spreadsheet ใน Google Drive พร้อมแยกแผ่นงาน (Sheet tabs):
              <br />• ภาพรวมรายชื่อนักเรียน
              <br />• ผลการคัดกรอง 9S (School Health HERO)
              <br />• ผลการประเมิน SDQ ครบทั้ง 5 ด้านและผลกระทบ
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleExportSheets}
              disabled={isExportingSheets}
              className="w-full py-2.5 px-4 bg-[#0f2b48] hover:bg-[#163a61] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isExportingSheets ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังสร้างและส่งออก Google Sheets...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>
                    {!currentUser
                      ? 'ลงชื่อเข้าใช้ Google เพื่อส่งออก Sheets'
                      : !hasAccessToken()
                      ? 'เชื่อมต่อสิทธิ์ Google และส่งออก Sheets'
                      : 'ส่งออกข้อมูลไปยัง Google Sheets ทันที'}
                  </span>
                </>
              )}
            </button>

            {sheetsResultUrl && (
              <a
                href={sheetsResultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-900 font-semibold underline underline-offset-2"
              >
                <span>เปิดดู Google Sheet ที่สร้างขึ้น</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Google Drive Report Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-500 transition">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <HardDrive className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              บันทึกรายงานสรุปไปยัง Google Drive
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              อัปโหลดไฟล์สรุปรายงานภาพรวมสุขภาวะนักเรียนประจำปีการศึกษา {academicYear} ไปยังโฟลเดอร์ Google Drive ของคุณ สำหรับการจัดเก็บเอกสารระบบประกันคุณภาพและการติดตามงาน
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleSaveToDrive}
              disabled={isSavingDrive}
              className="w-full py-2.5 px-4 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isSavingDrive ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังบันทึกลง Google Drive...</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-4 h-4 text-white" />
                  <span>
                    {!currentUser
                      ? 'ลงชื่อเข้าใช้ Google เพื่อบันทึกลง Drive'
                      : !hasAccessToken()
                      ? 'เชื่อมต่อสิทธิ์ Google และบันทึก Drive'
                      : 'บันทึกรายงานสรุปลง Google Drive'}
                  </span>
                </>
              )}
            </button>

            {driveResultLink && (
              <a
                href={driveResultLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-900 font-semibold underline underline-offset-2"
              >
                <span>เปิดดูไฟล์ใน Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Printing Center Cards */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              พิมพ์รายงานสรุปผลประจำห้องเรียน (Classroom Printouts)
            </h3>
            <p className="text-xs text-slate-500">
              จัดรูปแบบเอกสารแบบฟอร์มทางการเพื่อใช้เสนอผู้บริหารโรงเรียนวัดใหม่อมตรส
            </p>
          </div>
          <button
            type="button"
            onClick={onPrintSchoolSummary}
            className="px-4 py-2 bg-[#0f2b48] hover:bg-[#163a61] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-teal-300" />
            <span>พิมพ์ภาพรวมทั้งโรงเรียน</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {classList.map((cls) => {
            const count = students.filter((s) => s.classroom === cls).length;
            return (
              <button
                key={cls}
                type="button"
                onClick={() => onPrintClassroom(cls)}
                className="p-3.5 border border-slate-200 rounded-xl hover:border-[#0d9488] hover:bg-teal-50/40 text-center transition cursor-pointer group shadow-xs"
              >
                <div className="w-9 h-9 mx-auto rounded-lg bg-slate-100 group-hover:bg-[#0d9488] group-hover:text-white flex items-center justify-center text-xs font-bold text-[#0f2b48] transition">
                  {cls}
                </div>
                <div className="mt-2 text-xs font-bold text-slate-800">
                  ชั้น {cls}
                </div>
                <div className="text-[11px] text-slate-500">{count} คน</div>
                <div className="mt-2 text-[10px] text-teal-700 font-semibold flex items-center justify-center gap-1">
                  <Printer className="w-3 h-3" />
                  <span>พิมพ์เอกสาร</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Backup & System Data */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900">
            สำรองและกู้คืนข้อมูล (Local Backup)
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            ดาวน์โหลดไฟล์สำรองข้อมูล (JSON) สำหรับเก็บสำรองนอกระบบ หรือย้ายข้อมูลไปยังเครื่องอื่น
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>ดาวน์โหลดไฟล์สำรอง JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
