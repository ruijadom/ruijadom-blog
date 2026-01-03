'use client';

interface GameHelpScreenProps {
  onClose: () => void;
}

export function GameHelpScreen({ onClose }: GameHelpScreenProps) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95">
      <div className="mx-4 flex max-w-3xl flex-col items-center gap-6">
        {/* Title */}
        <h1 className="text-5xl font-bold text-yellow-400">HELP</h1>

        {/* Game Metaphor Box */}
        <div className="w-full rounded-lg border-2 border-primary bg-primary/10 p-6 backdrop-blur-sm">
          <div className="space-y-3 text-center text-gray-200">
            <p className="text-base">🪨 Asteroids = Resources for building features</p>
            <p className="text-base">🐛 Bugs = Problems that attack your project</p>
            <p className="text-base">🛰️ Satellites = Automation tools that fight bugs</p>
            <p className="text-base">🏗️ Space Stations = Infrastructure that prevents bugs</p>
            <div className="pt-2">
              <p className="text-sm text-gray-300">
                Collect 20 asteroids to deploy a defensive structure.
              </p>
              <p className="text-sm text-gray-300">
                Quotes appear automatically when structures deploy!
              </p>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="w-full">
          <h2 className="mb-4 text-center text-xl font-bold text-yellow-400">
            CONTROLS
          </h2>
          <div className="grid grid-cols-1 gap-3 text-gray-300 md:grid-cols-2">
            <div className="space-y-2 text-center md:text-right">
              <p>← → or A D: Move</p>
              <p>Space: Shoot</p>
              <p>?: Toggle Help</p>
            </div>
            <div className="space-y-2 text-center md:text-left">
              <p>ESC: Pause</p>
              <p>R: Restart</p>
            </div>
          </div>
          <p className="mt-3 text-center text-sm text-gray-400 md:hidden">
            Touch controls available at bottom
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="rounded-lg bg-primary px-12 py-3 text-xl font-bold text-white transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
        >
          Press ? or ESC to close
        </button>
      </div>
    </div>
  );
}
