import {
  Answers9S,
  Assessment9S,
  SDQAnswers,
  SDQImpactAnswers,
  SDQAssessorType,
  SDQStatus,
  SDQProsocialStatus,
} from '../types';

// ==========================================
// 9S Screening Definitions & Calculation
// ==========================================

export interface Question9SDef {
  key: keyof Answers9S;
  number: number;
  group: 'behavior' | 'emotion' | 'social';
  groupName: string;
  title: string;
  detail: string;
}

export const QUESTIONS_9S: Question9SDef[] = [
  // 1. กลุ่มพฤติกรรมและความใส่ใจ
  {
    key: 'q1_hyperactive',
    number: 1,
    group: 'behavior',
    groupName: 'กลุ่มพฤติกรรมสมาธิสั้นและความใส่ใจ',
    title: 'ซนเกินไป',
    detail: 'เด็กมีการเคลื่อนไหวมากเกินไป ไม่อยู่นิ่ง วิ่งเล่นหรือปีนป่ายตลอดเวลา',
  },
  {
    key: 'q2_inattentive',
    number: 2,
    group: 'behavior',
    groupName: 'กลุ่มพฤติกรรมสมาธิสั้นและความใส่ใจ',
    title: 'ใจลอย',
    detail: 'เด็กขาดสมาธิ ไม่สามารถจดจ่ออยู่กับสิ่งใดสิ่งหนึ่งได้นาน วอกแวกง่าย',
  },
  {
    key: 'q3_impulsive',
    number: 3,
    group: 'behavior',
    groupName: 'กลุ่มพฤติกรรมสมาธิสั้นและความใส่ใจ',
    title: 'รอคอยไม่ได้',
    detail: 'เด็กมีความอดทนต่ำ ไม่สามารถรอคอยคิว ขัดจังหวะการสนทนาของผู้อื่น',
  },

  // 2. ปัญหาด้านอารมณ์และความรู้สึก
  {
    key: 'q4_stress',
    number: 4,
    group: 'emotion',
    groupName: 'กลุ่มอารมณ์ซึมเศร้าและวิตกกังวล',
    title: 'เครียด / หงุดหงิดง่าย',
    detail: 'เด็กมีอารมณ์แปรปรวน หงุดหงิดง่าย ฉุนเฉียว โมโหง่ายเกินกว่าเหตุ',
  },
  {
    key: 'q5_discouraged',
    number: 5,
    group: 'emotion',
    groupName: 'กลุ่มอารมณ์ซึมเศร้าและวิตกกังวล',
    title: 'ท้อแท้ เบื่อหน่าย',
    detail: 'เด็กรู้สึกหมดกำลังใจ ไม่มีความกระตือรือร้น เซื่องซึม ร้องไห้บ่อย',
  },
  {
    key: 'q6_schoolRefusal',
    number: 6,
    group: 'emotion',
    groupName: 'กลุ่มอารมณ์ซึมเศร้าและวิตกกังวล',
    title: 'ไม่อยากไปโรงเรียน',
    detail: 'เด็กมีความรู้สึกไม่อยากไปโรงเรียน บ่นปวดหัวปวดท้องบ่อยเมื่อต้องไปโรงเรียน',
  },

  // 3. ปัญหาด้านสัมพันธภาพและการกลั่นแกล้งรังแก
  {
    key: 'q7_bully',
    number: 7,
    group: 'social',
    groupName: 'กลุ่มการกลั่นแกล้งรังแกและปัญหาการเข้าสังคม',
    title: 'แกล้งเพื่อน',
    detail: 'เด็กมีพฤติกรรมแกล้งเพื่อน ข่มขู่ หรือล้อเลียนเพื่อนร่วมห้อง',
  },
  {
    key: 'q8_bullied',
    number: 8,
    group: 'social',
    groupName: 'กลุ่มการกลั่นแกล้งรังแกและปัญหาการเข้าสังคม',
    title: 'ถูกเพื่อนแกล้ง',
    detail: 'เด็กถูกเพื่อน ๆ กลั่นแกล้ง ล้อเลียน หรือรังแกเป็นประจำ',
  },
  {
    key: 'q9_noFriends',
    number: 9,
    group: 'social',
    groupName: 'กลุ่มการกลั่นแกล้งรังแกและปัญหาการเข้าสังคม',
    title: 'ไม่มีเพื่อน / ไม่มีเพื่อนสนิท',
    detail: 'เด็กไม่มีเพื่อนสนิท ถูกกีดกันจากกลุ่มเพื่อน หรือแยกตัวอยู่คนเดียว',
  },
];

