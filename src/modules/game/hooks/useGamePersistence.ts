import { useEffect, useRef, useCallback } from 'react';
import {
  saveGame,
  loadGame,
  deleteSave,
  hasSavedGame,
  getStatistics,
  incrementStatistic,
  updateStatistics,
  addLeaderboardEntry,
  getLeaderboard,
  type GameSave,
  type GameStatistics,
  type LeaderboardEntry,
} from '@/modules/game/utils/storage';

interface GameState {
  score: number;
  lives: number;
  level: number;
  resources: {
    collected: number;
    totalCollected: number;
  };
  structures: Array<{
    type: 'satellite' | 'station';
    x: number;
    y: number;
  }>;
}

interface UseGamePersistenceOptions {
  autoSave?: boolean;
  autoSaveInterval?: number; // milliseconds
}

export function useGamePersistence(options: UseGamePersistenceOptions = {}) {
  const { autoSave = true, autoSaveInterval = 30000 } = options; // Default: 30 seconds
  
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval>>();
  const gameStartTimeRef = useRef<number>(Date.now()); // Initialize with current time
  const statsRef = useRef<{
    bugsKilled: number;
    asteroidsDestroyed: number;
  }>({
    bugsKilled: 0,
    asteroidsDestroyed: 0,
  });

  // ============================================================================
  // Statistics Tracking
  // ============================================================================

  const trackBugKill = useCallback(() => {
    statsRef.current.bugsKilled += 1;
    incrementStatistic('totalBugsKilled', 1);
  }, []);

  const trackAsteroidDestroy = useCallback(() => {
    statsRef.current.asteroidsDestroyed += 1;
    incrementStatistic('totalAsteroidsDestroyed', 1);
  }, []);

  const trackResourceCollect = useCallback(() => {
    incrementStatistic('totalResourcesCollected', 1);
  }, []);

  const trackStructureDeploy = useCallback(() => {
    incrementStatistic('totalStructuresDeployed', 1);
  }, []);

  const trackLevelReached = useCallback((level: number) => {
    const stats = getStatistics();
    if (level > stats.highestLevel) {
      updateStatistics({ highestLevel: level });
    }
  }, []);

  // ============================================================================
  // Game Session Management
  // ============================================================================

  const startGameSession = useCallback(() => {
    gameStartTimeRef.current = Date.now();
    statsRef.current = { bugsKilled: 0, asteroidsDestroyed: 0 };
    incrementStatistic('totalGamesPlayed', 1);
    console.log('🎮 Game session started');
  }, []);

  const endGameSession = useCallback((finalScore: number, finalLevel: number) => {
    const playTime = Date.now() - gameStartTimeRef.current;
    
    // Update total play time
    incrementStatistic('totalPlayTimeMs', playTime);
    
    // Add to leaderboard if score is good enough
    const leaderboard = getLeaderboard();
    const isTopScore = leaderboard.length < 10 || finalScore > leaderboard[leaderboard.length - 1]?.score;
    
    if (isTopScore) {
      addLeaderboardEntry({
        score: finalScore,
        level: finalLevel,
        timestamp: Date.now(),
        bugsKilled: statsRef.current.bugsKilled,
        asteroidsDestroyed: statsRef.current.asteroidsDestroyed,
      });
      console.log('🏆 New leaderboard entry added!');
    }
    
    // Clear auto-save
    deleteSave();
    
    console.log('🎮 Game session ended', {
      playTime: `${Math.round(playTime / 1000)}s`,
      finalScore,
      finalLevel,
      bugsKilled: statsRef.current.bugsKilled,
      asteroidsDestroyed: statsRef.current.asteroidsDestroyed,
    });
  }, []);

  // ============================================================================
  // Save/Load Game State
  // ============================================================================

  const saveGameState = useCallback((state: GameState) => {
    const save: GameSave = {
      timestamp: Date.now(),
      score: state.score,
      lives: state.lives,
      level: state.level,
      resources: {
        collected: state.resources.collected,
        totalCollected: state.resources.totalCollected,
      },
      structures: state.structures.map(s => ({
        type: s.type,
        x: s.x,
        y: s.y,
      })),
    };
    
    const success = saveGame(save);
    if (success) {
      console.log('💾 Game saved', { score: save.score, level: save.level });
    }
    return success;
  }, []);

  const loadGameState = useCallback((): GameSave | null => {
    const save = loadGame();
    if (save) {
      console.log('📂 Game loaded', { score: save.score, level: save.level });
    }
    return save;
  }, []);

  const clearSave = useCallback(() => {
    deleteSave();
    console.log('🗑️ Save deleted');
  }, []);

  const checkHasSave = useCallback((): boolean => {
    return hasSavedGame();
  }, []);

  // ============================================================================
  // Auto-Save
  // ============================================================================

  const startAutoSave = useCallback((getState: () => GameState) => {
    if (!autoSave) return;
    
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }
    
    // Set up new timer
    autoSaveTimerRef.current = setInterval(() => {
      const state = getState();
      // Only save if game is in progress (has score or is past level 1)
      if (state.score > 0 || state.level > 1) {
        saveGameState(state);
      }
    }, autoSaveInterval);
    
    console.log(`⏰ Auto-save enabled (every ${autoSaveInterval / 1000}s)`);
  }, [autoSave, autoSaveInterval, saveGameState]);

  const stopAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = undefined;
      console.log('⏰ Auto-save disabled');
    }
  }, []);

  // ============================================================================
  // Statistics Access
  // ============================================================================

  const getStats = useCallback((): GameStatistics => {
    return getStatistics();
  }, []);

  const getLeaderboardData = useCallback((): LeaderboardEntry[] => {
    return getLeaderboard();
  }, []);

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      stopAutoSave();
    };
  }, [stopAutoSave]);

  // ============================================================================
  // Return API
  // ============================================================================

  return {
    // Save/Load
    saveGameState,
    loadGameState,
    clearSave,
    checkHasSave,
    
    // Auto-save
    startAutoSave,
    stopAutoSave,
    
    // Session management
    startGameSession,
    endGameSession,
    
    // Statistics tracking
    trackBugKill,
    trackAsteroidDestroy,
    trackResourceCollect,
    trackStructureDeploy,
    trackLevelReached,
    
    // Data access
    getStats,
    getLeaderboardData,
  };
}
