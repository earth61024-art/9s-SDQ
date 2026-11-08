import React, { useState } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { Mail, LogIn, AlertCircle, CheckCircle, X, Shield, Sparkles } from 'lucide-react';
import { AppUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => Promise<void>;
  onEmailSignIn: (email: string, displayName?: string) => void;
  isLoggingIn: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onGoogleSignIn,
  onEmailSignIn,
  isLoggingIn,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleClick = async () => {
    setErrorMessage(null);
    try {
      await onGoogleSignIn();
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          'ไม่สามารถเข้าสู่ระบบด้วย Google ได้ หากเปิดในไอเฟรมหรือเบราว์เซอร์บล็อกป๊อปอัป กรุณาใช้วิธีระบุอีเมลด้านล่าง'
      );
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const email = emailInput.trim();
    if (!email || !email.includes('@')) {
      setErrorMessage('กรุณาระบุที่อยู่อีเมลที่ถูกต้อง เช่น earth61024@gmail.com');
      return;
    }

    try {
      onEmailSignIn(email, nameInput.trim() || undefined);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วยอีเมล');
    }
  };

  const handleQuickPreset = (presetEmail: string, presetName: string) => {
    setEmailInput(presetEmail);
    setNameInput(presetName);
    onEmailSignIn(presetEmail, presetName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0f2b48] to-[#163a61] text-white p-5 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SchoolLogo size={42} />
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>เข้าสู่ระบบ WMA CARE</span>
                <span className="text-[10px] font-semibold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-400/30">
                  โรงเรียนวัดใหม่อมตรส
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                ระบบดูแลสุขภาวะและพัฒนาการนักเรียน (9S & SDQ)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span className="font-semibold">ข้อผิดพลาด: </span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Method 1: Google Sign In */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              วิธีที่ 1: เข้าสู่ระบบด้วยบัญชี Google
            </label>
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 rounded-xl text-xs flex items-center justify-center gap-2.5 transition cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isLoggingIn ? (
                <>
                  <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  <span>กำลังเชื่อมต่อกับ Google...</span>
                </>
              ) : (
                <>
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
                  <span>ลงชื่อเข้าใช้ด้วย Google (Sign in with Google)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400">
              * สำหรับส่งออก Google Sheets และบันทึกรายงานลง Google Drive
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-3 text-slate-400 text-[11px] font-medium">หรือเข้าสู่ระบบด้วยอีเมล</span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {/* Quick preset for project admin */}
          <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-700" />
              <div>
                <p className="text-xs font-bold text-teal-900">earth61024@gmail.com</p>
                <p className="text-[10px] text-teal-700">ผู้ดูแลระบบโรงเรียนวัดใหม่อมตรส</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleQuickPreset('earth61024@gmail.com', 'ผู้ดูแลระบบ WMA CARE')}
              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold rounded-lg shadow-xs transition cursor-pointer"
            >
              เข้าใช้งานทันที
            </button>
          </div>

          {/* Method 2: Direct Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>ระบุที่อยู่อีเมลของคุณ:</span>
              </label>
              <input
                type="email"
                placeholder="earth61024@gmail.com หรืออีเมลครู"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                ชื่อ-นามสกุล / ตำแหน่ง (ระบุหรือไม่ก็ได้):
              </label>
              <input
                type="text"
                placeholder="เช่น ครูประจำชั้น ป.1 หรือ ครูสมชาย"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0f2b48] hover:bg-[#163a61] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-teal-400" />
              <span>เข้าสู่ระบบด้วยอีเมล</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            ระบบจะจำบัญชีอีเมลนี้ไว้บนอุปกรณ์ของคุณโดยอัตโนมัติ ทำให้เมื่อเปิดหน้าเว็บในครั้งถัดไป ระบบจะเข้าสู่ระบบให้อัตโนมัติทันที
          </p>
        </div>
      </div>
    </div>
  );
};
