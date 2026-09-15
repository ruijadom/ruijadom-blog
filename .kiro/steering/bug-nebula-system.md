# Bug Nebula System

## Overview
Sistema de nebulosas verdes que aparecem quando bugs especiais são destruídos. Cada nebulosa spawna 2 bugs após 5 segundos.

## Implementation Details

### Location
- **Component**: `src/modules/game/components/game-canvas.tsx`
- **Interface**: `BugNebula`

### How It Works

1. **Special Bugs**: A cada 3 bugs spawned, um é marcado como especial (brilho dourado)
2. **Nebula Creation**: Quando um bug especial é destruído, deixa uma nebulosa verde na sua posição
3. **Spawn Timer**: Após 5 segundos, a nebulosa spawna 2 bugs normais
4. **Visual Effect**: Nebulosa com efeito de rotação, pulsação e partículas orbitando

### Technical Details

#### BugNebula Interface
```typescript
interface BugNebula {
  id: string;
  x: number;
  y: number;
  createdAt: number;
  spawnTime: number; // Time when it will spawn bugs (5 seconds after creation)
  radius: number;
}
```

#### Visual Effects
- **Cores**: Verde (#10b981, #34d399, #059669)
- **Raio**: 30px
- **Efeitos**:
  - Múltiplas camadas de brilho externo
  - Gradiente radial do centro para as bordas
  - 8 partículas orbitando ao redor
  - Rotação contínua para efeito de redemoinho
  - Pulsação que acelera conforme se aproxima do spawn

#### Spawn Behavior
- Cada nebulosa spawna exatamente 2 bugs
- Bugs são spawned em ângulos opostos (180°)
- Bugs spawned não são especiais
- Partículas de explosão verde quando spawna
- Notificação visual quando spawna

### Game Balance

#### Timing
- **Criação**: Instantânea quando bug especial é destruído
- **Spawn**: 5 segundos após criação
- **Frequência**: 1 nebulosa a cada 3 bugs especiais destruídos

#### Scoring
- Destruir bug especial: +20 pontos
- Bugs spawned da nebulosa: +20 pontos cada (quando destruídos)
- Total potencial: 60 pontos por ciclo (1 especial + 2 spawned)

### Visual Design

#### Nebula Appearance
```
┌─────────────────────┐
│   Outer Glow (3x)   │  ← Camadas de brilho verde
│  ┌───────────────┐  │
│  │  Main Body    │  │  ← Gradiente radial verde
│  │  ┌─────────┐  │  │
│  │  │ Particles│  │  │  ← 8 partículas orbitando
│  │  │  ┌───┐   │  │  │
│  │  │  │Core│   │  │  │  ← Centro brilhante
│  │  │  └───┘   │  │  │
│  │  └─────────┘  │  │
│  └───────────────┘  │
└─────────────────────┘
```

#### Animation States
1. **Forming** (0-1s): Fade in com expansão
2. **Stable** (1-4s): Rotação constante, pulsação lenta
3. **Critical** (4-5s): Pulsação rápida, brilho intenso
4. **Spawning** (5s): Explosão de partículas, spawn de bugs

### Code Examples

#### Creating a Nebula
```typescript
bugNebulasRef.current.push({
  id: `nebula-${Date.now()}`,
  x: asteroid.x,
  y: asteroid.y,
  createdAt: now,
  spawnTime: now + 5000,
  radius: 30,
});
```

#### Drawing a Nebula
```typescript
const drawBugNebula = (nebula: BugNebula) => {
  // Pulsing effect
  const pulseIntensity = 0.7 + Math.sin(now / pulseSpeed) * 0.3;
  
  // Rotation for swirling
  const rotation = (age / 2000) * Math.PI * 2;
  
  // Multiple glow layers
  // Radial gradient
  // Orbiting particles
  // Bright core
};
```

#### Spawning Bugs
```typescript
const updateBugNebulas = (now: number) => {
  bugNebulasRef.current = bugNebulasRef.current.filter((nebula) => {
    if (now >= nebula.spawnTime) {
      // Spawn 2 bugs at opposite angles
      for (let i = 0; i < 2; i++) {
        const angle = (i / 2) * Math.PI * 2 + Math.random();
        // Create bug...
      }
      return false; // Remove nebula
    }
    return true;
  });
};
```

### Performance Considerations

- Nebulosas são removidas automaticamente após spawn
- Máximo de nebulosas na tela limitado pela frequência de bugs especiais
- Efeitos visuais otimizados com canvas rendering
- Sem impacto significativo no framerate (60fps mantido)

### Player Strategy

#### Offensive
- Destruir nebulosas rapidamente antes de spawnar
- Focar em bugs especiais para controlar nebulosas
- Usar estruturas defensivas para cobrir nebulosas

#### Defensive
- Manter distância de nebulosas prestes a spawnar
- Posicionar-se estrategicamente para lidar com spawn
- Priorizar nebulosas sobre bugs normais

### Future Enhancements

Potential improvements:
- Diferentes tipos de nebulosas (cores/efeitos)
- Nebulosas que spawnam mais bugs em níveis altos
- Nebulosas que se movem lentamente
- Power-ups que aparecem ao destruir nebulosas
- Nebulosas que podem ser destruídas antes de spawnar
- Efeitos sonoros para criação e spawn
- Partículas mais elaboradas
- Nebulosas que crescem com o tempo
