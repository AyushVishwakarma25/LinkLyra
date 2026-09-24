import React from 'react';

export interface IPhoneMockup3DProps {
  children: React.ReactNode;
  tiltAngle?: 'right' | 'left' | 'straight';
  className?: string;
}

export const IPhoneMockup3D: React.FC<IPhoneMockup3DProps> = ({
  children,
  tiltAngle = 'right',
  className = '',
}) => {
  // 3D Tilt calculation based on desired angle
  const getTiltClasses = () => {
    if (tiltAngle === 'straight') {
      return 'lg:[transform:rotateY(0deg)_rotateX(0deg)] lg:group-hover:[transform:translateY(-10px)]';
    }
    if (tiltAngle === 'left') {
      return 'lg:[transform:rotateY(11deg)_rotateX(7deg)_rotateZ(-1.5deg)] lg:group-hover:[transform:rotateY(2deg)_rotateX(2deg)_rotateZ(0deg)_translateY(-12px)]';
    }
    // Default: 'right'
    return 'lg:[transform:rotateY(-11deg)_rotateX(7deg)_rotateZ(1.5deg)] lg:group-hover:[transform:rotateY(-2deg)_rotateX(2deg)_rotateZ(0deg)_translateY(-12px)]';
  };

  // Directional floor shadow offset based on tilt angle
  const getShadowOffset = () => {
    if (tiltAngle === 'left') return 'left-[46%]';
    if (tiltAngle === 'straight') return 'left-1/2';
    return 'left-[54%]';
  };

  return (
    <div
      className={`relative w-full max-w-[365px] sm:max-w-[395px] mx-auto py-6 group select-none ${className}`}
      style={{ perspective: '1400px' }}
    >
      {/* ------------------------------------------------------------- */}
      {/* MULTI-LAYER 3D FLOOR DROP SHADOW PROJECTION                   */}
      {/* ------------------------------------------------------------- */}
      {/* 1. Deep Contact Floor Shadow directly underneath chassis */}
      <div
        className={`absolute -bottom-3 ${getShadowOffset()} -translate-x-1/2 w-[74%] h-8 bg-black/45 rounded-full blur-md pointer-events-none transition-all duration-700 ease-out group-hover:scale-95 group-hover:opacity-60`}
        aria-hidden="true"
      />

      {/* 2. Main Ambient Floor Projection (expands on float) */}
      <div
        className={`absolute -bottom-8 ${getShadowOffset()} -translate-x-1/2 w-[88%] h-14 bg-black/35 rounded-full blur-2xl pointer-events-none transform scale-95 transition-all duration-700 ease-out group-hover:scale-105 group-hover:bg-black/45 group-hover:blur-3xl`}
        aria-hidden="true"
      />

      {/* 3. Soft Extended Diffuse Elevation Shadow */}
      <div
        className={`absolute -bottom-14 ${getShadowOffset()} -translate-x-1/2 w-[98%] h-20 bg-black/20 rounded-full blur-3xl pointer-events-none transform scale-90 transition-all duration-700 ease-out group-hover:scale-110 group-hover:bg-black/25`}
        aria-hidden="true"
      />

      {/* ------------------------------------------------------------- */}
      {/* 3D TILTED IPHONE CHASSIS (Natural Titanium / Space Black)    */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`relative rounded-[52px] p-[10px] sm:p-[12px] bg-gradient-to-b from-[#3D4047] via-[#212328] to-[#131417] border border-[#5A5D6B]/50 shadow-[0_45px_90px_-20px_rgba(0,0,0,0.5),0_25px_45px_-15px_rgba(0,0,0,0.35),0_60px_120px_-30px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.7)] transition-all duration-700 ease-out ${getTiltClasses()}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Hardware Side Buttons */}
        {/* Left: Action / Mute Button */}
        <div
          className="w-[3.5px] h-6 bg-gradient-to-r from-[#4A4D57] to-[#25272D] rounded-l-xs absolute -left-[3.5px] top-24 shadow-xs border-y border-l border-white/20"
          aria-hidden="true"
        />
        {/* Left: Volume Up */}
        <div
          className="w-[3.5px] h-12 bg-gradient-to-r from-[#4A4D57] to-[#25272D] rounded-l-xs absolute -left-[3.5px] top-35 shadow-xs border-y border-l border-white/20"
          aria-hidden="true"
        />
        {/* Left: Volume Down */}
        <div
          className="w-[3.5px] h-12 bg-gradient-to-r from-[#4A4D57] to-[#25272D] rounded-l-xs absolute -left-[3.5px] top-50 shadow-xs border-y border-l border-white/20"
          aria-hidden="true"
        />
        {/* Right: Power / Siri Key */}
        <div
          className="w-[3.5px] h-16 bg-gradient-to-l from-[#4A4D57] to-[#25272D] rounded-r-xs absolute -right-[3.5px] top-32 shadow-xs border-y border-r border-white/20"
          aria-hidden="true"
        />

        {/* Outer Titanium Bezel Chamfer Highlight */}
        <div className="absolute inset-[1px] rounded-[51px] border border-white/15 pointer-events-none" />

        {/* OLED Ultra-thin Black Border Enclosure */}
        <div className="relative rounded-[42px] bg-black p-[2.5px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.9),0_0_0_1px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden max-h-[700px] sm:max-h-[725px]">
          {/* Inner Screen Display Surface */}
          <div className="relative rounded-[39px] bg-white overflow-hidden flex flex-col flex-1">
            {/* iOS Status Bar */}
            <div className="h-10 pt-2 px-5 flex items-center justify-between z-30 shrink-0 select-none bg-white/95 backdrop-blur-md border-b border-black/[0.03]">
              {/* iOS Clock */}
              <span className="font-semibold text-[13px] tracking-tight text-[#111111] font-mono">
                9:41
              </span>

              {/* Dynamic Island with Optical Camera & FaceID Sensors */}
              <div className="w-24 sm:w-26 h-5 sm:h-5.5 bg-black rounded-full flex items-center justify-between px-2.5 shadow-inner">
                {/* Front Camera Lens with Sapphire Optical Gleam */}
                <span className="w-2 h-2 rounded-full bg-[#0E101A] border border-[#23273D] flex items-center justify-center">
                  <span className="w-0.5 h-0.5 rounded-full bg-sky-300/80" />
                </span>
                {/* TrueDepth FaceID Infrared Sensor */}
                <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A10]" />
              </div>

              {/* Icons: 4G/5G Signal, WiFi, Battery */}
              <div className="flex items-center gap-1.5 text-[#111111]">
                {/* Cellular Signal Bars */}
                <svg className="w-3.5 h-2.5 fill-current" viewBox="0 0 17 11">
                  <rect x="0" y="8" width="2.5" height="3" rx="0.5" />
                  <rect x="4.5" y="5.5" width="2.5" height="5.5" rx="0.5" />
                  <rect x="9" y="3" width="2.5" height="8" rx="0.5" />
                  <rect x="13.5" y="0" width="2.5" height="11" rx="0.5" />
                </svg>

                {/* Wi-Fi Icon */}
                <svg className="w-3.5 h-3 fill-current" viewBox="0 0 16 12">
                  <path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM3.4 6.8a6.5 6.5 0 019.2 0 .8.8 0 101.1-1.1 8 8 0 00-11.4 0 .8.8 0 101.1 1.1zM.8 4.2a10 10 0 0114.4 0 .8.8 0 101.1-1.1 11.5 11.5 0 00-16.6 0 .8.8 0 101.1 1.1z" />
                </svg>

                {/* Battery Pill */}
                <div className="flex items-center">
                  <div className="w-5 h-2.5 rounded-xs border border-current p-0.5 flex items-center">
                    <div className="w-full h-full bg-current rounded-3xs" />
                  </div>
                  <div className="w-0.5 h-1 bg-current rounded-r-xs -ml-[0.5px]" />
                </div>
              </div>
            </div>

            {/* Screen Content Scroll Area */}
            <div className="overflow-y-auto no-scrollbar flex-1 relative z-20">
              {children}
            </div>

            {/* iOS Bottom Home Bar */}
            <div className="h-5 flex items-center justify-center shrink-0 z-30 bg-white/95 backdrop-blur-md border-t border-black/[0.02]">
              <div className="w-32 h-1 bg-black/25 rounded-full" />
            </div>

            {/* Specular Diagonal Glass Glare Reflection Overlay */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-white/[0.12] z-40 rounded-[39px]"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
