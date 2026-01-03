'use client';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

export function GameOverScreen({ score, highScore, onRestart }: GameOverScreenProps) {
  const isNewHighScore = score === highScore && score > 0;

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

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="mt-4 rounded-lg bg-green-500 px-12 py-4 text-2xl font-bold text-white shadow-lg shadow-green-500/50 transition-all hover:scale-105 hover:bg-green-600 hover:shadow-xl hover:shadow-green-500/70 active:scale-95"
        >
          Press R to restart
        </button>
      </div>
    </div>
  );
}
