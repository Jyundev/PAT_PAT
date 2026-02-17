'use client';

import { ChevronLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const hideBack = pathname === '/auth/signin';

  return (
    <div className="relative min-h-[100svh] overflow-y-auto text-white">
      {/* 베이스 배경: 공통 토큰 (Layout/body와 같은 베이스 톤) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, var(--bg-1) 0%, var(--bg-0) 100%)',
        }}
      />

      {/*  Auth 전용 은은한 글로우 (페이지마다 다르게 안 하고 “레이아웃 고정”) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(900px_520px_at_50%_85%,rgba(56,189,248,0.10),transparent_60%),' +
            'radial-gradient(900px_520px_at_20%_20%,rgba(130,70,255,0.10),transparent_62%)',
        }}
      />

      {/*  Vignette: 공통 딥톤 마무리 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 45%, transparent 35%, rgba(0,0,0,0.35) 100%)',
        }}
      />

      {/* header */}
      <header className="mx-auto flex h-14 w-full max-w-[480px] items-center px-5">
        {!hideBack && (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-white/10"
            aria-label="뒤로가기"
          >
            <ChevronLeft size={24} />
          </button>
        )}
      </header>

      {/* content container */}
      <main className="mx-auto w-full max-w-[480px] px-5 pb-10">
        {children}
      </main>
    </div>
  );
}
