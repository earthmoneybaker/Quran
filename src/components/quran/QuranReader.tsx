'use client';

import React, { useEffect, useState } from 'react';
import { fetchSurahArabic, fetchSurahEnglish } from '@/lib/quranApi';
import { QuranAyah } from '@/types';
import { Eye, EyeOff } from 'lucide-react';

interface ReaderProps {
  surahNumber: number;
}

export default function QuranReader({ surahNumber }: ReaderProps) {
  const [ayahs, setAyahs] = useState<QuranAyah[]>([]);
  const [translations, setTranslations] = useState<QuranAyah[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [hifzMode, setHifzMode] = useState<boolean>(false);
  const [hiddenAyahs, setHiddenAyahs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadQuranData() {
      setLoading(true);
      const [arData, enData] = await Promise.all([
        fetchSurahArabic(surahNumber),
        fetchSurahEnglish(surahNumber)
      ]);
      setAyahs(arData);
      setTranslations(enData);
      setLoading(false);
    }
    loadQuranData();
  }, [surahNumber]);

  const toggleAyahVisibility = (ayahNum: number) => {
    setHiddenAyahs((prev) => ({ ...prev, [ayahNum]: !prev[ayahNum] }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
        Loading Quran text...
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      color: '#ffffff',
      fontFamily: 'sans-serif'
    }}>
      {/* Controls Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0d1527',
        padding: '12px 20px',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '1px solid #1e293b'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
          Surah {surahNumber}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setHifzMode(!hifzMode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: hifzMode ? '#064e3b' : '#1e293b',
              color: hifzMode ? '#10b981' : '#9ca3af',
              border: '1px solid #334155',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {hifzMode ? <EyeOff size={14} /> : <Eye size={14} />}
            Hifz Masking Mode
          </button>
        </div>
      </div>

      {/* Ayahs Display */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {ayahs.map((ayah, index) => {
          const translation = translations[index]?.text;
          const isHidden = hifzMode && hiddenAyahs[ayah.numberInSurah];

          return (
            <div
              key={ayah.number}
              style={{
                backgroundColor: activeAyah === ayah.numberInSurah ? '#1e293b' : '#0d1527',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #1e293b',
                transition: 'background-color 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{
                  backgroundColor: '#10b98122',
                  color: '#10b981',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {surahNumber}:{ayah.numberInSurah}
                </span>

                {hifzMode && (
                  <button
                    onClick={() => toggleAyahVisibility(ayah.numberInSurah)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px'
                    }}
                  >
                    {isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                    {isHidden ? 'Reveal' : 'Mask'}
                  </button>
                )}
              </div>

              {/* Arabic Verse */}
              <div
                style={{
                  fontSize: '28px',
                  lineHeight: '2.2',
                  textAlign: 'right',
                  fontFamily: 'me_quran, "Traditional Arabic", serif',
                  marginBottom: '12px',
                  direction: 'rtl',
                  filter: isHidden ? 'blur(8px)' : 'none',
                  transition: 'filter 0.2s ease',
                  userSelect: isHidden ? 'none' : 'text'
                }}
              >
                {ayah.text}
              </div>

              {/* Translation */}
              {translation && !isHidden && (
                <div style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.5' }}>
                  {translation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
