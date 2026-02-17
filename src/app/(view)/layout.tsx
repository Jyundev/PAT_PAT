'use client';

import { Providers } from '../providers';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-[100svh] overflow-hidden">
      {/*  공통 배경: 전역 토큰을 사용 (body 배경을 덮고 싶으면 여기서) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(180deg, var(--bg-1) 0%, var(--bg-0) 100%)`,
        }}
      />

      {/* 공통 비네트/딥톤 레이어 (페이지마다 달라지지 않는 ‘통일감’ 담당) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 45%, transparent 35%, rgba(0,0,0,0.35) 100%)',
        }}
      />

      <div className="relative z-10 flex flex-col w-full min-h-[100svh]">
        <Providers>{children}</Providers>
      </div>
    </div>
  );
}