export function calculate9S(answers: Answers9S): {
  behavioralPositive: boolean;
  emotionalPositive: boolean;
  socialPositive: boolean;
  overallPositive: boolean;
  recommendation: string;
} {
  // 3 ข้อแรก ซนเกินไป ใจลอย รอคอยไม่ได้ เป็นบวกเมื่อ ตอบ "ใช่" 1 ข้อ
  const behavioralPositive = Boolean(
    answers.q1_hyperactive || answers.q2_inattentive || answers.q3_impulsive
  );

  // 3 ข้อกลาง เครียด/หงุดหงิดง่าย ท้อแท้เบื่อหน่าย ไม่อยากไปโรงเรียน เป็นบวกเมื่อ ตอบ "ใช่" 1 ข้อ
  const emotionalPositive = Boolean(
    answers.q4_stress || answers.q5_discouraged || answers.q6_schoolRefusal
  );

  // 3 ข้อหลัง ถูกเพื่อนแกล้ง แกล้งเพื่อน ไม่มีเพื่อน เป็นบวกเมื่อตอบ “ใช่” 2 ข้อ หรือตอบ “ใช่” ข้อ ไม่มีเพื่อนสนิท
  let socialYesCount = 0;
  if (answers.q7_bully) socialYesCount++;
  if (answers.q8_bullied) socialYesCount++;
  if (answers.q9_noFriends) socialYesCount++;

  const socialPositive = socialYesCount >= 2 || Boolean(answers.q9_noFriends);

  const overallPositive = behavioralPositive || emotionalPositive || socialPositive;

  let recommendation = '';
  if (overallPositive) {
    recommendation =
      'พบสัญญาณความเสี่ยงเบื้องต้น แนะนำให้ประเมินด้วยแบบประเมินจุดแข็งและจุดอ่อน (SDQ) ต่อ เพื่อประเมินปัญหาให้ละเอียดยิ่งขึ้นและวางแผนดูแลช่วยเหลือ';
  } else {
    recommendation =
      'สุขภาวะและพัฒนาการเบื้องต้นปกติ ควรส่งเสริมพฤติกรรมเชิงบวกและติดตามเฝ้าระวังอย่างต่อเนื่อง';
  }

  return {
    behavioralPositive,
    emotionalPositive,
    socialPositive,
    overallPositive,
    recommendation,
  };
}

// ==========================================
// SDQ Definitions & Scoring Engine
// ==========================================

export interface SDQQuestionDef {
  no: number;
  textStudent: string;
  textAdult: string;
  scale: 'emotional' | 'conduct' | 'hyperactivity' | 'peer' | 'prosocial';
  isReversed: boolean;
}

