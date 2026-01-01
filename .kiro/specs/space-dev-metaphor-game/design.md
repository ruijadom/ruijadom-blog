# Design Document: Space Dev Metaphor Game

## Overview

O Space Dev Metaphor Game é uma evolução do componente `rocket-ship.tsx` existente, transformando-o em um jogo educacional completo que ilustra conceitos fundamentais de desenvolvimento de software através de uma metáfora espacial interativa.

A metáfora central: **Asteroides representam recursos/features**, **Bugs são inimigos**, e **Satélites/Estações Espaciais representam infraestrutura e automação**. O jogo demonstra que focar exclusivamente em bugs cria um ciclo vicioso, enquanto investir em infraestrutura (fazer deploys) reduz bugs automaticamente.

### Core Metaphor

- **Asteroides (marrom/cinza)**: Recursos para construir features - o jogador deve coletar
- **Bugs (vermelhos)**: Problemas que atacam - o jogador deve gerenciar
- **Satélites**: Primeira camada de automação - destroem bugs automaticamente (deploy a cada 20 asteroides)
- **Estações Espaciais**: Infraestrutura avançada - maior alcance e taxa de fogo (deploy a cada 40 asteroides)
- **Mensagem**: Construir infraestrutura é mais eficiente que apenas corrigir bugs

## Architecture

### Component Structure

```
space-dev-metaphor-game.tsx (main component)
├── Game State Management
│   ├── useGameState() - Estado global do jogo
│   ├── useResourceSystem() - Gerencia recursos e deploys
│   └── useLevelSystem() - Progressão e dificuldade
├── Rendering System
│   ├── Canvas Renderer - 60fps usando requestAnimationFrame
│   ├── Entity Renderers - Desenha todos os objetos
│   └── HUD Renderer - Interface e estatísticas
├── Physics & Collision
│   ├── Collision Detection - Detecção circular
│   └── Movement System - Atualiza posições
├── Input System
│   ├── Keyboard Handler
│   └── Touch Handler
└── Game Logic
    ├── Spawn System - Gera asteroides e bugs
    ├── Deploy System - Cria satélites e estações
    └── Defensive System - Satélites atacam bugs
```

### Technology Stack

- **React 18+** com hooks para gerenciamento de estado
- **TypeScript** para type safety
- **HTML5 Canvas API** para renderização de alta performance
- **Next.js** (já utilizado no projeto)
- **Tailwind CSS** para HUD e controles touch

## Components and Interfaces

### Core Types

```typescript
// Game State
interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  level: number;
  lives: number;
  score: number;
  highScore: number;
}

// Entities
interface Rocket {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  lives: number;
}

interface Bullet {
  x: number;
  y: number;
  speed: number;
  owner: 'player' | 'satellite' | 'station';
}

interface Asteroid {
  x: number;
  y: number;
  radius: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  type: 'asteroid' | 'bug';
  health?: number; // Only for bugs
}

interface DefensiveStructure {
  id: string;
  x: number;
  y: number;
  type: 'satellite' | 'station';
  range: number;
  fireRate: number;
  lastShot: number;
  quote: string; // Educational quote
}

// Resource System
interface ResourceState {
  collected: number; // Current resources
  totalCollected: number; // All-time total
  nextDeployAt: number; // Resources needed for next deploy
  satellites: DefensiveStructure[];
  stations: DefensiveStructure[];
}

// Level System
interface LevelState {
  current: number;
  asteroidSpawnRate: number;
  bugSpawnRate: number;
  bugSpeed: number;
  asteroidsForNextLevel: number;
}
```

### Custom Hooks

```typescript
// Main game state hook
function useGameState() {
  const [state, setState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    level: 1,
    lives: 3,
    score: 0,
    highScore: 0,
  });

  const startGame = () => { /* ... */ };
  const pauseGame = () => { /* ... */ };
  const resumeGame = () => { /* ... */ };
  const gameOver = () => { /* ... */ };
  const resetGame = () => { /* ... */ };

  return { state, startGame, pauseGame, resumeGame, gameOver, resetGame };
}

// Resource and deploy management
function useResourceSystem(onDeploy: (structure: DefensiveStructure) => void) {
  const [resources, setResources] = useState<ResourceState>({
    collected: 0,
    totalCollected: 0,
    nextDeployAt: 20,
    satellites: [],
    stations: [],
  });

  const collectResource = () => { /* ... */ };
  const deployStructure = () => { /* ... */ };
  const getRandomQuote = (type: 'satellite' | 'station') => { /* ... */ };

  return { resources, collectResource, deployStructure };
}

// Level progression
function useLevelSystem(totalAsteroids: number) {
  const [level, setLevel] = useState<LevelState>({
    current: 1,
    asteroidSpawnRate: 2000,
    bugSpawnRate: 5000,
    bugSpeed: 2,
    asteroidsForNextLevel: 50,
  });

  const checkLevelUp = () => { /* ... */ };
  const calculateDifficulty = () => { /* ... */ };

  return { level, checkLevelUp };
}
```

