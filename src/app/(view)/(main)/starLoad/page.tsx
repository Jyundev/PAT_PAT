'use client';

import {
  displayDate,
  getZodiacBackgroundImage,
  getZodiacNameKo,
  getZodiacSeasonRange,
  getZodiacSign,
  loadTemplates,
  toDateString,
  type Pt,
} from '@/lib/zodiac';
import ConstellationSvg from '@/shared/components/ConstellationSvg';
import EntryModal from '@/shared/components/EntryModal';
import { Entry, getEntryByDate, loadEntriesByRange } from '@/utils/entries';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function Page() {
  const router = useRouter();
  const today = new Date();
  const todayStr = toDateString(today);

  // 별자리 계산
  const sign = useMemo(() => getZodiacSign(today), []);
  const seasonRange = useMemo(() => getZodiacSeasonRange(today, sign), [sign]);
  const zodiacName = getZodiacNameKo(sign);
  const zodiacBgImage = useMemo(() => getZodiacBackgroundImage(sign), [sign]);

  // 개발 환경에서만 디버깅 로그
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[starLoad] Sign:', sign);
      console.log('[starLoad] Background image:', zodiacBgImage);
      console.log('[starLoad] Season range:', seasonRange.daysCount, 'days');
    }
  }, [sign, seasonRange, zodiacBgImage]);

  // 앵커 포인트 (별자리 템플릿에서 가져오기)
  const [anchorPoints, setAnchorPoints] = useState<Pt[]>([
    { x: 120, y: 420 },
    { x: 220, y: 350 },
    { x: 320, y: 380 },
    { x: 420, y: 300 },
    { x: 520, y: 260 },
    { x: 650, y: 310 },
    { x: 760, y: 240 },
    { x: 880, y: 300 },
  ]);

  // 별자리 템플릿에서 앵커 포인트 로드
  useEffect(() => {
    const loadAnchorPoints = async () => {
      try {
        const templates = await loadTemplates();
        console.log('[starLoad] Loaded templates:', templates.length);

        // API는 star_code를 사용하지만 타입은 zodiac_code를 기대
        const template = templates.find(
          (t: any) => t.zodiac_code === sign || t.star_code === sign
        );

        console.log('[starLoad] Found template for', sign, ':', template);

        if (template && template.points && template.points.length > 0) {
          // path_index가 있으면 사용, 없으면 points 직접 사용
          const path = template.path_index
            ? template.path_index.map((i: number) => template.points[i])
            : template.points;
          console.log(
            '[starLoad] Anchor points:',
            path.length,
            path.slice(0, 3)
          );
          setAnchorPoints(path);
        } else {
          console.warn('[starLoad] Template not found or no points');
        }
      } catch (error) {
        console.error('Failed to load zodiac template:', error);
        // 기본값 유지
      }
    };

    loadAnchorPoints();
  }, [sign]);

  // 상태
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 글 로드
  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true);
      try {
        const loaded = await loadEntriesByRange(
          seasonRange.start,
          seasonRange.end
        );
        setEntries(loaded);
      } catch (error) {
        console.error('Failed to load entries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [seasonRange]);

  // 별 클릭 핸들러
  const handleStarClick = useCallback(
    async (date: string, index: number) => {
      setSelectedDate(date);
      const entry = entries[date] || (await getEntryByDate(date));
      setSelectedEntry(entry);
      setIsModalOpen(true);
    },
    [entries]
  );

  // 모달 닫기
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedEntry(null);
  }, []);

  // 수정하기 (글 작성 페이지로 이동)
  const handleEdit = useCallback(() => {
    if (selectedDate) {
      router.push(`/diary/editor?date=${selectedDate}`);
    } else {
      router.push('/diary/editor');
    }
  }, [selectedDate, router]);

  // 진행도 계산
  const progressCount = useMemo(() => {
    return Object.keys(entries).length;
  }, [entries]);

  // 날짜 범위 표시
  const rangeDisplay = useMemo(() => {
    return `${displayDate(seasonRange.start)} ~ ${displayDate(
      seasonRange.end
    )}`;
  }, [seasonRange]);

  return (
    <main className="min-h-[100svh] text-white">
      {/* 배경 */}
      <div className="fixed inset-0 -z-10 bg-space">
        {/* 오버레이 효과들 */}
        <div className="nebula nebula-a opacity-30" />
        <div className="nebula nebula-b opacity-30" />
        <div className="nebula nebula-c opacity-30" />
        <div className="starfield opacity-20" />
        <div className="vignette opacity-30" />
      </div>

      <section className="mx-auto w-full max-w-[480px] px-5 pt-5 pb-28">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <button
            className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition"
            aria-label="뒤로"
            onClick={() => router.back()}
          >
            ←
          </button>

          <div className="text-center">
            <div className="text-[16px] font-semibold tracking-[-0.01em]">
              {zodiacName}
            </div>
            <div className="text-[12px] text-white/65">{rangeDisplay}</div>
          </div>

          <button
            className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition"
            aria-label="정보"
          >
            i
          </button>
        </header>

        {/* Progress row */}
        <div className="mt-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <span className="chip">이달의 별자리</span>
            <span className="chip chip-soft">
              {today.toLocaleDateString('ko-KR')}
            </span>
          </div>

          <span className="chip chip-glow">
            진행 {progressCount}/{seasonRange.daysCount}
          </span>
        </div>

        {/* Hero constellation card */}
        <div className="mt-4 hero-card">
          <div className="hero-halo" />
          <div className="hero-inner p-4 min-h-[300px] relative">
            {/* 기본 배경 이미지 */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage: 'url(/images/bg/zodiac_bg/starLoad_bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
              aria-hidden="true"
            />

            {/* 별자리 배경 이미지 - SVG와 같은 영역에 배치 */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: `url(${zodiacBgImage})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
              aria-hidden="true"
            />

            {/* SVG 레이어 */}
            <div className="relative z-10">
              {loading ? (
                <div className="text-white/60 text-sm text-center py-8">
                  별자리 로딩 중…
                </div>
              ) : seasonRange.daysCount === 0 ? (
                <div className="text-white/60 text-sm text-center py-8">
                  별자리 데이터를 불러올 수 없습니다.
                  <br />
                  <span className="text-xs">
                    daysCount: {seasonRange.daysCount}
                  </span>
                </div>
              ) : anchorPoints.length === 0 ? (
                <div className="text-white/60 text-sm text-center py-8">
                  앵커 포인트를 불러올 수 없습니다.
                </div>
              ) : (
                <ConstellationSvg
                  anchorPoints={anchorPoints}
                  daysCount={seasonRange.daysCount}
                  entries={entries}
                  dates={seasonRange.dates}
                  todayDate={todayStr}
                  onStarClick={handleStarClick}
                />
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-5">
          <button
            className="cta w-full"
            onClick={() => router.push('/diary/editor')}
          >
            오늘의 별 만들기
            <span className="cta-shimmer" aria-hidden />
          </button>
        </div>
      </section>

      {/* Entry Modal */}
      <EntryModal
        isOpen={isModalOpen}
        date={selectedDate}
        entry={selectedEntry}
        onClose={handleCloseModal}
        onEdit={handleEdit}
      />
    </main>
  );
}
