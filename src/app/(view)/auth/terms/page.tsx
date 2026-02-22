'use client';

import { completeSignupAction } from '@/features/auth/actions/auth';
import ErrorModal from '@/features/common/ErrorModal';
import { createClient } from '@/utils/supabase/client';
import { Check } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

/* ─────────────────── 이용약관 ─────────────────── */
const TERMS_SECTIONS = [
  {
    id: 't1',
    title: '제1조 (목적)',
    content: `본 약관은 PAT PAT(이하 "서비스")이 제공하는 감정 기록 및 별자리 다이어리 서비스의 이용과 관련하여, 서비스와 이용자 사이의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.`,
  },
  {
    id: 't2',
    title: '제2조 (정의)',
    content: `① "서비스"란 PAT PAT이 운영하는 감정 일기 애플리케이션 및 관련 제반 서비스를 의미합니다.\n② "이용자"란 본 약관에 동의하고 서비스를 이용하는 회원을 의미합니다.\n③ "콘텐츠"란 이용자가 서비스 내에서 작성·업로드한 감정 일기, 태그, 이미지 등 일체의 데이터를 의미합니다.`,
  },
  {
    id: 't3',
    title: '제3조 (약관의 효력 및 변경)',
    content: `① 본 약관은 서비스 화면 게시 또는 이메일 등 기타 방법을 통해 이용자에게 공지함으로써 효력이 발생합니다.\n② 서비스는 관련 법령을 위반하지 않는 범위 내에서 본 약관을 개정할 수 있으며, 변경 시 최소 7일 전부터 공지합니다.`,
  },
  {
    id: 't4',
    title: '제4조 (회원가입 및 계정)',
    content: `① 이용자는 카카오, 구글 소셜 로그인 또는 이메일로 회원가입할 수 있습니다.\n② 이용자는 계정 정보를 타인에게 양도·공유할 수 없으며, 계정의 부정 사용으로 인한 책임은 해당 이용자에게 있습니다.\n③ 서비스는 다음 각 호에 해당하는 경우 가입을 거절할 수 있습니다.\n  · 타인의 정보를 도용한 경우\n  · 허위 정보를 기재한 경우\n  · 서비스 운영 정책에 위배되는 경우`,
  },
  {
    id: 't5',
    title: '제5조 (소셜 로그인)',
    content: `① 서비스는 카카오(Kakao)·구글(Google)·이메일 세 가지 방식의 로그인을 지원합니다.\n② 소셜 로그인 이용 시, 각 플랫폼(카카오, 구글)의 이용약관 및 개인정보 처리방침도 함께 적용됩니다.\n③ 소셜 계정 연동 해제 또는 탈퇴는 서비스 내 계정 설정에서 처리할 수 있습니다.`,
  },
  {
    id: 't6',
    title: '제6조 (서비스 이용)',
    content: `① 서비스는 연중무휴 24시간 제공을 원칙으로 합니다. 다만, 시스템 점검·장애 등으로 일시 중단될 수 있습니다.\n② 이용자는 다음 행위를 하여서는 안 됩니다.\n  · 타인의 개인정보를 수집·이용하는 행위\n  · 서비스의 정상적인 운영을 방해하는 행위\n  · 음란·폭력적인 콘텐츠를 게시하는 행위\n  · 관련 법령을 위반하는 행위`,
  },
  {
    id: 't7',
    title: '제7조 (콘텐츠의 권리)',
    content: `① 이용자가 작성한 콘텐츠의 저작권은 해당 이용자에게 귀속됩니다.\n② 서비스는 서비스 운영·개선 목적으로만 콘텐츠를 활용하며, 이 경우 이용자의 사전 동의를 구합니다.\n③ 탈퇴 시 해당 이용자의 콘텐츠는 즉시 삭제됩니다.`,
  },
  {
    id: 't8',
    title: '제8조 (면책 조항)',
    content: `① 서비스는 천재지변·전쟁·기타 불가항력적 사유로 인한 서비스 제공 불가에 대해 책임지지 않습니다.\n② 이용자의 귀책사유로 인한 서비스 이용 장애는 서비스가 책임을 지지 않습니다.`,
  },
  {
    id: 't9',
    title: '제9조 (준거법 및 관할법원)',
    content: `① 본 약관의 해석 및 분쟁에 대해서는 대한민국 법령을 적용합니다.\n② 분쟁 발생 시 서비스 본사 소재지를 관할하는 법원을 전속 관할법원으로 합니다.`,
  },
];

