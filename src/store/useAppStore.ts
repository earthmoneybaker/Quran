import { create } from 'zustand';
import { Profile, DailyLog, HifzItem } from '@/types';

interface AppState {
  profile: Profile | null;
  dailyLog: DailyLog | null;
  hifzItems: HifzItem[];
  activeSurah: number;
  activeAyah: number;
  isPlayingAudio: boolean;
  audioReciter: string;
  setProfile: (profile: Profile | null) => void;
  setDailyLog: (log: DailyLog | null) => void;
  setHifzItems: (items: HifzItem[]) => void;
  setActiveSurah: (surah: number) => void;
  setActiveAyah: (ayah: number) => void;
  setIsPlayingAudio: (playing: boolean) => void;
  setAudioReciter: (reciter: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  dailyLog: null,
  hifzItems: [],
  activeSurah: 1,
  activeAyah: 1,
  isPlayingAudio: false,
  audioReciter: 'ar.alafasy',
  setProfile: (profile) => set({ profile }),
  setDailyLog: (dailyLog) => set({ dailyLog }),
  setHifzItems: (hifzItems) => set({ hifzItems }),
  setActiveSurah: (activeSurah) => set({ activeSurah }),
  setActiveAyah: (activeAyah) => set({ activeAyah }),
  setIsPlayingAudio: (isPlayingAudio) => set({ isPlayingAudio }),
  setAudioReciter: (audioReciter) => set({ audioReciter }),
}));
