import React, { useState } from 'react';

export const WMA_LOGO_SRC = '/assets/aistudio/_____________WMA_CARE_____________________4cbfce17.png';

interface SchoolLogoProps {
  className?: string;
  size?: number;
  alt?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 48,
  alt = 'โลโก้ WMA CARE โรงเรียนวัดใหม่อมตรส',
}) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <circle cx="50" cy="50" r="47" fill="#0f2b48" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="41" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
          <path
            d="M24 64C28 72 38 78 50 78C62 78 72 72 76 64C70 68 60 70 50 70C40 70 30 68 24 64Z"
            fill="#f59e0b"
          />
          <path
            d="M50 14C45 23 41 29 41 36C41 42 45 46 50 46C55 46 59 42 59 36C59 29 55 23 50 14Z"
            fill="#d97706"
          />
          <circle cx="50" cy="36" r="3" fill="#fef3c7" />
          <path
            d="M32 38C32 38 50 33 68 38V56C68 64 50 71 50 71C50 71 32 64 32 56V38Z"
            fill="#0f2b48"
            stroke="#0d9488"
            strokeWidth="1.5"
          />
          <text
            x="50"
            y="56"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="18"
            fontWeight="bold"
            fontFamily="sans-serif"
            letterSpacing="0.5"
          >
            มอ
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-white/90 p-0.5 shadow-xs border border-white/30 transition-transform duration-200 hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={WMA_LOGO_SRC}
        alt={alt}
        onError={() => setImgError(true)}
        className="w-full h-full object-contain rounded-full select-none"
        loading="eager"
      />
    </div>
  );
};
