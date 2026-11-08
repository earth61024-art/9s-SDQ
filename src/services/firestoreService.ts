import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { auth } from './firebaseAuth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Student, Assessment9S, AssessmentSDQ, AcademicSemester } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/* CRITICAL: The app will break without this line */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate Connection to Firestore on initial boot
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // If permission denied or doc not found, the connection to server succeeded
    return true;
  }
}

// Auto-run connection test
testConnection().catch(() => {});

/**
 * Helper to build period path: /periods/{periodKey}
 */
export function getPeriodKey(year: string, semester: AcademicSemester): string {
  return `${year}_${semester}`;
}

/**
 * Register or update teacher profile
 */
export async function saveUserProfile(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
}) {
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userDocRef);
    if (!existing.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role: user.email === 'earth61024@gmail.com' ? 'admin' : 'teacher',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save / update Academic Period document
 */
export async function saveAcademicPeriod(
  year: string,
  semester: AcademicSemester,
  studentCount: number = 0
) {
  const periodKey = getPeriodKey(year, semester);
  const path = `periods/${periodKey}`;
  try {
    const periodRef = doc(db, 'periods', periodKey);
    await setDoc(
      periodRef,
      {
        periodKey,
        academicYear: year,
        semester,
        studentCount,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.uid || 'system',
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save single student to Firestore
 */
export async function saveStudentToFirestore(
  student: Student,
  year: string,
  semester: AcademicSemester
) {
  const periodKey = getPeriodKey(year, semester);
  const path = `periods/${periodKey}/students/${student.id}`;
  try {
    const studentRef = doc(db, 'periods', periodKey, 'students', student.id);
    await setDoc(studentRef, {
      id: student.id,
      periodKey,
      studentCode: student.studentCode,
      nationalId: student.nationalId || '',
      orderNo: student.orderNo ?? 0,
      name: student.name,
      classroom: student.classroom,
      birthdate: student.birthdate || '',
      gender: student.gender || 'ชาย',
      academicYear: year,
      semester,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.uid || 'user',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save multiple students in batch to Firestore
 */
export async function batchSaveStudentsToFirestore(
  students: Student[],
  year: string,
  semester: AcademicSemester
) {
  if (students.length === 0) return;
  const periodKey = getPeriodKey(year, semester);
  const path = `periods/${periodKey}/students`;

  try {
    await saveAcademicPeriod(year, semester, students.length);

    // Firestore batch has a 500 operation limit
    const chunkSize = 400;
    for (let i = 0; i < students.length; i += chunkSize) {
      const chunk = students.slice(i, i + chunkSize);
      const batch = writeBatch(db);

      chunk.forEach((student) => {
        const studentRef = doc(db, 'periods', periodKey, 'students', student.id);
        batch.set(studentRef, {
          id: student.id,
          periodKey,
          studentCode: student.studentCode,
          nationalId: student.nationalId || '',
          orderNo: student.orderNo ?? 0,
          name: student.name,
          classroom: student.classroom,
          birthdate: student.birthdate || '',
          gender: student.gender || 'ชาย',
          academicYear: year,
          semester,
          updatedAt: new Date().toISOString(),
          updatedBy: auth.currentUser?.uid || 'user',
        });
      });

      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a student from Firestore
 */
export async function deleteStudentFromFirestore(
  studentId: string,
  year: string,
  semester: AcademicSemester
) {
  const periodKey = getPeriodKey(year, semester);
  const path = `periods/${periodKey}/students/${studentId}`;
  try {
    await deleteDoc(doc(db, 'periods', periodKey, 'students', studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save 9S Assessment
 */
export async function save9SToFirestore(
  assessment: Assessment9S,
  year: string,
  semester: AcademicSemester
) {
  const periodKey = getPeriodKey(year, semester);
  const path = `periods/${periodKey}/screenings_9s/${assessment.studentId}`;
  try {
    const docRef = doc(db, 'periods', periodKey, 'screenings_9s', assessment.studentId);
    await setDoc(docRef, {
      studentId: assessment.studentId,
      periodKey,
      academicYear: year,
      semester,
      answers: assessment.answers,
      behavioralPositive: assessment.behavioralPositive,
      emotionalPositive: assessment.emotionalPositive,
      socialPositive: assessment.socialPositive,
      overallPositive: assessment.overallPositive,
      assessmentDate: assessment.assessmentDate,
      assessmentTime: assessment.assessmentTime,
      assessorName: assessment.assessorName || 'ครูประจำชั้น',
      notes: assessment.notes || '',
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.uid || 'user',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save SDQ Assessment
 */
export async function saveSDQToFirestore(
  assessment: AssessmentSDQ,
  year: string,
  semester: AcademicSemester
) {
  const periodKey = getPeriodKey(year, semester);
  const path = `periods/${periodKey}/assessments_sdq/${assessment.studentId}`;
  try {
    const docRef = doc(db, 'periods', periodKey, 'assessments_sdq', assessment.studentId);
    await setDoc(docRef, {
      studentId: assessment.studentId,
      periodKey,
      academicYear: year,
      semester,
      assessorType: assessment.assessorType,
      answers: assessment.answers,
      emotionalScore: assessment.emotionalScore,
      conductScore: assessment.conductScore,
      hyperactivityScore: assessment.hyperactivityScore,
      peerScore: assessment.peerScore,
      prosocialScore: assessment.prosocialScore,
      totalDifficulties: assessment.totalDifficulties,
      totalStatus: assessment.totalStatus,
      prosocialStatus: assessment.prosocialStatus,
      assessmentDate: assessment.assessmentDate,
      assessmentTime: assessment.assessmentTime || '',
      assessorName: assessment.assessorName || 'ครูประจำชั้น',
      impact: assessment.impact || {},
      impactTotalScore: assessment.impactTotalScore ?? 0,
      impactStatus: assessment.impactStatus || 'normal',
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.uid || 'user',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Load all students for a period
 */
export async function fetchStudentsFromFirestore(
  year: string,
  semester: AcademicSemester
): Promise<Student[]> {
  const periodKey = getPeriodKey(year, semester);
  const path = `periods/${periodKey}/students`;
  try {
    const colRef = collection(db, 'periods', periodKey, 'students');
    const snapshot = await getDocs(colRef);
    const students: Student[] = [];
    snapshot.forEach((docSnap) => {
      students.push(docSnap.data() as Student);
    });
    return students;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Load all 9S screenings for a period
 */
export async function fetch9SFromFirestore(
  year: string,
  semester: AcademicSemester
): Promise<Record<string, Assessment9S>> {
  const periodKey = getPeriodKey(year, semester);
  const path = `periods/${periodKey}/screenings_9s`;
  try {
    const colRef = collection(db, 'periods', periodKey, 'screenings_9s');
    const snapshot = await getDocs(colRef);
    const result: Record<string, Assessment9S> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Assessment9S;
      result[data.studentId] = data;
    });
    return result;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Load all SDQ assessments for a period
 */
export async function fetchSDQFromFirestore(
  year: string,
  semester: AcademicSemester
): Promise<Record<string, AssessmentSDQ>> {
  const periodKey = getPeriodKey(year, semester);
  const path = `periods/${periodKey}/assessments_sdq`;
  try {
    const colRef = collection(db, 'periods', periodKey, 'assessments_sdq');
    const snapshot = await getDocs(colRef);
    const result: Record<string, AssessmentSDQ> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as AssessmentSDQ;
      result[data.studentId] = data;
    });
    return result;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Real-time period subscription
 */
export function subscribeToPeriodData(
  year: string,
  semester: AcademicSemester,
  callbacks: {
    onStudents: (students: Student[]) => void;
    on9S: (screenings: Record<string, Assessment9S>) => void;
    onSDQ: (assessments: Record<string, AssessmentSDQ>) => void;
  }
): () => void {
  const periodKey = getPeriodKey(year, semester);
  const studentsPath = `periods/${periodKey}/students`;
  const path9S = `periods/${periodKey}/screenings_9s`;
  const pathSDQ = `periods/${periodKey}/assessments_sdq`;

  const unsubStudents: Unsubscribe = onSnapshot(
    collection(db, 'periods', periodKey, 'students'),
    (snapshot) => {
      const list: Student[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Student);
      });
      callbacks.onStudents(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, studentsPath);
    }
  );

  const unsub9S: Unsubscribe = onSnapshot(
    collection(db, 'periods', periodKey, 'screenings_9s'),
    (snapshot) => {
      const map: Record<string, Assessment9S> = {};
      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as Assessment9S;
        map[item.studentId] = item;
      });
      callbacks.on9S(map);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path9S);
    }
  );

  const unsubSDQ: Unsubscribe = onSnapshot(
    collection(db, 'periods', periodKey, 'assessments_sdq'),
    (snapshot) => {
      const map: Record<string, AssessmentSDQ> = {};
      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as AssessmentSDQ;
        map[item.studentId] = item;
      });
      callbacks.onSDQ(map);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, pathSDQ);
    }
  );

  return () => {
    unsubStudents();
    unsub9S();
    unsubSDQ();
  };
}
