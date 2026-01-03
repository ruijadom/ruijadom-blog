'use client';

interface GameHelpScreenProps {
  onClose: () => void;
}

export function GameHelpScreen({ onClose }: GameHelpScreenProps) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto bg-black/95 p-4">
      <div className="m-auto flex w-full max-w-3xl flex-col items-center gap-4 md:gap-6">
        {/* Title */}
        <h1 className="text-4xl font-bold text-yellow-400 md:text-5xl">HELP</h1>

        {/* Game Metaphor Box */}
        <div className="w-full rounded-lg border-2 border-primary bg-primary/10 p-4 backdrop-blur-sm md:p-6">
          <div className="space-y-2 text-center text-gray-200 md:space-y-3">
            <p className="text-sm md:text-base">🪨 Asteroids = Resources for building features</p>
            <p className="text-sm md:text-base">🐛 Bugs = Problems that attack your project</p>
            <p className="text-sm md:text-base">🛰️ Satellites = Automation tools that fight bugs</p>
            <p className="text-sm md:text-base">🏗️ Space Stations = Infrastructure that prevents bugs</p>
            <div className="pt-2">
              <p className="text-xs text-gray-300 md:text-sm">
                Collect 20 asteroids to deploy a defensive structure.
              </p>
              <p className="text-xs text-gray-300 md:text-sm">
                Quotes appear automatically when structures deploy!
              </p>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="w-full">
          <h2 className="mb-3 text-center text-lg font-bold text-yellow-400 md:mb-4 md:text-xl">
            CONTROLS
          </h2>
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-300 md:grid-cols-2 md:gap-3 md:text-base">
            <div className="space-y-1 text-center md:space-y-2 md:text-right">
              <p>← → or A D: Move</p>
              <p>Space: Shoot</p>
              <p>?: Toggle Help</p>
            </div>
            <div className="space-y-1 text-center md:space-y-2 md:text-left">
              <p>ESC: Pause</p>
              <p>R: Restart</p>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-gray-400 md:mt-3 md:hidden md:text-sm">
            Touch controls available at bottom
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-primary px-8 py-3 text-base font-bold text-white transition-all hover:scale-105 hover:bg-primary/90 active:scale-95 md:w-auto md:px-12 md:text-xl"
        >
          <span className="md:hidden">Close</span>
          <span className="hidden md:inline">Press ? or ESC to close</span>
        </button>
      </div>
    </div>
  );
}
