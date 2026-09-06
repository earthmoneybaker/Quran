'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { fetchPrayerTimes } from '@/lib/prayerApi';
import { supabase } from '@/lib/supabaseClient';
import { PrayerTimes } from '@/types';
import { Flame, Clock, BookOpen, Heart, Sparkles, Bookmark } from 'lucide-react';

interface HadithData {
  hadith_text: string;
  source: string;
  hadith_number: number;
}

interface NameData {
  number: number;
  name_arabic: string;
  name_transliteration: string;
  meaning_english: string;
  explanation: string;
}

export default function TodayScreen() {
  const { profile, dailyLog } = useAppStore();
  const [prayers, setPrayers] = useState<PrayerTimes | null>(null);
  const [hadith, setHadith] = useState<HadithData | null>(null);
  const [nameOfDay, setNameOfDay] = useState<NameData | null>(null);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [savedHadith, setSavedHadith] = useState<boolean>(false);
  const [savedName, setSavedName] = useState<boolean>(false);

  useEffect(() => {
    // 1. Fetch Prayer Times
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude).then(setPrayers);
        },
        () => {
          fetchPrayerTimes(21.4225, 39.8262).then(setPrayers);
        }
      );
    } else {
      fetchPrayerTimes(21.4225, 39.8262).then(setPrayers);
    }

    // 2. Fetch Daily Hadith from DB
    async function loadHadith() {
      const { data } = await supabase
        .from('hadith_of_day')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setHadith(data);
      } else {
        // Fallback default if DB not yet seeded
        setHadith({
          hadith_text: 'The best among you are those who learn the Quran and teach it.',
          source: 'Sahih al-Bukhari',
          hadith_number: 5027
        });
      }
    }

    // 3. Fetch Name of the Day (Asma ul Husna) from DB
    async function loadNameOfDay() {
      const dayIndex = (new Date().getDate() % 99) + 1;
      const { data } = await supabase
        .from('asma_ul_husna')
        .select('*')
        .eq('number', dayIndex)
        .single();

      if (data) {
        setNameOfDay(data);
      } else {
        setNameOfDay({
          number: 47,
          name_arabic: 'الودود',
          name_transliteration: 'Al-Wadud',
          meaning_english: 'The Most Loving',
          explanation: 'The One who is Loving towards His righteous servants, and who fills their hearts with divine peace.'
        });
      }
    }

    // 4. Fetch User Streak from DB
    async function loadStreak() {
      if (!profile?.id) return;
      const { data } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', profile.id)
        .single();

      if (data) {
        setStreakCount(data.current_streak);
      }
    }

    loadHadith();
    loadNameOfDay();
    loadStreak();
  }, [profile?.id]);

  const minutesSpent = dailyLog?.minutes_spent || 0;
  const goalMinutes = profile?.daily_goal_minutes || 10;
  const progressPercent = Math.min(100, Math.round((minutesSpent / goalMinutes) * 100));

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      color: '#ffffff',
      fontFamily: 'sans-serif'
    }}>
      {/* Header Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0, color: '#f3f4f6' }}>
            Salam, {profile?.full_name || 'Servant of Allah'}
          </h1>
          <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: '14px' }}>
            A moment with the Quran today brings peace tomorrow.
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#1e293b',
          padding: '8px 14px',
          borderRadius: '20px',
          border: '1px solid #334155'
        }}>
          <Flame size={18} color="#f59e0b" />
          <span style={{ fontWeight: 'bold', color: '#f59e0b', fontSize: '14px' }}>
            {streakCount} Day Habit
          </span>
        </div>
      </div>

      {/* Daily Micro-Habit Card */}
      <div style={{
        backgroundColor: '#0d1527',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid #1e293b',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '16px' }}>Daily Goal Progress</h3>
          </div>
          <span style={{ fontSize: '14px', color: '#10b981', fontWeight: 'bold' }}>
            {minutesSpent} / {goalMinutes} min
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '10px',
          backgroundColor: '#1e293b',
          borderRadius: '5px',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            backgroundColor: '#10b981',
            transition: 'width 0.3s ease'
          }} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#10b981',
            color: '#fff',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
            <BookOpen size={18} /> Continue Reading
          </button>
        </div>
      </div>

      {/* FEATURE 1: Hadith of the Day Card (Wired to DB) */}
      {hadith && (
        <div style={{
          backgroundColor: '#111827',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #1f2937'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
              <Heart size={18} />
              <h4 style={{ margin: 0, fontSize: '15px' }}>Hadith of the Day</h4>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                backgroundColor: '#064e3b',
                color: '#10b981',
                padding: '2px 8px',
                borderRadius: '10px',
                fontWeight: 'bold'
              }}>
                Sahih (Authentic)
              </span>
              <button
                onClick={() => setSavedHadith(!savedHadith)}
                style={{ background: 'none', border: 'none', color: savedHadith ? '#10b981' : '#9ca3af', cursor: 'pointer' }}
              >
                <Bookmark size={18} fill={savedHadith ? '#10b981' : 'none'} />
              </button>
            </div>
          </div>
          <p style={{ fontStyle: 'italic', color: '#e5e7eb', fontSize: '14px', lineHeight: '1.5', margin: '0 0 10px' }}>
            &ldquo;{hadith.hadith_text}&rdquo;
          </p>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            Collection: {hadith.source} | Hadith #{hadith.hadith_number}
          </span>
        </div>
      )}

      {/* FEATURE 2: Name of the Day Card (Wired to DB) */}
      {nameOfDay && (
        <div style={{
          backgroundColor: '#0d1527',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #1e293b'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
              <Sparkles size={18} />
              <h4 style={{ margin: 0, fontSize: '15px' }}>Name of the Day (أسماء الله الحسنى)</h4>
            </div>
            <button
              onClick={() => setSavedName(!savedName)}
              style={{ background: 'none', border: 'none', color: savedName ? '#3b82f6' : '#9ca3af', cursor: 'pointer' }}
            >
              <Bookmark size={18} fill={savedName ? '#3b82f6' : 'none'} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#60a5fa' }}>
                {nameOfDay.name_transliteration} ({nameOfDay.name_arabic})
              </div>
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>{nameOfDay.meaning_english}</div>
            </div>
            <span style={{ fontSize: '24px', fontFamily: 'serif', color: '#93c5fd' }}>{nameOfDay.name_arabic}</span>
          </div>

          <p style={{ fontSize: '13px', color: '#d1d5db', lineHeight: '1.4', margin: 0 }}>
            {nameOfDay.explanation}
          </p>
        </div>
      )}

      {/* Next Prayer Times Bar */}
      {prayers && (
        <div style={{
          backgroundColor: '#0d1527',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'center'
        }}>
          {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((pName) => (
            <div key={pName}>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>{pName}</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f3f4f6' }}>{prayers[pName]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
