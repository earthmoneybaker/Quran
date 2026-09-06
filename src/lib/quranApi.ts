import { supabase } from './supabaseClient';
import { QuranSurah, QuranAyah } from '@/types';

const ALQURAN_BASE = 'https://api.alquran.cloud/v1';

export async function fetchSurahList(): Promise<QuranSurah[]> {
  try {
    const res = await fetch(`${ALQURAN_BASE}/surah`);
    const data = await res.json();
    if (data.code === 200) {
      return data.data;
    }
    throw new Error('Failed to fetch surah list');
  } catch (err) {
    console.error('Error fetching surahs:', err);
    return [];
  }
}

export async function fetchSurahArabic(surahNumber: number): Promise<QuranAyah[]> {
  try {
    // 1. Check Supabase DB cache first
    const { data: cached, error } = await supabase
      .from('cached_ayahs')
      .select('*')
      .eq('surah_number', surahNumber)
      .order('ayah_number', { ascending: true });

    if (!error && cached && cached.length > 0) {
      return cached.map((c: any) => ({
        number: c.ayah_number,
        text: c.text_uthmani,
        numberInSurah: c.ayah_number,
        juz: c.juz_number || 1,
        manzil: 1,
        page: c.page_number || 1,
        ruku: 1,
        hizbQuarter: 1,
        sajda: false
      }));
    }

    // 2. Cache miss — fetch from Alquran Cloud API
    const res = await fetch(`${ALQURAN_BASE}/surah/${surahNumber}/quran-uthmani`);
    const data = await res.json();

    if (data.code === 200) {
      const ayahs: QuranAyah[] = data.data.ayahs;

      // Async populate Supabase cache table
      const rowsToInsert = ayahs.map((a) => ({
        surah_number: surahNumber,
        ayah_number: a.numberInSurah,
        text_uthmani: a.text,
        page_number: a.page,
        juz_number: a.juz
      }));

      await supabase.from('cached_ayahs').upsert(rowsToInsert, { onConflict: 'surah_number,ayah_number' });

      return ayahs;
    }
    throw new Error(`Failed to fetch surah ${surahNumber}`);
  } catch (err) {
    console.error('Error fetching surah arabic:', err);
    return [];
  }
}

export async function fetchSurahEnglish(surahNumber: number): Promise<QuranAyah[]> {
  try {
    // 1. Check Supabase DB cache first
    const { data: cached, error } = await supabase
      .from('cached_translations')
      .select('*')
      .eq('surah_number', surahNumber)
      .eq('edition', 'en.sahih')
      .order('ayah_number', { ascending: true });

    if (!error && cached && cached.length > 0) {
      return cached.map((c: any) => ({
        number: c.ayah_number,
        text: c.translation_text,
        numberInSurah: c.ayah_number,
        juz: 1,
        manzil: 1,
        page: 1,
        ruku: 1,
        hizbQuarter: 1,
        sajda: false
      }));
    }

    // 2. Cache miss — fetch from Alquran Cloud API
    const res = await fetch(`${ALQURAN_BASE}/surah/${surahNumber}/en.sahih`);
    const data = await res.json();

    if (data.code === 200) {
      const ayahs: QuranAyah[] = data.data.ayahs;

      // Async populate Supabase cache table
      const rowsToInsert = ayahs.map((a) => ({
        surah_number: surahNumber,
        ayah_number: a.numberInSurah,
        edition: 'en.sahih',
        translation_text: a.text
      }));

      await supabase.from('cached_translations').upsert(rowsToInsert, { onConflict: 'surah_number,ayah_number,edition' });

      return ayahs;
    }
    throw new Error(`Failed to fetch surah ${surahNumber} translation`);
  } catch (err) {
    console.error('Error fetching surah translation:', err);
    return [];
  }
}
