import React from 'react';
import type { GameSave } from '@/modules/game/utils/storage';

interface GameContinueDialogProps {
  save: GameSave;
  onContinue: () => void;
  onNewGame: () => void;
}

export function GameContinueDialog({ save, onContinue, onNewGame }: GameContinueDialogProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    
    // Less than 1 hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // More than 24 hours
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">💾</div>
          <h2 className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
            Continue Game?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Found a saved game from {formatDate(save.timestamp)}
          </p>
        </div>

        {/* Save Info */}
        <div className="mb-6 space-y-2 rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Score:</span>
            <span className="text-lg font-bold text-primary">{save.score.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Level:</span>
            <span className="font-bold text-yellow-400">{save.level}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Lives:</span>
            <span className="font-bold text-red-400">{'❤️'.repeat(save.lives)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Resources:</span>
            <span className="font-bold text-stone-400">⛏️ {save.resources.collected}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Structures:</span>
            <span className="font-bold text-blue-400">
              {save.structures.filter(s => s.type === 'satellite').length} 🛰️ + {' '}
              {save.structures.filter(s => s.type === 'station').length} 🏗️
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onContinue}
            className="w-full rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Continue Game
          </button>
          <button
            onClick={onNewGame}
            className="w-full rounded-lg bg-slate-700 px-6 py-3 font-bold text-white transition-colors hover:bg-slate-600"
          >
            Start New Game
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Starting a new game will delete the saved game
        </p>
      </div>
    </div>
  );
}
