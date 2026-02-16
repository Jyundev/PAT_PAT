// app/lib/zodiac.ts
export type Pt = { x: number; y: number };

export type ZodiacTemplate = {
  zodiac_code?: string; // API에서는 star_code 사용
  star_code?: string; // API 응답 형식
  name_ko: string;
  start_mmdd?: string; // API에서는 start_day 사용
  start_day?: string; // API 응답 형식
  end_mmdd?: string; // API에서는 end_day 사용
  end_day?: string; // API 응답 형식
  primary_month?: string;
  points: Pt[];
  path_index?: number[]; // 없으면 [0..points.length-1]
  edges?: [number, number][];
};

export async function loadTemplates(): Promise<ZodiacTemplate[]> {
  const res = await fetch("/api/star", { cache: "no-store" });
  if (!res.ok) throw new Error("failed to load starAPI");
  const data = await res.json();

  // API 응답을 ZodiacTemplate 형식으로 변환
  return data.map((item: any) => ({
    zodiac_code: item.star_code || item.zodiac_code,
    star_code: item.star_code,
    name_ko: item.name_ko,
    start_mmdd: item.start_day || item.start_mmdd,
    start_day: item.start_day,
    end_mmdd: item.end_day || item.end_mmdd,
    end_day: item.end_day,
    primary_month: item.primary_month,
    points: item.points || [],
    path_index: item.path_index,
    edges: item.edges,
  }));
}

export function inRange(mmdd: string, start: string, end: string) {
  return start <= end
    ? mmdd >= start && mmdd <= end
    : mmdd >= start || mmdd <= end;
}

export function resolveZodiacByDate(date: Date, list: ZodiacTemplate[]) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const mmdd = `${mm}-${dd}`;
  return list.find((z) => {
    const start = z.start_mmdd || z.start_day || "";
    const end = z.end_mmdd || z.end_day || "";
    return inRange(mmdd, start, end);
  }) ?? list[0];
}

/* ---------- polyline sampling ---------- */
function buildMeta(points: Pt[]) {
  const seg: number[] = [];
  const acc: number[] = [0];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const L = Math.hypot(dx, dy);
    seg.push(L);
    total += L;
    acc.push(total);
  }
  return { seg, acc, total };
}

function sampleAt(points: Pt[], seg: number[], acc: number[], s: number): Pt {
  let i = 0;
  while (i < seg.length && acc[i + 1] < s) i++;
  if (i >= seg.length) return points[points.length - 1];
  const t = seg[i] === 0 ? 0 : (s - acc[i]) / seg[i];
  return {
    x: points[i].x + (points[i + 1].x - points[i].x) * t,
    y: points[i].y + (points[i + 1].y - points[i].y) * t,
  };
}

export function samplePolyline(
  points: Pt[] | undefined | null,
  N: number
): Pt[] {
  if (!points || points.length === 0) {
    return Array.from({ length: Math.max(0, N) }, () => ({ x: 0, y: 0 }));
  }
  if (points.length < 2 || N <= 1) {
    const first = points[0] ?? { x: 0, y: 0 };
    return Array.from({ length: Math.max(0, N) }, () => first);
  }
  const { seg, acc, total } = buildMeta(points);
  return Array.from({ length: N }, (_, k) =>
    sampleAt(points, seg, acc, total * (k / Math.max(1, N - 1)))
  );
}

export function daysInMonth(year: number, month1to12: number) {
  return new Date(year, month1to12, 0).getDate();
}

/* ---------- 별자리 시즌 계산 (요구사항) ---------- */
export type ZodiacSign =
  | "capricorn"
  | "aquarius"
  | "pisces"
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius";

export type ZodiacSeasonRange = {
  start: Date;
  end: Date;
  daysCount: number;
  dates: string[]; // "YYYY-MM-DD" 형식
};

// 별자리 정의 (MM-DD 형식)
const ZODIAC_DEFINITIONS: Record<
  ZodiacSign,
  { name_ko: string; start_mmdd: string; end_mmdd: string }
> = {
  capricorn: { name_ko: "염소자리", start_mmdd: "12-22", end_mmdd: "01-19" },
  aquarius: { name_ko: "물병자리", start_mmdd: "01-20", end_mmdd: "02-18" },
  pisces: { name_ko: "물고기자리", start_mmdd: "02-19", end_mmdd: "03-20" },
  aries: { name_ko: "양자리", start_mmdd: "03-21", end_mmdd: "04-19" },
  taurus: { name_ko: "황소자리", start_mmdd: "04-20", end_mmdd: "05-20" },
  gemini: { name_ko: "쌍둥이자리", start_mmdd: "05-21", end_mmdd: "06-21" },
  cancer: { name_ko: "게자리", start_mmdd: "06-22", end_mmdd: "07-22" },
  leo: { name_ko: "사자자리", start_mmdd: "07-23", end_mmdd: "08-22" },
  virgo: { name_ko: "처녀자리", start_mmdd: "08-23", end_mmdd: "09-22" },
  libra: { name_ko: "천칭자리", start_mmdd: "09-23", end_mmdd: "10-22" },
  scorpio: { name_ko: "전갈자리", start_mmdd: "10-23", end_mmdd: "11-21" },
  sagittarius: { name_ko: "사수자리", start_mmdd: "11-22", end_mmdd: "12-21" },
};

/**
 * 날짜 기준으로 별자리를 반환
 */