export const SDQ_QUESTIONS: SDQQuestionDef[] = [
  {
    no: 1,
    textStudent: 'ฉันพยายามทำตัวดีกับคนอื่น ฉันใส่ใจความรู้สึกของคนอื่น',
    textAdult: 'ห่วงใยความรู้สึกคนอื่น',
    scale: 'prosocial',
    isReversed: false,
  },
  {
    no: 2,
    textStudent: 'ฉันอยู่ไม่นิ่ง ฉันนั่งนิ่ง ๆ ไม่ได้',
    textAdult: 'อยู่ไม่นิ่ง นั่งนิ่ง ๆ ไม่ได้',
    scale: 'hyperactivity',
    isReversed: false,
  },
  {
    no: 3,
    textStudent: 'ฉันปวดศีรษะ ปวดท้อง หรือไม่สบายบ่อย ๆ',
    textAdult: 'มักจะบ่นว่าปวดศีรษะ ปวดท้อง',
    scale: 'emotional',
    isReversed: false,
  },
  {
    no: 4,
    textStudent: 'ฉันเต็มใจแบ่งปันสิ่งของให้เพื่อน (ขนม, ของเล่น, ดินสอ เป็นต้น)',
    textAdult: 'เต็มใจแบ่งปันสิ่งของให้เพื่อน (ขนม, ของเล่น, ดินสอ เป็นต้น)',
    scale: 'prosocial',
    isReversed: false,
  },
  {
    no: 5,
    textStudent: 'ฉันโกรธแรง และมักอารมณ์เสีย',
    textAdult: 'มักจะอาละวาด หรือโมโหร้าย',
    scale: 'conduct',
    isReversed: false,
  },
  {
    no: 6,
    textStudent: 'ฉันชอบอยู่กับตัวเอง ฉันชอบเล่นคนเดียวหรืออยู่ตามลำพัง',
    textAdult: 'ค่อนข้างแยกตัว ชอบเล่นคนเดียว',
    scale: 'peer',
    isReversed: false,
  },
  {
    no: 7,
    textStudent: 'ฉันมักทำตามที่คนอื่นบอก',
    textAdult: 'เชื่อฟัง มักจะทำตามที่ผู้ใหญ่ต้องการ',
    scale: 'conduct',
    isReversed: true, // กลับคะแนน: ไม่จริง=2, ค่อนข้างจริง=1, จริง=0
  },
  {
    no: 8,
    textStudent: 'ฉันขี้กังวล',
    textAdult: 'กังวลใจหลายเรื่อง ดูกังวลเสมอ',
    scale: 'emotional',
    isReversed: false,
  },
  {
    no: 9,
    textStudent: 'ใคร ๆ ก็พึ่งฉันได้ ถ้าเขาเสียใจ อารมณ์ไม่ดี หรือไม่สบายใจ',
    textAdult: 'เป็นที่พึ่งได้เวลาที่คนอื่นเสียใจ อารมณ์ไม่ดี หรือไม่สบายใจ',
    scale: 'prosocial',
    isReversed: false,
  },
  {
    no: 10,
    textStudent: 'ฉันอยู่ไม่สุข วุ่นวาย',
    textAdult: 'อยู่ไม่สุข วุ่นวายอย่างมาก',
    scale: 'hyperactivity',
    isReversed: false,
  },
  {
    no: 11,
    textStudent: 'ฉันมีเพื่อนสนิท',
    textAdult: 'มีเพื่อนสนิท',
    scale: 'peer',
    isReversed: true, // กลับคะแนน
  },
  {
    no: 12,
    textStudent: 'ฉันมีเรื่องทะเลาะวิวาทบ่อย ฉันทำให้คนอื่นทำอย่างที่ฉันต้องการได้',
    textAdult: 'มักจะมีเรื่องทะเลาะวิวาทกับเด็กอื่น หรือรังแกเด็กอื่น',
    scale: 'conduct',
    isReversed: false,
  },
  {
    no: 13,
    textStudent: 'ฉันไม่มีความสุข ท้อแท้ ร้องไห้บ่อย ๆ',
    textAdult: 'ดูไม่มีความสุข ท้อแท้',
    scale: 'emotional',
    isReversed: false,
  },
  {
    no: 14,
    textStudent: 'เพื่อน ๆ ส่วนมากชอบฉัน',
    textAdult: 'เป็นที่ชื่นชอบของเพื่อน',
    scale: 'peer',
    isReversed: true, // กลับคะแนน
  },
  {
    no: 15,
    textStudent: 'ฉันวอกแวกง่าย ฉันรู้สึกว่าไม่มีสมาธิ',
    textAdult: 'วอกแวกง่าย สมาธิสั้น',
    scale: 'hyperactivity',
    isReversed: false,
  },
  {
    no: 16,
    textStudent: 'ฉันกังวลเวลาอยู่ในสถานการณ์ที่ไม่คุ้น และเสียความมั่นใจในตนเองง่าย',
    textAdult: 'เครียดไม่ยอมห่างเวลาอยู่ในสถานการณ์ที่ไม่คุ้น และขาดความมั่นใจในตนเอง',
    scale: 'emotional',
    isReversed: false,
  },
  {
    no: 17,
    textStudent: 'ฉันใจดีกับเด็กที่เล็กกว่า',
    textAdult: 'ใจดีกับเด็กที่เล็กกว่า',
    scale: 'prosocial',
    isReversed: false,
  },
  {
    no: 18,
    textStudent: 'มีคนว่าฉันโกหก หรือขี้โกงบ่อย ๆ',
    textAdult: 'ชอบโกหก หรือขี้โกง',
    scale: 'conduct',
    isReversed: false,
  },
  {
    no: 19,
    textStudent: 'เด็กๆ คนอื่นล้อเลียน หรือรังแกฉัน',
    textAdult: 'ถูกเด็กคนอื่นล้อเลียนหรือรังแก',
    scale: 'peer',
    isReversed: false,
  },
  {
    no: 20,
    textStudent: 'ฉันมักจะอาสาช่วยเหลือผู้อื่น (พ่อแม่, ครู, เพื่อน, เด็กคนอื่น ๆ เป็นต้น)',
    textAdult: 'ชอบอาสาช่วยเหลือผู้อื่น (พ่อ, แม่, ครู, เด็กคนอื่น)',
    scale: 'prosocial',
    isReversed: false,
  },
  {
    no: 21,
    textStudent: 'ฉันคิดก่อนทำ',
    textAdult: 'คิดก่อนทำ',
    scale: 'hyperactivity',
    isReversed: true, // กลับคะแนน
  },
  {
    no: 22,
    textStudent: 'ฉันเอาของคนอื่นในบ้าน ที่โรงเรียนหรือที่อื่น',
    textAdult: 'ขโมยของที่บ้าน ที่โรงเรียนหรือที่อื่น',
    scale: 'conduct',
    isReversed: false,
  },
  {
    no: 23,
    textStudent: 'ฉันเข้ากับผู้ใหญ่ได้ดีกว่ากับเด็กในวัยเดียวกัน',
    textAdult: 'เข้ากับผู้ใหญ่ได้ดีกว่าเด็กวัยเดียวกัน',
    scale: 'peer',
    isReversed: false,
  },
  {
    no: 24,
    textStudent: 'ฉันขี้กลัว รู้สึกหวาดกลัวได้ง่าย',
    textAdult: 'ขี้กลัว รู้สึกหวาดกลัวได้ง่าย',
    scale: 'emotional',
    isReversed: false,
  },
  {
    no: 25,
    textStudent: 'ฉันทำงานได้จนเสร็จ ความตั้งใจในการทำงานของฉันดี',
    textAdult: 'ทำงานได้จนเสร็จ มีความตั้งอกตั้งใจในการทำงาน',
    scale: 'hyperactivity',
    isReversed: true, // กลับคะแนน
  },
];

