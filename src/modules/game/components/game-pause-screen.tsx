'use client';

interface GamePauseScreenProps {
  onResume: () => void;
  onRestart: () => void;
}

export function GamePauseScreen({ onResume, onRestart }: GamePauseScreenProps) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-7xl font-bold text-blue-500">PAUSED</h1>
        
        <div className="flex flex-col items-center gap-4 text-xl">
          <button
            onClick={onResume}
            className="rounded-lg bg-blue-500 px-8 py-3 font-bold text-white transition-all hover:scale-105 hover:bg-blue-600 active:scale-95"
          >
            Press ESC to continue
          </button>
          
          <button
            onClick={onRestart}
            className="text-gray-400 transition-colors hover:text-white"
          >
            Press R to restart
          </button>
        </div>
      </div>
    </div>
  );
}
