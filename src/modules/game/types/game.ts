// ============================================================================
// Game Entity Types
// ============================================================================

export interface Rocket {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  lives: number;
}

export interface Bullet {
  x: number;
  y: number;
  speed: number;
  owner: 'player' | 'satellite' | 'station';
  directionX?: number;
  directionY?: number;
}

export interface Asteroid {
  x: number;
  y: number;
  radius: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  type: 'asteroid' | 'bug';
  isSpecial?: boolean;
  lastDustEmission?: number;
  dustEmitted?: number;
}

export interface DustParticle {
  x: number;
  y: number;
  createdAt: number;
  opacity: number;
  size: number;
}

export interface BugNest {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  createdAt: number;
  lastSpawn: number;
  spawnInterval: number;
  maxDuration: number;
  radius: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface DefensiveStructure {
  id: string;
  x: number;
  y: number;
  type: 'satellite' | 'station';
  range: number;
  fireRate: number;
  lastShot: number;
  quote: string;
}

// ============================================================================
// Animation Types
// ============================================================================

export interface DeployAnimation {
  x: number;
  y: number;
  startTime: number;
  duration: number;
  type: 'satellite' | 'station';
}

export interface LevelUpAnimation {
  startTime: number;
  duration: number;
  level: number;
}

// ============================================================================
// Game State Types
// ============================================================================

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  level: number;
  lives: number;
  score: number;
  highScore: number;
}

export interface ResourceState {
  collected: number;
  totalCollected: number;
  nextDeployAt: number;
  satellites: DefensiveStructure[];
  stations: DefensiveStructure[];
}

export interface LevelState {
  current: number;
  asteroidSpawnRate: number;
  bugSpawnRate: number;
  bugSpeed: number;
  asteroidsForNextLevel: number;
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType = 'deploy' | 'levelup' | 'damage' | 'info';

export interface Notification {
  id: string;
  message: string;
  timestamp: number;
  duration: number;
  type: NotificationType;
}

// ============================================================================
// Screen Effect Types
// ============================================================================

export interface ScreenShake {
  x: number;
  y: number;
  intensity: number;
}
