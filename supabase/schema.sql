-- ==========================================
-- Lahzah (لحظة) Complete Database Schema
-- ==========================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  daily_goal_minutes INT DEFAULT 10,
  reading_track TEXT CHECK (reading_track IN ('khatm', 'hifz', 'reflection', 'custom')) DEFAULT 'khatm',
  current_juz INT DEFAULT 1,
  current_surah INT DEFAULT 1,
  current_ayah INT DEFAULT 1,
  hafiz_status BOOLEAN DEFAULT FALSE,
  memorized_surahs INT[] DEFAULT '{}',
  time_zone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public Profiles View (Non-sensitive display info for circles)
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT id, full_name, avatar_url, experience_level, hafiz_status, created_at
  FROM public.profiles;

-- 2. Daily Habits & Logs
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  minutes_spent INT DEFAULT 0,
  pages_read INT DEFAULT 0,
  ayahs_memorized INT DEFAULT 0,
  ayahs_reviewed INT DEFAULT 0,
  completed_goal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 3. Hifz (Memorization) Items with Spaced Repetition (SM-2)
CREATE TABLE IF NOT EXISTS public.hifz_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  surah_number INT NOT NULL,
  ayah_start INT NOT NULL,
  ayah_end INT NOT NULL,
  status TEXT CHECK (status IN ('new', 'learning', 'reviewing', 'mastered')) DEFAULT 'new',
  ease_factor FLOAT DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  repetitions INT DEFAULT 0,
  next_review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Memorization Logs
CREATE TABLE IF NOT EXISTS public.hifz_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  hifz_item_id UUID REFERENCES public.hifz_items(id) ON DELETE CASCADE NOT NULL,
  quality_rating INT CHECK (quality_rating BETWEEN 0 AND 5),
  accuracy_percentage FLOAT,
  mistakes_count INT DEFAULT 0,
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Recitation Attempts (ASR Engine with full transcripts and mismatches)
CREATE TABLE IF NOT EXISTS public.recitation_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  surah_number INT NOT NULL,
  ayah_start INT NOT NULL,
  ayah_end INT NOT NULL,
  mode TEXT CHECK (mode IN ('hifz_test', 'live_follow', 'word_by_word')) DEFAULT 'hifz_test',
  transcript TEXT NOT NULL,
  expected_text TEXT NOT NULL,
  accuracy_percentage FLOAT NOT NULL,
  mismatches JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Circles (Privacy-first Accountability)
CREATE TABLE IF NOT EXISTS public.circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.circle_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.circle_settings (
  circle_id UUID PRIMARY KEY REFERENCES public.circles(id) ON DELETE CASCADE,
  show_individual_scores BOOLEAN DEFAULT FALSE,
  group_goal_type TEXT DEFAULT 'total_minutes',
  group_goal_target INT DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Group Khatm Juz Claims
CREATE TABLE IF NOT EXISTS public.juz_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  juz_number INT CHECK (juz_number BETWEEN 1 AND 30) NOT NULL,
  claimed_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('claimed', 'reading', 'completed')) DEFAULT 'claimed',
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(circle_id, juz_number)
);

-- 8. Streaks and Circle Streaks
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.circle_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID UNIQUE REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Notification Preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  fajr_reminder BOOLEAN DEFAULT TRUE,
  dhuhr_reminder BOOLEAN DEFAULT FALSE,
  asr_reminder BOOLEAN DEFAULT FALSE,
  maghrib_reminder BOOLEAN DEFAULT FALSE,
  isha_reminder BOOLEAN DEFAULT TRUE,
  daily_reminder_time TIME DEFAULT '20:00:00',
  push_subscription JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Offline Caching Tables
CREATE TABLE IF NOT EXISTS public.cached_ayahs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surah_number INT NOT NULL,
  ayah_number INT NOT NULL,
  text_uthmani TEXT NOT NULL,
  page_number INT,
  juz_number INT,
  UNIQUE(surah_number, ayah_number)
);

