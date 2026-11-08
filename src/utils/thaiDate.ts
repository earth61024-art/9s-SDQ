export const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export const THAI_MONTHS_FULL = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export function getTodayThaiDate(): { dateString: string; timeString: string; fullThaiText: string } {
  const now = new Date();
  const day = now.getDate();
  const monthIdx = now.getMonth();
  const thaiYear = now.getFullYear() + 543;

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const yyyy = now.getFullYear();
  const mm = String(monthIdx + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');

  return {
    dateString: `${yyyy}-${mm}-${dd}`,
    timeString: `${hours}:${minutes}`,
    fullThaiText: `วันที่ ${day} ${THAI_MONTHS_FULL[monthIdx]} พ.ศ. ${thaiYear}`,
  };
}

export function formatToThaiDate(isoDateString?: string, timeString?: string): string {
  if (!isoDateString) return '-';
  try {
    const parts = isoDateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const thaiYear = year > 2500 ? year : year + 543;
      const dateText = `${day} ${THAI_MONTHS_SHORT[monthIdx]} ${thaiYear}`;
      return timeString ? `${dateText} เวลา ${timeString} น.` : dateText;
    }
    const d = new Date(isoDateString);
    if (isNaN(d.getTime())) return isoDateString;
    const day = d.getDate();
    const monthIdx = d.getMonth();
    const thaiYear = d.getFullYear() + 543;
    const dateText = `${day} ${THAI_MONTHS_SHORT[monthIdx]} ${thaiYear}`;
    return timeString ? `${dateText} เวลา ${timeString} น.` : dateText;
  } catch {
    return isoDateString;
  }
}

export function formatToThaiDateFull(isoDateString?: string): string {
  if (!isoDateString) return '-';
  try {
    const parts = isoDateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const thaiYear = year > 2500 ? year : year + 543;
      return `วันที่ ${day} ${THAI_MONTHS_FULL[monthIdx]} พ.ศ. ${thaiYear}`;
    }
    const d = new Date(isoDateString);
    if (isNaN(d.getTime())) return isoDateString;
    return `วันที่ ${d.getDate()} ${THAI_MONTHS_FULL[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`;
  } catch {
    return isoDateString;
  }
}
