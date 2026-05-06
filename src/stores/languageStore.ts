import { create } from 'zustand';

type Language = 'en' | 'hi';

interface LanguageStore {
  lang: Language;
  toggleLang: () => void;
  setLang: (lang: Language) => void;
}

const STORAGE_KEY = 'dhansathi_lang';

function loadLang(): Language {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved === 'hi' || saved === 'en') return saved;
  } catch {
    // ignore
  }
  return 'en';
}

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  lang: loadLang(),

  toggleLang: () => {
    const next = get().lang === 'en' ? 'hi' : 'en';
    sessionStorage.setItem(STORAGE_KEY, next);
    set({ lang: next });
  },

  setLang: (lang) => {
    sessionStorage.setItem(STORAGE_KEY, lang);
    set({ lang });
  },
}));
