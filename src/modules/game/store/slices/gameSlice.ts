import type { StateCreator } from 'zustand';

export interface GameSlice {
  // Game state
  isGameVisible: boolean;
  hasStarted: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  showHelp: boolean;
  
  // Score
  score: number;
  highScore: number;
  
  // Lives
  lives: number;
  
  // Actions
  setGameVisible: (visible: boolean) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  toggleHelp: () => void;
  gameOver: () => void;
  
  addScore: (points: number) => void;
  updateHighScore: () => void;
  loseLife: () => void;
  
  resetGame: () => void;
}

export const createGameSlice: StateCreator<GameSlice> = (set, get) => ({
  // Initial state
  isGameVisible: false,
  hasStarted: false,
  isPaused: false,
  isGameOver: false,
  showHelp: false,
  score: 0,
  highScore: 0,
  lives: 3,
  
  // Actions
  setGameVisible: (visible) => set({ isGameVisible: visible }),
  
  startGame: () => set({ hasStarted: true, isPaused: false }),
  
  pauseGame: () => set({ isPaused: true }),
  
  resumeGame: () => set({ isPaused: false }),
  
  toggleHelp: () => set((state) => ({ showHelp: !state.showHelp })),
  
  gameOver: () => {
    const { score, highScore } = get();
    const newHighScore = Math.max(score, highScore);
    
    // Save to localStorage
    try {
      localStorage.setItem('spaceDevGameHighScore', newHighScore.toString());
    } catch (e) {
      console.warn('Could not save high score:', e);
    }
    
    set({ 
      isGameOver: true,
      highScore: newHighScore
    });
  },
  
  addScore: (points) => set((state) => ({ score: state.score + points })),
  
  updateHighScore: () => {
    const { score, highScore } = get();
    if (score > highScore) {
      set({ highScore: score });
      try {
        localStorage.setItem('spaceDevGameHighScore', score.toString());
      } catch (e) {
        console.warn('Could not save high score:', e);
      }
    }
  },
  
  loseLife: () => {
    const newLives = get().lives - 1;
    set({ lives: newLives });
    
    if (newLives <= 0) {
      get().gameOver();
    }
  },
  
  resetGame: () => {
    // Load high score from localStorage
    let savedHighScore = 0;
    try {
      const saved = localStorage.getItem('spaceDevGameHighScore');
      if (saved) savedHighScore = parseInt(saved, 10);
    } catch (e) {
      console.warn('Could not load high score:', e);
    }
    
    set({
      hasStarted: false,
      isPaused: false,
      isGameOver: false,
      showHelp: false,
      score: 0,
      highScore: savedHighScore,
      lives: 3,
    });
  },
});
