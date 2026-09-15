// Main game components
export { RocketShip } from './components/rocket-ship';
export { GameCanvas } from './components/game-canvas';

// Game hooks (custom hooks, not Zustand)
export { useResourceSystem } from './hooks/useResourceSystem';
export { useLevelSystem } from './hooks/useLevelSystem';
export { useGamePersistence } from './hooks/useGamePersistence';

// Game store (Zustand) - includes useGameState from store
export * from './store';

// Game types
export * from './types/game';

// Game constants
export * from './constants/game';

// Game utilities
export * from './utils';
