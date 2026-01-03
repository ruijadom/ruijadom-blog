import React from 'react';
import type { GameStatistics, LeaderboardEntry } from '@/modules/game/utils/storage';

interface GameStatsScreenProps {
  statistics: GameStatistics;
  leaderboard: LeaderboardEntry[];
  onClose: () => void;
}

export function GameStatsScreen({ statistics, leaderboard, onClose }: GameStatsScreenProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md">
      <div className="relative mx-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 border-b border-primary/30 bg-gradient-to-r from-primary/20 to-blue-500/20 p-6 backdrop-blur-sm">
          <h2 className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-center text-3xl font-bold text-transparent">
            📊 Game Statistics
          </h2>
        </div>

        <div className="space-y-6 p-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              icon="🎮"
              label="Games Played"
              value={statistics.totalGamesPlayed.toLocaleString()}
            />
            <StatCard
              icon="🐛"
              label="Bugs Killed"
              value={statistics.totalBugsKilled.toLocaleString()}
            />
            <StatCard
              icon="☄️"
              label="Asteroids"
              value={statistics.totalAsteroidsDestroyed.toLocaleString()}
            />
            <StatCard
              icon="⛏️"
              label="Resources"
              value={statistics.totalResourcesCollected.toLocaleString()}
            />
            <StatCard
              icon="🏗️"
              label="Structures"
              value={statistics.totalStructuresDeployed.toLocaleString()}
            />
            <StatCard
              icon="⏱️"
              label="Play Time"
              value={formatTime(statistics.totalPlayTimeMs)}
            />
            <StatCard
              icon="🏆"
              label="Highest Level"
              value={statistics.highestLevel.toString()}
            />
            <StatCard
              icon="📅"
              label="Last Played"
              value={formatDate(statistics.lastPlayedAt)}
              small
            />
          </div>

          {/* Leaderboard */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-xl font-bold text-primary">
              🏆 Top 10 Scores
            </h3>
            
            {leaderboard.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No scores yet. Play to set your first record!
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                      index === 0
                        ? 'border-yellow-500/30 bg-yellow-500/10'
                        : index === 1
                        ? 'border-gray-400/30 bg-gray-400/10'
                        : index === 2
                        ? 'border-orange-600/30 bg-orange-600/10'
                        : 'border-slate-700/50 bg-slate-800/50'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 shrink-0 text-center">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>

                    {/* Score */}
                    <div className="flex-1">
                      <div className="text-lg font-bold">{entry.score.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        Level {entry.level} • {entry.bugsKilled} bugs • {entry.asteroidsDestroyed} asteroids
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-right text-xs text-muted-foreground">
                      {formatDate(entry.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={onClose}
              className="rounded-lg bg-primary px-8 py-3 font-bold text-primary-foreground transition-colors hover:bg-primary/80"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  small?: boolean;
}

function StatCard({ icon, label, value, small }: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4 text-center transition-colors hover:border-primary/30">
      <div className="mb-2 text-2xl">{icon}</div>
      <div className={`font-bold ${small ? 'text-sm' : 'text-xl'} mb-1 text-primary`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
