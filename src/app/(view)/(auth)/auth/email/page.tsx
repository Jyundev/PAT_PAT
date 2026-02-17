'use client';

import { useSignUp } from '@/features/auth/hooks/useSignUp';

export default function EmailSignupPage() {
  const {
    nickname,
    email,
    code,
    password,
    password2,
    nicknameChecking,
    nicknameAvailable,
    nicknameError,
    sendingOtp,
    otpSent,
    verifyingOtp,
    otpVerified,
    otpError,
    passwordError,
    password2Error,
    busy,
    setNickname,
    setEmail,
    setCode,
    checkNickname,
    sendOtp,
    verifyOtp,
    handlePasswordChange,
    handlePassword2Change,
    handleSubmit,
  } = useSignUp();

  // Base styles (톤/리듬 통일)
  const labelBase = 'block text-[13px] text-white/65 mb-1';
  const hintBase = 'mt-1 text-[12px] text-white/45';

  const inputBase =
    'w-full rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3 ' +
    'text-[15px] text-white/90 placeholder:text-white/35 outline-none transition ' +
    'focus:bg-white/[0.06] focus:border-sky-300/70 focus:ring-2 focus:ring-sky-300/18';

  // 보조 버튼(중복검사/전송/인증) = 작고 덜 강조
  const subButtonBase =
    'rounded-2xl px-3.5 py-2.5 text-[13px] whitespace-nowrap transition ' +
    'border border-white/10 bg-white/6 text-white/75 hover:bg-white/10 ' +
    'disabled:opacity-40 disabled:cursor-not-allowed';

  const canSubmit =
    !busy &&
    nickname.trim().length > 0 &&
    email.trim().length > 0 &&
    otpVerified &&
    !passwordError &&
    !password2Error &&
    password.trim().length > 0 &&
    password2.trim().length > 0;

  return (
    <div className="min-h-[100svh] flex justify-center px-5 pt-8 pb-[140px] overflow-y-auto">
      <div className="w-full max-w-[440px]">
        {/* 헤더: 왼쪽 정렬로 감성 + 여백 */}
        <h2 className="text-[22px] font-semibold text-white mb-2 tracking-[-0.02em]">
          별빛 계정 만들기
        </h2>
        <p className="text-[13px] text-white/55 mb-5 leading-relaxed">
          이메일 인증으로 계정을 생성하세요
        </p>

        {/* 폼 카드: 패널감 줄이기 */}
        <form
          id="email-signup-form"
          onSubmit={handleSubmit}
          className="
            space-y-5
            rounded-[22px]
            border border-white/8
            bg-white/5
            backdrop-blur
            p-6
            shadow-[0_10px_22px_rgba(6,19,42,0.28)]
          "
        >
          {/* 닉네임 */}
          <div>
            <label htmlFor="nickname" className={labelBase}>
              닉네임
            </label>

            <div className="flex gap-2">
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="별빛의 사용자 이름"
                maxLength={20}
                className={[
                  'flex-1',
                  inputBase,
                  nicknameAvailable === true
                    ? 'border-emerald-400/60'
                    : nicknameAvailable === false
                    ? 'border-rose-400/75'
                    : 'border-white/8',
                ].join(' ')}
              />

              <button
                type="button"
                onClick={checkNickname}
                disabled={nicknameChecking || !nickname.trim()}
                className={subButtonBase}
              >
                {nicknameChecking ? '확인중...' : '중복검사'}
              </button>
            </div>

            {nicknameError && (
              <p className="mt-1 text-xs text-rose-300">{nicknameError}</p>
            )}
            {nicknameAvailable === true && (
              <p className="mt-1 text-xs text-emerald-300">
                사용 가능한 닉네임입니다.
              </p>
            )}
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="email" className={labelBase}>
              이메일
            </label>

            <div className="flex gap-2">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={['flex-1', inputBase].join(' ')}
              />

              <button
                type="button"
                onClick={sendOtp}
                disabled={
                  sendingOtp || verifyingOtp || !email.trim() || otpVerified
                }
                className={subButtonBase}
              >
                {sendingOtp ? '발송중...' : otpVerified ? '완료' : '전송하기'}
              </button>
            </div>

            {otpSent && !otpVerified && (
              <p className="mt-1 text-xs text-sky-200/80">
                이메일로 발송된 인증번호를 입력해주세요.
              </p>
            )}
            {otpVerified && (
              <p className="mt-1 text-xs text-emerald-300">
                인증이 완료되었습니다.
              </p>
            )}
          </div>

          {/* 인증번호: 전송 전엔 숨김 (답답함 제거 핵심) */}
          {otpSent && !otpVerified && (
            <div>
              <label htmlFor="code" className={labelBase}>
                인증번호
              </label>

              <div className="flex gap-2">
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="인증번호 입력"
                  className={['flex-1', inputBase].join(' ')}
                />

                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={verifyingOtp || !code.trim()}
                  className={subButtonBase}
                >
                  {verifyingOtp ? '확인중...' : '인증하기'}
                </button>
              </div>

              {otpError && (
                <p className="mt-1 text-xs text-rose-300">{otpError}</p>
              )}
            </div>
          )}

          {/* 비밀번호 (리듬: 여기서 한 번 숨통) */}
          <div className="pt-2">
            <label htmlFor="password" className={labelBase}>
              비밀번호
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="영문 소문자 + 숫자 필수 (8자 이상)"
              className={[
                inputBase,
                passwordError ? 'border-rose-400/75' : 'border-white/8',
              ].join(' ')}
            />

            <p className={hintBase}>영문 소문자 + 숫자 필수, 기호 선택</p>

            {passwordError && (
              <p className="mt-1 text-xs text-rose-300">{passwordError}</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="password2" className={labelBase}>
              비밀번호 확인
            </label>

            <input
              id="password2"
              type="password"
              value={password2}
              onChange={(e) => handlePassword2Change(e.target.value)}
              placeholder="비밀번호 확인"
              className={[
                inputBase,
                password2Error ? 'border-rose-400/75' : 'border-white/8',
              ].join(' ')}
            />

            {password2Error && (
              <p className="mt-1 text-xs text-rose-300">{password2Error}</p>
            )}
          </div>
        </form>

        {/*  Sticky CTA: “그라운드(바닥판)” 제거 → 버튼만 떠 있게 */}
        <div
          className="fixed left-1/2 -translate-x-1/2 w-[92%] max-w-[420px]"
          style={{
            bottom: 'max(calc(env(safe-area-inset-bottom) + 12px), 18px)',
          }}
        >
          <button
            type="submit"
            form="email-signup-form"
            disabled={!canSubmit}
            className={[
              'w-full py-4 rounded-2xl text-[16px] font-semibold',
              'bg-[linear-gradient(180deg,var(--cta-from)_0%,var(--cta-to)_100%)] text-white',
              'border border-white/12 shadow-[0_10px_30px_rgba(0,0,0,0.25)]',
              'transition active:scale-[0.99]',
              !canSubmit
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:brightness-110',
            ].join(' ')}
          >
            {busy ? '처리 중...' : '생성하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
