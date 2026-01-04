/**
 * useLanguage Hook
 * Manages language state and synchronization with backend
 */

import { useState, useEffect } from 'react';
import { UserResponseDto } from '../models/dto/User.dto';
import { userService } from '../services/resources/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n } from '../locales/i18n';

const LANGUAGE_STORAGE_KEY = '@tomi_language';

export type Language = 'en' | 'fr';

export interface UseLanguageResult {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to manage user language preference
 * - Auto-applies language from user record
 * - Persists language changes to backend and local storage
 * - Updates i18n system
 */
export function useLanguage(user: UserResponseDto | null): UseLanguageResult {
  const [language, setLanguageState] = useState<Language>('en');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Apply language from user record on mount
  useEffect(() => {
    if (user && user.language) {
      const userLang = user.language as Language;
      console.log('[useLanguage] Setting language from user:', userLang);
      setLanguageState(userLang);
      // Apply to i18n system
      i18n.setLocale(userLang);
      // Store locally as fallback
      AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, userLang).catch(console.error);
    } else {
      // Load from local storage as fallback
      AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
        .then((storedLang) => {
          if (storedLang && (storedLang === 'en' || storedLang === 'fr')) {
            console.log('[useLanguage] Setting language from storage:', storedLang);
            setLanguageState(storedLang);
            i18n.setLocale(storedLang);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const setLanguage = async (lang: Language) => {
    if (!user) {
      console.warn('Cannot update language: no user loaded');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Update UI immediately
      setLanguageState(lang);
      i18n.setLocale(lang);

      // Persist to backend
      await userService.updateLanguage(user.userId, lang);

      // Persist locally as fallback
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update language');
      setError(error);
      console.error('Error updating language:', error);
      
      // Revert on error
      if (user.language) {
        setLanguageState(user.language as Language);
        // i18n.locale = user.language;
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    language,
    setLanguage,
    loading,
    error,
  };
}

export default useLanguage;
