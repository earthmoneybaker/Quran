'use client';

import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: (data: {
    experience_level: 'beginner' | 'intermediate' | 'advanced';
    daily_goal_minutes: number;
    reading_track: 'khatm' | 'hifz' | 'reflection' | 'custom';
    memorized_surahs: number[];
  }) => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<number>(1);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [goal, setGoal] = useState<number>(10);
  const [track, setTrack] = useState<'khatm' | 'hifz' | 'reflection' | 'custom'>('khatm');
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({
        experience_level: level,
        daily_goal_minutes: goal,
        reading_track: track,
        memorized_surahs: selectedSurahs,
      });
    }
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '40px auto',
      padding: '24px',
      backgroundColor: '#0d1527',
      borderRadius: '16px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#10b981' }}>
        Welcome to Lahzah (لحظة)
      </h2>
      <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '24px', fontSize: '14px' }}>
        Step {step} of 3 — Personalizing your Quran habit
      </p>

      {step === 1 && (
        <div>
          <h3 style={{ marginBottom: '16px' }}>What is your current Quran reading comfort?</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: level === l ? '2px solid #10b981' : '1px solid #374151',
                  backgroundColor: level === l ? '#064e3b' : '#1f2937',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  textTransform: 'capitalize'
                }}
              >
                <strong>{l}</strong>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 style={{ marginBottom: '16px' }}>Choose your primary track & daily goal</h3>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#d1d5db' }}>
            Primary Goal Track
          </label>
          <select
            value={track}
            onChange={(e) => setTrack(e.target.value as any)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
              marginBottom: '20px'
            }}
          >
            <option value="khatm">Khatm (Sequential Reading)</option>
            <option value="hifz">Hifz (Memorization & Review)</option>
            <option value="reflection">Reflection (Tadabbur)</option>
            <option value="custom">Custom Daily Target</option>
          </select>

          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#d1d5db' }}>
            Daily Reading Goal: <strong>{goal} Minutes</strong>
          </label>
          <input
            type="range"
            min="3"
            max="60"
            step="1"
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 style={{ marginBottom: '16px' }}>Already memorized any Surahs?</h3>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '12px' }}>
            Select Juz Amma surahs you already know to seed your Hifz review deck:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
            {[114, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101, 67, 36, 18, 1].map((sNum) => {
              const isSelected = selectedSurahs.includes(sNum);
              return (
                <button
                  key={sNum}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedSurahs(selectedSurahs.filter((num) => num !== sNum));
                    } else {
                      setSelectedSurahs([...selectedSurahs, sNum]);
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    border: isSelected ? '1px solid #10b981' : '1px solid #374151',
                    backgroundColor: isSelected ? '#064e3b' : '#1f2937',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Surah {sNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#374151',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Back
          </button>
        ) : <div />}
        <button
          onClick={handleNext}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#10b981',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {step === 3 ? 'Start My Habit' : 'Next'}
        </button>
      </div>
    </div>
  );
}
