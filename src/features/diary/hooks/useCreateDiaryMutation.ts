'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { unwrap, ActionError } from '@/lib/result/result';
import { createDiaryAction } from '../actions/diary';
// import { diariesKeys } from "@/features/diary/queries/diaries";

export function useCreateDiaryMutation() {
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDiaryInput) => {
      const res = await createDiaryAction(input);
      return unwrap(res); //  ok=false면 throw
    },

    onSuccess: async () => {
      router.replace('/starLoad');
    },

    onError: (err) => {
      // 여기서 전역 토스트/로깅 붙이기 좋음
      if (err instanceof ActionError) {
        // err.payload 안에 code/requestId/message 있음
        // console.log(err.payload);
      }
    },
  });
}
