'use client';

import { homeKeys } from '@/features/home/queries/summary,';
import { ActionError, unwrap } from '@/lib/result/result';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createDiaryAction } from '../actions/create';
import { updateDiaryAction } from '../actions/update';
import { diaryKeys } from '../queries/diaries';

type UpsertInput = UpsertDiaryInput;

export function useUpsertDiaryMutation({ diary_id }: { diary_id?: string }) {
  const router = useRouter();
  const qc = useQueryClient();

  const mode = diary_id ? 'update' : 'create';

  return useMutation({
    mutationKey: ['diary', mode, diary_id ?? 'new'],

    mutationFn: async (input: UpsertInput) => {
      const res = diary_id
        ? await updateDiaryAction({ diary_id, ...input })
        : await createDiaryAction(input);

      return unwrap(res);
    },

    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: homeKeys.all });
      await qc.invalidateQueries({ queryKey: diaryKeys.all });

      router.replace('/starLoad');
    },

    onError: (err) => {
      if (err instanceof ActionError) {
        console.error(err.payload.message);
        return;
      }
      console.error(err);
    },
  });
}
