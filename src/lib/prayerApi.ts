import { PrayerTimes } from '@/types';

export async function fetchPrayerTimes(latitude: number, longitude: number): Promise<PrayerTimes | null> {
  try {
    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    const res = await fetch(
      `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=2`
    );
    const data = await res.json();
    if (data.code === 200) {
      return data.data.timings;
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch prayer times:', err);
    return null;
  }
}
