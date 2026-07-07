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
