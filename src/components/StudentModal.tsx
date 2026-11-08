import React, { useState, useEffect } from 'react';
import { Student, ClassroomGrade, AcademicSemester } from '../types';
import { X, UserPlus, Edit3 } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  student?: Student | null;
  defaultClassroom?: ClassroomGrade;
  currentAcademicYear: string;
  currentSemester?: AcademicSemester;
  onClose: () => void;
  onSave: (student: Student) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  student,
  defaultClassroom = 'ป.1',
  currentAcademicYear,
  currentSemester = '1',
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [classroom, setClassroom] = useState<ClassroomGrade>(defaultClassroom);
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState<'ชาย' | 'หญิง'>('ชาย');
  const [orderNo, setOrderNo] = useState<number | ''>('');
  const [academicYear, setAcademicYear] = useState(currentAcademicYear);
  const [semester, setSemester] = useState<AcademicSemester>(currentSemester);

  useEffect(() => {
    if (student) {
      setName(student.name);
      setStudentCode(student.studentCode);
      setNationalId(student.nationalId);
      setClassroom(student.classroom);
      setBirthdate(student.birthdate);
      setGender(student.gender || 'ชาย');
      setOrderNo(student.orderNo ?? '');
      setAcademicYear(student.academicYear);
      setSemester(student.semester || currentSemester);
    } else {
      setName('');
      setStudentCode('');
      setNationalId('');
      setClassroom(defaultClassroom);
      setBirthdate('');
      setGender('ชาย');
      setOrderNo('');
      setAcademicYear(currentAcademicYear);
      setSemester(currentSemester);
    }
  }, [student, defaultClassroom, currentAcademicYear, currentSemester, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedStudent: Student = {
      id: student ? student.id : `student-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      studentCode: studentCode.trim() || 'N/A',
      nationalId: nationalId.trim() || '-',
      classroom,
      birthdate: birthdate.trim() || '-',
      gender,
      orderNo: orderNo === '' ? undefined : Number(orderNo),
      academicYear,
      semester,
    };

    onSave(updatedStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-[#0f2b48] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {student ? <Edit3 className="w-5 h-5 text-teal-400" /> : <UserPlus className="w-5 h-5 text-teal-400" />}
            <h3 className="font-semibold text-lg">
              {student ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มรายชื่อนักเรียนใหม่'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-md transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ปีการศึกษา
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] focus:border-transparent outline-none bg-slate-50 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ภาคเรียน
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as AcademicSemester)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] focus:border-transparent outline-none bg-white font-medium"
              >
                <option value="1">เทอม 1</option>
                <option value="2">เทอม 2</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                ระดับชั้น
              </label>
              <select
                value={classroom}
                onChange={(e) => setClassroom(e.target.value as ClassroomGrade)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] focus:border-transparent outline-none bg-white font-medium"
              >
                <option value="ป.1">ป.1</option>
                <option value="ป.2">ป.2</option>
                <option value="ป.3">ป.3</option>
                <option value="ป.4">ป.4</option>
                <option value="ป.5">ป.5</option>
                <option value="ป.6">ป.6</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">เลขที่</label>
              <input
                type="number"
                min="1"
                placeholder="เช่น 1"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เลขประจำตัวนักเรียน
              </label>
              <input
                type="text"
                placeholder="เช่น 6169"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อ - นามสกุล นักเรียน <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น ด.ช.ณัฏฐกานต์ มณีเมือง"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.startsWith('ด.ญ.') || e.target.value.startsWith('นางสาว')) {
                  setGender('หญิง');
                } else if (e.target.value.startsWith('ด.ช.') || e.target.value.startsWith('นาย')) {
                  setGender('ชาย');
                }
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เลขประจำตัวประชาชน
              </label>
              <input
                type="text"
                placeholder="เช่น 1-1008-01843-55-1"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] outline-none font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วันเกิด
              </label>
              <input
                type="text"
                placeholder="เช่น 5 มิ.ย. 2562"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">เพศ</label>
            <div className="flex gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="gender"
                  value="ชาย"
                  checked={gender === 'ชาย'}
                  onChange={() => setGender('ชาย')}
                  className="text-teal-600 focus:ring-teal-500"
                />
                ชาย
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="gender"
                  value="หญิง"
                  checked={gender === 'หญิง'}
                  onChange={() => setGender('หญิง')}
                  className="text-teal-600 focus:ring-teal-500"
                />
                หญิง
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-[#0d9488] hover:bg-[#0f766e] rounded-lg shadow-sm transition cursor-pointer"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