## Data Models

### Educational Quotes

```typescript
const SATELLITE_QUOTES = [
  "Automation is not about replacing humans, it's about freeing them",
  "Good tools make good developers great",
  "The best code is no code at all",
  "Measure twice, cut once - automate forever",
  "Testing is an investment, not a cost",
  "CI/CD: Deploy fast, fail fast, learn fast",
  "Linting catches bugs before they hatch",
  "Code review is a conversation, not a criticism",
  "Documentation is a love letter to your future self",
  "Refactoring is gardening, not demolition",
];

const STATION_QUOTES = [
  "Technical debt compounds like financial debt",
  "Architecture is about the important stuff, whatever that is",
  "Make it work, make it right, make it fast - in that order",
  "Premature optimization is the root of all evil",
  "Simplicity is the ultimate sophistication",
  "Good architecture makes the system easy to understand, develop, and maintain",
  "The best time to fix technical debt was yesterday, the second best time is now",
  "Scalability is not an afterthought, it's a foundation",
  "Microservices are not a silver bullet, they're a trade-off",
  "Infrastructure as code: version control for your entire stack",
];
```

### Spawn Rates and Difficulty Scaling

```typescript
interface DifficultyConfig {
  level: number;
  asteroidSpawnRate: number; // milliseconds
  bugSpawnRate: number; // milliseconds
  bugSpeed: number; // pixels per frame
  bugHealthMultiplier: number;
}

const DIFFICULTY_SCALING = {
  asteroidSpawnRateDecrease: 0.9, // 10% faster each level
  bugSpawnRateDecrease: 0.85, // 15% faster each level
  bugSpeedIncrease: 1.1, // 10% faster each level
  minAsteroidSpawnRate: 800, // Cap at 800ms
  minBugSpawnRate: 2000, // Cap at 2000ms
  maxBugSpeed: 5, // Cap at 5 pixels/frame
};
```

### Defensive Structure Configuration

```typescript
const STRUCTURE_CONFIG = {
  satellite: {
    range: 200,
    fireRate: 1000, // 1 shot per second
    bulletSpeed: 8,
    cost: 20, // resources
    width: 40,
    height: 40,
  },
  station: {
    range: 300,
    fireRate: 500, // 2 shots per second
    bulletSpeed: 10,
    cost: 40, // resources (cumulative)
    width: 60,
    height: 60,
  },
};
```

## Data Models (continued)

### Collision Detection

```typescript
interface CollisionSystem {
  checkCircleCollision(
    x1: number, y1: number, r1: number,
    x2: number, y2: number, r2: number
  ): boolean;
  
  checkBulletAsteroidCollisions(
    bullets: Bullet[],
    asteroids: Asteroid[]
  ): { bullet: Bullet; asteroid: Asteroid }[];
  
  checkRocketBugCollisions(
    rocket: Rocket,
    bugs: Asteroid[]
  ): Asteroid[];
  
  checkDefensiveStructureTargets(
    structures: DefensiveStructure[],
    bugs: Asteroid[]
  ): { structure: DefensiveStructure; target: Asteroid }[];
}
```

### HUD Layout

