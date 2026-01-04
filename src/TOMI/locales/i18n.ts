import { useState, useEffect } from 'react';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

type Language = 'en' | 'fr';
type Translations = typeof en;

const translations: Record<Language, Translations> = {
  en,
  fr,
};

let currentLanguage: Language = 'en';
let listeners: ((lang: Language) => void)[] = [];

export const i18n = {
  get locale() {
    return currentLanguage;
  },
  
  setLocale: (lang: Language) => {
    currentLanguage = lang;
    listeners.forEach(listener => listener(lang));
  },
  
  t: (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return value || key;
  },
  
  subscribe: (listener: (lang: Language) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
};

export const useTranslation = () => {
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    const unsubscribe = i18n.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);
  
  return {
    t: i18n.t,
    locale: currentLanguage,
  };
};

export const getTranslations = (lang: Language = currentLanguage): Translations => {
  return translations[lang];
};
