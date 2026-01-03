// ============================================================================
// Game Storage Utilities
// ============================================================================

const STORAGE_KEYS = {
  HIGH_SCORE: 'spaceDevGameHighScore',
  SAVE_GAME: 'spaceDevGameSave',
  STATISTICS: 'spaceDevGameStats',
  LEADERBOARD: 'spaceDevGameLeaderboard',
} as const;

// ============================================================================
// Types
// ============================================================================

export interface GameSave {
  timestamp: number;
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

export interface GameStatistics {
  totalGamesPlayed: number;
  totalBugsKilled: number;
  totalAsteroidsDestroyed: number;
  totalResourcesCollected: number;
  totalStructuresDeployed: number;
  totalPlayTimeMs: number;
  highestLevel: number;
  lastPlayedAt: number;
}

export interface LeaderboardEntry {
  id: string;
  score: number;
  level: number;
  timestamp: number;
  bugsKilled: number;
  asteroidsDestroyed: number;
}

// ============================================================================
// Storage Functions
// ============================================================================

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`Could not read from localStorage (${key}):`, e);
    return null;
  }
}

function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`Could not write to localStorage (${key}):`, e);
    return false;
  }
}

function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.warn(`Could not remove from localStorage (${key}):`, e);
    return false;
  }
}

// ============================================================================
// High Score
// ============================================================================

export function getHighScore(): number {
  const saved = safeGetItem(STORAGE_KEYS.HIGH_SCORE);
  return saved ? parseInt(saved, 10) || 0 : 0;
}

export function saveHighScore(score: number): boolean {
  return safeSetItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
}

// ============================================================================
// Game Save/Load
// ============================================================================

export function saveGame(save: GameSave): boolean {
  return safeSetItem(STORAGE_KEYS.SAVE_GAME, JSON.stringify(save));
}

export function loadGame(): GameSave | null {
  const saved = safeGetItem(STORAGE_KEYS.SAVE_GAME);
  if (!saved) return null;
  
  try {
    const data = JSON.parse(saved) as GameSave;
    
    // Validate save data
    if (!data.timestamp || !data.score || !data.level) {
      console.warn('Invalid save data');
      return null;
    }
    
    // Check if save is not too old (e.g., 7 days)
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > sevenDaysMs) {
      console.log('Save data is too old, ignoring');
      deleteSave();
      return null;
    }
    
    return data;
  } catch (e) {
    console.warn('Could not parse save data:', e);
    return null;
  }
}

export function deleteSave(): boolean {
  return safeRemoveItem(STORAGE_KEYS.SAVE_GAME);
}

export function hasSavedGame(): boolean {
  return loadGame() !== null;
}

// ============================================================================
// Statistics
// ============================================================================

export function getStatistics(): GameStatistics {
  const saved = safeGetItem(STORAGE_KEYS.STATISTICS);
  
  if (!saved) {
    return {
      totalGamesPlayed: 0,
      totalBugsKilled: 0,
      totalAsteroidsDestroyed: 0,
      totalResourcesCollected: 0,
      totalStructuresDeployed: 0,
      totalPlayTimeMs: 0,
      highestLevel: 1,
      lastPlayedAt: Date.now(),
    };
  }
  
  try {
    return JSON.parse(saved) as GameStatistics;
  } catch (e) {
    console.warn('Could not parse statistics:', e);
    return {
      totalGamesPlayed: 0,
      totalBugsKilled: 0,
      totalAsteroidsDestroyed: 0,
      totalResourcesCollected: 0,
      totalStructuresDeployed: 0,
      totalPlayTimeMs: 0,
      highestLevel: 1,
      lastPlayedAt: Date.now(),
    };
  }
}

export function updateStatistics(updates: Partial<GameStatistics>): boolean {
  const current = getStatistics();
  const updated = { ...current, ...updates, lastPlayedAt: Date.now() };
  return safeSetItem(STORAGE_KEYS.STATISTICS, JSON.stringify(updated));
}

export function incrementStatistic(
  key: keyof Omit<GameStatistics, 'lastPlayedAt'>,
  amount: number = 1
): boolean {
  const stats = getStatistics();
  stats[key] = (stats[key] as number) + amount;
  stats.lastPlayedAt = Date.now();
  return safeSetItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
}

export function resetStatistics(): boolean {
  return safeRemoveItem(STORAGE_KEYS.STATISTICS);
}

// ============================================================================
// Leaderboard
// ============================================================================

export function getLeaderboard(): LeaderboardEntry[] {
  const saved = safeGetItem(STORAGE_KEYS.LEADERBOARD);
  
  if (!saved) return [];
  
  try {
    const data = JSON.parse(saved) as LeaderboardEntry[];
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('Could not parse leaderboard:', e);
    return [];
  }
}

export function addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): boolean {
  const leaderboard = getLeaderboard();
  
  // Add new entry with unique ID
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  
  leaderboard.push(newEntry);
  
  // Sort by score (descending)
  leaderboard.sort((a, b) => b.score - a.score);
  
  // Keep only top 10
  const top10 = leaderboard.slice(0, 10);
  
  return safeSetItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(top10));
}

export function clearLeaderboard(): boolean {
  return safeRemoveItem(STORAGE_KEYS.LEADERBOARD);
}

// ============================================================================
// Utility Functions
// ============================================================================

export function clearAllGameData(): boolean {
  let success = true;
  success = safeRemoveItem(STORAGE_KEYS.HIGH_SCORE) && success;
  success = safeRemoveItem(STORAGE_KEYS.SAVE_GAME) && success;
  success = safeRemoveItem(STORAGE_KEYS.STATISTICS) && success;
  success = safeRemoveItem(STORAGE_KEYS.LEADERBOARD) && success;
  return success;
}

export function exportGameData(): string {
  return JSON.stringify({
    highScore: getHighScore(),
    save: loadGame(),
    statistics: getStatistics(),
    leaderboard: getLeaderboard(),
  }, null, 2);
}

export function importGameData(data: string): boolean {
  try {
    const parsed = JSON.parse(data);
    
    if (parsed.highScore) saveHighScore(parsed.highScore);
    if (parsed.save) saveGame(parsed.save);
    if (parsed.statistics) safeSetItem(STORAGE_KEYS.STATISTICS, JSON.stringify(parsed.statistics));
    if (parsed.leaderboard) safeSetItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(parsed.leaderboard));
    
    return true;
  } catch (e) {
    console.error('Could not import game data:', e);
    return false;
  }
}
