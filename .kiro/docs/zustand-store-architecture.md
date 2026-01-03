# Zustand Store Architecture

## Overview
O estado do jogo Space Dev agora é gerenciado por Zustand, uma biblioteca de gerenciamento de estado leve e performática.

## Estrutura da Store

```
src/modules/game/store/
├── index.ts                    # Store principal e bound hooks
└── slices/
    ├── gameSlice.ts           # Estado do jogo (pause, game over, score, lives)
    ├── resourceSlice.ts       # Sistema de recursos e estruturas
    └── levelSlice.ts          # Sistema de progressão de níveis
```

## Slices

### GameSlice
Gerencia o estado principal do jogo:
- **Estado**: isGameVisible, hasStarted, isPaused, isGameOver, showHelp, score, highScore, lives
- **Ações**: startGame, pauseGame, resumeGame, toggleHelp, gameOver, addScore, loseLife, resetGame

### ResourceSlice
Gerencia recursos e estruturas defensivas:
- **Estado**: collected, totalCollected, nextDeployAt, structures
- **Ações**: collectResource, deployStructure, resetResources

### LevelSlice
Gerencia progressão de níveis e dificuldade:
- **Estado**: current, asteroidSpawnRate, bugSpawnRate, bugSpeed, asteroidsForNextLevel
- **Ações**: checkLevelUp, resetLevel

## Uso

### Bound Store (Recomendado)
Use o bound store para acesso organizado a todo o estado:

```typescript
import { useBoundGameStore } from '@/modules/game';

function GameComponent() {
  const { game, resources, level, actions } = useBoundGameStore();
  
  // Acessar estado
  console.log(game.score);
  console.log(resources.collected);
  console.log(level.current);
  
  // Chamar ações
  actions.startGame();
  actions.collectResource();
  actions.checkLevelUp(resources.totalCollected);
}
```

### Hooks Seletivos (Performance)
Para componentes que precisam apenas de parte do estado:

```typescript
import { useGameState, useGameScore, useGameActions } from '@/modules/game';

function ScoreDisplay() {
  // Apenas re-renderiza quando score/lives mudam
  const { score, lives } = useGameScore();
  
  return <div>Score: {score} | Lives: {lives}</div>;
}

function GameControls() {
  // Não re-renderiza quando estado muda (apenas ações)
  const { startGame, pauseGame } = useGameActions();
  
  return (
    <>
      <button onClick={startGame}>Start</button>
      <button onClick={pauseGame}>Pause</button>
    </>
  );
}
```

### Store Direta
Para casos especiais onde você precisa de controle total:

```typescript
import { useGameStore } from '@/modules/game';

function AdvancedComponent() {
  // Acesso direto com seletor customizado
  const isPlaying = useGameStore((state) => 
    state.hasStarted && !state.isPaused && !state.isGameOver
  );
  
  // Acesso a múltiplos valores
  const { score, lives, addScore } = useGameStore((state) => ({
    score: state.score,
    lives: state.lives,
    addScore: state.addScore,
  }));
}
```

## Benefícios do Zustand

### 1. Performance
- **Seletores otimizados**: Componentes só re-renderizam quando dados específicos mudam
- **Sem Context Provider**: Menos overhead de React
- **Pequeno bundle size**: ~1KB minified + gzipped

### 2. Developer Experience
- **TypeScript first**: Tipagem completa e autocomplete
- **DevTools**: Integração com Redux DevTools para debugging
- **Simples**: API minimalista e fácil de aprender

### 3. Arquitetura
- **Slices organizados**: Separação clara de responsabilidades
- **Ações co-localizadas**: Lógica próxima ao estado que modifica
- **Imutabilidade**: Zustand usa Immer internamente

### 4. Testabilidade
- **Store isolada**: Fácil criar instâncias para testes
- **Ações puras**: Fácil testar lógica de negócio
- **Mock simples**: Pode mockar store facilmente

## Migração dos Hooks Antigos

### Antes (React Hooks)
```typescript
const { resources, collectResource, deployStructure } = useResourceSystem();
const { level, checkLevelUp } = useLevelSystem(resources.totalCollected);
```

### Depois (Zustand)
```typescript
const { resources, level, actions } = useBoundGameStore();
// ou
const resources = useGameResources();
const level = useGameLevel();
const { collectResource, deployStructure, checkLevelUp } = useGameActions();
```

## Padrões de Uso

### 1. Componentes de UI
Use hooks seletivos para máxima performance:

```typescript
function HUD() {
  const { score, lives } = useGameScore();
  const { collected, nextDeployAt } = useGameResources();
  const { current } = useGameLevel();
  
  return (
    <div>
      <div>Score: {score}</div>
      <div>Lives: {lives}</div>
      <div>Resources: {collected}/{nextDeployAt}</div>
      <div>Level: {current}</div>
    </div>
  );
}
```

### 2. Componentes de Controle
Use apenas actions para evitar re-renders:

```typescript
function GameControls() {
  const { startGame, pauseGame, resetGame } = useGameActions();
  
  return (
    <>
      <button onClick={startGame}>Start</button>
      <button onClick={pauseGame}>Pause</button>
      <button onClick={resetGame}>Reset</button>
    </>
  );
}
```

### 3. Game Loop
Use store direta para acesso rápido:

```typescript
function gameLoop() {
  const store = useGameStore.getState();
  
  // Ler estado
  if (store.isPaused) return;
  
  // Atualizar estado
  store.addScore(10);
  store.collectResource();
  
  // Verificar condições
  if (store.checkLevelUp(store.totalCollected)) {
    console.log('Level up!');
  }
}
```

## DevTools

Para usar o Redux DevTools:

1. Instale a extensão Redux DevTools no navegador
2. A store já está configurada com `devtools` middleware
3. Abra DevTools e veja o estado em tempo real
4. Time-travel debugging disponível

## Próximos Passos

1. ✅ Criar slices organizados
2. ✅ Configurar bound store
3. ✅ Adicionar DevTools
4. ⏳ Migrar rocket-ship.tsx para usar Zustand
5. ⏳ Remover hooks antigos (useResourceSystem, useLevelSystem)
6. ⏳ Adicionar persist middleware para salvar high score
7. ⏳ Adicionar testes para slices

## Recursos

- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- [TypeScript Guide](https://docs.pmnd.rs/zustand/guides/typescript)
