'use client';

import { useRouter } from 'next/navigation';

interface GameWelcomeScreenProps {
  onStart: () => void;
  onViewStats?: () => void;
}

export function GameWelcomeScreen({ onStart, onViewStats }: GameWelcomeScreenProps) {
  const router = useRouter();

  const handleExitToHome = () => {
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95">
      <div className="mx-4 flex max-w-3xl flex-col items-center gap-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold text-primary">DEV SPACE</h1>
          <p className="text-2xl font-bold text-green-500">
            Build Infrastructure, Not Just Code
          </p>
        </div>

        {/* Game Metaphor Box */}
        <div className="w-full rounded-lg border-2 border-primary bg-primary/10 p-6 backdrop-blur-sm">
          <div className="space-y-3 text-center text-gray-200">
            <p className="text-lg">🪨 Asteroids = Resources for building features</p>
            <p className="text-lg">🐛 Bugs = Problems that attack your project</p>
            <p className="text-lg">🛰️ Satellites = Automation tools that fight bugs</p>
            <p className="text-lg">🏗️ Space Stations = Infrastructure that prevents bugs</p>
            <div className="pt-2">
              <p className="text-base text-gray-300">
                Collect asteroids to deploy defensive structures!
              </p>
              <p className="text-base text-gray-300">
                Build infrastructure to automate bug prevention.
              </p>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="w-full">
          <h2 className="mb-4 text-center text-2xl font-bold text-yellow-400">
            CONTROLS
          </h2>
          <div className="grid grid-cols-1 gap-4 text-gray-300 md:grid-cols-2">
            <div className="space-y-2 text-center md:text-right">
              <p className="text-lg">← → or A D: Move</p>
              <p className="text-lg">Space: Shoot</p>
            </div>
            <div className="space-y-2 text-center md:text-left">
              <p className="text-lg">ESC: Pause</p>
              <p className="text-lg">R: Restart</p>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-gray-400 md:hidden">
            Touch controls available at bottom
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            onClick={onStart}
            className="group relative overflow-hidden rounded-lg border-2 border-purple-600 bg-primary px-16 py-4 text-2xl font-bold text-white shadow-lg shadow-primary/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/70 active:scale-95"
          >
            <span className="relative z-10">START GAME</span>
            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>

          {onViewStats && (
            <button
              onClick={onViewStats}
              className="rounded-lg bg-slate-700 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-slate-600 active:scale-95"
            >
              📊 Stats
            </button>
          )}

          <button
            onClick={handleExitToHome}
            className="rounded-lg bg-red-600 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-red-700 active:scale-95"
          >
            ← Back to Home
          </button>
        </div>

        <p className="text-sm text-gray-400">
          Click button or press SPACE to start
        </p>
      </div>
    </div>
  );
}
