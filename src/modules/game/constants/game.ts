// ============================================================================
// Game Configuration Constants
// ============================================================================

export const GAME_CONFIG = {
  ROCKET: {
    WIDTH: 60,
    HEIGHT: 80,
    SPEED: 8,
    INITIAL_LIVES: 3,
  },
  BULLET: {
    SPEED: 10,
    RADIUS: 4,
    FIRE_RATE: 200, // ms between shots
  },
  ASTEROID: {
    MIN_RADIUS: 20,
    MAX_RADIUS: 40,
    MIN_SPEED: 1,
    MAX_SPEED: 3,
  },
  BUG: {
    MIN_RADIUS: 15,
    MAX_RADIUS: 25,
    SPECIAL_FREQUENCY: 3, // Every 3rd bug is special
    DUST_EMISSION_INTERVAL: 800, // ms
    MAX_DUST_PARTICLES: 6,
    DUST_SPREAD: 0.5, // Multiplier for particle spread
  },
  NEST: {
    HEALTH: 50,
    SPAWN_INTERVAL: 5000, // ms
    MAX_DURATION: 30000, // ms
    RADIUS: 30,
    MIN_PARTICLES_TO_FORM: 5,
    PARTICLE_CLUSTER_RADIUS: 100,
  },
  DUST: {
    LIFETIME: 20000, // ms
    MIN_SIZE: 4,
    MAX_SIZE: 6,
    MIN_OPACITY: 0.7,
    MAX_OPACITY: 0.9,
  },
  STRUCTURE: {
    SATELLITE: {
      RANGE: 200,
      FIRE_RATE: 1000,
      BULLET_SPEED: 8,
    },
    STATION: {
      RANGE: 300,
      FIRE_RATE: 500,
      BULLET_SPEED: 10,
    },
  },
  RESOURCE: {
    DEPLOY_THRESHOLD: 20,
  },
  LEVEL: {
    INITIAL_ASTEROID_SPAWN_RATE: 2000,
    INITIAL_BUG_SPAWN_RATE: 5000,
    INITIAL_BUG_SPEED: 2,
    ASTEROIDS_PER_LEVEL: 50,
    MIN_ASTEROID_SPAWN_RATE: 800,
    MIN_BUG_SPAWN_RATE: 2000,
    MAX_BUG_SPEED: 5,
  },
  MOBILE: {
    SPEED_MULTIPLIER: 0.6,
    SPAWN_MULTIPLIER: 1.5,
    BREAKPOINT: 768,
  },
  SCORING: {
    ASTEROID: 10,
    BUG_NORMAL: 25,
    BUG_SPECIAL: 35,
    NEST_DESTROYED: 100,
  },
} as const;

// ============================================================================
// Visual Constants
// ============================================================================

export const COLORS = {
  ROCKET: {
    BODY: '#3b82f6',
    WINDOW: '#60a5fa',
    WINGS: '#1e40af',
    FLAMES: {
      ORANGE: '#f59e0b',
      RED: '#ef4444',
      YELLOW: '#fbbf24',
    },
    JS_TEXT: '#f7df1e',
  },
  BUG: {
    NORMAL: {
      BODY: '#dc2626',
      HEAD: '#991b1b',
      LEGS: '#7f1d1d',
      EYES: '#fef08a',
    },
    SPECIAL: {
      BODY: '#991b1b',
      HEAD: '#7f1d1d',
      AURA: '#fbbf24',
    },
  },
  ASTEROID: {
    BODY: '#78716c',
    DETAIL: '#57534e',
  },
  NEST: {
    BODY: '#57534e',
    VEINS: '#dc2626',
    CORE: '#991b1b',
  },
  DUST: {
    PARTICLE: '#78716c',
    GLOW: '#fbbf24',
  },
  BULLET: {
    PLAYER: '#10b981',
    SATELLITE: '#3b82f6',
    STATION: '#10b981',
  },
  STRUCTURE: {
    SATELLITE: {
      BODY: '#60a5fa',
      GRADIENT_START: '#60a5fa',
      GRADIENT_END: '#3b82f6',
      RING: '#1e40af',
      PANELS: '#1e3a8a',
      PANEL_DETAIL: '#60a5fa',
      ANTENNA: '#94a3b8',
      ANTENNA_TIP: '#ef4444',
    },
    STATION: {
      BODY: '#4ade80',
      GRADIENT_START: '#4ade80',
      GRADIENT_END: '#10b981',
      RING: '#047857',
      ROTATING_RING: '#059669',
      MODULES: '#065f46',
      WINDOWS: '#34d399',
      DISHES: '#6ee7b7',
      CORE: '#047857',
    },
  },
  UI: {
    PRIMARY: '#a855f7',
    SECONDARY: '#10b981',
    WARNING: '#fbbf24',
    DANGER: '#ef4444',
    INFO: '#3b82f6',
    TEXT: '#ffffff',
    TEXT_MUTED: '#94a3b8',
    BACKGROUND: 'rgba(0, 0, 0, 0.5)',
  },
} as const;

// ============================================================================
// Educational Quotes
// ============================================================================

export const SATELLITE_QUOTES = [
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
] as const;

export const STATION_QUOTES = [
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
] as const;

// ============================================================================
// Helper Functions
// ============================================================================

export function getRandomQuote(type: 'satellite' | 'station'): string {
  const quotes = type === 'satellite' ? SATELLITE_QUOTES : STATION_QUOTES;
  return quotes[Math.floor(Math.random() * quotes.length)];
}
