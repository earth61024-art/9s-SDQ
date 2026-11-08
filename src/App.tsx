import React, { useState, useEffect } from 'react';
import {
  Student,
  Assessment9S,
  AssessmentSDQ,
  ClassroomGrade,
  AcademicSemester,
} from './types';
import { INITIAL_STUDENTS_2569 } from './data/initialStudents';
import { initAuth, googleSignIn, logout } from './services/firebaseAuth';
import { User } from 'firebase/auth';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ClassroomView } from './components/ClassroomView';
import { ReportsView } from './components/ReportsView';
import { StudentModal } from './components/StudentModal';
import { Screening9SModal } from './components/Screening9SModal';
import { SDQModal } from './components/SDQModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PrintView, PrintMode } from './components/PrintView';
import { ImportStudentsModal } from './components/ImportStudentsModal';
import {
  saveUserProfile,
  saveStudentToFirestore,
  batchSaveStudentsToFirestore,
  deleteStudentFromFirestore,
  save9SToFirestore,
  saveSDQToFirestore,
  subscribeToPeriodData,
} from './services/firestoreService';

export default function App() {
  // Academic Year State (defaults to 2569 as requested)
  const [academicYear, setAcademicYear] = useState<string>(() => {
    return localStorage.getItem('wma_current_academic_year') || '2569';
  });

  // Academic Semester State (defaults to '1', supports '1' or '2')
  const [semester, setSemester] = useState<AcademicSemester>(() => {
    const saved = localStorage.getItem('wma_current_semester');
    return saved === '2' ? '2' : '1';
  });

  const [availableYears, setAvailableYears] = useState<string[]>(() => {
    const saved = localStorage.getItem('wma_available_academic_years');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return ['2568', '2569', '2570'];
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Selected Classroom filter
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomGrade | 'all'>('all');

  // Helper function for composite period key
  const getPeriodKey = (year: string, sem: AcademicSemester) => `${year}_${sem}`;
  const currentPeriodKey = getPeriodKey(academicYear, semester);

  // Students Database: keyed by period `${academicYear}_${semester}`
  const [allStudentsByPeriod, setAllStudentsByPeriod] = useState<Record<string, Student[]>>(() => {
    const savedPeriod = localStorage.getItem('wma_students_by_period');
    if (savedPeriod) {
      try {
        return JSON.parse(savedPeriod);
      } catch (e) {
        console.error(e);
      }
    }

    // Migration from old year-only storage or fallback to INITIAL_STUDENTS_2569
    const oldYearSaved = localStorage.getItem('wma_students_by_year');
    let base2569 = INITIAL_STUDENTS_2569;
    if (oldYearSaved) {
      try {
        const parsed = JSON.parse(oldYearSaved);
        if (parsed['2569'] && parsed['2569'].length > 0) {
          base2569 = parsed['2569'];
        }
      } catch (e) {
        console.error(e);
      }
    }

    const initial2569Term1: Student[] = base2569.map((s) => ({
      ...s,
      academicYear: '2569',
      semester: '1',
    }));

    return {
      '2569_1': initial2569Term1,
    };
  });

  // Current active students list
  const currentStudents = allStudentsByPeriod[currentPeriodKey] || [];

  // Assessments 9S State (Key: periodKey -> studentId -> Assessment9S)
  const [screenings9SByPeriod, setScreenings9SByPeriod] = useState<
    Record<string, Record<string, Assessment9S>>
  >(() => {
    const saved = localStorage.getItem('wma_screenings_9s_by_period');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    // Check old year storage
    const oldYear = localStorage.getItem('wma_screenings_9s_by_year');
    if (oldYear) {
      try {
        const parsed = JSON.parse(oldYear);
        if (parsed['2569']) {
          return { '2569_1': parsed['2569'] };
        }
      } catch (e) {
        console.error(e);
      }
    }

    return {};
  });

  const current9SScreenings = screenings9SByPeriod[currentPeriodKey] || {};

  // Assessments SDQ State (Key: periodKey -> studentId -> AssessmentSDQ)
  const [assessmentsSDQByPeriod, setAssessmentsSDQByPeriod] = useState<
    Record<string, Record<string, AssessmentSDQ>>
  >(() => {
    const saved = localStorage.getItem('wma_assessments_sdq_by_period');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    // Check old year storage
    const oldYear = localStorage.getItem('wma_assessments_sdq_by_year');
    if (oldYear) {
      try {
        const parsed = JSON.parse(oldYear);
        if (parsed['2569']) {
          return { '2569_1': parsed['2569'] };
        }
      } catch (e) {
        console.error(e);
      }
    }

    return {};
  });

  const currentSDQAssessments = assessmentsSDQByPeriod[currentPeriodKey] || {};

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Modals State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [is9SModalOpen, setIs9SModalOpen] = useState(false);
  const [activeStudent9S, setActiveStudent9S] = useState<Student | null>(null);

  const [isSDQModalOpen, setIsSDQModalOpen] = useState(false);
  const [activeStudentSDQ, setActiveStudentSDQ] = useState<Student | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'primary' | 'danger' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'primary',
    onConfirm: () => {},
  });

  // Print Preview Modal State
  const [printState, setPrintState] = useState<{
    isOpen: boolean;
    mode: PrintMode;
    student?: Student | null;
    assessment9S?: Assessment9S | null;
    assessmentSDQ?: AssessmentSDQ | null;
    classroom?: ClassroomGrade;
    academicYear?: string;
    semester?: AcademicSemester;
  }>({
    isOpen: false,
    mode: '9s_individual',
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('wma_current_academic_year', academicYear);
  }, [academicYear]);

  useEffect(() => {
    localStorage.setItem('wma_current_semester', semester);
  }, [semester]);

  useEffect(() => {
    localStorage.setItem('wma_available_academic_years', JSON.stringify(availableYears));
  }, [availableYears]);

  useEffect(() => {
    localStorage.setItem('wma_students_by_period', JSON.stringify(allStudentsByPeriod));
  }, [allStudentsByPeriod]);

  useEffect(() => {
    localStorage.setItem('wma_screenings_9s_by_period', JSON.stringify(screenings9SByPeriod));
  }, [screenings9SByPeriod]);

  useEffect(() => {
    localStorage.setItem('wma_assessments_sdq_by_period', JSON.stringify(assessmentsSDQByPeriod));
  }, [assessmentsSDQByPeriod]);

  // Auth Initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Realtime Firestore synchronization for current period
  useEffect(() => {
    if (!currentUser) return;

    // Save profile on sign in
    saveUserProfile({
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
    }).catch(console.error);

    // Subscribe to current period data in Firestore
    const unsub = subscribeToPeriodData(academicYear, semester, {
      onStudents: (remoteStudents) => {
        if (remoteStudents && remoteStudents.length > 0) {
          setAllStudentsByPeriod((prev) => ({
            ...prev,
            [currentPeriodKey]: remoteStudents,
          }));
        } else if (currentPeriodKey === '2569_1' && currentStudents.length > 0) {
          // If Firestore is empty for 2569_1, seed it with the base students
          batchSaveStudentsToFirestore(currentStudents, academicYear, semester).catch(console.error);
        }
      },
      on9S: (remote9S) => {
        if (remote9S && Object.keys(remote9S).length > 0) {
          setScreenings9SByPeriod((prev) => ({
            ...prev,
            [currentPeriodKey]: remote9S,
          }));
        }
      },
      onSDQ: (remoteSDQ) => {
        if (remoteSDQ && Object.keys(remoteSDQ).length > 0) {
          setAssessmentsSDQByPeriod((prev) => ({
            ...prev,
            [currentPeriodKey]: remoteSDQ,
          }));
        }
      },
    });

    return () => {
      unsub();
    };
  }, [currentUser, academicYear, semester, currentPeriodKey]);

  const handleSignInGoogle = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
      }
    } catch (err: any) {
      console.error('Sign in error', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOutGoogle = async () => {
    await logout();
    setCurrentUser(null);
  };

  const handleAddYear = (newYear: string) => {
    if (!availableYears.includes(newYear)) {
      setAvailableYears((prev) => [...prev, newYear].sort());
      setAllStudentsByPeriod((prev) => ({
        ...prev,
        [getPeriodKey(newYear, '1')]: prev[getPeriodKey(newYear, '1')] || [],
        [getPeriodKey(newYear, '2')]: prev[getPeriodKey(newYear, '2')] || [],
      }));
    }
  };

  // Student CRUD
  const handleSaveStudent = (savedStudent: Student) => {
    const targetPeriod = getPeriodKey(
      savedStudent.academicYear || academicYear,
      savedStudent.semester || semester
    );

    setAllStudentsByPeriod((prev) => {
      const currentList = prev[targetPeriod] || [];
      const existsIndex = currentList.findIndex((s) => s.id === savedStudent.id);

      let updatedList: Student[];
      if (existsIndex >= 0) {
        updatedList = [...currentList];
        updatedList[existsIndex] = savedStudent;
      } else {
        updatedList = [...currentList, savedStudent];
      }

      // Sort by classroom and orderNo
      updatedList.sort((a, b) => {
        if (a.classroom !== b.classroom) return a.classroom.localeCompare(b.classroom);
        return (a.orderNo ?? 999) - (b.orderNo ?? 999);
      });

      return {
        ...prev,
        [targetPeriod]: updatedList,
      };
    });

    if (currentUser) {
      saveStudentToFirestore(
        savedStudent,
        savedStudent.academicYear || academicYear,
        savedStudent.semester || semester
      ).catch(console.error);
    }
  };

  const handleDeleteStudent = (student: Student) => {
    const studentPeriod = getPeriodKey(student.academicYear || academicYear, student.semester || semester);

    setConfirmationModal({
      isOpen: true,
      title: 'ยืนยันการลบรายชื่อนักเรียน?',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบรายชื่อ "${student.name}" (${student.classroom} เลขประจำตัว ${student.studentCode}) ออกจากปีการศึกษา ${academicYear} ภาคเรียนที่ ${semester}? ข้อมูลแบบประเมินในเทอมนี้จะถูกลบด้วย`,
      variant: 'danger',
      onConfirm: () => {
        setAllStudentsByPeriod((prev) => {
          const currentList = prev[studentPeriod] || [];
          return {
            ...prev,
            [studentPeriod]: currentList.filter((s) => s.id !== student.id),
          };
        });

        // Clean up assessments in this period
        setScreenings9SByPeriod((prev) => {
          const currentMap = { ...(prev[studentPeriod] || {}) };
          delete currentMap[student.id];
          return { ...prev, [studentPeriod]: currentMap };
        });

        setAssessmentsSDQByPeriod((prev) => {
          const currentMap = { ...(prev[studentPeriod] || {}) };
          delete currentMap[student.id];
          return { ...prev, [studentPeriod]: currentMap };
        });

        if (currentUser) {
          deleteStudentFromFirestore(
            student.id,
            student.academicYear || academicYear,
            student.semester || semester
          ).catch(console.error);
        }

        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Batch Import / Promotion Handler
  const handleImportComplete = (
    targetYear: string,
    targetSem: AcademicSemester,
    newStudents: Student[],
    mode: 'merge' | 'replace' | 'promote'
  ) => {
    // Ensure targetYear is in availableYears
    if (!availableYears.includes(targetYear)) {
      setAvailableYears((prev) => [...prev, targetYear].sort());
    }

    const targetKey = getPeriodKey(targetYear, targetSem);

    setAllStudentsByPeriod((prev) => {
      let finalStudents: Student[] = [];

      if (mode === 'replace' || mode === 'promote') {
        finalStudents = [...newStudents];
      } else {
        // Merge: existing students + new students (update if studentCode or nationalId matches)
        const existing = prev[targetKey] || [];
        const mergedMap = new Map<string, Student>();

        existing.forEach((s) => {
          mergedMap.set(s.studentCode || s.id, s);
        });

        newStudents.forEach((s) => {
          mergedMap.set(s.studentCode || s.id, s);
        });

        finalStudents = Array.from(mergedMap.values());
      }

      // Sort by classroom and order
      finalStudents.sort((a, b) => {
        if (a.classroom !== b.classroom) return a.classroom.localeCompare(b.classroom);
        return (a.orderNo ?? 999) - (b.orderNo ?? 999);
      });

      if (currentUser) {
        batchSaveStudentsToFirestore(finalStudents, targetYear, targetSem).catch(console.error);
      }

      return {
        ...prev,
        [targetKey]: finalStudents,
      };
    });

    // Auto switch active period to the imported target so the user immediately views it!
    setAcademicYear(targetYear);
    setSemester(targetSem);
    setActiveTab('students');
  };

  // 9S Assessment Handlers
  const handleSave9S = (assessment: Assessment9S) => {
    const period = getPeriodKey(assessment.academicYear || academicYear, assessment.semester || semester);
    setScreenings9SByPeriod((prev) => {
      const currentMap = prev[period] || {};
      return {
        ...prev,
        [period]: {
          ...currentMap,
          [assessment.studentId]: assessment,
        },
      };
    });

    if (currentUser) {
      save9SToFirestore(
        assessment,
        assessment.academicYear || academicYear,
        assessment.semester || semester
      ).catch(console.error);
    }
  };

  // SDQ Assessment Handlers
  const handleSaveSDQ = (assessment: AssessmentSDQ) => {
    const period = getPeriodKey(assessment.academicYear || academicYear, assessment.semester || semester);
    setAssessmentsSDQByPeriod((prev) => {
      const currentMap = prev[period] || {};
      return {
        ...prev,
        [period]: {
          ...currentMap,
          [assessment.studentId]: assessment,
        },
      };
    });

    if (currentUser) {
      saveSDQToFirestore(
        assessment,
        assessment.academicYear || academicYear,
        assessment.semester || semester
      ).catch(console.error);
    }
  };

  // Print Handlers
  const handlePrintIndividual9S = (student: Student, assessment: Assessment9S) => {
    setPrintState({
      isOpen: true,
      mode: '9s_individual',
      student,
      assessment9S: assessment,
      academicYear,
      semester,
    });
  };

  const handlePrintIndividualSDQ = (student: Student, assessment: AssessmentSDQ) => {
    setPrintState({
      isOpen: true,
      mode: 'sdq_individual',
      student,
      assessmentSDQ: assessment,
      academicYear,
      semester,
    });
  };

  const handlePrintClassroomSummary = (grade: ClassroomGrade) => {
    setPrintState({
      isOpen: true,
      mode: 'classroom_summary',
      classroom: grade,
      academicYear,
      semester,
      student: null,
    });
  };

  const handlePrintSchoolSummary = () => {
    setPrintState({
      isOpen: true,
      mode: 'school_summary',
      academicYear,
      semester,
      student: null,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        academicYear={academicYear}
        setAcademicYear={setAcademicYear}
        availableYears={availableYears}
        onAddYear={handleAddYear}
        semester={semester}
        setSemester={setSemester}
        currentUser={currentUser}
        onSignInWithGoogle={handleSignInGoogle}
        onSignOut={handleSignOutGoogle}
        isLoggingIn={isLoggingIn}
        onOpenImportModal={() => setIsImportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            academicYear={academicYear}
            semester={semester}
            students={currentStudents}
            screenings9S={current9SScreenings}
            assessmentsSDQ={currentSDQAssessments}
            onSelectClassroom={(cls) => {
              setSelectedClassroom(cls);
              setActiveTab('9s');
            }}
            onOpen9S={(student) => {
              setActiveStudent9S(student);
              setIs9SModalOpen(true);
            }}
            onOpenSDQ={(student) => {
              setActiveStudentSDQ(student);
              setIsSDQModalOpen(true);
            }}
            onPrintSchoolSummary={handlePrintSchoolSummary}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        )}

        {(activeTab === '9s' || activeTab === 'sdq' || activeTab === 'students') && (
          <ClassroomView
            viewType={activeTab}
            academicYear={academicYear}
            semester={semester}
            students={currentStudents}
            screenings9S={current9SScreenings}
            assessmentsSDQ={currentSDQAssessments}
            selectedClassroom={selectedClassroom}
            setSelectedClassroom={setSelectedClassroom}
            onOpen9SModal={(student) => {
              setActiveStudent9S(student);
              setIs9SModalOpen(true);
            }}
            onOpenSDQModal={(student) => {
              setActiveStudentSDQ(student);
              setIsSDQModalOpen(true);
            }}
            onOpenStudentModal={(student) => {
              setEditingStudent(student || null);
              setIsStudentModalOpen(true);
            }}
            onDeleteStudent={handleDeleteStudent}
            onPrint9S={handlePrintIndividual9S}
            onPrintSDQ={handlePrintIndividualSDQ}
            onPrintClassroomSummary={handlePrintClassroomSummary}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            academicYear={academicYear}
            semester={semester}
            students={currentStudents}
            screenings9S={current9SScreenings}
            assessmentsSDQ={currentSDQAssessments}
            currentUser={currentUser}
            onSignInWithGoogle={handleSignInGoogle}
            onPrintClassroom={handlePrintClassroomSummary}
            onPrintSchoolSummary={handlePrintSchoolSummary}
            onConfirmModal={(opts) => {
              setConfirmationModal({
                isOpen: true,
                title: opts.title,
                message: opts.message,
                variant: opts.variant || 'primary',
                onConfirm: () => {
                  opts.onConfirm();
                  setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
                },
              });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-700">WMA CARE</span> — ระบบดูแลสุขภาวะและพัฒนาการนักเรียน โรงเรียนวัดใหม่อมตรส (School Health HERO & SDQ)
          </div>
          <div>
            ปีการศึกษา {academicYear} (ภาคเรียนที่ {semester}) • พร้อมใช้งาน Google Workspace
          </div>
        </div>
      </footer>

      {/* Student Add/Edit Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        student={editingStudent}
        defaultClassroom={selectedClassroom === 'all' ? 'ป.1' : selectedClassroom}
        currentAcademicYear={academicYear}
        currentSemester={semester}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
      />

      {/* Import / Promote Students Modal */}
      <ImportStudentsModal
        isOpen={isImportModalOpen}
        currentAcademicYear={academicYear}
        currentSemester={semester}
        availableYears={availableYears}
        existingStudentsCurrentPeriod={currentStudents}
        allStudentsByPeriod={allStudentsByPeriod}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />

      {/* 9S Screening Modal */}
      <Screening9SModal
        isOpen={is9SModalOpen}
        student={activeStudent9S}
        assessment={activeStudent9S ? current9SScreenings[activeStudent9S.id] : null}
        currentAcademicYear={academicYear}
        currentSemester={semester}
        onClose={() => {
          setIs9SModalOpen(false);
          setActiveStudent9S(null);
        }}
        onSave={handleSave9S}
        onProceedToSDQ={(student) => {
          setIs9SModalOpen(false);
          setActiveStudent9S(null);
          setActiveStudentSDQ(student);
          setIsSDQModalOpen(true);
        }}
        onPrint={handlePrintIndividual9S}
      />

      {/* SDQ Assessment Modal */}
      <SDQModal
        isOpen={isSDQModalOpen}
        student={activeStudentSDQ}
        assessment={activeStudentSDQ ? currentSDQAssessments[activeStudentSDQ.id] : null}
        currentAcademicYear={academicYear}
        currentSemester={semester}
        onClose={() => {
          setIsSDQModalOpen(false);
          setActiveStudentSDQ(null);
        }}
        onSave={handleSaveSDQ}
        onPrint={handlePrintIndividualSDQ}
      />

      {/* Print View Preview Modal */}
      {printState.isOpen && (
        <PrintView
          mode={printState.mode}
          student={printState.student}
          assessment9S={printState.assessment9S}
          assessmentSDQ={printState.assessmentSDQ}
          classroom={printState.classroom}
          academicYear={printState.academicYear || academicYear}
          semester={printState.semester || semester}
          students={
            printState.classroom
              ? currentStudents.filter((s) => s.classroom === printState.classroom)
              : currentStudents
          }
          all9S={current9SScreenings}
          allSDQ={currentSDQAssessments}
          onClose={() => setPrintState((prev) => ({ ...prev, isOpen: false }))}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        variant={confirmationModal.variant}
        onConfirm={confirmationModal.onConfirm}
        onCancel={() => setConfirmationModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
