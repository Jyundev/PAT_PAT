'use client';

import { useRouter } from 'next/navigation';

interface ErrorModalProps {
  message: string | string[]; // 배열과 문자열 모두 대응 가능하게 개선
  url: string;
}

export default function ErrorModal({ message, url }: ErrorModalProps) {
  const router = useRouter();

  // 메시지가 배열로 들어올 경우 첫 번째 항목을 사용하거나 조인
  const displayMessage = Array.isArray(message) ? message[0] : message;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[400px] rounded-t-3xl bg-[#1E2843] p-8 shadow-2xl sm:rounded-3xl animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 text-4xl animate-bounce">😿</div>
          <h3 className="mb-2 text-xl font-bold text-white">
            앗, 문제가 생겼어요
          </h3>
          <p className="mb-6 text-[#A6A6A6] text-sm leading-relaxed whitespace-pre-line">
            {displayMessage || '알 수 없는 오류가 발생했습니다.'}
            <br />
            다시 한 번 시도해 주시겠어요?
          </p>
          <button
            onClick={() => router.replace(url)} // 쿼리 파라미터가 없는 원래 URL로 교체하여 모달 닫기
            className="w-full rounded-full bg-[#FEE300] py-4 font-bold text-[#353C3B] hover:bg-[#F0D500] active:scale-[0.98] transition-all"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
