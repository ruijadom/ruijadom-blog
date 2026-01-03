import { useState, useCallback, useEffect } from 'react';

// ============================================================================
// Core Type Definitions
// ============================================================================

/**
 * Main game state interface
 * Tracks overall game lifecycle and player stats
 */
export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  level: number;
  lives: number;
  score: number;
  highScore: number;
}

/**
 * Rocket entity interface
 */
export interface Rocket {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  lives: number;
}

/**
 * Bullet entity interface
 */
export interface Bullet {
  x: number;
  y: number;
  speed: number;
  owner: 'player' | 'satellite' | 'station';
}

/**
 * Asteroid/Bug entity interface
 */
export interface Asteroid {
  x: number;
  y: number;
  radius: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  type: 'asteroid' | 'bug';
  health?: number; // Only for bugs
}

/**
 * Defensive structure interface (Satellites and Space Stations)
 */
export interface DefensiveStructure {
  id: string;
  x: number;
  y: number;
  type: 'satellite' | 'station';
  range: number;
  fireRate: number;
  lastShot: number;
  quote: string; // Educational quote
}

/**
 * Resource system state
 * Tracks collected resources and deployed structures
 */
export interface ResourceState {
  collected: number; // Current resources (resets after deploy)
  totalCollected: number; // All-time total
  nextDeployAt: number; // Resources needed for next deploy
  satellites: DefensiveStructure[];
  stations: DefensiveStructure[];
}

/**
 * Level progression state
 * Manages difficulty scaling
 */
export interface LevelState {
  current: number;
  asteroidSpawnRate: number;
  bugSpawnRate: number;
  bugSpeed: number;
  asteroidsForNextLevel: number;
}

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Hook for managing main game state
 * Handles game lifecycle: start, pause, resume, game over, reset
 */
export function useGameState() {
  const [state, setState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    level: 1,
    lives: 3,
    score: 0,
    highScore: 0,
  });

  // Load high score from localStorage on mount
  useEffect(() => {
    try {
      const savedHighScore = localStorage.getItem('spaceDevGameHighScore');
      if (savedHighScore) {
        setState((prev) => ({ ...prev, highScore: parseInt(savedHighScore, 10) }));
      }
    } catch (e) {
      console.warn('Could not load high score:', e);
    }
  }, []);

  const startGame = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      level: 1,
      lives: 3,
      score: 0,
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resumeGame = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const gameOver = useCallback(() => {
    setState((prev) => {
      const newHighScore = Math.max(prev.score, prev.highScore);
      
      // Save high score to localStorage
      try {
        localStorage.setItem('spaceDevGameHighScore', newHighScore.toString());
      } catch (e) {
        console.warn('Could not save high score:', e);
      }

      return {
        ...prev,
        isPlaying: false,
        isGameOver: true,
        highScore: newHighScore,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      level: 1,
      lives: 3,
      score: 0,
    }));
  }, []);

  const incrementScore = useCallback((points: number) => {
    setState((prev) => ({ ...prev, score: prev.score + points }));
  }, []);

  const decrementLives = useCallback(() => {
    setState((prev) => {
      const newLives = prev.lives - 1;
      if (newLives <= 0) {
        // Game over will be triggered by the caller
        return { ...prev, lives: 0 };
      }
      return { ...prev, lives: newLives };
    });
  }, []);

  const incrementLevel = useCallback(() => {
    setState((prev) => ({ ...prev, level: prev.level + 1 }));
  }, []);

  return {
    state,
    startGame,
    pauseGame,
    resumeGame,
    gameOver,
    resetGame,
    incrementScore,
    decrementLives,
    incrementLevel,
  };
}

/**
 * Hook for managing resource collection and deploy system
 * Handles resource counting and defensive structure deployment
 */
