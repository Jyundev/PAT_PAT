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

type CreateDiaryInput = {
  entry_date: string;
  polarity: 'POSITIVE' | 'NEGATIVE' | 'UNSET';
  content: string;
  intensity: number;
  tag_ids?: string[]; // uuid[]
};

type CreateDiaryData = unknown; // rpc 리턴 타입 알면 구체화

type CreateDiaryError = {
  message: string;
  code: 'UNAUTHORIZED' | 'RPC_ERROR' | 'INTERNAL_ERROR';
  requestId: string;
};
