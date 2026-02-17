'use client';

import { useSignIn } from '@/features/auth/hooks/useSignIn';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const {
    email,
    password,
    loading,
    error,
    canSubmit,
    setEmail,
    setPassword,
    clearError,
    handleSubmit,
  } = useSignIn();

  const emailError = !!error && error.includes('이메일');
  const pwError = !!error && !error.includes('이메일');

  const inputBase =
    'w-full text-[16px] py-4 px-4 rounded-2xl border ' +
    'bg-white/5 text-white placeholder:text-white/40 outline-none transition ' +
    'focus:bg-white/6 focus:border-sky-300/70 focus:ring-2 focus:ring-sky-300/25';

  return (
    <main className="relative min-h-[100svh] overflow-y-auto">
      {/* AuthLayout에서 vignette/glow 처리한다면 여기 overlay는 빼도 됨.
          남기고 싶으면 “약하게”만: */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle_at_center,transparent_62%,rgba(0,0,0,0.22))',
        }}
      />

      <section className="relative mx-auto w-full max-w-[480px] min-h-[100svh] px-5 py-4">
        <header className="pt-8 text-center">
          <h1 className="text-white text-[20px] font-semibold tracking-tight">
            별빛 열기
          </h1>
          <p className="mt-1 text-white/70 text-[13px]">기록을 다시 이어가요</p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="
            mt-6 flex flex-col gap-4 p-5
            rounded-2xl border border-white/10
            bg-white/6 backdrop-blur
            shadow-[0_10px_30px_rgba(6,19,42,0.45)]
          "
        >
          {/* 이메일 입력 */}
          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              className={[
                inputBase,
                emailError
                  ? 'border-rose-400/80 focus:border-rose-300 focus:ring-rose-300/20'
                  : 'border-white/10',
              ].join(' ')}
            />
            {emailError && (
              <p className="mt-1 text-xs text-rose-300">{error}</p>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              className={[
                inputBase,
                pwError
                  ? 'border-rose-400/80 focus:border-rose-300 focus:ring-rose-300/20'
                  : 'border-white/10',
              ].join(' ')}
            />
            {pwError && <p className="mt-1 text-xs text-rose-300">{error}</p>}
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={[
              'w-full py-4 rounded-2xl text-[16px] font-semibold',
              'flex items-center justify-center gap-2 transition active:scale-[0.99]',
              'border border-white/14',
              'bg-[linear-gradient(180deg,var(--cta-from)_0%,var(--cta-to)_100%)] text-white',
              canSubmit
                ? 'hover:brightness-110'
                : 'opacity-40 cursor-not-allowed',
            ].join(' ')}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push('/auth/email')}
              className="text-white/85 text-[13px] underline underline-offset-4 hover:text-white transition"
            >
              계정이 없나요? 이메일로 가입하기
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
