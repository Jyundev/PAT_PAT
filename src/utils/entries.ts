"use client";

import { toDateString } from "@/lib/zodiac";
import { supabase } from "@/utils/supabase/client";

export type Entry = {
  date: string; // "YYYY-MM-DD"
  content: string;
  createdAt?: string;
  updatedAt?: string;
  diary_id?: number;
  diary_type?: "star" | "worry"; // 추가: diary_type
  tag_ids?: number[]; // 추가: 태그 ID 배열
};

/**
 * 날짜 범위의 글들을 로드
 */
export async function loadEntriesByRange(
  start: Date,
  end: Date
): Promise<Record<string, Entry>> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      console.error("User not authenticated");
      return {};
    }

    const startStr = toDateString(start);
    const endStr = toDateString(end);

    // diary 테이블에서 날짜 범위로 조회
    const { data: diaries, error } = await supabase
      .from("diary")
      .select("diary_id, content, entry_date, created_at, updated_at")
      .eq("auth_user_id", auth.user.id)
      .is("deleted_at", null)
      .gte("entry_date", startStr)
      .lte("entry_date", endStr)
      .order("entry_date", { ascending: true });

    if (error) {
      console.error("Failed to load entries:", error);
      return {};
    }

    // Record<dateString, Entry> 형태로 변환
    const result: Record<string, Entry> = {};
    diaries?.forEach((diary) => {
      const dateStr = diary.entry_date;
      result[dateStr] = {
        date: dateStr,
        content: diary.content || "",
        createdAt: diary.created_at,
        updatedAt: diary.updated_at,
        diary_id: diary.diary_id,
      };
    });

    return result;
  } catch (error) {
    console.error("Error loading entries:", error);
    return {};
  }
}

/**
 * 특정 날짜의 글 가져오기
 */
export async function getEntryByDate(
  dateString: string
): Promise<Entry | null> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return null;
    }

    // 해당 날짜의 일기 조회
    const { data: diaries, error } = await supabase
      .from("diary")
      .select("diary_id, content, entry_date, created_at, updated_at")
      .eq("auth_user_id", auth.user.id)
      .eq("entry_date", dateString)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("[getEntryByDate] Error:", error);
      return null;
    }

    if (!diaries || diaries.length === 0) {
      return null;
    }

    const diary = diaries[0];

    // 태그 가져오기
    const { data: diaryTags } = await supabase
      .from("diary_tags")
      .select("tag_id")
      .eq("diary_id", diary.diary_id);

    const tagIds = diaryTags?.map((dt) => dt.tag_id) || [];

    return {
      date: diary.entry_date,
      content: diary.content || "",
      createdAt: diary.created_at,
      updatedAt: diary.updated_at || undefined,
      diary_id: diary.diary_id,
      diary_type: "star" as const,
      tag_ids: tagIds,
    };
  } catch (error) {
    console.error("Error getting entry:", error);
    return null;
  }
}
