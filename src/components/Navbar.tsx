import React, { useState } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { User } from 'firebase/auth';
import { AcademicSemester } from '../types';
import {
  LayoutDashboard,
  ClipboardCheck,
  FileSpreadsheet,
  Users,
  Printer,
  Calendar,
  Plus,
  LogOut,
  ChevronDown,
  Upload,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | '9s' | 'sdq' | 'students' | 'reports';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  academicYear: string;
  setAcademicYear: (year: string) => void;
  availableYears: string[];
  onAddYear: (year: string) => void;
  semester: AcademicSemester;
  setSemester: (sem: AcademicSemester) => void;
  currentUser: User | null;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  isLoggingIn: boolean;
  onOpenImportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  academicYear,
  setAcademicYear,
  availableYears,
  onAddYear,
  semester,
  setSemester,
  currentUser,
  onSignInWithGoogle,
  onSignOut,
  isLoggingIn,
  onOpenImportModal,
}) => {
  const [showAddYearInput, setShowAddYearInput] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleCreateYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (newYearInput.trim() && !availableYears.includes(newYearInput.trim())) {
      onAddYear(newYearInput.trim());
      setAcademicYear(newYearInput.trim());
      setNewYearInput('');
      setShowAddYearInput(false);
    }
  };

  return (
    <header className="bg-[#0f2b48] text-white shadow-md sticky top-0 z-40 print:hidden">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <SchoolLogo size={46} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center">
                WMA <span className="text-teal-400 ml-1">CARE</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                School Health HERO
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              ระบบดูแลสุขภาวะและพัฒนาการนักเรียน โรงเรียนวัดใหม่อมตรส
            </p>
          </div>
        </div>

        {/* Academic Year Switcher, Semester Switcher & Google Workspace Auth */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Year & Semester Control Group */}
          <div className="flex items-center bg-[#173a5e] border border-white/15 rounded-xl p-1 text-xs gap-1.5 shadow-xs">
            {/* Year Selector */}
            <div className="flex items-center">
              <span className="flex items-center gap-1 px-1.5 text-slate-300 font-medium">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                ปี:
              </span>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer pr-1"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr} className="bg-[#0f2b48] text-white">
                    {yr}
                  </option>
                ))}
              </select>
              {!showAddYearInput ? (
                <button
                  type="button"
                  onClick={() => setShowAddYearInput(true)}
                  title="เพิ่มปีการศึกษาใหม่"
                  className="p-1 hover:bg-white/15 rounded text-teal-300 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              ) : (
                <form onSubmit={handleCreateYear} className="flex items-center gap-1 ml-1">
                  <input
                    type="text"
                    placeholder="2570"
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(e.target.value)}
                    className="w-14 px-1.5 py-0.5 text-xs bg-white text-slate-900 rounded outline-none font-bold"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-1.5 py-0.5 bg-teal-600 text-white rounded text-[10px] font-bold"
                  >
                    เพิ่ม
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddYearInput(false)}
                    className="px-1 text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </form>
              )}
            </div>

            <span className="w-px h-4 bg-white/20" />

            {/* Semester Switcher */}
            <div className="flex items-center bg-[#0e2742] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setSemester('1')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  semester === '1'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                เทอม 1
              </button>
              <button
                type="button"
                onClick={() => setSemester('2')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  semester === '2'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                เทอม 2
              </button>
            </div>
          </div>

          {/* Quick Import Button */}
          <button
            type="button"
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 bg-[#0d9488] hover:bg-[#0f766e] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            title="อัปโหลดไฟล์ Excel/CSV หรือเลื่อนชั้นปีถัดไป"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">อัปโหลดรายชื่อ (Excel/CSV)</span>
            <span className="sm:hidden">อัปโหลด</span>
          </button>

          {/* Google Auth Status / Button */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-[#173a5e] hover:bg-[#1f4a75] border border-white/15 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-teal-500 text-[#0f2b48] font-bold flex items-center justify-center text-[10px]">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[110px] truncate text-slate-200">
                  {currentUser.displayName || currentUser.email}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {currentUser.displayName || 'Google Account'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <div className="flex flex-col gap-1 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] text-teal-800 bg-teal-50 border border-teal-200/60 px-1.5 py-0.5 rounded font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                        Firebase Firestore ซิงค์คลาวด์สด
                      </span>
                      <span className="inline-block text-[10px] text-sky-800 bg-sky-50 border border-sky-200/60 px-1.5 py-0.5 rounded font-medium">
                        เชื่อมต่อ Drive & Sheets สำเร็จ
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onSignOut();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ออกจากระบบ Google</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignInWithGoogle}
              disabled={isLoggingIn}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-3 py-1.5 rounded-lg text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoggingIn ? 'กำลังเชื่อมต่อ...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-1 py-1.5 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-[#0d9488] text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>ภาพรวมระบบ (Dashboard)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('9s')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === '9s'
              ? 'bg-[#0d9488] text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>แบบคัดกรอง 9S (HERO)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sdq')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'sdq'
              ? 'bg-[#0d9488] text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>แบบประเมิน SDQ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'students'
              ? 'bg-[#0d9488] text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>จัดการข้อมูลนักเรียน</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-[#0d9488] text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>พิมพ์รายงาน & ส่งออก Workspace</span>
        </button>
      </nav>
    </header>
  );
};
