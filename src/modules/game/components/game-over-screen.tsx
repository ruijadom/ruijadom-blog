'use client';

import { useRouter } from 'next/navigation';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  leaderboardPosition?: number; // Position in leaderboard (1-10), undefined if not in top 10
  onRestart: () => void;
  onViewStats?: () => void;
}

export function GameOverScreen({ 
  score, 
  highScore, 
  leaderboardPosition,
  onRestart,
  onViewStats,
}: GameOverScreenProps) {
  const router = useRouter();
  const isNewHighScore = score === highScore && score > 0;
  const isInLeaderboard = leaderboardPosition !== undefined;

  const handleExitToHome = () => {
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="mx-4 flex max-w-2xl flex-col items-center gap-6">
        {/* Title */}
        <h1 className="text-7xl font-bold text-red-500">GAME OVER</h1>

        {/* Scores */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-white">Final Score:</span>
            <span className="text-4xl font-bold text-white">{score}</span>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-xl text-green-500">High Score:</span>
            <span className="text-3xl font-bold text-green-500">{highScore}</span>
          </div>

          {isNewHighScore && (
            <div className="animate-pulse rounded-lg bg-yellow-500/20 px-6 py-2">
              <span className="text-xl font-bold text-yellow-400">🎉 New High Score!</span>
            </div>
          )}

          {isInLeaderboard && (
            <div className="rounded-lg border border-primary/30 bg-primary/20 px-6 py-2">
              <span className="text-lg font-bold text-primary">
                {leaderboardPosition === 1 ? '🥇' : leaderboardPosition === 2 ? '🥈' : leaderboardPosition === 3 ? '🥉' : '🏆'} 
                {' '}Top {leaderboardPosition} Score!
              </span>
            </div>
          )}
        </div>

        {/* Educational Messages */}
        <div className="mt-4 space-y-2 text-center text-gray-400">
          <p className="text-lg">
            Balancing features and bugs is the key to success.
          </p>
          <p className="text-lg">
            Build infrastructure to automate bug prevention!
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <button
            onClick={onRestart}
            className="rounded-lg bg-green-500 px-12 py-4 text-2xl font-bold text-white shadow-lg shadow-green-500/50 transition-all hover:scale-105 hover:bg-green-600 hover:shadow-xl hover:shadow-green-500/70 active:scale-95"
          >
            Restart Game
          </button>
          
          {onViewStats && (
            <button
              onClick={onViewStats}
              className="rounded-lg bg-primary/80 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-primary hover:shadow-xl active:scale-95"
            >
              View Stats
            </button>
          )}

          <button
            onClick={handleExitToHome}
            className="rounded-lg bg-red-600 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-red-700 hover:shadow-xl active:scale-95"
          >
            Exit to Home
          </button>
        </div>

        <p className="mt-2 text-sm text-gray-400">
          Press R to restart
        </p>
      </div>
    </div>
  );
}
