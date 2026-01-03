'use client';

import { useRouter } from 'next/navigation';

interface GamePauseScreenProps {
  onResume: () => void;
  onRestart: () => void;
  onViewStats?: () => void;
}

export function GamePauseScreen({ onResume, onRestart, onViewStats }: GamePauseScreenProps) {
  const router = useRouter();

  const handleExitToHome = () => {
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-7xl font-bold text-blue-500">PAUSED</h1>
        
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onResume}
            className="rounded-lg bg-blue-500 px-12 py-4 text-xl font-bold text-white transition-all hover:scale-105 hover:bg-blue-600 active:scale-95"
          >
            Resume Game
          </button>
          
          <button
            onClick={onRestart}
            className="rounded-lg bg-slate-700 px-12 py-4 text-xl font-bold text-white transition-all hover:scale-105 hover:bg-slate-600 active:scale-95"
          >
            Restart Game
          </button>

          {onViewStats && (
            <button
              onClick={onViewStats}
              className="rounded-lg bg-primary px-12 py-4 text-xl font-bold text-white transition-all hover:scale-105 hover:bg-primary/80 active:scale-95"
            >
              📊 View Stats
            </button>
          )}

          <button
            onClick={handleExitToHome}
            className="rounded-lg bg-red-600 px-12 py-4 text-xl font-bold text-white transition-all hover:scale-105 hover:bg-red-700 active:scale-95"
          >
            Exit to Home
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center gap-2 text-sm text-gray-400">
          <p>ESC - Resume</p>
          <p>R - Restart</p>
        </div>
      </div>
    </div>
  );
}
