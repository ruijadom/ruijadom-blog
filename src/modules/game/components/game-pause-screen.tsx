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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col items-center gap-6 md:gap-8">
        <h1 className="text-5xl font-bold text-blue-500 md:text-7xl">PAUSED</h1>
        
        <div className="flex w-full flex-col items-center gap-3 md:gap-4">
          <button
            onClick={onResume}
            className="w-full rounded-lg bg-blue-500 px-8 py-3 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-blue-600 active:scale-95 md:px-12 md:py-4 md:text-xl"
          >
            Resume Game
          </button>
          
          <button
            onClick={onRestart}
            className="w-full rounded-lg bg-slate-700 px-8 py-3 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-slate-600 active:scale-95 md:px-12 md:py-4 md:text-xl"
          >
            Restart Game
          </button>

          {onViewStats && (
            <button
              onClick={onViewStats}
              className="w-full rounded-lg bg-primary px-8 py-3 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-primary/80 active:scale-95 md:px-12 md:py-4 md:text-xl"
            >
              📊 View Stats
            </button>
          )}

          <button
            onClick={handleExitToHome}
            className="w-full rounded-lg bg-red-600 px-8 py-3 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-red-700 active:scale-95 md:px-12 md:py-4 md:text-xl"
          >
            Exit to Home
          </button>
        </div>

        <div className="mt-2 hidden flex-col items-center gap-2 text-sm text-gray-400 md:mt-4 md:flex">
          <p>ESC - Resume</p>
          <p>R - Restart</p>
        </div>
      </div>
    </div>
  );
}
