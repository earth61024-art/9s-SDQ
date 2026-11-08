import React, { useState, useEffect } from 'react';
import { Student, Assessment9S, Answers9S, AcademicSemester } from '../types';
import { QUESTIONS_9S, calculate9S } from '../utils/assessmentScoring';
import { getTodayThaiDate, formatToThaiDate } from '../utils/thaiDate';
import { X, CheckCircle, AlertTriangle, Printer, ArrowRight, Save, Clock, Calendar } from 'lucide-react';

interface Screening9SModalProps {
  isOpen: boolean;
  student: Student | null;
  assessment?: Assessment9S | null;
  currentAcademicYear: string;
  currentSemester: AcademicSemester;
  onClose: () => void;
  onSave: (assessment: Assessment9S) => void;
  onProceedToSDQ?: (student: Student) => void;
  onPrint?: (student: Student, assessment: Assessment9S) => void;
}

export const Screening9SModal: React.FC<Screening9SModalProps> = ({
  isOpen,
  student,
  assessment,
  currentAcademicYear,
  currentSemester,
  onClose,
  onSave,
  onProceedToSDQ,
  onPrint,
}) => {
  const [answers, setAnswers] = useState<Answers9S>({
    q1_hyperactive: false,
    q2_inattentive: false,
    q3_impulsive: false,
    q4_stress: false,
    q5_discouraged: false,
    q6_schoolRefusal: false,
    q7_bully: false,
    q8_bullied: false,
    q9_noFriends: false,
  });

  const [assessmentDate, setAssessmentDate] = useState('');
  const [assessmentTime, setAssessmentTime] = useState('');
  const [assessorName, setAssessorName] = useState('ครูประจำชั้น');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (assessment) {
      setAnswers(assessment.answers);
      setAssessmentDate(assessment.assessmentDate);
      setAssessmentTime(assessment.assessmentTime || '09:00');
      setAssessorName(assessment.assessorName || 'ครูประจำชั้น');
      setNotes(assessment.notes || '');
    } else {
      const today = getTodayThaiDate();
      setAnswers({
        q1_hyperactive: false,
        q2_inattentive: false,
        q3_impulsive: false,
        q4_stress: false,
        q5_discouraged: false,
        q6_schoolRefusal: false,
        q7_bully: false,
        q8_bullied: false,
        q9_noFriends: false,
      });
      setAssessmentDate(today.dateString);
      setAssessmentTime(today.timeString);
      setAssessorName('ครูประจำชั้น');
      setNotes('');
    }
  }, [assessment, student, isOpen]);

  if (!isOpen || !student) return null;

  const currentResults = calculate9S(answers);

  const handleToggle = (key: keyof Answers9S, val: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSave = () => {
    const updated: Assessment9S = {
      id: assessment ? assessment.id : `9s-${student.id}-${currentSemester}-${Date.now()}`,
      studentId: student.id,
      academicYear: student.academicYear || currentAcademicYear,
      semester: student.semester || currentSemester,
      assessmentDate,
      assessmentTime,
      assessorName: assessorName.trim() || 'ครูประจำชั้น',
      answers,
      ...currentResults,
      notes,
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
    onClose();
  };

  const handleSaveAndGoSDQ = () => {
    const updated: Assessment9S = {
      id: assessment ? assessment.id : `9s-${student.id}-${currentSemester}-${Date.now()}`,
      studentId: student.id,
      academicYear: student.academicYear || currentAcademicYear,
      semester: student.semester || currentSemester,
      assessmentDate,
      assessmentTime,
      assessorName: assessorName.trim() || 'ครูประจำชั้น',
      answers,
      ...currentResults,
      notes,
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
    if (onProceedToSDQ) {
      onProceedToSDQ(student);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0f2b48] text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                School Health HERO
              </span>
              <span className="text-xs text-slate-300">
                ปีการศึกษา {student.academicYear || currentAcademicYear} (ภาคเรียนที่ {student.semester || currentSemester})
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">
              แบบสังเกตและคัดกรองอาการ 9S
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              นักเรียน: <span className="font-semibold text-white">{student.name}</span> ({student.classroom} เลขที่ {student.orderNo ?? '-'} เลขประจำตัว {student.studentCode})
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onPrint && assessment && (
              <button
                type="button"
                onClick={() => onPrint(student, assessment)}
                title="พิมพ์แบบประเมิน 9S"
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              >
                <Printer className="w-4 h-4 text-teal-300" />
                <span className="hidden sm:inline">พิมพ์แบบฟอร์ม</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Editable Date, Time, Assessor */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#0d9488]" />
                วันที่สังเกต/คัดกรอง
              </label>
              <input
                type="date"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#0d9488]" />
                เวลาสังเกต
              </label>
              <input
                type="time"
                value={assessmentTime}
                onChange={(e) => setAssessmentTime(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ครูผู้สังเกตและคัดกรอง
              </label>
              <input
                type="text"
                placeholder="ชื่อครูประจำชั้น / ผู้สังเกต"
                value={assessorName}
                onChange={(e) => setAssessorName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] outline-none"
              />
            </div>
          </div>

          {/* Group 1: Behavior & Attention */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="px-4 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-sm text-[#0f2b48]">
                1. กลุ่มพฤติกรรมและความใส่ใจ (สมาธิสั้น)
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  currentResults.behavioralPositive
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {currentResults.behavioralPositive ? 'เกณฑ์บวก (ตอบใช่ ≥ 1 ข้อ)' : 'ปกติ'}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {QUESTIONS_9S.filter((q) => q.group === 'behavior').map((q) => (
                <div key={q.key} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                  <div>
                    <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#0f2b48] text-white flex items-center justify-center text-xs">
                        {q.number}
                      </span>
                      {q.title}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 ml-7">{q.detail}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-7 sm:ml-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(q.key, false)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                        !answers[q.key]
                          ? 'bg-teal-50 border-[#0d9488] text-[#0d9488] font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ไม่ใช่
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle(q.key, true)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                        answers[q.key]
                          ? 'bg-amber-500 border-amber-600 text-white font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ใช่
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group 2: Emotion & Feeling */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="px-4 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-sm text-[#0f2b48]">
                2. ปัญหาด้านอารมณ์และความรู้สึก (ซึมเศร้า/วิตกกังวล)
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  currentResults.emotionalPositive
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {currentResults.emotionalPositive ? 'เกณฑ์บวก (ตอบใช่ ≥ 1 ข้อ)' : 'ปกติ'}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {QUESTIONS_9S.filter((q) => q.group === 'emotion').map((q) => (
                <div key={q.key} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                  <div>
                    <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#0f2b48] text-white flex items-center justify-center text-xs">
                        {q.number}
                      </span>
                      {q.title}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 ml-7">{q.detail}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-7 sm:ml-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(q.key, false)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                        !answers[q.key]
                          ? 'bg-teal-50 border-[#0d9488] text-[#0d9488] font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ไม่ใช่
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle(q.key, true)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                        answers[q.key]
                          ? 'bg-amber-500 border-amber-600 text-white font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ใช่
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group 3: Social & Bullying */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="px-4 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-sm text-[#0f2b48]">
                3. ปัญหาด้านสัมพันธภาพและการกลั่นแกล้งรังแก
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  currentResults.socialPositive
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {currentResults.socialPositive ? 'เกณฑ์บวก (ใช่ ≥ 2 ข้อ หรือ ไม่มีเพื่อนสนิท)' : 'ปกติ'}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {QUESTIONS_9S.filter((q) => q.group === 'social').map((q) => (
                <div key={q.key} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                  <div>
                    <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#0f2b48] text-white flex items-center justify-center text-xs">
                        {q.number}
                      </span>
                      {q.title}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 ml-7">{q.detail}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-7 sm:ml-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(q.key, false)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                        !answers[q.key]
                          ? 'bg-teal-50 border-[#0d9488] text-[#0d9488] font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ไม่ใช่
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle(q.key, true)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                        answers[q.key]
                          ? 'bg-amber-500 border-amber-600 text-white font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ใช่
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Summary Box */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              currentResults.overallPositive
                ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                : 'bg-teal-50/80 border-teal-200 text-teal-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {currentResults.overallPositive ? (
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  สรุปผลการคัดกรอง 9S:{' '}
                  {currentResults.overallPositive ? (
                    <span className="text-amber-700 underline underline-offset-2">
                      พบสัญญาณความเสี่ยง (ผลบวกอย่างน้อย 1 ด้าน)
                    </span>
                  ) : (
                    <span className="text-teal-700">สุขภาวะเบื้องต้นปกติ</span>
                  )}
                </h4>
                <p className="text-xs mt-1 text-slate-700">{currentResults.recommendation}</p>
              </div>
            </div>

            {currentResults.overallPositive && onProceedToSDQ && (
              <button
                type="button"
                onClick={handleSaveAndGoSDQ}
                className="px-4 py-2 bg-[#0f2b48] hover:bg-[#163a61] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 shrink-0 transition cursor-pointer"
              >
                <span>บันทึกและประเมิน SDQ ต่อทันที</span>
                <ArrowRight className="w-4 h-4 text-teal-300" />
              </button>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              บันทึกข้อสังเกตเพิ่มเติมของครู
            </label>
            <textarea
              rows={2}
              placeholder="ระบุพฤติกรรมเฉพาะ หรือสิ่งที่สังเกตพบเพิ่มเติม..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            ระบบคัดกรอง 9S โรงเรียนวัดใหม่อมตรส
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
              onClick={handleSave}
              className="px-5 py-2 text-sm font-medium text-white bg-[#0d9488] hover:bg-[#0f766e] rounded-lg shadow-sm flex items-center gap-2 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกผลการคัดกรอง 9S</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
