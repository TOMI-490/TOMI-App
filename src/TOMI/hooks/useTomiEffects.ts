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

  useEffect(() => {
    if (!currentTomi) {
      return;
    }

    const prevTomi = prevTomiRef.current;

    // First time seeing TOMI data - just store it, no effects
    if (!prevTomi) {
      prevTomiRef.current = currentTomi;
      return;
    }

    // Detect XP change
    if (currentTomi.xp !== prevTomi.xp) {
      const delta = currentTomi.xp - prevTomi.xp;
      if (delta > 0) {
        setXpDelta(delta);
        setShowXpToast(true);
        console.log('[useTomiEffects] XP gained:', delta);

        // Auto-dismiss XP toast after 3 seconds
        setTimeout(() => {
          setShowXpToast(false);
          setXpDelta(null);
        }, 3000);
      }
    }

    // Detect level up
    if (currentTomi.level > prevTomi.level) {
      setLevelUp(true);
      setNewLevel(currentTomi.level);
      setShowLevelUpModal(true);
      console.log('[useTomiEffects] Level up!', currentTomi.level);
    }

    // Update ref with current data
    prevTomiRef.current = currentTomi;
  }, [currentTomi]);

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
