'use client';

import ErrorModal from '@/features/common/ErrorModal';
import LoginButton from '@/shared/components/loginBtn';
import { signInWithGoogle } from '@/utils/supabase/signInWithGoogle';
import { signInWithKakao } from '@/utils/supabase/signInWithKakao';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function OnboardingContent() {
  const router = useRouter();
  const pathname = usePathname();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [busy, setBusy] = useState(false);

  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error');

  // [중요!] 여기서 return null을 해버리면 에러가 없을 때 페이지 내용이 다 사라집니다.
  // 대신 메시지만 결정하고, 렌더링은 아래에서 처리해야 합니다.
  const messages: Record<string, string> = {
    DB_ERROR: '계정 정보를 저장하는 데 실패했어요.',
    UNAUTHORIZED: '로그인 인증에 실패했습니다.',
    INVALID_CODE: '잘못된 접근입니다.',
  };

  const errorMessage = errorCode
    ? messages[errorCode] || '알 수 없는 오류가 발생했습니다.'
    : null;

  const onGoogle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signInWithGoogle('/home');
    } finally {
      setBusy(false);
    }
  };

  const onKakao = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signInWithKakao();
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <main
      className="
        relative
        min-h-screen
        min-w-[412px]
        overflow-x-auto
        flex justify-center
        bg-[radial-gradient(circle_at_center,_#0B183D_0%,_#070D1F_100%)]
      "
    >
      {/* 1. 에러가 있을 때만 모달을 띄우도록 수정 */}
      {errorMessage && <ErrorModal message={[errorMessage]} url={pathname} />}

      {/* 고양이 캐릭터 */}
      <img
        src="/images/icon/lumi/lumi_start.svg"
        alt="Lumi 캐릭터"
        className="absolute right-0 top-50 z-[10]
                   w-[150px] sm:w-[150px] h-auto
                   select-none pointer-events-none"
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />

      <div className="w-full max-w-[480px] px-4 pt-10 pb-10 flex flex-col items-center">
        <div className="flex flex-col items-center mt-24">
          <span className="font-surround text-white text-[50px] leading-[1.3] font-bold tracking-[-0.03em]">
            PAT PAT
          </span>
          <span className="text-[14px] text-[#656E8A] font-light mt-1 leading-[1.1]">
            로그인하고 오늘의 감정 기록을 시작해요
          </span>
        </div>

        <div className="flex flex-col w-full px-4 items-center gap-5 mt-44">
          <LoginButton
            title="카카오로 시작하기"
            onClickEvent={onKakao}
            icon="/images/icon/sns/kakao.svg"
            style="bg-[#FEE300] text-[#353C3B]"
            disable={busy}
          />
          <LoginButton
            title="구글로 시작하기"
            onClickEvent={onGoogle}
            icon="/images/icon/sns/google.svg"
            style="bg-[#4B5672] text-[#FBFBFB]"
            disable={busy}
          />
          <LoginButton
            title="이메일로 시작하기"
            onClickEvent={() => router.push('/auth/signin')}
            style="bg-[#1E2843] text-[#FBFBFB]"
          />

          <div className="bg-[#636B83] h-[1px] w-full mt-4" />
          <div className="mt-1.5 text-[#A6A6A6] text-[15px]">
            <a href="/auth/signup">회원가입</a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Onboarding() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070D1F]" />}>
      <OnboardingContent />
    </Suspense>
  );
}
