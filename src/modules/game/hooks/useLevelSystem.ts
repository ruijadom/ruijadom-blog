import { useState, useCallback } from 'react';
import type { LevelState } from '@/modules/game/types/game';
import { GAME_CONFIG } from '@/modules/game/constants/game';

/**
 * Hook for managing level progression and difficulty scaling
 * Adjusts spawn rates and enemy speeds based on level
 */
export function useLevelSystem(totalAsteroids: number) {
  const [level, setLevel] = useState<LevelState>({
    current: 1,
    asteroidSpawnRate: GAME_CONFIG.LEVEL.INITIAL_ASTEROID_SPAWN_RATE,
    bugSpawnRate: GAME_CONFIG.LEVEL.INITIAL_BUG_SPAWN_RATE,
    bugSpeed: GAME_CONFIG.LEVEL.INITIAL_BUG_SPEED,
    asteroidsForNextLevel: GAME_CONFIG.LEVEL.ASTEROIDS_PER_LEVEL,
  });

  const checkLevelUp = useCallback(() => {
    setLevel((prev) => {
      if (totalAsteroids >= prev.asteroidsForNextLevel) {
        const newLevel = prev.current + 1;
        
        // Calculate new difficulty values with caps
        const newAsteroidSpawnRate = Math.max(
          GAME_CONFIG.LEVEL.MIN_ASTEROID_SPAWN_RATE,
          prev.asteroidSpawnRate * 0.9
        );
        const newBugSpawnRate = Math.max(
          GAME_CONFIG.LEVEL.MIN_BUG_SPAWN_RATE,
          prev.bugSpawnRate * 0.85
        );
        const newBugSpeed = Math.min(
          GAME_CONFIG.LEVEL.MAX_BUG_SPEED,
          prev.bugSpeed * 1.1
        );

        return {
          current: newLevel,
          asteroidSpawnRate: newAsteroidSpawnRate,
          bugSpawnRate: newBugSpawnRate,
          bugSpeed: newBugSpeed,
          asteroidsForNextLevel: prev.asteroidsForNextLevel + GAME_CONFIG.LEVEL.ASTEROIDS_PER_LEVEL,
        };
      }
      return prev;
    });
  }, [totalAsteroids]);

  const resetLevel = useCallback(() => {
    setLevel({
      current: 1,
      asteroidSpawnRate: GAME_CONFIG.LEVEL.INITIAL_ASTEROID_SPAWN_RATE,
      bugSpawnRate: GAME_CONFIG.LEVEL.INITIAL_BUG_SPAWN_RATE,
      bugSpeed: GAME_CONFIG.LEVEL.INITIAL_BUG_SPEED,
      asteroidsForNextLevel: GAME_CONFIG.LEVEL.ASTEROIDS_PER_LEVEL,
    });
  }, []);

  return {
    level,
    checkLevelUp,
    resetLevel,
  };
}
