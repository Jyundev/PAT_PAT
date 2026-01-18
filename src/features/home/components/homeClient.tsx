'use client';

import { useHomeSummary } from '@/features/home/hooks/useHomeSummary';
import GlassCard from '@/shared/components/glassCard';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import HomeSkeleton from './homeSkeleton';
import Pill from './pill';
import PrimaryButton from './primaryButton';
import SecondaryButton from './secondaryButton';
import { ErrorModal } from '@/features/common/BaseModal';

function pct(value: number, max: number) {
  const v = Math.max(0, Math.min(max, value));
  return (v / max) * 100;
}
function getTimeMessage(hour: number) {
  if (hour >= 5 && hour < 11) return '오늘이 천천히 시작되고 있어요.';
  if (hour >= 11 && hour < 17) return '오늘이 차분히 흘러가고 있어요.';
  if (hour >= 17 && hour < 22) return '오늘이 정리되는 시간이에요.';
  return '오늘이 조용히 마무리되고 있어요.';
}

export default function HomeClient() {
  const { data: result, isPending, isError, error } = useHomeSummary();

  const router = useRouter();

  const headerTitle = `${result?.profile?.nickname ?? '사용자'} 님,`;
  const headerSubtitle = '오늘을 한 줄로 정리해볼까요?';

  const todayTitle = useMemo(() => {
    return result?.starCount
      ? '오늘은 조용히 남겨졌어요'
      : '오늘은 아직 기록이 없어요';
  }, [result?.starCount]);

  const todayDesc = useMemo(() => {
    return result?.starCount
      ? `별이 생성됐어요.`
      : '하루가 지나가기 전, 한 줄을 남길 수 있어요.';
  }, [result?.starCount]);

  const todaySkyLabel = useMemo(() => {
    return result?.starCount ? '오늘의 하늘 · 빛남' : '오늘의 하늘 · 고요함';
  }, [result?.starCount]);

  if (isPending) {
    return <HomeSkeleton />;
  }

  return (
    <div className="relative min-h-[100svh] overflow-y-auto">
      {/* 배경 */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_800px_at_50%_-10%,rgba(70,120,255,0.22),transparent_60%),radial-gradient(900px_600px_at_80%_40%,rgba(130,70,255,0.14),transparent_60%),linear-gradient(180deg,#07102a_0%,#050b1c_100%)]" />

      <section className="relative mx-auto w-full max-w-[480px] px-5 pb-[120px]">
        {/* 헤더 */}
        <header className="pt-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-white text-[28px] font-semibold tracking-[-0.02em]">
                {headerTitle}
              </div>
              <div className="mt-2 text-white/85 text-[18px] leading-snug">
                {headerSubtitle}
              </div>

              <div className="mt-4 flex items-center gap-2">
                {/* <Pill>⭐ Star {starCount}</Pill> */}
                <Pill>{todaySkyLabel}</Pill>
              </div>
            </div>

            <img
              src="/images/icon/lumi/lumi_main.svg"
              alt="루미"
              className="w-16 h-16 object-contain"
            />
          </div>
        </header>

        {/* (1) 오늘 상태 */}
        <div className="mt-6">
          <GlassCard className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-white text-[16px] font-semibold">
                  {todayTitle}
                </div>
                <div className="mt-1 text-white/70 text-[13px] leading-snug">
                  {todayDesc}
                </div>
                <div className="mt-3 text-white/55 text-[12px]">
                  {getTimeMessage(new Date().getHours())}
                </div>
              </div>

              <div className="w-10 h-10 rounded-2xl border border-white/10 bg-white/4 flex items-center justify-center text-white/60 text-[12px]">
                ✦
              </div>
            </div>
          </GlassCard>
        </div>

        {/* (2) 메인 CTA */}
        <div className="mt-4">
          <PrimaryButton
            onClick={() =>
              router.push(`/diary/editor?diaryId=${result?.diaryId}`)
            }
          >
            {result?.isDiary ? '오늘 기록 수정하기' : '한 줄이면 충분해요'}
          </PrimaryButton>
        </div>

        {/* (3) 주간 요약 */}
        <div className="mt-6">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-white/90 text-[15px] font-semibold">
                이번 주 돌아보기
              </div>
              <button
                onClick={() => router.push('/stats')}
                className="h-9 rounded-xl px-3 text-[13px] text-white/80 bg-white/6 border border-white/12 hover:bg-white/10 transition"
              >
                자세히
              </button>
            </div>

            <div className="mt-3 text-white/70 text-[13px] leading-snug">
              {result?.starCount
                ? `이번 주에 별 ${result?.starCount}개가 남겨졌어요`
                : '이번 주는 아직 기록이 없어요'}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[12px] text-white/55">
                <span>기록한 날</span>
                <span>{result?.diaryCount ?? 0}/7</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/40"
                  style={{ width: `${pct(result?.diaryCount ?? 0, 7)}%` }}
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* (4) 보조 바로가기 */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <SecondaryButton onClick={() => router.push('/diary-archive')}>
            기록 모아보기
          </SecondaryButton>
          <SecondaryButton onClick={() => router.push('/starLoad')}>
            별자리 보기
          </SecondaryButton>
        </div>
        <ErrorModal open={isError} title={error?.message} onClose={() => {}} />
      </section>
    </div>
  );
}
