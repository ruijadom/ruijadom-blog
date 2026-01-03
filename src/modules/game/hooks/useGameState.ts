import { useState, useCallback, useEffect } from 'react';
import type { GameState } from '@/modules/game/types/game';

const HIGH_SCORE_KEY = 'spaceDevGameHighScore';

/**
 * Hook for managing main game state
 * Handles game lifecycle: start, pause, resume, game over, reset
 */
export function useGameState() {
  const [state, setState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    level: 1,
    lives: 3,
    score: 0,
    highScore: 0,
  });

  // Load high score from localStorage on mount
  useEffect(() => {
    try {
      const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
      if (savedHighScore) {
        setState((prev) => ({ ...prev, highScore: parseInt(savedHighScore, 10) }));
      }
    } catch (e) {
      console.warn('Could not load high score:', e);
    }
  }, []);

  const startGame = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      level: 1,
      lives: 3,
      score: 0,
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resumeGame = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const gameOver = useCallback(() => {
    setState((prev) => {
      const newHighScore = Math.max(prev.score, prev.highScore);
      
      // Save high score to localStorage
      try {
        localStorage.setItem(HIGH_SCORE_KEY, newHighScore.toString());
      } catch (e) {
        console.warn('Could not save high score:', e);
      }

      return {
        ...prev,
        isPlaying: false,
        isGameOver: true,
        highScore: newHighScore,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      level: 1,
      lives: 3,
      score: 0,
    }));
  }, []);

  const incrementScore = useCallback((points: number) => {
    setState((prev) => ({ ...prev, score: prev.score + points }));
  }, []);

  const decrementLives = useCallback(() => {
    setState((prev) => {
      const newLives = prev.lives - 1;
      if (newLives <= 0) {
        return { ...prev, lives: 0 };
      }
      return { ...prev, lives: newLives };
    });
  }, []);

  const incrementLevel = useCallback(() => {
    setState((prev) => ({ ...prev, level: prev.level + 1 }));
  }, []);

  return {
    state,
    startGame,
    pauseGame,
    resumeGame,
    gameOver,
    resetGame,
    incrementScore,
    decrementLives,
    incrementLevel,
  };
}
