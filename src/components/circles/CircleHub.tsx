'use client';

import React, { useState } from 'react';
import { Users, Plus, UserPlus, Award } from 'lucide-react';

export default function CircleHub() {
  const [activeTab, setActiveTab] = useState<'my' | 'create' | 'join'>('my');
  const [circleName, setCircleName] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      color: '#ffffff',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Users size={24} color="#10b981" />
        <h2 style={{ margin: 0 }}>Circles (حلقات)</h2>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        backgroundColor: '#0d1527',
        padding: '4px',
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #1e293b'
      }}>
        {(['my', 'create', 'join'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === tab ? '#10b981' : 'transparent',
              color: activeTab === tab ? '#fff' : '#9ca3af',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab === 'my' ? 'My Circles' : tab === 'create' ? 'Create Circle' : 'Join Circle'}
          </button>
        ))}
      </div>

      {activeTab === 'my' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            backgroundColor: '#0d1527',
            borderRadius: '14px',
            padding: '20px',
            border: '1px solid #1e293b'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#f3f4f6' }}>Fajr Readers Circle</h3>
              <span style={{ fontSize: '12px', color: '#10b981', backgroundColor: '#064e3b', padding: '2px 8px', borderRadius: '12px' }}>
                Code: FAJR2026
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 16px' }}>
              Group Khatm goal: 1,000 minutes total community reading.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '14px' }}>
              <Award size={18} />
              <span>Collective Progress: 640 / 1,000 mins</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div style={{
          backgroundColor: '#0d1527',
          borderRadius: '14px',
          padding: '20px',
          border: '1px solid #1e293b'
        }}>
          <h3 style={{ margin: '0 0 16px' }}>Create Privacy-First Circle</h3>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#9ca3af' }}>
            Circle Name
          </label>
          <input
            type="text"
            placeholder="e.g. Family Quran Habit"
            value={circleName}
            onChange={(e) => setCircleName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
              marginBottom: '16px'
            }}
          />
          <button style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#10b981',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Create Circle
          </button>
        </div>
      )}

      {activeTab === 'join' && (
        <div style={{
          backgroundColor: '#0d1527',
          borderRadius: '14px',
          padding: '20px',
          border: '1px solid #1e293b'
        }}>
          <h3 style={{ margin: '0 0 16px' }}>Join Circle via Invite Code</h3>
          <input
            type="text"
            placeholder="Enter 6-character code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
              marginBottom: '16px'
            }}
          />
          <button style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#10b981',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Join Circle
          </button>
        </div>
      )}
    </div>
  );
}
