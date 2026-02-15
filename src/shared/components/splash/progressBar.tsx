import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function SmoothProgress() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  // 더 완만한 easing
  const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

  useEffect(() => {
    const DURATION = 5000;
    const start = performance.now();

    const loop = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / DURATION, 1);
      const eased = easeInOutSine(t);
      const percent = eased * 100;

      setProgress(percent);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        setProgress(100); // 깔끔하게 마무리

        setTimeout(() => {
          router.replace('/start');
        }, 500);
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [router]);

  return (
    <div className="relative w-[260px] h-10 flex items-center justify-center">
      {/* 1. 진행 바 레일 (부모 기준점) */}
      <div className="relative w-full h-1 bg-white/10 rounded-full">
        {/* 2. 채워지는 바 (잔상 효과) */}
        <div
          className="h-full bg-gradient-to-r from-transparent via-indigo-500/40 to-white"
          style={{ width: `${progress}%` }}
        />

        {/* 3. 별 광원 유닛 (이동의 주인공) */}
        <div
          className="absolute top-1/2 flex items-center justify-center" // transition-all 삭제!
          style={{
            left: `${progress}%`,
            transform: 'translate(-50%, -50%)',
            opacity: progress > 97 ? 0 : 1,
          }}
        >
          {/* 외부 후광 */}
          <div className="absolute w-14 h-14 bg-yellow-200/10 blur-xl rounded-full" />
          {/* 핵심 광원 */}
          <div className="absolute w-6 h-6 bg-white/40 blur-md rounded-full" />

          {/* [이미지 7번 보정] 수평 렌즈 플레어 */}
          <div className="absolute w-20 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

          {/* 실제 별 이미지 */}
          <img
            src="/images/icon/menu/star.svg"
            alt="star"
            className="relative w-7 h-7 select-none z-10"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(255, 255, 200, 0.9))',
              transform: `rotate(${progress * 5}deg)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
