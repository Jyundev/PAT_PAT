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

  const hideBack = pathname === '/';

  const getTitle = () => {
    if (pathname === '/auth/terms') return '서비스 약관';
    if (pathname === '/auth/signup') return '회원가입';
    if (pathname === '/auth/signin') return '로그인';
    return '';
  };

  const title = getTitle();

  return (
    <div className="relative h-screen overflow-hidden text-white flex flex-col">
      {/* 베이스 배경 (전체 고정) */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, var(--bg-1) 0%, var(--bg-0) 100%)',
        }}
      />

      {/* 배경 글로우 (고정) */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 opacity-70"
        style={{
          background:
            'radial-gradient(900px_520px_at_50%_85%,rgba(56,189,248,0.08),transparent_60%),' +
            'radial-gradient(900px_520px_at_20%_20%,rgba(130,70,255,0.08),transparent_62%)',
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

      {/* Header: Fixed Height (56px) */}
      <header className="shrink-0 z-50 mx-auto flex h-14 w-full max-w-[480px] items-center px-4 border-b border-white/5 bg-[rgba(5,11,28,0.85)] backdrop-blur-md">
        <div className="relative flex w-full items-center">
          {!hideBack && (
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-white/10"
              aria-label="뒤로가기"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          {title && (
            <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold tracking-tight text-white/90">
              {title}
            </h1>
          )}
        </div>
      </header>

      {/* Main Area: Fills remaining height, no scrolling here */}
      <main className="flex-1 min-h-0 flex flex-col mx-auto w-full max-w-[480px]">
        {children}
      </main>
    </div>
  );
}