export function useResourceSystem(onDeploy?: (structure: DefensiveStructure) => void) {
  const [resources, setResources] = useState<ResourceState>({
    collected: 0,
    totalCollected: 0,
    nextDeployAt: 20,
    satellites: [],
    stations: [],
  });

  const collectResource = useCallback(() => {
    setResources((prev) => {
      const newCollected = prev.collected + 1;
      const newTotalCollected = prev.totalCollected + 1;

      // Check if we should deploy a structure
      if (newCollected >= prev.nextDeployAt) {
        // Deploy will be handled separately
        return {
          ...prev,
          collected: newCollected,
          totalCollected: newTotalCollected,
        };
      }

      return {
        ...prev,
        collected: newCollected,
        totalCollected: newTotalCollected,
      };
    });
  }, []);

  const deployStructure = useCallback(
    (canvasWidth: number, canvasHeight: number) => {
      console.log('🎯 deployStructure called!');
      setResources((prev) => {
        console.log('🔄 setResources callback executing', {
          collected: prev.collected,
          totalCollected: prev.totalCollected,
          satellites: prev.satellites.length,
          stations: prev.stations.length
        });
        
        // Determine structure type based on deploy count
        const totalStructures = prev.satellites.length + prev.stations.length;
        const structureType: 'satellite' | 'station' =
          totalStructures === 0 ? 'satellite' : totalStructures === 1 ? 'station' : totalStructures % 2 === 0 ? 'satellite' : 'station';

        console.log('🏗️ Creating structure:', { type: structureType, totalStructures });

        // Random position across screen width (with margins)
        const margin = 100; // Keep structures away from edges
        const xPosition = margin + Math.random() * (canvasWidth - margin * 2);
        
        // Random position in upper half of screen
        const yPosition = 100 + Math.random() * (canvasHeight * 0.4); // Between 100px and 40% of screen height

        const newStructure: DefensiveStructure = {
          id: `${structureType}-${Date.now()}`,
          x: xPosition,
          y: yPosition,
          type: structureType,
          range: structureType === 'satellite' ? 200 : 300,
          fireRate: structureType === 'satellite' ? 1000 : 500,
          lastShot: 0,
          quote: getRandomQuote(structureType),
        };

        console.log('✅ Calling onDeploy callback');
        // Call the onDeploy callback if provided
        if (onDeploy) {
          onDeploy(newStructure);
        }

        // Update state
        const newState = {
          ...prev,
          collected: 0, // Reset counter after deploy
          nextDeployAt: 20, // Always 20 resources for next deploy
          satellites: structureType === 'satellite' ? [...prev.satellites, newStructure] : prev.satellites,
          stations: structureType === 'station' ? [...prev.stations, newStructure] : prev.stations,
        };

        return newState;
      });
    },
    [onDeploy]
  );

  const resetResources = useCallback(() => {
    setResources({
      collected: 0,
      totalCollected: 0,
      nextDeployAt: 20,
      satellites: [],
      stations: [],
    });
  }, []);

  return {
    resources,
    collectResource,
    deployStructure,
    resetResources,
  };
}

/**
 * Hook for managing level progression and difficulty scaling
 * Adjusts spawn rates and enemy speeds based on level
 */
export function useLevelSystem(totalAsteroids: number) {
  const [level, setLevel] = useState<LevelState>({
    current: 1,
    asteroidSpawnRate: 2000,
    bugSpawnRate: 5000,
    bugSpeed: 2,
    asteroidsForNextLevel: 50,
  });

  const checkLevelUp = useCallback(() => {
    setLevel((prev) => {
      if (totalAsteroids >= prev.asteroidsForNextLevel) {
        const newLevel = prev.current + 1;
        
        // Calculate new difficulty values with caps
        const newAsteroidSpawnRate = Math.max(800, prev.asteroidSpawnRate * 0.9); // 10% faster, min 800ms
        const newBugSpawnRate = Math.max(2000, prev.bugSpawnRate * 0.85); // 15% faster, min 2000ms
        const newBugSpeed = Math.min(5, prev.bugSpeed * 1.1); // 10% faster, max 5 pixels/frame

        return {
          current: newLevel,
          asteroidSpawnRate: newAsteroidSpawnRate,
          bugSpawnRate: newBugSpawnRate,
          bugSpeed: newBugSpeed,
          asteroidsForNextLevel: prev.asteroidsForNextLevel + 50,
        };
      }
      return prev;
    });
  }, [totalAsteroids]);

  const resetLevel = useCallback(() => {
    setLevel({
      current: 1,
      asteroidSpawnRate: 2000,
      bugSpawnRate: 5000,
      bugSpeed: 2,
      asteroidsForNextLevel: 50,
    });
  }, []);

  return {
    level,
    checkLevelUp,
    resetLevel,
  };
}

// ============================================================================
// Educational Quotes
// ============================================================================

const SATELLITE_QUOTES = [
  'Automation is not about replacing humans, it\'s about freeing them',
  'Good tools make good developers great',
  'The best code is no code at all',
  'Measure twice, cut once - automate forever',
  'Testing is an investment, not a cost',
  'CI/CD: Deploy fast, fail fast, learn fast',
  'Linting catches bugs before they hatch',
  'Code review is a conversation, not a criticism',
  'Documentation is a love letter to your future self',
  'Refactoring is gardening, not demolition',
  'Small commits, big impact',
  'Write code that reads like poetry',
];

const STATION_QUOTES = [
  'Technical debt compounds like financial debt',
  'Architecture is about the important stuff, whatever that is',
  'Make it work, make it right, make it fast - in that order',
  'Premature optimization is the root of all evil',
  'Simplicity is the ultimate sophistication',
  'Good architecture makes the system easy to understand, develop, and maintain',
  'The best time to fix technical debt was yesterday, the second best time is now',
  'Scalability is not an afterthought, it\'s a foundation',
  'Microservices are not a silver bullet, they\'re a trade-off',
  'Infrastructure as code: version control for your entire stack',
  'Design for failure, plan for success',
  'Monoliths aren\'t evil, they\'re just misunderstood',
];

/**
 * Get a random educational quote for a structure type
 */
function getRandomQuote(type: 'satellite' | 'station'): string {
  const quotes = type === 'satellite' ? SATELLITE_QUOTES : STATION_QUOTES;
  return quotes[Math.floor(Math.random() * quotes.length)];
}
