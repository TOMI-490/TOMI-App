/**
 * useTomiEffects Hook
 * Detects XP changes, level ups, and evolution eligibility for visual effects
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { UserAvatarResponseDto } from '../models/dto/UserAvatar.dto';
import { evolutionService } from '../services/resources/evolution.service';
import type { EvolutionNodeDto, EvolutionStateDto } from '../models/dto/Evolution.dto';

export interface TomiEffects {
  xpDelta: number | null;
  levelUp: boolean;
  newLevel: number | null;
  showXpToast: boolean;
  showLevelUpModal: boolean;
  dismissXpToast: () => void;
  dismissLevelUpModal: () => void;
  // Evolution
  showEvolutionModal: boolean;
  evolutionOptions: EvolutionNodeDto[];
  evolutionLoading: boolean;
  dismissEvolutionModal: () => void;
  checkEvolution: () => void;
}

/**
 * Hook to detect TOMI XP/level changes and evolution eligibility
 */
export function useTomiEffects(currentTomi: UserAvatarResponseDto | null | undefined): TomiEffects {
  const [xpDelta, setXpDelta] = useState<number | null>(null);
  const [levelUp, setLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const [showXpToast, setShowXpToast] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [evolutionOptions, setEvolutionOptions] = useState<EvolutionNodeDto[]>([]);
  const [evolutionLoading, setEvolutionLoading] = useState(false);
  const pendingEvolutionCheck = useRef(false);

  const prevTomiRef = useRef<UserAvatarResponseDto | null>(null);

  const currentXp = currentTomi?.xp;
  const currentLevel = currentTomi?.level;
  const userId = currentTomi?.userId;

  const checkEvolution = useCallback(async () => {
    if (!userId) return;
    setEvolutionLoading(true);
    try {
      const state = await evolutionService.getEvolutionState(userId, true);
      if (state?.isEligible && state.availableOptions.length > 0) {
        console.log('[useTomiEffects] 🧬 EVOLUTION AVAILABLE! Options:', state.availableOptions.length);
        setEvolutionOptions(state.availableOptions);
        setShowEvolutionModal(true);
      }
    } catch {
      // Silently fail — user can still evolve from the Avatar tab
    } finally {
      setEvolutionLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    console.log('[useTomiEffects] Effect triggered - currentTomi:', currentTomi ? `Lv${currentTomi.level} XP${currentTomi.xp}` : 'null');
    
    if (!currentTomi) {
      console.log('[useTomiEffects] No current TOMI, skipping');
      return;
    }

    const prevTomi = prevTomiRef.current;
    console.log('[useTomiEffects] Previous TOMI:', prevTomi ? `Lv${prevTomi.level} XP${prevTomi.xp}` : 'null (first time)');

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

        setTimeout(() => {
          setShowXpToast(false);
          setXpDelta(null);
        }, 3000);
      }
    }

    // Detect level up → queue evolution check after LevelUpModal is dismissed
    if (currentTomi.level > prevTomi.level) {
      console.log('[useTomiEffects] 🎉 LEVEL UP DETECTED!', prevTomi.level, '→', currentTomi.level);
      setLevelUp(true);
      setNewLevel(currentTomi.level);
      setShowLevelUpModal(true);
      pendingEvolutionCheck.current = true;
    }

    prevTomiRef.current = { ...currentTomi };
  }, [currentXp, currentLevel]);

  const dismissXpToast = () => {
    setShowXpToast(false);
    setXpDelta(null);
  };

  const dismissLevelUpModal = useCallback(() => {
    setShowLevelUpModal(false);
    setLevelUp(false);
    setNewLevel(null);

    // After the celebration, check if evolution is now available
    if (pendingEvolutionCheck.current) {
      pendingEvolutionCheck.current = false;
      checkEvolution();
    }
  }, [checkEvolution]);

  const dismissEvolutionModal = useCallback(() => {
    setShowEvolutionModal(false);
    setEvolutionOptions([]);
  }, []);

  return {
    xpDelta,
    levelUp,
    newLevel,
    showXpToast,
    showLevelUpModal,
    dismissXpToast,
    dismissLevelUpModal,
    showEvolutionModal,
    evolutionOptions,
    evolutionLoading,
    dismissEvolutionModal,
    checkEvolution,
  };
}