CREATE TABLE IF NOT EXISTS public.cached_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surah_number INT NOT NULL,
  ayah_number INT NOT NULL,
  edition TEXT NOT NULL DEFAULT 'en.sahih',
  translation_text TEXT NOT NULL,
  UNIQUE(surah_number, ayah_number, edition)
);

CREATE TABLE IF NOT EXISTS public.cached_word_by_word (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surah_number INT NOT NULL,
  ayah_number INT NOT NULL,
  words_data JSONB NOT NULL,
  UNIQUE(surah_number, ayah_number)
);

CREATE TABLE IF NOT EXISTS public.cached_tajweed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surah_number INT NOT NULL,
  ayah_number INT NOT NULL,
  tajweed_data JSONB NOT NULL,
  UNIQUE(surah_number, ayah_number)
);

-- 11. Hadith & Asma ul Husna Data Tables
CREATE TABLE IF NOT EXISTS public.hadith_of_day (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE DEFAULT CURRENT_DATE,
  hadith_text TEXT NOT NULL,
  source TEXT NOT NULL,
  chapter TEXT,
  hadith_number INT
);

CREATE TABLE IF NOT EXISTS public.cached_hadith (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection TEXT NOT NULL,
  hadith_number INT NOT NULL,
  arabic_text TEXT,
  english_text TEXT NOT NULL,
  grade TEXT,
  UNIQUE(collection, hadith_number)
);

CREATE TABLE IF NOT EXISTS public.saved_hadith (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  hadith_id UUID REFERENCES public.cached_hadith(id) ON DELETE CASCADE NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hadith_id)
);

CREATE TABLE IF NOT EXISTS public.asma_ul_husna (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number INT UNIQUE NOT NULL,
  name_arabic TEXT NOT NULL,
  name_transliteration TEXT NOT NULL,
  meaning_english TEXT NOT NULL,
  explanation TEXT
);

CREATE TABLE IF NOT EXISTS public.saved_names (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name_id UUID REFERENCES public.asma_ul_husna(id) ON DELETE CASCADE NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name_id)
);

-- ==========================================
-- AUTOMATIC DATABASE TRIGGERS & FUNCTIONS
-- ==========================================

-- Trigger Function: Recalculates personal streak and all associated circle streaks on daily_logs INSERT or UPDATE
-- Includes guard: ONLY updates streak counters when log entry is for CURRENT_DATE to prevent past-date backfills from corrupting active streaks.
CREATE OR REPLACE FUNCTION public.handle_daily_log_streak_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_circle_id UUID;
BEGIN
  -- Guard: Only calculate streaks if activity > 0 AND log date is today
  IF NEW.minutes_spent > 0 AND NEW.date = CURRENT_DATE THEN
    -- 1. Recalculate Personal Streak
    INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (NEW.user_id, 1, 1, NEW.date)
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = CASE
        WHEN public.streaks.last_activity_date = NEW.date - INTERVAL '1 day' THEN public.streaks.current_streak + 1
        WHEN public.streaks.last_activity_date = NEW.date THEN public.streaks.current_streak
        ELSE 1
      END,
      longest_streak = GREATEST(
        public.streaks.longest_streak,
        CASE
          WHEN public.streaks.last_activity_date = NEW.date - INTERVAL '1 day' THEN public.streaks.current_streak + 1
          ELSE 1
        END
      ),
      last_activity_date = NEW.date,
      updated_at = NOW();

    -- 2. Recalculate Circle Streaks for every circle the user belongs to
    FOR target_circle_id IN (SELECT circle_id FROM public.circle_members WHERE user_id = NEW.user_id) LOOP
      INSERT INTO public.circle_streaks (circle_id, current_streak, longest_streak, last_activity_date)
      VALUES (target_circle_id, 1, 1, NEW.date)
      ON CONFLICT (circle_id) DO UPDATE SET
        current_streak = CASE
          WHEN public.circle_streaks.last_activity_date = NEW.date - INTERVAL '1 day' THEN public.circle_streaks.current_streak + 1
          WHEN public.circle_streaks.last_activity_date = NEW.date THEN public.circle_streaks.current_streak
          ELSE 1
        END,
        longest_streak = GREATEST(
          public.circle_streaks.longest_streak,
          CASE
            WHEN public.circle_streaks.last_activity_date = NEW.date - INTERVAL '1 day' THEN public.circle_streaks.current_streak + 1
            ELSE 1
          END
        ),
        last_activity_date = NEW.date,
        updated_at = NOW();
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Create Trigger on daily_logs
DROP TRIGGER IF EXISTS trigger_update_streaks ON public.daily_logs;
CREATE TRIGGER trigger_update_streaks
  AFTER INSERT OR UPDATE ON public.daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_daily_log_streak_trigger();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- User & Private Data Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hifz_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hifz_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recitation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.juz_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_hadith ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_names ENABLE ROW LEVEL SECURITY;

