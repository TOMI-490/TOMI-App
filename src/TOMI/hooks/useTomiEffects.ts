/**
 * useTomiEffects Hook
 * Detects XP changes and level ups for visual effects
 */

import { useState, useEffect, useRef } from 'react';
import { UserAvatarResponseDto } from '../models/dto/UserAvatar.dto';

export interface TomiEffects {
  xpDelta: number | null;  // Amount of XP gained (null if no change)
  levelUp: boolean;         // True if level increased
  newLevel: number | null;  // The new level reached (null if no level up)
  showXpToast: boolean;     // Flag to show XP toast
  showLevelUpModal: boolean; // Flag to show level up modal
  dismissXpToast: () => void;
  dismissLevelUpModal: () => void;
}

/**
 * Hook to detect TOMI XP and level changes for visual effects
 * @param currentTomi - Current TOMI data
 * @returns Flags and data for showing XP/level up effects
 */
export function useTomiEffects(currentTomi: UserAvatarResponseDto | null | undefined): TomiEffects {
  const [xpDelta, setXpDelta] = useState<number | null>(null);
  const [levelUp, setLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const [showXpToast, setShowXpToast] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  // Store previous values to detect changes
  const prevTomiRef = useRef<UserAvatarResponseDto | null>(null);

  // Extract values to use as dependencies (to avoid infinite loops from object reference changes)
  const currentXp = currentTomi?.xp;
  const currentLevel = currentTomi?.level;

  useEffect(() => {
    console.log('[useTomiEffects] Effect triggered - currentTomi:', currentTomi ? `Lv${currentTomi.level} XP${currentTomi.xp}` : 'null');
    
    if (!currentTomi) {
      console.log('[useTomiEffects] No current TOMI, skipping');
      return;
    }

    const prevTomi = prevTomiRef.current;
    console.log('[useTomiEffects] Previous TOMI:', prevTomi ? `Lv${prevTomi.level} XP${prevTomi.xp}` : 'null (first time)');

    // First time seeing TOMI data - just store it, no effects
    if (!prevTomi) {
      console.log('[useTomiEffects] First TOMI data, storing reference');
      prevTomiRef.current = { ...currentTomi };
      return;
    }

    // Detect XP change
    if (currentTomi.xp !== prevTomi.xp) {
      const delta = currentTomi.xp - prevTomi.xp;
      console.log('[useTomiEffects] XP change detected:', prevTomi.xp, '→', currentTomi.xp, '(delta:', delta, ')');
      if (delta > 0) {
        setXpDelta(delta);
        setShowXpToast(true);
        console.log('[useTomiEffects] ✨ XP gained:', delta);

        // Auto-dismiss XP toast after 3 seconds
        setTimeout(() => {
          setShowXpToast(false);
          setXpDelta(null);
        }, 3000);
      }
    }

    // Detect level up
    if (currentTomi.level > prevTomi.level) {
      console.log('[useTomiEffects] 🎉 LEVEL UP DETECTED!', prevTomi.level, '→', currentTomi.level);
      setLevelUp(true);
      setNewLevel(currentTomi.level);
      setShowLevelUpModal(true);
    }

    // Update ref with current data (create a copy to store values)
    console.log('[useTomiEffects] Updating ref with current TOMI');
    prevTomiRef.current = { ...currentTomi };
  }, [currentXp, currentLevel]); // Only depend on primitive values to avoid infinite loop

  const dismissXpToast = () => {
    setShowXpToast(false);
    setXpDelta(null);
  };

  const dismissLevelUpModal = () => {
    setShowLevelUpModal(false);
    setLevelUp(false);
    setNewLevel(null);
  };

  return {
    xpDelta,
    levelUp,
    newLevel,
    showXpToast,
    showLevelUpModal,
    dismissXpToast,
    dismissLevelUpModal,
  };
}
