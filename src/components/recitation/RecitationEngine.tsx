'use client';

import React, { useState } from 'react';
import { Mic, Square, CheckCircle, RefreshCw } from 'lucide-react';

interface EngineProps {
  expectedText: string;
  surahNumber: number;
  ayahStart: number;
  ayahEnd: number;
  onComplete?: (result: { accuracy: number; mistakes: number }) => void;
}

export default function RecitationEngine({
  expectedText,
  surahNumber,
  ayahStart,
  ayahEnd,
  onComplete
}: EngineProps) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<{
    accuracy: number;
    mismatches: Array<{ expected: string; actual: string }>;
  } | null>(null);

  const startRecording = async () => {
    setIsRecording(true);
    setTranscript('');
    setResult(null);

    // Mock Audio Recording simulation / Web Speech API fallback
    setTimeout(() => {
      // Simulate speech captured after 3 seconds
      setIsRecording(false);
      analyzeRecitation('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
    }, 4000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const analyzeRecitation = async (userTranscript: string) => {
    setAnalyzing(true);
    setTranscript(userTranscript);

    try {
      const res = await fetch('/api/recitation/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: userTranscript,
          expectedText,
          surahNumber,
          ayahStart,
          ayahEnd
        })
      });
      const data = await res.json();
      setResult(data);
      if (onComplete) {
        onComplete({
          accuracy: data.accuracy,
          mistakes: data.mismatches?.length || 0
        });
      }
    } catch (err) {
      console.error('Error analyzing recitation:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#0d1527',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #1e293b',
      color: '#ffffff',
      textAlign: 'center'
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#10b981' }}>
        Recitation Verification
      </h3>

      <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
        Recite Ayah {surahNumber}:{ayahStart}-{ayahEnd} out loud to test your memorization accuracy.
      </p>

      {/* Recording Button */}
      <div style={{ marginBottom: '24px' }}>
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={analyzing}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Mic size={36} />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              cursor: 'pointer',
              animation: 'pulse 1.5s infinite'
            }}
          >
            <Square size={32} />
          </button>
        )}
      </div>

      {isRecording && (
        <p style={{ color: '#ef4444', fontSize: '14px', fontWeight: 'bold' }}>
          Listening to your recitation...
        </p>
      )}

      {analyzing && (
        <div style={{ color: '#f59e0b', fontSize: '14px' }}>
          Comparing with Uthmani Quran script...
        </div>
      )}

      {result && (
        <div style={{
          backgroundColor: '#1f2937',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'left',
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>Accuracy Score:</span>
            <span style={{ color: result.accuracy > 85 ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
              {result.accuracy}%
            </span>
          </div>

          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
            Transcribed: &ldquo;{transcript}&rdquo;
          </div>

          {result.mismatches.length === 0 ? (
            <div style={{ color: '#10b981', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} /> Perfect recitation! No mistakes detected.
            </div>
          ) : (
            <div style={{ color: '#ef4444', fontSize: '12px' }}>
              {result.mismatches.length} hesitation/mismatch areas detected.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
