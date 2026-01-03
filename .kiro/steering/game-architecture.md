# Game Architecture

## Overview
Estrutura modular organizada do jogo Space Dev seguindo clean architecture e design patterns.

## Folder Structure

```
src/
└── modules/
    └── game/                          # Módulo completo do jogo
        ├── components/                # Componentes React do jogo
        │   ├── rocket-ship.tsx        # Componente principal do jogo
        │   ├── game-state.ts          # (deprecated - usar hooks)
        │   ├── game-welcome-screen.tsx # Tela de boas-vindas
        │   ├── game-help-screen.tsx   # Tela de ajuda
        │   ├── game-pause-screen.tsx  # Tela de pausa
        │   ├── game-over-screen.tsx   # Tela de game over
        │   └── shooting-starts.tsx    # Efeito de estrelas cadentes
        │
        ├── hooks/                     # Hooks customizados do jogo
        │   ├── useGameState.ts        # Estado do jogo
        │   ├── useResourceSystem.ts   # Sistema de recursos
        │   ├── useLevelSystem.ts      # Sistema de níveis
        │   └── index.ts               # Exports
        │
        ├── utils/                     # Utilitários do jogo
        │   ├── collision.ts           # Detecção de colisões
        │   ├── drawing.ts             # Funções de desenho
        │   ├── physics.ts             # Física e movimento
        │   ├── screens.ts             # Renderização de telas
        │   └── index.ts               # Exports
        │
        ├── types/                     # Tipos TypeScript
        │   └── game.ts                # Todas as interfaces
        │
        ├── constants/                 # Constantes e configurações
        │   └── game.ts                # Config, cores, quotes
        │
        └── index.ts                   # Export principal do módulo
```

## Design Patterns

### Separation of Concerns
- **Components**: Apenas lógica de UI e orquestração
- **Hooks**: Gerenciamento de estado
- **Utils**: Funções puras e lógica de negócio
- **Types**: Definições de tipos centralizadas
- **Constants**: Configurações imutáveis

### Single Responsibility Principle
Cada módulo tem uma responsabilidade clara:
- `collision.ts`: Apenas detecção de colisões
- `drawing.ts`: Apenas renderização visual
- `physics.ts`: Apenas cálculos de movimento
- `screens.ts`: Apenas renderização de telas do jogo

### DRY (Don't Repeat Yourself)
- Código reutilizável em módulos compartilhados
- Funções utilitárias exportadas e importadas onde necessário
- Constantes centralizadas evitam magic numbers

### Clean Code
- Nomes descritivos e auto-explicativos
- Funções pequenas e focadas
- Comentários apenas onde necessário
- Tipagem forte com TypeScript

## Import Guidelines

### Importar o jogo completo
```typescript
import { RocketShip } from '@/modules/game';
```

### Importar hooks específicos
```typescript
import { useResourceSystem, useLevelSystem } from '@/modules/game';
```

### Importar utils específicos
```typescript
import { 
  checkCircleCollision,
  drawRocket,
  updateBugMovement 
} from '@/modules/game';
```

### Importar types
```typescript
import type { Asteroid, Bullet, BugNest } from '@/modules/game';
```

### Importar constants
```typescript
import { GAME_CONFIG, COLORS } from '@/modules/game';
```

## Migration Notes

### New Module Structure
Todo o código do jogo agora está em `src/modules/game/` com subpastas organizadas:
- `components/`: Todos os componentes React
- `hooks/`: Todos os hooks customizados
- `utils/`: Todas as funções utilitárias
- `types/`: Todas as definições de tipos
- `constants/`: Todas as configurações

### Deprecated
- `src/components/game-state.ts` - Usar hooks em `src/modules/game/hooks/` em vez disso

### Benefits of Module Structure
1. **Self-contained**: Todo o código do jogo em um único módulo
2. **Portable**: Fácil mover para outro projeto
3. **Clear boundaries**: Separação clara entre game e resto da app
4. **Scalable**: Fácil adicionar novos módulos (ex: `modules/blog/`)
5. **Single import**: `import { ... } from '@/modules/game'`

## Benefits

1. **Maintainability**: Código organizado é mais fácil de manter
2. **Scalability**: Fácil adicionar novas features sem bagunça
3. **Testability**: Funções puras são fáceis de testar
4. **Reusability**: Código pode ser reutilizado em outros projetos
5. **Readability**: Estrutura clara facilita onboarding de novos devs
6. **Performance**: Imports específicos reduzem bundle size

## Next Steps

1. Refatorar `rocket-ship.tsx` para usar os novos utils
2. Remover código duplicado
3. Adicionar testes unitários para utils
4. Documentar funções complexas
5. Considerar extrair mais lógica para hooks customizados