/* ─────────────────── 개인정보 처리방침 ─────────────────── */
const PRIVACY_SECTIONS = [
  {
    id: 'p1',
    title: '제1조 (수집하는 개인정보)',
    content: `PAT PAT은 서비스 제공을 위해 아래와 같이 개인정보를 수집합니다.\n\n■ 소셜 로그인 (카카오·구글)\n  · 이메일 주소, 프로필 닉네임, 소셜 계정 고유 식별자(ID)\n  · 소셜 로그인 최초 연동 시 수집\n\n■ 이메일 로그인\n  · 이메일 주소, 비밀번호(암호화 저장)\n  · 회원가입 시 수집\n\n■ 자동 생성·수집 정보\n  · 감정 일기 데이터(일시, 내용, 감정 태그)\n  · 서비스 이용 기록, 접속 로그, 기기 정보`,
  },
  {
    id: 'p2',
    title: '제2조 (수집·이용 목적)',
    content: `① 회원 식별 및 본인 확인\n② 서비스(감정 기록, 별자리 다이어리 등) 제공 및 개선\n③ 서비스 관련 공지사항 전달\n④ 부정 이용 방지 및 서비스 안정성 확보`,
  },
  {
    id: 'p3',
    title: '제3조 (보유·이용 기간)',
    content: `① 회원 탈퇴 시 수집된 개인정보는 즉시 파기됩니다.\n② 단, 관련 법령에 따라 아래와 같이 일정 기간 보관할 수 있습니다.\n  · 전자상거래법: 계약·청약 철회 기록 5년\n  · 통신비밀보호법: 서비스 이용 로그 3개월\n③ 감정 일기 데이터는 이용자 요청 즉시 삭제됩니다.`,
  },
  {
    id: 'p4',
    title: '제4조 (제3자 제공)',
    content: `원칙적으로 제3자에게 제공하지 않으며, 다음 경우에만 예외입니다.\n  · 이용자가 사전에 동의한 경우\n  · 법령에 의해 요구되는 경우\n\n■ 소셜 로그인 제공자\n  · 카카오코리아(주): 카카오 개인정보 처리방침 적용\n  · Google LLC: Google 개인정보 보호정책 적용`,
  },
  {
    id: 'p5',
    title: '제5조 (처리 위탁)',
    content: `수탁자: Supabase Inc.\n위탁 업무: 회원 인증·데이터 저장 및 관리\n보유 기간: 회원 탈퇴 또는 위탁 계약 종료 시까지`,
  },
  {
    id: 'p6',
    title: '제6조 (이용자의 권리)',
    content: `이용자는 언제든지 아래 권리를 행사할 수 있습니다.\n\n① 개인정보 열람 요청\n② 개인정보 수정·삭제 요청\n③ 개인정보 처리 정지 요청\n④ 서비스 탈퇴 (탈퇴 시 모든 데이터 즉시 삭제)\n\n앱 내 [설정 > 계정 관리] 또는 support@patpat.app으로 문의해 주세요.`,
  },
  {
    id: 'p7',
    title: '제7조 (개인정보의 파기)',
    content: `① 전자적 파일: 복원 불가한 방법으로 완전 삭제\n② 종이 문서: 분쇄 또는 소각\n③ 회원 탈퇴 시 별도 요청 없이 즉시 자동 파기됩니다.`,
  },
  {
    id: 'p8',
    title: '제8조 (보호책임자 및 변경)',
    content: `개인정보 문의: support@patpat.app (영업일 기준 3일 이내 답변)\n\n본 방침은 법령·정책 변경에 따라 개정될 수 있으며, 시행 7일 전 앱 내 공지를 통해 안내합니다.`,
  },
];

