export interface Category {
  id: string;
  name: string;
  color: string; // HEX or Tailwind class prefix
  icon: string;  // Abstract symbol or icon name
}

export interface GoodDeed {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD
  category_ids: string[]; // Supports combo categories
}

export interface MonthDayStats {
  date: string; // YYYY-MM-DD
  deedsCount: number;
  dominantCategoryIds: string[];
}

export interface QWeeklyReport {
  id: string;
  weekRange: string; // Например, "05.07 - 12.07"
  status: 'completed' | 'skipped';
  mainVictory: string;
  failuresReason: string;
  energyLevel: string; // Например, "7/8"
  metrics: {
    applications: number;
    responses: string;
  };
  insights: string[]; // Несколько идей/наблюдений
  nextWeekFocus: string[]; // Строго 3 фокус-задачи
}