export function getZodiacSign(date: Date): ZodiacSign {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const mmdd = `${mm}-${dd}`;

  for (const [sign, def] of Object.entries(ZODIAC_DEFINITIONS)) {
    if (inRange(mmdd, def.start_mmdd, def.end_mmdd)) {
      return sign as ZodiacSign;
    }
  }

  // 기본값 (염소자리)
  return "capricorn";
}

/**
 * 날짜와 별자리 기준으로 시즌 범위를 계산 (연도 경계 포함)
 * 예: 2025-12-28의 염소자리 시즌 = 2025-12-22 ~ 2026-01-19
 */
export function getZodiacSeasonRange(
  date: Date,
  sign: ZodiacSign
): ZodiacSeasonRange {
  const def = ZODIAC_DEFINITIONS[sign];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 시작일/종료일 파싱
  const [startMonth, startDay] = def.start_mmdd.split("-").map(Number);
  const [endMonth, endDay] = def.end_mmdd.split("-").map(Number);

  let startYear = year;
  let endYear = year;

  // 연도 경계를 넘는 경우 (예: 염소자리 12-22 ~ 01-19)
  const crossesYear = startMonth > endMonth || (startMonth === endMonth && startDay > endDay);

  if (crossesYear) {
    // 현재 날짜가 시작일(12-22) 이후이면
    if (month > startMonth || (month === startMonth && day >= startDay)) {
      // 시작일은 올해, 종료일은 다음 해
      startYear = year;
      endYear = year + 1;
    } else {
      // 현재 날짜가 시작일 이전이면 (1월 초 등)
      // 시작일은 전년도, 종료일은 올해
      startYear = year - 1;
      endYear = year;
    }
  } else {
    // 연도 경계를 넘지 않는 경우
    if (month < startMonth || (month === startMonth && day < startDay)) {
      startYear = year - 1;
    }
    if (month > endMonth || (month === endMonth && day > endDay)) {
      endYear = year + 1;
    }
  }

  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);

  // 날짜 리스트 생성
  const dates: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(toDateString(current));
    current.setDate(current.getDate() + 1);
  }

  const daysCount = dates.length;

  return { start, end, daysCount, dates };
}

/**
 * Date를 "YYYY-MM-DD" 형식으로 변환
 */
export function toDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Date를 "YYYY.MM.DD" 형식으로 표시
 */
export function displayDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

/**
 * 별자리 한글명 반환
 */
export function getZodiacNameKo(sign: ZodiacSign): string {
  return ZODIAC_DEFINITIONS[sign].name_ko;
}

/**
 * 별자리 배경 이미지 경로 반환
 * 월별로 해당하는 별자리 배경 이미지를 반환합니다.
 */
export function getZodiacBackgroundImage(sign: ZodiacSign): string {
  const imageMap: Record<ZodiacSign, string> = {
    aquarius: "/images/bg/zodiac/1_aquarius.png",
    pisces: "/images/bg/zodiac/2_pisces.png",
    aries: "/images/bg/zodiac/3_aries.png",
    taurus: "/images/bg/zodiac/4_taurus.png",
    gemini: "/images/bg/zodiac/5_gemini.png",
    cancer: "/images/bg/zodiac/6_cancer.png",
    leo: "/images/bg/zodiac/7_leo.png",
    virgo: "/images/bg/zodiac/8_virgo.png",
    libra: "/images/bg/zodiac/9_libra.png",
    scorpio: "/images/bg/zodiac/10_scorpio.png",
    sagittarius: "/images/bg/zodiac/11_sagittarius.png",
    capricorn: "/images/bg/zodiac/12_capricorn.png",
  };
  return imageMap[sign];
}

export function expandToDays(
  points: Pt[] | undefined,
  pathIndex: number[] | undefined,
  days: number
): Pt[] {
  if (!points || points.length === 0) return Array(days).fill({ x: 0, y: 0 });
  const path = (
    pathIndex && pathIndex.length > 0 ? pathIndex : points.map((_, i) => i)
  )
    .map((i) => points[i])
    .filter(Boolean);
  return samplePolyline(path, days);
}

/* ---- localStorage mock (그대로) ---- */
export type StarRecord = {
  dayIndex: number; // 0-based
  moodKey: string;
  intensity: number; // 1~5
  text: string;
  tags: string[];
  isSpecial: boolean;
};

export function loadMonthStarsMock(
  userId: string,
  year: number,
  month: number
): StarRecord[] {
  if (typeof window === "undefined") return [];
  const key = `stars:${userId}:${year}-${String(month).padStart(2, "0")}`;
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export function saveMonthStarsMock(
  userId: string,
  year: number,
  month: number,
  list: StarRecord[]
) {
  if (typeof window === "undefined") return;
  const key = `stars:${userId}:${year}-${String(month).padStart(2, "0")}`;
  localStorage.setItem(key, JSON.stringify(list));
}

export function upsertStarMock(
  userId: string,
  date: Date,
  data: Omit<StarRecord, "dayIndex">
) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dayIndex = d - 1;
  const list = loadMonthStarsMock(userId, y, m);
  const i = list.findIndex((r) => r.dayIndex === dayIndex);
  const rec: StarRecord = { dayIndex, ...data };
  if (i >= 0) list[i] = rec;
  else list.push(rec);
  saveMonthStarsMock(userId, y, m, list);
  return rec;
}
