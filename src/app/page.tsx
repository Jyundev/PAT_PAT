'use client';

import ProgressBar from '../shared/components/splash/progressBar';
import SplashStar from '../shared/components/splash/splashStar';

export default function Splash() {
  return (
    <main
      className={[
        'flex flex-col gap-3 bg-[radial-gradient(circle,_#0B183D_0%,_#070D1F_100%)] h-screen items-center justify-center',
      ].join(' ')}
      aria-label="루미 스플래시"
    >
      {/* 배경 별빛 */}
      <SplashStar />

      <div className="flex flex-col items-center">
        <img
          src="/images/icon/lumi/lumi_main.svg"
          alt="Lumi"
          className="relative w-[92px] h-[138px] object-contain"
        />
        {/* 앱 이름 */}
        <h1 className="font-surround   text-white text-[37px] leading-[1.3] font-bold tracking-[-0.01em]">
          PAT PAT
        </h1>
        <p className="mt-1 text-[#C6C6C7] text-base font-extralight	">
          당신의 감정이 별이 되어 빛나요
        </p>

        {/* 진행 표시*/}
        <div className="relative mt-40 w-[260px]">
          <ProgressBar />
        </div>
      </div>

      <footer
        className="absolute left-1/2 -translate-x-1/2 text-center text-white/45 text-[11px]"
        style={{ bottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        v0.1.0 · © pat-pat
      </footer>
    </main>
  );
}
