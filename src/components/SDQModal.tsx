import React, { useState, useEffect } from 'react';
import {
  Student,
  AssessmentSDQ,
  SDQAnswers,
  SDQImpactAnswers,
  SDQAssessorType,
  AcademicSemester,
} from '../types';
import {
  SDQ_QUESTIONS,
  calculateSDQScores,
  getRawQuestionScore,
} from '../utils/assessmentScoring';
import { getTodayThaiDate, formatToThaiDate } from '../utils/thaiDate';
import { X, CheckCircle, AlertTriangle, Printer, Save, Calendar, Clock, UserCheck } from 'lucide-react';

interface SDQModalProps {
  isOpen: boolean;
  student: Student | null;
  assessment?: AssessmentSDQ | null;
  currentAcademicYear: string;
  currentSemester: AcademicSemester;
  onClose: () => void;
  onSave: (assessment: AssessmentSDQ) => void;
  onPrint?: (student: Student, assessment: AssessmentSDQ) => void;
}

export const SDQModal: React.FC<SDQModalProps> = ({
  isOpen,
  student,
  assessment,
  currentAcademicYear,
  currentSemester,
  onClose,
  onSave,
  onPrint,
}) => {
  const [assessorType, setAssessorType] = useState<SDQAssessorType>('teacher');
  const [assessorName, setAssessorName] = useState('ครูประจำชั้น');
  const [assessmentDate, setAssessmentDate] = useState('');
  const [assessmentTime, setAssessmentTime] = useState('');
  const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');

  // Answers 1-25 (default 0)
  const [answers, setAnswers] = useState<SDQAnswers>(() => {
    const initial: SDQAnswers = {};
    for (let i = 1; i <= 25; i++) {
      initial[i] = 0;
    }
    return initial;
  });

  // Impact Supplement (ด้านหลัง)
  const [impact, setImpact] = useState<SDQImpactAnswers>({
    hasProblem: 'no',
    duration: '<1month',
    distress: 0,
    impactHome: 0,
    impactPeers: 0,
    impactClassroom: 0,
    impactLeisure: 0,
    impactBurden: 0,
  });

  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (assessment) {
      setAssessorType(assessment.assessorType);
      setAssessorName(assessment.assessorName);
      setAssessmentDate(assessment.assessmentDate);
      setAssessmentTime(assessment.assessmentTime || '09:00');
      setAnswers(assessment.answers);
      setImpact(assessment.impact);
      setNotes(assessment.notes || '');
    } else {
      const today = getTodayThaiDate();
      setAssessorType('teacher');
      setAssessorName('ครูประจำชั้น');
      setAssessmentDate(today.dateString);
      setAssessmentTime(today.timeString);
      const initial: SDQAnswers = {};
      for (let i = 1; i <= 25; i++) {
        initial[i] = 0;
      }
      setAnswers(initial);
      setImpact({
        hasProblem: 'no',
        duration: '<1month',
        distress: 0,
        impactHome: 0,
        impactPeers: 0,
        impactClassroom: 0,
        impactLeisure: 0,
        impactBurden: 0,
      });
      setNotes('');
    }
  }, [assessment, student, isOpen]);

  if (!isOpen || !student) return null;

  const results = calculateSDQScores(answers, assessorType, impact);

  const handleScoreChange = (qNo: number, score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [qNo]: score,
    }));
  };

  const handleSave = () => {
    const updated: AssessmentSDQ = {
      id: assessment ? assessment.id : `sdq-${student.id}-${assessorType}-${currentSemester}-${Date.now()}`,
      studentId: student.id,
      academicYear: student.academicYear || currentAcademicYear,
      semester: student.semester || currentSemester,
      assessmentDate,
      assessmentTime,
      assessorType,
      assessorName: assessorName.trim() || 'ผู้ประเมิน',
      answers,
      impact,
      ...results,
      notes,
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
    onClose();
  };

  const getStatusBadge = (status: string) => {
    if (status === 'normal') {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          ปกติ
        </span>
      );
    }
    if (status === 'risk') {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
          เสี่ยง
        </span>
      );
    }
    if (status === 'problem') {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-300">
          มีปัญหา
        </span>
      );
    }
    if (status === 'strength') {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-teal-800 border border-teal-300">
          มีจุดแข็ง
        </span>
      );
    }
    if (status === 'no_strength') {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-300">
          ไม่มีจุดแข็ง
        </span>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0f2b48] text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                SDQ Assessment (จุดแข็งและจุดอ่อน)
              </span>
              <span className="text-xs text-slate-300">
                ปีการศึกษา {student.academicYear || currentAcademicYear} (ภาคเรียนที่ {student.semester || currentSemester})
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">
              แบบประเมินพฤติกรรมนักเรียน (SDQ)
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
                title="พิมพ์แบบประเมิน SDQ"
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              >
                <Printer className="w-4 h-4 text-teal-300" />
                <span className="hidden sm:inline">พิมพ์รายงาน SDQ</span>
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

        {/* Sub-header: Assessor selection & Tab switcher */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">ฉบับประเมิน:</span>
            <div className="inline-flex bg-white rounded-lg p-0.5 border border-slate-300">
              <button
                type="button"
                onClick={() => setAssessorType('teacher')}
                className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                  assessorType === 'teacher'
                    ? 'bg-[#0f2b48] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ฉบับครูประเมิน
              </button>
              <button
                type="button"
                onClick={() => setAssessorType('student')}
                className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                  assessorType === 'student'
                    ? 'bg-[#0f2b48] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ฉบับนักเรียนประเมินตนเอง
              </button>
              <button
                type="button"
                onClick={() => setAssessorType('parent')}
                className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                  assessorType === 'parent'
                    ? 'bg-[#0f2b48] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ฉบับผู้ปกครอง
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('front')}
              className={`px-3 py-1 rounded-lg font-semibold border transition cursor-pointer ${
                activeTab === 'front'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              ด้านหน้า (25 ข้อพฤติกรรม)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('back')}
              className={`px-3 py-1 rounded-lg font-semibold border transition cursor-pointer ${
                activeTab === 'back'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              ด้านหลัง (การส่งผลกระทบ)
            </button>
          </div>
        </div>

        {/* Date, Time, Assessor Inputs */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0d9488]" />
              วันที่ประเมิน
            </label>
            <input
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-[#0d9488] outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0d9488]" />
              เวลาประเมิน
            </label>
            <input
              type="time"
              value={assessmentTime}
              onChange={(e) => setAssessmentTime(e.target.value)}
              className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-[#0d9488] outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-[#0d9488]" />
              ชื่อผู้ประเมิน
            </label>
            <input
              type="text"
              placeholder="เช่น คุณครูวิไลภรณ์ / ผู้ปกครอง"
              value={assessorName}
              onChange={(e) => setAssessorName(e.target.value)}
              className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-[#0d9488] outline-none"
            />
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'front' ? (
            <>
              {/* Score Snapshot Bar */}
              <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500">1. อารมณ์</div>
                  <div className="text-base font-bold text-slate-800">{results.emotionalScore}</div>
                  <div className="mt-1">{getStatusBadge(results.emotionalStatus)}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500">2. ความประพฤติ</div>
                  <div className="text-base font-bold text-slate-800">{results.conductScore}</div>
                  <div className="mt-1">{getStatusBadge(results.conductStatus)}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500">3. สมาธิสั้น</div>
                  <div className="text-base font-bold text-slate-800">{results.hyperactivityScore}</div>
                  <div className="mt-1">{getStatusBadge(results.hyperactivityStatus)}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500">4. สัมพันธ์เพื่อน</div>
                  <div className="text-base font-bold text-slate-800">{results.peerScore}</div>
                  <div className="mt-1">{getStatusBadge(results.peerStatus)}</div>
                </div>
                <div className="bg-teal-50/70 p-2 rounded-lg border border-teal-200">
                  <div className="text-[11px] text-teal-800 font-semibold">รวม 4 ด้าน (ปัญหา)</div>
                  <div className="text-base font-bold text-teal-900">{results.totalDifficulties}/40</div>
                  <div className="mt-1">{getStatusBadge(results.totalStatus)}</div>
                </div>
                <div className="bg-amber-50/70 p-2 rounded-lg border border-amber-200">
                  <div className="text-[11px] text-amber-800 font-semibold">5. จุดแข็ง (สังคม)</div>
                  <div className="text-base font-bold text-amber-900">{results.prosocialScore}/10</div>
                  <div className="mt-1">{getStatusBadge(results.prosocialStatus)}</div>
                </div>
              </div>

              {/* Questions Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0f2b48] text-white">
                        <th className="py-2.5 px-3 w-12 text-center">ข้อ</th>
                        <th className="py-2.5 px-3">พฤติกรรมที่ประเมิน (ในช่วง 6 เดือนที่ผ่านมา)</th>
                        <th className="py-2.5 px-2 w-20 text-center">ไม่จริง (0)</th>
                        <th className="py-2.5 px-2 w-24 text-center">ค่อนข้างจริง (1)</th>
                        <th className="py-2.5 px-2 w-20 text-center">จริง (2)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {SDQ_QUESTIONS.map((q) => {
                        const val = answers[q.no] ?? 0;
                        const displayText =
                          assessorType === 'student' ? q.textStudent : q.textAdult;

                        return (
                          <tr key={q.no} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 font-semibold text-center text-slate-600">
                              {q.no}
                            </td>
                            <td className="py-2.5 px-3 text-slate-800">
                              <span className="font-medium">{displayText}</span>
                              {q.isReversed && (
                                <span className="ml-2 text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                                  ข้อความเชิงบวก
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <label className="inline-flex items-center justify-center w-full cursor-pointer py-1">
                                <input
                                  type="radio"
                                  name={`sdq_q_${q.no}`}
                                  checked={val === 0}
                                  onChange={() => handleScoreChange(q.no, 0)}
                                  className="w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                />
                              </label>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <label className="inline-flex items-center justify-center w-full cursor-pointer py-1">
                                <input
                                  type="radio"
                                  name={`sdq_q_${q.no}`}
                                  checked={val === 1}
                                  onChange={() => handleScoreChange(q.no, 1)}
                                  className="w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                />
                              </label>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <label className="inline-flex items-center justify-center w-full cursor-pointer py-1">
                                <input
                                  type="radio"
                                  name={`sdq_q_${q.no}`}
                                  checked={val === 2}
                                  onChange={() => handleScoreChange(q.no, 2)}
                                  className="w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                />
                              </label>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* Impact Supplement (ด้านหลัง) */
            <div className="space-y-6">
              <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl">
                <h4 className="font-bold text-sm text-teal-900 mb-1">
                  แบบประเมินผลกระทบของปัญหา (Impact Supplement ด้านหลัง)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ประเมินว่ามีความเรื้อรัง ส่งผลกระทบต่อบุคคลรอบตัวเด็ก มีผลต่อสัมพันธภาพทางสังคมและชีวิตประจำวันของเด็กหรือไม่
                </p>
              </div>

              {/* 1. มีปัญหาหรือไม่ */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
                <label className="block font-semibold text-sm text-slate-900 mb-2">
                  1. โดยรวมท่านคิดว่าเด็กมีปัญหาในด้านอารมณ์ สมาธิ พฤติกรรม หรือความสามารถเข้ากับผู้อื่นหรือไม่:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 'no', label: 'ไม่ (0)' },
                    { val: 'minor', label: 'ใช่ มีปัญหาเล็กน้อย' },
                    { val: 'definite', label: 'ใช่ มีปัญหาชัดเจน' },
                    { val: 'severe', label: 'ใช่ มีปัญหาอย่างมาก' },
                  ].map((opt) => (
                    <label
                      key={opt.val}
                      className={`p-3 rounded-lg border text-center cursor-pointer transition flex items-center justify-center gap-2 ${
                        impact.hasProblem === opt.val
                          ? 'bg-[#0f2b48] text-white border-[#0f2b48] font-bold'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="impact_hasProblem"
                        checked={impact.hasProblem === opt.val}
                        onChange={() =>
                          setImpact((prev) => ({
                            ...prev,
                            hasProblem: opt.val as any,
                          }))
                        }
                        className="hidden"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {impact.hasProblem === 'no' && (
                  <p className="mt-2 text-xs text-emerald-700 italic">
                    * เมื่อตอบว่า "ไม่" ไม่ต้องคิดคะแนนข้อต่อไป (ผลกระทบอยู่ในเกณฑ์ปกติ)
                  </p>
                )}
              </div>

              {impact.hasProblem !== 'no' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* 2. นานเท่าใด */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
                    <label className="block font-semibold text-sm text-slate-900 mb-2">
                      2. ปัญหานี้เกิดขึ้นมานานเท่าไหร่แล้ว:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        { val: '<1month', label: 'น้อยกว่า 1 เดือน' },
                        { val: '1-5months', label: '1 – 5 เดือน' },
                        { val: '6-12months', label: '6 – 12 เดือน' },
                        { val: '>1year', label: 'มากกว่า 1 ปี' },
                      ].map((opt) => (
                        <label
                          key={opt.val}
                          className={`p-2.5 rounded-lg border text-center cursor-pointer transition flex items-center justify-center ${
                            impact.duration === opt.val
                              ? 'bg-teal-700 text-white border-teal-700 font-semibold'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="impact_duration"
                            checked={impact.duration === opt.val}
                            onChange={() =>
                              setImpact((prev) => ({
                                ...prev,
                                duration: opt.val as any,
                              }))
                            }
                            className="hidden"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 3, 4, 5 Rating table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#0f2b48] text-white">
                          <th className="py-2.5 px-3">ข้อคำถามผลกระทบ</th>
                          <th className="py-2.5 px-2 w-20 text-center">ไม่เลย (0)</th>
                          <th className="py-2.5 px-2 w-20 text-center">เล็กน้อย (0)</th>
                          <th className="py-2.5 px-2 w-24 text-center">ค่อนข้างมาก (1)</th>
                          <th className="py-2.5 px-2 w-20 text-center">มาก (2)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {/* 3. รู้สึกไม่สบายใจ */}
                        <tr className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            3. ปัญหานี้ทำให้เด็กรู้สึกไม่สบายใจหรือไม่
                          </td>
                          {[0, 0, 1, 2].map((pts, idx) => (
                            <td key={idx} className="py-2 px-2 text-center">
                              <input
                                type="radio"
                                name="impact_distress"
                                checked={impact.distress === pts}
                                onChange={() =>
                                  setImpact((prev) => ({ ...prev, distress: pts }))
                                }
                                className="w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                              />
                            </td>
                          ))}
                        </tr>

                        {/* 4.1 ความเป็นอยู่ที่บ้าน */}
                        <tr className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            4.1 รบกวนความเป็นอยู่ที่บ้าน
                          </td>
                          {[0, 0, 1, 2].map((pts, idx) => (
                            <td key={idx} className="py-2 px-2 text-center">
                              <input
                                type="radio"
                                name="impact_home"
                                checked={impact.impactHome === pts}
                                onChange={() =>
                                  setImpact((prev) => ({ ...prev, impactHome: pts }))
                                }
                                className="w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                              />
                            </td>
                          ))}
                        </tr>

                        {/* 4.2 การคบเพื่อน */}
                        <tr className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            4.2 รบกวนการคบเพื่อน
                          </td>
                          {[0, 0, 1, 2].map((pts, idx) => (
                            <td key={idx} className="py-2 px-2 text-center">
                              <input
                                type="radio"
                                name="impact_peers"
                                checked={impact.impactPeers === pts}
                                onChange={() =>
                                  setImpact((prev) => ({ ...prev, impactPeers: pts }))
                                }
                                className="w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                              />
                            </td>
                          ))}
                        </tr>

                        {/* 4.3 การเรียนในห้องเรียน */}
                        <tr className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            4.3 รบกวนการเรียนในห้องเรียน
                          </td>
                          {[0, 0, 1, 2].map((pts, idx) => (
                            <td key={idx} className="py-2 px-2 text-center">
                              <input
                                type="radio"
                                name="impact_classroom"
                                checked={impact.impactClassroom === pts}
                                onChange={() =>
                                  setImpact((prev) => ({ ...prev, impactClassroom: pts }))
                                }
                                className="w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                              />
                            </td>
                          ))}
                        </tr>

                        {/* 4.4 กิจกรรมยามว่าง */}
                        <tr className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            4.4 รบกวนกิจกรรมยามว่าง
                          </td>
                          {[0, 0, 1, 2].map((pts, idx) => (
                            <td key={idx} className="py-2 px-2 text-center">
                              <input
                                type="radio"
                                name="impact_leisure"
                                checked={impact.impactLeisure === pts}
                                onChange={() =>
                                  setImpact((prev) => ({ ...prev, impactLeisure: pts }))
                                }
                                className="w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                              />
                            </td>
                          ))}
                        </tr>

                        {/* 5. ความยุ่งยากต่อคนรอบข้าง */}
                        <tr className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            5. ปัญหานี้ทำให้คนรอบข้างเกิดความยุ่งยากหรือไม่
                          </td>
                          {[0, 0, 1, 2].map((pts, idx) => (
                            <td key={idx} className="py-2 px-2 text-center">
                              <input
                                type="radio"
                                name="impact_burden"
                                checked={impact.impactBurden === pts}
                                onChange={() =>
                                  setImpact((prev) => ({ ...prev, impactBurden: pts }))
                                }
                                className="w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                              />
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Impact Score Result */}
                  <div className="p-4 bg-slate-100 rounded-xl flex items-center justify-between text-xs border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-700">คะแนนรวมแบบประเมินด้านหลัง: </span>
                      <span className="text-base font-bold text-[#0f2b48] ml-1">
                        {results.impactTotalScore} คะแนน
                      </span>
                      <span className="ml-2 text-slate-500">
                        (เกณฑ์: 0=ปกติ, 1-2=เสี่ยง, ≥3=มีปัญหา)
                      </span>
                    </div>
                    <div>{getStatusBadge(results.impactStatus)}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ข้อเสนอแนะ / แผนการดูแลช่วยเหลือนักเรียน
            </label>
            <textarea
              rows={2}
              placeholder="บันทึกแนวทางการให้คำปรึกษา หรือการประสานงานกับผู้ปกครอง..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            ระบบดูแลช่วยเหลือนักเรียน โรงเรียนวัดใหม่อมตรส
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
              <span>บันทึกผลการประเมิน SDQ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
