import { Student, Assessment9S, AssessmentSDQ, AcademicSemester } from '../types';
import { getAccessToken } from './firebaseAuth';
import { formatToThaiDate } from '../utils/thaiDate';

export interface ExportResult {
  success: boolean;
  fileId?: string;
  spreadsheetUrl?: string;
  webViewLink?: string;
  error?: string;
}

export async function exportToGoogleSheets(
  academicYear: string,
  semester: AcademicSemester,
  students: Student[],
  screenings9S: Record<string, Assessment9S>,
  assessmentsSDQ: Record<string, AssessmentSDQ>
): Promise<ExportResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google ก่อนส่งออกข้อมูล');
  }

  // 1. Create Spreadsheet
  const title = `WMA CARE - สรุปผลคัดกรอง 9S & SDQ ปีการศึกษา ${academicYear} ภาคเรียนที่ ${semester} (โรงเรียนวัดใหม่อมตรส)`;
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        { properties: { title: 'ภาพรวมรายชื่อนักเรียน' } },
        { properties: { title: 'ผลการคัดกรอง 9S (HERO)' } },
        { properties: { title: 'ผลการประเมิน SDQ' } },
      ],
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json();
    throw new Error(errData?.error?.message || 'ไม่สามารถสร้าง Google Sheets ได้');
  }

  const createdSheet = await createRes.json();
  const spreadsheetId = createdSheet.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare Data for Sheet 1: Roster
  const rosterRows: any[][] = [
    [
      'โรงเรียนวัดใหม่อมตรส - ระบบ WMA CARE',
      '',
      '',
      '',
      '',
      `ปีการศึกษา ${academicYear}`,
    ],
    ['เลขที่', 'ชั้นเรียน', 'เลขประจำตัว', 'เลขประจำตัวประชาชน', 'ชื่อ - สกุล', 'วันเกิด'],
  ];

  students.forEach((s) => {
    rosterRows.push([
      s.orderNo ?? '-',
      s.classroom,
      s.studentCode,
      s.nationalId,
      s.name,
      s.birthdate,
    ]);
  });

  // 3. Prepare Data for Sheet 2: 9S Screening
  const screeningRows: any[][] = [
    [
      'แบบคัดกรอง 9S (School Health HERO) - โรงเรียนวัดใหม่อมตรส',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      `ปีการศึกษา ${academicYear}`,
    ],
    [
      'เลขที่',
      'ชั้น',
      'เลขประจำตัว',
      'ชื่อ - สกุล',
      'วันที่คัดกรอง',
      'พฤติกรรมสมาธิสั้น (3 ข้อแรก)',
      'อารมณ์ซึมเศร้าวิตกกังวล (3 ข้อกลาง)',
      'การรังแกและการเข้าสังคม (3 ข้อหลัง)',
      'สรุปผล 9S',
      'ข้อเสนอแนะ',
    ],
  ];

  students.forEach((s) => {
    const sc = screenings9S[s.id];
    if (sc) {
      screeningRows.push([
        s.orderNo ?? '-',
        s.classroom,
        s.studentCode,
        s.name,
        formatToThaiDate(sc.assessmentDate, sc.assessmentTime),
        sc.behavioralPositive ? 'ผลบวก (เสี่ยง)' : 'ปกติ',
        sc.emotionalPositive ? 'ผลบวก (เสี่ยง)' : 'ปกติ',
        sc.socialPositive ? 'ผลบวก (เสี่ยง)' : 'ปกติ',
        sc.overallPositive ? 'พบความเสี่ยง' : 'ปกติ',
        sc.recommendation,
      ]);
    } else {
      screeningRows.push([
        s.orderNo ?? '-',
        s.classroom,
        s.studentCode,
        s.name,
        'ยังไม่ได้รับการประเมิน',
        '-',
        '-',
        '-',
        '-',
        '-',
      ]);
    }
  });

  // 4. Prepare Data for Sheet 3: SDQ Assessment
  const sdqRows: any[][] = [
    [
      'แบบประเมินพฤติกรรมนักเรียน SDQ - โรงเรียนวัดใหม่อมตรส',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      `ปีการศึกษา ${academicYear}`,
    ],
    [
      'เลขที่',
      'ชั้น',
      'เลขประจำตัว',
      'ชื่อ - สกุล',
      'ผู้ประเมิน',
      'วันที่ประเมิน',
      'ด้านอารมณ์',
      'ด้านความประพฤติ',
      'ด้านสมาธิสั้น',
      'ด้านเพื่อน',
      'รวม 4 ด้าน (ปัญหา)',
      'ด้านสัมพันธภาพสังคม (จุดแข็ง)',
      'ผลกระทบ (ด้านหลัง)',
    ],
  ];

  const statusLabel = (st: string) => {
    if (st === 'normal') return 'ปกติ';
    if (st === 'risk') return 'เสี่ยง';
    if (st === 'problem') return 'มีปัญหา';
    if (st === 'strength') return 'มีจุดแข็ง';
    if (st === 'no_strength') return 'ไม่มีจุดแข็ง';
    return st || '-';
  };

  students.forEach((s) => {
    const sdq = assessmentsSDQ[s.id];
    if (sdq) {
      const assessorText =
        sdq.assessorType === 'student'
          ? 'นักเรียนประเมินตนเอง'
          : sdq.assessorType === 'teacher'
          ? `ครู (${sdq.assessorName || 'ครูที่ปรึกษา'})`
          : `ผู้ปกครอง (${sdq.assessorName || 'ผู้ปกครอง'})`;

      sdqRows.push([
        s.orderNo ?? '-',
        s.classroom,
        s.studentCode,
        s.name,
        assessorText,
        formatToThaiDate(sdq.assessmentDate, sdq.assessmentTime),
        `${sdq.emotionalScore} คะแนน (${statusLabel(sdq.emotionalStatus)})`,
        `${sdq.conductScore} คะแนน (${statusLabel(sdq.conductStatus)})`,
        `${sdq.hyperactivityScore} คะแนน (${statusLabel(sdq.hyperactivityStatus)})`,
        `${sdq.peerScore} คะแนน (${statusLabel(sdq.peerStatus)})`,
        `${sdq.totalDifficulties} คะแนน (${statusLabel(sdq.totalStatus)})`,
        `${sdq.prosocialScore} คะแนน (${statusLabel(sdq.prosocialStatus)})`,
        `${sdq.impactTotalScore} คะแนน (${statusLabel(sdq.impactStatus)})`,
      ]);
    } else {
      sdqRows.push([
        s.orderNo ?? '-',
        s.classroom,
        s.studentCode,
        s.name,
        'ยังไม่ประเมิน',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
      ]);
    }
  });

  // Batch update spreadsheet values
  const batchRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: 'ภาพรวมรายชื่อนักเรียน!A1',
            values: rosterRows,
          },
          {
            range: 'ผลการคัดกรอง 9S (HERO)!A1',
            values: screeningRows,
          },
          {
            range: 'ผลการประเมิน SDQ!A1',
            values: sdqRows,
          },
        ],
      }),
    }
  );

  if (!batchRes.ok) {
    const err = await batchRes.json();
    throw new Error(err?.error?.message || 'บันทึกข้อมูลลง Google Sheets ล้มเหลว');
  }

  return {
    success: true,
    fileId: spreadsheetId,
    spreadsheetUrl,
  };
}

export async function saveSummaryReportToDrive(
  academicYear: string,
  semester: AcademicSemester,
  reportTitle: string,
  reportTextContent: string
): Promise<ExportResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google ก่อนส่งออกไฟล์');
  }

  const fileName = `${reportTitle}_ปีการศึกษา_${academicYear}_ภาคเรียนที่_${semester}.txt`;
  const metadata = {
    name: fileName,
    mimeType: 'text/plain',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', new Blob([reportTextContent], { type: 'text/plain;charset=utf-8' }));

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || 'บันทึกรายงานลง Google Drive ล้มเหลว');
  }

  const driveFile = await res.json();
  return {
    success: true,
    fileId: driveFile.id,
    webViewLink: driveFile.webViewLink,
  };
}
