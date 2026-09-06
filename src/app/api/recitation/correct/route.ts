import { NextResponse } from 'next/server';

const HF_MODEL = 'tarteel-ai/whisper-base-ar-quran';
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;

// Clean diacritics and whitespace for exact normalized string alignment comparison
function cleanStr(str: string): string {
  return str.replace(/[\u064B-\u065F\u0670\u0671]/g, '').trim();
}

// Dynamic Programming Sequence Alignment (Needleman-Wunsch / Levenshtein alignment)
function alignWords(expectedWords: string[], transcriptWords: string[]) {
  const m = expectedWords.length;
  const n = transcriptWords.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = expectedWords[i - 1] === transcriptWords[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // Deletion (omitted word)
        dp[i][j - 1] + 1,      // Insertion (extra word)
        dp[i - 1][j - 1] + cost // Substitution / Exact Match
      );
    }
  }

  // Backtrack to find aligned pairs and mismatches
  let i = m;
  let j = n;
  let matchCount = 0;
  const mismatches: Array<{ expected: string; actual: string }> = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && expectedWords[i - 1] === transcriptWords[j - 1]) {
      matchCount++;
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      mismatches.push({ expected: expectedWords[i - 1], actual: transcriptWords[j - 1] });
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      mismatches.push({ expected: expectedWords[i - 1], actual: '[omitted]' });
      i--;
    } else {
      mismatches.push({ expected: '[extra]', actual: transcriptWords[j - 1] });
      j--;
    }
  }

  mismatches.reverse();
  const accuracy = Math.round((matchCount / Math.max(m, 1)) * 100);

  return { accuracy, mismatches };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as Blob | null;
    const expectedText = formData.get('expectedText') as string | null;

    if (!audioFile || !expectedText) {
      return NextResponse.json(
        { error: 'Missing audio file or expected text' },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();

    // Call updated Hugging Face router endpoint with hf-inference segment
    const hfRes = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'audio/wav',
        ...(process.env.HUGGINGFACE_API_KEY
          ? { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` }
          : {})
      },
      body: arrayBuffer
    });

    if (!hfRes.ok) {
      const errText = await hfRes.text();
      console.error('HuggingFace ASR Error:', hfRes.status, errText);
      return NextResponse.json(
        { error: `Hugging Face ASR transcription failed (${hfRes.status}). ${errText}` },
        { status: 502 }
      );
    }

    const hfData = await hfRes.json();
    const transcript = hfData.text || '';

    if (!transcript.trim()) {
      return NextResponse.json(
        { error: 'ASR model returned empty transcript. Speech was not recognized clearly.' },
        { status: 422 }
      );
    }

    const normTranscript = cleanStr(transcript);
    const normExpected = cleanStr(expectedText);

    const transcriptWords = normTranscript.split(/\s+/).filter(Boolean);
    const expectedWords = normExpected.split(/\s+/).filter(Boolean);

    const { accuracy, mismatches } = alignWords(expectedWords, transcriptWords);

    return NextResponse.json({
      transcript,
      expectedText,
      accuracy,
      mismatches
    });
  } catch (err: any) {
    console.error('Error in recitation alignment route:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
