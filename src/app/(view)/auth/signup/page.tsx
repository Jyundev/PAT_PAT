'use client';

import SocialLogin from '@/features/auth/components/socialLogin';
import { useSignUpPage } from '@/features/auth/hooks/useSignUpPage';
import LoginButton from '@/shared/components/loginBtn';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const { handleEmailSignup, handleGoToSignIn } = useSignUpPage();

  return (
    <main className="relative min-h-[100svh] overflow-y-auto">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(100%_70%_at_50%_100%,#0b1d4a_0%,#091430_48%,#070f24_100%)]"
      />

      <section className="relative mx-auto w-full max-w-[480px] min-h-[100svh] px-5 py-4">
        <header className="pt-8 text-center">
          <h1 className="text-white text-[20px] font-semibold tracking-tight">
            별빛 계정 만들기
          </h1>
          <p className="mt-1 text-white/70 text-[13px]">
            밤하늘에 기록을 오래 담아둘 수 있어요
          </p>
        </header>

        <div
          className="flex flex-col items-center mt-6 rounded-[16px] border border-white/12
             bg-white/6 backdrop-blur px-5 pt-5 pb-6 text-center shadow-[0_12px_36px_rgba(7,17,40,0.35)]"
        >
          <LoginButton
            title={'이메일로 시작하기'}
            onClickEvent={handleEmailSignup}
            style="bg-[#1E2843] text-[#FBFBFB]"
          />

          {/* 구분선 */}
          <div className="relative w-full max-w-[360px] my-5">
            <div className="h-px bg-white/10" />
            <span
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2
                 px-3 text-white/60 text-[16px] bg-[#0b1d4a]/50 backdrop-blur-sm rounded-full"
            >
              or
            </span>
          </div>

          {/* SNS 로그인 (SocialLogin 컴포넌트) */}
          <div className="w-full max-w-[360px]">
            <SocialLogin />
          </div>

          {/* 로그인 안내 */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push('/auth/terms')}
              className="text-white/85 text-[13px] underline underline-offset-4 hover:text-white transition"
            >
              약관 동의 및 가입 시작하기
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
