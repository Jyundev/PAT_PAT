type TEmotion = {
  polarity: string;
  emotion: string;
  emotion_ko: string;
};

type TTag = {
  tag_id: string;
  tag_name: string;
};

type Journal = {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  tags?: string[];
  pinned?: boolean;
};

type TDiaryItem = {
  content: string;
  created_at: string;
  diary_id: string;
  emotion_intensity: 3;
  emotion_polarity: number;
  entry_date: string;
  tags: TTag[];
  updated_at: string;
};

type UpsertDiaryInput = {
  entry_date?: string;
  diary_id?: string;
  polarity: 'POSITIVE' | 'NEGATIVE' | 'UNSET';
  content: string;
  intensity: number;
  tag_ids?: string[]; // uuid[]
};

type UpsertDiaryData = {
  ok: true;
  auth_user_id: string;
  period_id: string;
  diary_id: string;
  star_id: string;
  polarity: 'POSITIVE' | 'NEGATIVE' | 'UNSET';
  tag_count: number;
};