```typescript
interface HUDElements {
  topLeft: {
    resources: number;
    progressToNextDeploy: string; // "15/20"
  };
  topRight: {
    level: number;
    score: number;
  };
  topCenter: {
    lives: number; // Visual hearts
  };
  bottomLeft: {
    satellites: number;
    stations: number;
  };
  center: {
    notifications: Notification[];
    quotes: QuoteDisplay | null;
  };
}

interface Notification {
  id: string;
  message: string;
  type: 'deploy' | 'levelup' | 'damage' | 'info';
  duration: number;
  timestamp: number;
}

interface QuoteDisplay {
  quote: string;
  author: string;
  structureType: 'satellite' | 'station';
  position: { x: number; y: number };
  opacity: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Rocket Movement Respects Boundaries

*For any* rocket position and movement input (left/right), the rocket's x position should remain within [0, canvas.width - rocket.width].

**Validates: Requirements 1.1, 1.4**

### Property 2: Fire Rate Limiting

*For any* sequence of fire attempts within 200ms, only one bullet should be created.

**Validates: Requirements 1.5**

### Property 3: Resource Collection Increments Counter

*For any* asteroid destroyed by a player bullet, the resource counter should increase by exactly 1.

**Validates: Requirements 2.3**

### Property 4: Asteroid Movement Direction

*For any* asteroid, its y position should increase over time (moving downward).

**Validates: Requirements 2.2**

### Property 5: Deploy Triggers at Resource Threshold

*For any* resource counter value that is a multiple of 20, a defensive structure should be deployed and the counter should reset to 0.

**Validates: Requirements 2.6, 4.1, 4.2, 4.8**

### Property 6: Collision Detection is Symmetric

*For any* two circular objects A and B, if A collides with B, then B collides with A.

**Validates: Requirements 7.1**

### Property 7: Collision Removes Both Objects

*For any* bullet that collides with an asteroid or bug, both the bullet and the target should be removed from the game state.

**Validates: Requirements 2.3, 3.3, 7.2, 7.3, 7.5**

### Property 8: Bug Movement Toward Rocket

*For any* bug entity, its velocity vector should be directed toward the rocket's current position.

**Validates: Requirements 3.2**

### Property 9: Lives Decrease on Bug Collision

*For any* collision between the rocket and a bug, the rocket's lives should decrease by exactly 1 and the bug should be removed.

**Validates: Requirements 3.4, 7.4**

### Property 10: Defensive Structures Auto-Target Bugs

*For any* defensive structure and bug within the structure's range, if the fire rate cooldown has elapsed, the structure should fire a bullet toward the bug.

**Validates: Requirements 4.3, 4.4**

### Property 11: Level Progression Increases Difficulty

*For any* level transition, the new level should have spawn rates that are faster (lower milliseconds) and bug speeds that are higher than the previous level, within defined caps.

**Validates: Requirements 5.3, 5.4, 5.6**

### Property 12: Game Over When Lives Reach Zero

*For any* game state where lives reach 0, the game should transition to game over state and stop all gameplay updates.

**Validates: Requirements 10.3**

### Property 13: Pause Stops Game Updates

*For any* game state that is paused, no entity positions, spawns, or collisions should be processed until the game is resumed.

**Validates: Requirements 10.1, 10.2**

### Property 14: High Score Persists

*For any* game session that ends with a score higher than the stored high score, the new high score should be saved to localStorage and persist across page reloads.

**Validates: Requirements 10.4, 10.5**

### Property 15: Deploy Quote Selection

*For any* deployed defensive structure, it should have a randomly selected quote from the appropriate quote pool (satellite quotes for satellites, station quotes for stations).

**Validates: Requirements 8.2, 8.3, 8.8**

### Property 16: Click on Structure Shows Quote

*For any* deployed defensive structure that is clicked, the associated educational quote should be displayed to the player.

**Validates: Requirements 8.4, 8.5**

### Property 17: HUD Counters Match Game State

*For any* game state, the HUD should display resource count, satellite count, station count, and progress to next deploy that exactly match the actual game state values.

**Validates: Requirements 6.4, 6.5, 6.6**

### Property 18: Out-of-Bounds Cleanup

*For any* entity (asteroid, bug, bullet) that moves outside the canvas bounds, it should be removed from the game state.

**Validates: Requirements 2.4, 9.4**

### Property 19: Canvas Resize Updates Dimensions

*For any* window resize event, the canvas dimensions should update to match the new window size.

**Validates: Requirements 9.3**

### Property 20: Reset Restores Initial State

*For any* game state, calling reset should restore all counters (resources, level, lives, score) and arrays (bullets, asteroids, bugs, structures) to their initial values.

**Validates: Requirements 10.6**

## Error Handling

### Canvas Initialization Errors

```typescript
// Handle canvas not available
if (!canvas || !ctx) {
  console.error('Canvas not supported');
  return <div>Canvas not supported in your browser</div>;
}
```

### LocalStorage Errors

```typescript
// Handle localStorage not available or quota exceeded
try {
  localStorage.setItem('highScore', score.toString());
} catch (e) {
  console.warn('Could not save high score:', e);
  // Continue game without persistence
}
```

### Animation Frame Errors

```typescript
// Ensure cleanup on unmount
useEffect(() => {
  // ... game logic
  return () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
}, []);
```

### Collision Detection Edge Cases

- **Empty arrays**: Check array length before processing collisions
- **Negative coordinates**: Clamp entity positions to canvas bounds
- **Division by zero**: Validate denominators in distance calculations
- **NaN values**: Validate all numeric inputs and use fallbacks

### Spawn Rate Edge Cases

- **Level overflow**: Cap difficulty scaling at reasonable maximums
- **Negative spawn rates**: Ensure spawn rates never go below minimum thresholds
- **Concurrent spawns**: Use timestamps to prevent spawn flooding

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

- **Collision detection**: Test specific coordinate pairs for collision/no-collision
- **Resource counting**: Test counter increments correctly for various scenarios
- **Deploy thresholds**: Test structure deployment at exactly 20, 40, 60 resources
- **Level transitions**: Test level-up at exactly 50, 100, 150 asteroids
- **Lives system**: Test damage application and game over at 0 lives
- **Pause/resume**: Test that paused state prevents updates
- **LocalStorage**: Test high score save/load with mocked storage
- **Quote selection**: Test that quotes are selected from correct pools

### Property-Based Tests

Property tests will verify universal properties across randomized inputs using **fast-check** (JavaScript property-based testing library):

- **Minimum 100 iterations** per property test
- Each test tagged with: `Feature: space-dev-metaphor-game, Property {N}: {description}`
- Tests will generate random game states and verify properties hold

**Property Test Examples:**

```typescript
// Property 1: Resource collection
fc.assert(
  fc.property(
    fc.integer({ min: 0, max: 100 }), // initial resources
    fc.array(fc.record({ x: fc.float(), y: fc.float() })), // asteroids
    (initialResources, asteroids) => {
      const finalResources = simulateAsteroidDestruction(initialResources, asteroids);
      return finalResources === initialResources + asteroids.length;
    }
  ),
  { numRuns: 100 }
);

