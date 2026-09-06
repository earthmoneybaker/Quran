export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  daily_goal_minutes: number;
  reading_track: 'khatm' | 'hifz' | 'reflection' | 'custom';
  current_juz?: number;
  current_surah?: number;
  current_ayah?: number;
  hafiz_status: boolean;
  memorized_surahs: number[];
  time_zone: string;
  created_at: string;
  updated_at: string;
}

export interface QuranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface QuranAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | object;
  translation?: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  minutes_spent: number;
  pages_read: number;
  ayahs_memorized: number;
  ayahs_reviewed: number;
  completed_goal: boolean;
  created_at: string;
}

export interface HifzItem {
  id: string;
  user_id: string;
  surah_number: number;
  ayah_start: number;
  ayah_end: number;
  status: 'new' | 'learning' | 'reviewing' | 'mastered';
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  last_reviewed_at?: string;
  created_at: string;
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}