-- Reference & Cache Tables (Read-Only to Public/Client)
ALTER TABLE public.cached_ayahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_word_by_word ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_tajweed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadith_of_day ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_hadith ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asma_ul_husna ENABLE ROW LEVEL SECURITY;

-- Public Read-Only Policies for Reference Tables
CREATE POLICY "Public read cached_ayahs" ON public.cached_ayahs FOR SELECT USING (true);
CREATE POLICY "Public read cached_translations" ON public.cached_translations FOR SELECT USING (true);
CREATE POLICY "Public read cached_word_by_word" ON public.cached_word_by_word FOR SELECT USING (true);
CREATE POLICY "Public read cached_tajweed" ON public.cached_tajweed FOR SELECT USING (true);
CREATE POLICY "Public read hadith_of_day" ON public.hadith_of_day FOR SELECT USING (true);
CREATE POLICY "Public read cached_hadith" ON public.cached_hadith FOR SELECT USING (true);
CREATE POLICY "Public read asma_ul_husna" ON public.asma_ul_husna FOR SELECT USING (true);

-- 1. Profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Daily Logs, Hifz Items & Logs, Recitation Attempts
CREATE POLICY "Users manage own daily_logs" ON public.daily_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own hifz_items" ON public.hifz_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own hifz_logs" ON public.hifz_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own recitation_attempts" ON public.recitation_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own notification_preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own saved_hadith" ON public.saved_hadith FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own saved_names" ON public.saved_names FOR ALL USING (auth.uid() = user_id);

-- Personal Streaks Policy (READ ONLY to clients — direct INSERT/UPDATE forbidden for clients, updated strictly via DB trigger)
CREATE POLICY "Users view own streaks" ON public.streaks FOR SELECT USING (auth.uid() = user_id);

-- 3. Circles & Members Policies
CREATE POLICY "Authenticated users insert circle" ON public.circles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Circle members select circle" ON public.circles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = public.circles.id AND user_id = auth.uid()) OR created_by = auth.uid()
);

CREATE POLICY "Authenticated users join circle_members" ON public.circle_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Circle members view members" ON public.circle_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = public.circle_members.circle_id AND cm.user_id = auth.uid())
);

-- Circle Settings Policies
CREATE POLICY "Circle members view settings" ON public.circle_settings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = public.circle_settings.circle_id AND user_id = auth.uid())
);
CREATE POLICY "Circle creator insert settings" ON public.circle_settings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.circles WHERE id = public.circle_settings.circle_id AND created_by = auth.uid())
);
CREATE POLICY "Circle creator update settings" ON public.circle_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.circles WHERE id = public.circle_settings.circle_id AND created_by = auth.uid())
);

-- Circle Streaks Policy (READ ONLY to clients — direct INSERT/UPDATE forbidden for clients, updated strictly via DB trigger)
CREATE POLICY "Circle members view circle_streaks" ON public.circle_streaks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = public.circle_streaks.circle_id AND user_id = auth.uid())
);

CREATE POLICY "Circle members view juz_claims" ON public.juz_claims FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = public.juz_claims.circle_id AND user_id = auth.uid())
);
CREATE POLICY "Circle members insert juz_claims" ON public.juz_claims FOR INSERT WITH CHECK (
  auth.uid() = claimed_by AND EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = public.juz_claims.circle_id AND user_id = auth.uid())
);
CREATE POLICY "Circle members update own juz_claims" ON public.juz_claims FOR UPDATE USING (auth.uid() = claimed_by);