type Tab = 'terms' | 'privacy';

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
      <path
        d="M1 5l3.5 3.5L11 1"
        stroke="#050b1c"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200',
        checked
          ? 'bg-sky-400/90 border-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.35)]'
          : 'border-white/22 bg-white/5 hover:border-white/40',
      ].join(' ')}
    >
      {checked && <CheckIcon />}
    </button>
  );
}

export default function TermsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('terms');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();
  const pathname = usePathname();
  const canProceed = agreedTerms && agreedPrivacy && !isSubmitting;
  const allAgreed = agreedTerms && agreedPrivacy;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCompleteSignup = async () => {
    if (!canProceed) return;
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      const res = await completeSignupAction(fd);
      if (!res.ok) {
        setErrorMsg(res.message);
        console.log(res.message);
        setIsSubmitting(false);
        return;
      }

      // 성공 시 홈으로 이동
      router.push('/home');
    } catch (err: any) {
      console.error('completeSignupAction error:', err);
      setErrorMsg(err.message || '가입 처리 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  // const handleCompleteSignup = async () => {
  //   if (!canProceed) return;

  //   setIsSubmitting(true);
  //   try {
  //     // 1. 현재 세션 확인
  //     const {
  //       data: { user },
  //     } = await supabase.auth.getUser();

  //     if (!user) {
  //       router.push('/start');
  //       return;
  //     }

  //     // 2. 이미 가입된 유저인지 체크 (중복 방지)
  //     const { data: existingUser } = await supabase
  //       .from('users')
  //       .select('user_id')
  //       .eq('auth_user_id', user.id)
  //       .maybeSingle();

  //     if (existingUser) {
  //       router.push('/home');
  //       return;
  //     }

  //     // 3. DB에 유저 정보 삽입
  //     const provider = user.app_metadata?.provider as string;
  //     const nickname = user.user_metadata?.nickname || user.user_metadata?.name;

  //     const { error: insertErr } = await supabase.from('users').insert({
  //       auth_user_id: user.id,
  //       email: user.email,
  //       signup_method: provider || 'email', // provider가 없으면 이메일 가입으로 간주
  //       nickname: nickname || user.email?.split('@')[0],
  //     });

  //     if (insertErr) {
  //       console.error('Signup DB Error:', insertErr);
  //       alert('가입 처리 중 오류가 발생했습니다.');
  //       return;
  //     }

  //     // 4. 가입 완료 후 홈으로 이동
  //     router.push('/home');
  //   } catch (err) {
  //     console.error('Signup unexpected error:', err);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const sections = activeTab === 'terms' ? TERMS_SECTIONS : PRIVACY_SECTIONS;

  return (
    /* Fills the flex-1 space in AuthLayout, ensuring internal scroll works */
    <div className="flex-1 flex flex-col min-h-0 text-white relative">
      {/* 탭 바: 상단 고정 (Sticky within this container) */}
      <div className="shrink-0 z-20 border-b border-white/8 bg-[rgba(5,11,28,0.85)] backdrop-blur-md">
        <div className="flex w-full">
          {(['terms', 'privacy'] as Tab[]).map((tab) => {
            const label = tab === 'terms' ? '이용약관' : '개인정보 처리방침';
            const agreed = tab === 'terms' ? agreedTerms : agreedPrivacy;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={[
                  'relative flex flex-1 items-center justify-center gap-1.5 py-4 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'text-sky-300'
                    : 'text-white/40 hover:text-white/65',
                ].join(' ')}
              >
                {agreed && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-400/20 border border-sky-400/40">
                    <Check size={9} strokeWidth={3} className="text-sky-300" />
                  </span>
                )}
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-14 -translate-x-1/2 rounded-full bg-sky-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 내부 스크롤 콘텐츠 ── */}
      <div className="flex-1 overflow-y-auto scroll-hide">
        <div className="w-full px-5 pt-5 pb-5 space-y-3">
          {sections.map((s, idx) => (
            <section
              key={s.id}
              id={s.id}
              className="rounded-[16px] border border-white/8 bg-white/[0.04] px-5 py-5 shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(56,189,248,0.15)] border border-[rgba(56,189,248,0.2)] text-[11px] font-bold text-sky-300">
                  {idx + 1}
                </span>
                <h2 className="text-[14px] font-bold text-white/90">
                  {s.title}
                </h2>
              </div>
              <div className="mb-3 h-px bg-white/10" />
              <p className="whitespace-pre-line text-[13px] leading-[1.8] text-white/60">
                {s.content}
              </p>
            </section>
          ))}
          <div className="h-4" />
        </div>
      </div>

      {/* ── Fixed 하단 동의 바 ── */}
      <div className="shrink-0 border-t border-white/10 bg-[rgba(5,11,28,0.92)] backdrop-blur-2xl px-5 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="space-y-3">
          {/* 전체 동의 */}
          <div
            className={[
              'flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300 cursor-pointer',
              allAgreed
                ? 'bg-sky-400/10 border border-sky-400/20'
                : 'bg-white/5 border border-white/10',
            ].join(' ')}
            onClick={() => {
              setAgreedTerms(!allAgreed);
              setAgreedPrivacy(!allAgreed);
            }}
          >
            <Checkbox
              checked={allAgreed}
              onChange={(v) => {
                setAgreedTerms(v);
                setAgreedPrivacy(v);
              }}
            />
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-white/90">
                약관 전체 동의하기
              </span>
              <span className="text-[11px] text-white/40">
                필수 이용약관 및 개인정보 처리방침
              </span>
            </div>
          </div>

          {/* 개별 동의 2개 */}
          <div className="flex gap-3 px-1">
            {/* 이용약관 */}
            <div
              className="flex flex-1 items-center gap-2.5 cursor-pointer"
              onClick={() => setAgreedTerms(!agreedTerms)}
            >
              <div className="scale-90">
                <Checkbox checked={agreedTerms} onChange={setAgreedTerms} />
              </div>
              <span className="text-[12px] text-white/60 font-medium">
                이용약관 <span className="text-sky-300/60 ml-0.5">(필수)</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('terms');
                }}
                className="ml-auto text-[11px] text-white/30 underline underline-offset-2 hover:text-white/55 transition"
              >
                보기
              </button>
            </div>

            {/* 개인정보 처리방침 */}
            <div
              className="flex flex-1 items-center gap-2.5 cursor-pointer"
              onClick={() => setAgreedPrivacy(!agreedPrivacy)}
            >
              <div className="scale-90">
                <Checkbox checked={agreedPrivacy} onChange={setAgreedPrivacy} />
              </div>
              <span className="text-[12px] text-white/60 font-medium">
                개인정보 <span className="text-sky-300/60 ml-0.5">(필수)</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('privacy');
                }}
                className="ml-auto text-[11px] text-white/30 underline underline-offset-2 hover:text-white/55 transition"
              >
                보기
              </button>
            </div>
          </div>

          {/* CTA 버튼 */}
          <form
            action={handleCompleteSignup}
            className="flex-1 flex flex-col min-h-0"
          >
            <button
              disabled={!canProceed}
              className={[
                'relative w-full h-[54px] rounded-2xl text-[16px] font-bold tracking-tight',
                'flex items-center justify-center overflow-hidden transition-all duration-300',
                'active:scale-[0.98]',
                canProceed
                  ? 'bg-[linear-gradient(180deg,var(--cta-from)_0%,var(--cta-to)_100%)] border-white/14 text-white shadow-[0_12px_32px_rgba(0,0,0,0.3)] hover:brightness-110'
                  : 'bg-white/5 border border-white/5 text-white/20 cursor-not-allowed',
              ].join(' ')}
            >
              {canProceed && (
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent " />
              )}
              동의하고 시작하기
            </button>
          </form>
        </div>
      </div>
      {errorMsg && (
        <ErrorModal message={[errorMsg]} onClose={() => setErrorMsg(null)} />
      )}
    </div>
  );
}
