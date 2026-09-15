import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createGameSlice, type GameSlice } from './slices/gameSlice';
import { createResourceSlice, type ResourceSlice } from './slices/resourceSlice';
import { createLevelSlice, type LevelSlice } from './slices/levelSlice';

// Combined store type
export type GameStore = GameSlice & ResourceSlice & LevelSlice;

// Create the store with all slices
export const useGameStore = create<GameStore>()(
  devtools(
    (...args) => ({
      ...createGameSlice(...args),
      ...createResourceSlice(...args),
      ...createLevelSlice(...args),
    }),
    {
      name: 'game-store',
    }
  )
);

// Bound store - pre-configured selectors for common use cases
export const useBoundGameStore = () => {
  const game = useGameStore((state) => ({
    isGameVisible: state.isGameVisible,
    hasStarted: state.hasStarted,
    isPaused: state.isPaused,
    isGameOver: state.isGameOver,
    showHelp: state.showHelp,
    score: state.score,
    highScore: state.highScore,
    lives: state.lives,
  }));

  const resources = useGameStore((state) => ({
    collected: state.collected,
    totalCollected: state.totalCollected,
    nextDeployAt: state.nextDeployAt,
    structures: state.structures,
  }));

  const level = useGameStore((state) => ({
    current: state.current,
    asteroidSpawnRate: state.asteroidSpawnRate,
    bugSpawnRate: state.bugSpawnRate,
    bugSpeed: state.bugSpeed,
    asteroidsForNextLevel: state.asteroidsForNextLevel,
  }));

  const actions = useGameStore((state) => ({
    // Game actions
    setGameVisible: state.setGameVisible,
    startGame: state.startGame,
    pauseGame: state.pauseGame,
    resumeGame: state.resumeGame,
    toggleHelp: state.toggleHelp,
    gameOver: state.gameOver,
    addScore: state.addScore,
    updateHighScore: state.updateHighScore,
    loseLife: state.loseLife,
    resetGame: state.resetGame,
    
    // Resource actions
    collectResource: state.collectResource,
    deployStructure: state.deployStructure,
    resetResources: state.resetResources,
    
    // Level actions
    checkLevelUp: state.checkLevelUp,
    resetLevel: state.resetLevel,
  }));

  return {
    game,
    resources,
    level,
    actions,
  };
};

// Selective hooks for performance optimization
export const useGameState = () => useGameStore((state) => ({
  isGameVisible: state.isGameVisible,
  hasStarted: state.hasStarted,
  isPaused: state.isPaused,
  isGameOver: state.isGameOver,
  showHelp: state.showHelp,
}));

export const useGameScore = () => useGameStore((state) => ({
  score: state.score,
  highScore: state.highScore,
  lives: state.lives,
}));

export const useGameResources = () => useGameStore((state) => ({
  collected: state.collected,
  totalCollected: state.totalCollected,
  nextDeployAt: state.nextDeployAt,
  structures: state.structures,
}));

export const useGameLevel = () => useGameStore((state) => ({
  current: state.current,
  asteroidSpawnRate: state.asteroidSpawnRate,
  bugSpawnRate: state.bugSpawnRate,
  bugSpeed: state.bugSpeed,
  asteroidsForNextLevel: state.asteroidsForNextLevel,
}));

export const useGameActions = () => useGameStore((state) => ({
  // Game actions
  setGameVisible: state.setGameVisible,
  startGame: state.startGame,
  pauseGame: state.pauseGame,
  resumeGame: state.resumeGame,
  toggleHelp: state.toggleHelp,
  gameOver: state.gameOver,
  addScore: state.addScore,
  updateHighScore: state.updateHighScore,
  loseLife: state.loseLife,
  resetGame: state.resetGame,
  
  // Resource actions
  collectResource: state.collectResource,
  deployStructure: state.deployStructure,
  resetResources: state.resetResources,
  
  // Level actions
  checkLevelUp: state.checkLevelUp,
  resetLevel: state.resetLevel,
}));

// Export types
export type { GameSlice, ResourceSlice, LevelSlice };
