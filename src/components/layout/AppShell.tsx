'use client';

import React, { useState } from 'react';
import TodayScreen from '@/components/home/TodayScreen';
import QuranReader from '@/components/quran/QuranReader';
import RecitationEngine from '@/components/recitation/RecitationEngine';
import CircleHub from '@/components/circles/CircleHub';
import { Home, BookOpen, Mic, Users } from 'lucide-react';

export default function AppShell() {
  const [tab, setTab] = useState<'today' | 'quran' | 'recitation' | 'circles'>('today');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#090d16',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Navbar */}
      <header style={{
        backgroundColor: '#0d1527',
        borderBottom: '1px solid #1e293b',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>Lahzah</span>
          <span style={{ fontSize: '18px', color: '#9ca3af' }}>(لحظة)</span>
        </div>
      </header>

      {/* Main Content View */}
      <main style={{ flex: 1, paddingBottom: '80px' }}>
        {tab === 'today' && <TodayScreen />}
        {tab === 'quran' && <QuranReader surahNumber={1} />}
        {tab === 'recitation' && (
          <div style={{ maxWidth: '600px', margin: '20px auto', padding: '0 20px' }}>
            <RecitationEngine
              expectedText="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
              surahNumber={1}
              ayahStart={1}
              ayahEnd={1}
            />
          </div>
        )}
        {tab === 'circles' && <CircleHub />}
      </main>

      {/* Bottom Navigation Bar */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: '#0d1527',
        borderTop: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 50
      }}>
        {[
          { id: 'today', label: 'Today', icon: Home },
          { id: 'quran', label: 'Quran', icon: BookOpen },
          { id: 'recitation', label: 'Verify', icon: Mic },
          { id: 'circles', label: 'Circles', icon: Users }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id as any)}
              style={{
                background: 'none',
                border: 'none',
                color: isActive ? '#10b981' : '#9ca3af',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
