'use client';

import { ErrorModal } from '@/features/common/BaseModal';
import GlassCard from '@/shared/components/glassCard';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useCreateDiaryMutation } from '../hooks/useCreateDiaryMutation';
import { useTags } from '../hooks/useTags';

type Polarity = 'POSITIVE' | 'NEGATIVE' | 'UNSET';

const POLARITIES: Array<{
  key: Polarity;
  label: string;
}> = [
  { key: 'POSITIVE', label: '괜찮았어요' },
  { key: 'NEGATIVE', label: '버거웠어요' },
];

const LIMIT = 200;
const MAX_TAGS = 3;

function intensityLabel(v: number) {
  if (v <= 2) return '잔잔한 편이에요';
  if (v === 3) return '조금 남아 있어요';
  return '꽤 크게 남아 있어요';
}

function clampTags(next: string[]) {
  return Array.from(new Set(next)).slice(0, MAX_TAGS);
}

export default function DiaryWrite() {
  const { data: tags, isPending } = useTags();
  const { mutate, isPending: diaryPending, error } = useCreateDiaryMutation();

  const router = useRouter();

  const [polarity, setPolarity] = useState<Polarity>('UNSET');
  const [intensity, setIntensity] = useState<number>(3);
  const [text, setText] = useState('');
  const [tagOpen, setTagOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  //  error는 "진짜 실패"만 들어옴 (ok=false 포함)
  const errorMessage =
    error instanceof Error ? error.message : '에러가 발생했습니다.';

  const canSubmit = useMemo(() => {
    return text.trim().length > 0 && polarity && !diaryPending;
  }, [text, polarity, diaryPending]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => {
      const exists = prev.includes(tagId);
      return exists
        ? prev.filter((t) => t !== tagId)
        : clampTags([...prev, tagId]);
    });
  };

  const submit = () => {
    if (!canSubmit) return;

    mutate({
      entry_date: new Date().toISOString().slice(0, 10),
      polarity,
      content: text,
      intensity,
      tag_ids: selectedTags,
    });
  };

  useEffect(() => {
    setIsError(!!error);
  }, [error]);

  return (
    <div className="relative min-h-[100svh] overflow-y-auto">
      {/* 배경 */}
      <div
        className="pointer-events-none absolute inset-0 -z-10
        bg-[linear-gradient(180deg,#07102a_0%,#050b1c_100%)]"
      />

      {
        <section className="mx-auto max-w-[480px] px-5 pb-[120px]">
          {/* 헤더 */}
          <header className="pt-6 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="rounded-lg px-3 h-9 text-white/80
                       bg-white/6 border border-white/10"
            >
              ←
            </button>
            <h1 className="text-white text-[18px] font-semibold">
              오늘 정리하기
            </h1>
            <span className="w-9" />
          </header>

          {/* 안내 */}
          <div className="mt-4">
            <GlassCard className="p-4 relative overflow-hidden">
              {/* 은은한 별빛 */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.22]
      bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.35)_0,transparent_48%),
          radial-gradient(circle_at_70%_60%,rgba(56,189,248,0.18)_0,transparent_52%)]"
              />

              <div className="relative flex items-center gap-3">
                <img
                  src="/images/icon/lumi/lumi_main.svg"
                  alt="루미"
                  className="w-10 h-10 object-contain"
                />

                <div className="min-w-0">
                  <p className="text-white/90 text-[14px] font-medium">
                    {polarity
                      ? polarity === 'POSITIVE'
                        ? '좋았던 건 더 선명해져요.'
                        : '무거웠던 건 가볍게 정리해도 돼요.'
                      : '오늘도 여기까지 왔어요.'}
                  </p>
                  <p className="mt-0.5 text-white/55 text-[12.5px]">
                    {text.trim().length === 0
                      ? '한 문장만 남겨도 충분해요.'
                      : text.length > 150
                        ? '천천히 써도 괜찮아요.'
                        : '짧아도 좋아요.'}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* 상태 선택 */}
          <div className="mt-4">
            <GlassCard className="p-4">
              <p className="text-white/85 text-[14px] mb-3">이 하루는</p>
              <div className="grid grid-cols-2 gap-3">
                {POLARITIES.map((p) => {
                  const selected = polarity === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setPolarity(p.key)}
                      className={[
                        'h-12 rounded-xl border text-[15px] transition',
                        selected
                          ? 'bg-white/15 border-white/40 text-white shadow-[0_0_0_4px_rgba(56,189,248,0.10)]'
                          : 'bg-white/5 border-white/10 text-white/65 hover:bg-white/8',
                      ].join(' ')}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* 강도 */}
          <div className="mt-4">
            <GlassCard className="p-4">
              <p className="text-white/85 text-[14px] mb-1">지금 이 하루는</p>
              <p className="text-white/55 text-[13px] mb-3">
                {intensityLabel(intensity)}
              </p>

              <input
                type="range"
                min={1}
                max={5}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full slider-star"
              />
            </GlassCard>
          </div>

          {/* 기록 */}
          <div className="mt-4">
            <GlassCard className="p-4">
              <p className="text-white/85 text-[14px] mb-3">
                오늘을 한 줄로 남겨보세요
              </p>

              <textarea
                maxLength={LIMIT}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="짧아도 괜찮아요"
                className="
                w-full h-32 resize-none rounded-xl p-3
                bg-white/4 border border-white/10
                text-[15px] text-white/90
                placeholder:text-white/40
                focus:outline-none
                focus:ring-0
                focus:border-white/20 focus:bg-white/6
                transition
"
              />

              <div className="mt-2 flex justify-between text-[12px] text-white/50">
                <span>이 기록은 하나의 별이 됩니다</span>
                <span>
                  {text.length}/{LIMIT}
                </span>
              </div>

              {/* 태그 (선택) */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setTagOpen((v) => !v)}
                  className="w-full flex justify-between items-center
                           rounded-xl border border-white/10 bg-white/4
                           px-3 py-2 text-[13px] text-white/70"
                >
                  분류하고 싶다면 (선택)
                  <span>{tagOpen ? '▴' : '▾'}</span>
                </button>

                {tagOpen && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags?.map((tag: TTag) => {
                      const selected = selectedTags.includes(tag.tag_id);
                      return (
                        <button
                          key={tag.tag_id}
                          onClick={() => toggleTag(tag.tag_id)}
                          className={[
                            'px-2.5 py-1 rounded-full text-[12px] border',
                            selected
                              ? 'bg-white/15 border-white/40 text-white'
                              : 'bg-white/6 border-white/10 text-white/70',
                          ].join(' ')}
                        >
                          #{tag.tag_name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* 하단 CTA */}
          <div
            className="fixed left-1/2 -translate-x-1/2 w-[92%] max-w-[420px]"
            style={{
              bottom: 'max(calc(env(safe-area-inset-bottom) + 10px), 18px)',
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.back()}
                className="h-12 rounded-[12px]
                         text-[14px] text-white/80
                         bg-white/6 border border-white/12"
              >
                취소
              </button>

              <button
                disabled={!canSubmit}
                onClick={submit}
                className={[
                  'h-12 rounded-[12px] text-[15px] font-semibold text-white',
                  'bg-[linear-gradient(180deg,#18326f_0%,#0b1d4a_100%)]',
                  'border border-white/14',
                  canSubmit ? '' : 'opacity-40',
                ].join(' ')}
              >
                오늘 정리하기
              </button>
            </div>
          </div>
        </section>
      }
      <ErrorModal
        open={isError}
        onClose={() => setIsError(false)}
        title={'Error'}
        description={errorMessage}
      />
    </div>
  );
}