export function getRawQuestionScore(qNo: number, rawValue: number): number {
  const q = SDQ_QUESTIONS.find((item) => item.no === qNo);
  if (!q) return rawValue;
  if (q.isReversed) {
    // 0 -> 2, 1 -> 1, 2 -> 0
    if (rawValue === 0) return 2;
    if (rawValue === 1) return 1;
    if (rawValue === 2) return 0;
  }
  return rawValue;
}

export function calculateSDQScores(
  answers: SDQAnswers,
  assessorType: SDQAssessorType,
  impact: SDQImpactAnswers
) {
  let emotionalScore = 0;
  let conductScore = 0;
  let hyperactivityScore = 0;
  let peerScore = 0;
  let prosocialScore = 0;

  SDQ_QUESTIONS.forEach((q) => {
    const rawVal = answers[q.no] ?? 0;
    const score = getRawQuestionScore(q.no, rawVal);

    if (q.scale === 'emotional') emotionalScore += score;
    else if (q.scale === 'conduct') conductScore += score;
    else if (q.scale === 'hyperactivity') hyperactivityScore += score;
    else if (q.scale === 'peer') peerScore += score;
    else if (q.scale === 'prosocial') prosocialScore += score;
  });

  const totalDifficulties = emotionalScore + conductScore + hyperactivityScore + peerScore;

  // Cut-off classifications based on assessor type
  let emotionalStatus: SDQStatus = 'normal';
  let conductStatus: SDQStatus = 'normal';
  let hyperactivityStatus: SDQStatus = 'normal';
  let peerStatus: SDQStatus = 'normal';
  let totalStatus: SDQStatus = 'normal';
  let prosocialStatus: SDQProsocialStatus = 'strength';

  if (assessorType === 'student') {
    // ฉบับนักเรียนประเมินตนเอง
    // รวม 4 ด้าน: 0-16 ปกติ, 17-18 เสี่ยง, 19-40 มีปัญหา
    if (totalDifficulties >= 19) totalStatus = 'problem';
    else if (totalDifficulties >= 17) totalStatus = 'risk';
    else totalStatus = 'normal';

    // ด้านที่ 1 อารมณ์: 0-5 ปกติ, 6 เสี่ยง, 7-10 มีปัญหา
    if (emotionalScore >= 7) emotionalStatus = 'problem';
    else if (emotionalScore === 6) emotionalStatus = 'risk';
    else emotionalStatus = 'normal';

    // ด้านที่ 2 ความประพฤติ: 0-4 ปกติ, 5 เสี่ยง, 6-10 มีปัญหา
    if (conductScore >= 6) conductStatus = 'problem';
    else if (conductScore === 5) conductStatus = 'risk';
    else conductStatus = 'normal';

    // ด้านที่ 3 สมาธิสั้น: 0-5 ปกติ, 6 เสี่ยง, 7-10 มีปัญหา
    if (hyperactivityScore >= 7) hyperactivityStatus = 'problem';
    else if (hyperactivityScore === 6) hyperactivityStatus = 'risk';
    else hyperactivityStatus = 'normal';

    // ด้านที่ 4 สัมพันธ์กับเพื่อน: 0-3 ปกติ, 4 เสี่ยง, 5-10 มีปัญหา
    if (peerScore >= 5) peerStatus = 'problem';
    else if (peerScore === 4) peerStatus = 'risk';
    else peerStatus = 'normal';

    // ด้านที่ 5 สัมพันธภาพทางสังคม: 4-10 เป็นจุดแข็ง, ต่ำกว่า 3 (0-3) ไม่มีจุดแข็ง
    if (prosocialScore >= 4) prosocialStatus = 'strength';
    else prosocialStatus = 'no_strength';
  } else {
    // ฉบับครู หรือ ผู้ปกครอง
    // รวม 4 ด้าน: 0-15 ปกติ, 16-17 เสี่ยง, 18-40 มีปัญหา
    if (totalDifficulties >= 18) totalStatus = 'problem';
    else if (totalDifficulties >= 16) totalStatus = 'risk';
    else totalStatus = 'normal';

    // ด้านที่ 1 อารมณ์: 0-3 ปกติ, 4 เสี่ยง, 5-10 มีปัญหา
    if (emotionalScore >= 5) emotionalStatus = 'problem';
    else if (emotionalScore === 4) emotionalStatus = 'risk';
    else emotionalStatus = 'normal';

    // ด้านที่ 2 ความประพฤติ: 0-3 ปกติ, 4 เสี่ยง, 5-10 มีปัญหา
    if (conductScore >= 5) conductStatus = 'problem';
    else if (conductScore === 4) conductStatus = 'risk';
    else conductStatus = 'normal';

    // ด้านที่ 3 สมาธิสั้น: 0-5 ปกติ, 6 เสี่ยง, 7-10 มีปัญหา
    if (hyperactivityScore >= 7) hyperactivityStatus = 'problem';
    else if (hyperactivityScore === 6) hyperactivityStatus = 'risk';
    else hyperactivityStatus = 'normal';

    // ด้านที่ 4 สัมพันธ์กับเพื่อน: 0-5 ปกติ, 6 เสี่ยง, 7-10 มีปัญหา (ในตารางครู/ผู้ปกครอง ปกติ 0-5, เสี่ยง 6, ปัญหา 7-10)
    if (peerScore >= 7) peerStatus = 'problem';
    else if (peerScore === 6) peerStatus = 'risk';
    else peerStatus = 'normal';

    // ด้านที่ 5 สัมพันธภาพทางสังคม: 4-10 เป็นจุดแข็ง, 3 เสี่ยง, 0-2 มีปัญหา (ไม่มีจุดแข็ง)
    if (prosocialScore >= 4) prosocialStatus = 'strength';
    else prosocialStatus = 'no_strength';
  }

  // ด้านหลัง (Impact)
  let impactTotalScore = 0;
  let impactStatus: SDQStatus = 'normal';

  if (impact.hasProblem !== 'no') {
    impactTotalScore += impact.distress ?? 0;
    impactTotalScore += impact.impactHome ?? 0;
    impactTotalScore += impact.impactPeers ?? 0;
    impactTotalScore += impact.impactClassroom ?? 0;
    impactTotalScore += impact.impactLeisure ?? 0;
    impactTotalScore += impact.impactBurden ?? 0;

    if (impactTotalScore >= 3) impactStatus = 'problem';
    else if (impactTotalScore >= 1) impactStatus = 'risk';
    else impactStatus = 'normal';
  }

  return {
    emotionalScore,
    emotionalStatus,
    conductScore,
    conductStatus,
    hyperactivityScore,
    hyperactivityStatus,
    peerScore,
    peerStatus,
    totalDifficulties,
    totalStatus,
    prosocialScore,
    prosocialStatus,
    impactTotalScore,
    impactStatus,
  };
}
