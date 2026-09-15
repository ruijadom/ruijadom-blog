import type { StateCreator } from 'zustand';
import { GAME_CONFIG } from '@/modules/game/constants/game';

export interface LevelSlice {
  // Level state
  current: number;
  asteroidSpawnRate: number;
  bugSpawnRate: number;
  bugSpeed: number;
  asteroidsForNextLevel: number;
  
  // Actions
  checkLevelUp: (totalAsteroids: number) => boolean;
  resetLevel: () => void;
}

export const createLevelSlice: StateCreator<LevelSlice> = (set, get) => ({
  // Initial state
  current: 1,
  asteroidSpawnRate: GAME_CONFIG.LEVEL.INITIAL_ASTEROID_SPAWN_RATE,
  bugSpawnRate: GAME_CONFIG.LEVEL.INITIAL_BUG_SPAWN_RATE,
  bugSpeed: GAME_CONFIG.LEVEL.INITIAL_BUG_SPEED,
  asteroidsForNextLevel: GAME_CONFIG.LEVEL.ASTEROIDS_PER_LEVEL,
  
  // Actions
  checkLevelUp: (totalAsteroids) => {
    const { current, asteroidsForNextLevel } = get();
    
    if (totalAsteroids >= asteroidsForNextLevel) {
      const newLevel = current + 1;
      
      // Calculate new spawn rates (faster spawning)
      const newAsteroidSpawnRate = Math.max(
        GAME_CONFIG.LEVEL.MIN_ASTEROID_SPAWN_RATE,
        GAME_CONFIG.LEVEL.INITIAL_ASTEROID_SPAWN_RATE - (newLevel - 1) * 100
      );
      
      const newBugSpawnRate = Math.max(
        GAME_CONFIG.LEVEL.MIN_BUG_SPAWN_RATE,
        GAME_CONFIG.LEVEL.INITIAL_BUG_SPAWN_RATE - (newLevel - 1) * 200
      );
      
      // Calculate new bug speed (faster bugs)
      const newBugSpeed = Math.min(
        GAME_CONFIG.LEVEL.MAX_BUG_SPEED,
        GAME_CONFIG.LEVEL.INITIAL_BUG_SPEED + (newLevel - 1) * 0.3
      );
      
      set({
        current: newLevel,
        asteroidSpawnRate: newAsteroidSpawnRate,
        bugSpawnRate: newBugSpawnRate,
        bugSpeed: newBugSpeed,
        asteroidsForNextLevel: newLevel * GAME_CONFIG.LEVEL.ASTEROIDS_PER_LEVEL,
      });
      
      return true; // Level up occurred
    }
    
    return false; // No level up
  },
  
  resetLevel: () => set({
    current: 1,
    asteroidSpawnRate: GAME_CONFIG.LEVEL.INITIAL_ASTEROID_SPAWN_RATE,
    bugSpawnRate: GAME_CONFIG.LEVEL.INITIAL_BUG_SPAWN_RATE,
    bugSpeed: GAME_CONFIG.LEVEL.INITIAL_BUG_SPEED,
    asteroidsForNextLevel: GAME_CONFIG.LEVEL.ASTEROIDS_PER_LEVEL,
  }),
});