// Property 3: Collision symmetry
fc.assert(
  fc.property(
    fc.float(), fc.float(), fc.float(), // object A: x, y, radius
    fc.float(), fc.float(), fc.float(), // object B: x, y, radius
    (x1, y1, r1, x2, y2, r2) => {
      const aCollidesB = checkCollision(x1, y1, r1, x2, y2, r2);
      const bCollidesA = checkCollision(x2, y2, r2, x1, y1, r1);
      return aCollidesB === bCollidesA;
    }
  ),
  { numRuns: 100 }
);
```

### Integration Tests

- Test complete game loop from start to game over
- Test deploy system with actual resource collection
- Test defensive structures actually destroying bugs
- Test level progression with actual gameplay
- Test HUD updates with real game state changes

### Visual/Manual Tests

- Verify visual appearance of all entities
- Verify smooth animations at 60fps
- Verify touch controls on mobile devices
- Verify educational quotes are readable and well-positioned
- Verify game feel and difficulty curve

## Implementation Notes

### Performance Optimizations

1. **Object Pooling**: Reuse bullet and particle objects instead of creating new ones
2. **Spatial Partitioning**: Only check collisions for entities in nearby grid cells
3. **Culling**: Don't render entities outside canvas bounds
4. **Batch Rendering**: Group similar draw calls together
5. **RAF Throttling**: Skip frames if performance drops below 30fps

### Responsive Design

- Canvas scales to window size
- Touch controls only visible on mobile (< 768px)
- HUD elements reposition based on screen size
- Font sizes scale with canvas dimensions

### Accessibility

- Keyboard controls clearly documented
- High contrast colors for visibility
- Text shadows for readability
- Pause functionality for breaks
- Educational content accessible via clicks

### Browser Compatibility

- Canvas API (all modern browsers)
- LocalStorage (all modern browsers)
- RequestAnimationFrame (all modern browsers)
- Touch events (mobile browsers)
- Fallback for browsers without canvas support
