# Horizontal Laser System

## Overview
Sistema de laser horizontal ativado pela tecla "B" que destrói tudo em seu caminho. Possui cooldown de 10 segundos e duração de 0.5 segundos.

## Implementation Details

### Location
- **Component**: `src/modules/game/components/game-canvas.tsx`
- **Interface**: `HorizontalLaser`
- **Activation**: Tecla "B"

### How It Works

1. **Activation**: Pressionar tecla "B" quando o cooldown estiver completo
2. **Effect**: Laser horizontal vermelho atravessa toda a tela na altura da nave
3. **Duration**: 0.5 segundos (500ms)
4. **Cooldown**: 10 segundos entre usos
5. **Collision**: Destrói todos os asteroides, bugs e nebulosas que tocar

### Technical Details

#### HorizontalLaser Interface
```typescript
interface HorizontalLaser {
  y: number;           // Y position where laser fires
  startTime: number;   // When laser was activated
  duration: number;    // How long laser lasts (500ms)
}
```

#### Constants
```typescript
const LASER_COOLDOWN = 10000;  // 10 seconds cooldown
const LASER_DURATION = 500;    // 0.5 seconds active
```

#### Visual Effects
- **Cores**: Vermelho (#ef4444, #f87171, #fecaca)
- **Camadas**: 3 camadas com diferentes espessuras e opacidades
  - Outer glow: 24px de espessura, 30% opacidade
  - Middle layer: 16px de espessura, 60% opacidade
  - Core beam: 8px de espessura, 100% opacidade
- **Efeitos**: Shadow blur para efeito de brilho
- **Fade out**: Opacidade diminui durante a duração

#### Cooldown Indicator
- **Location**: Canto superior direito, abaixo do score
- **Display**: Barra de progresso com tempo restante
- **Colors**:
  - Verde (#10b981): Quando pronto
  - Vermelho (#ef4444): Durante cooldown
- **Text**: "READY!" quando disponível, tempo em segundos quando em cooldown

### Game Balance

#### Damage & Scoring
- **Asteroides**: +10 pontos cada
- **Bugs normais**: +20 pontos cada
- **Bugs especiais**: +20 pontos + cria nebulosa
- **Nebulosas**: +50 pontos cada (bônus por destruir antes de spawnar)

#### Strategic Use
- Ideal para limpar múltiplos inimigos de uma vez
- Especialmente útil contra nebulosas prestes a spawnar
- Pode destruir bugs especiais e prevenir nebulosas
- Cooldown longo requer uso estratégico

### Controls

#### Desktop
- **Tecla B**: Ativar laser (quando disponível)

#### Mobile
- Não há controle touch para o laser (apenas teclado)

### Code Examples

#### Activating Laser
```typescript
if (keysRef.current.laser && !horizontalLaserRef.current) {
  const timeSinceLastLaser = now - laserCooldownRef.current;
  if (timeSinceLastLaser >= LASER_COOLDOWN) {
    horizontalLaserRef.current = {
      y: rocket.y + rocket.height / 2,
      startTime: now,
      duration: LASER_DURATION,
    };
    laserCooldownRef.current = now;
  }
}
```

#### Drawing Laser
```typescript
const drawHorizontalLaser = (laser: HorizontalLaser, now: number) => {
  const elapsed = now - laser.startTime;
  const progress = elapsed / laser.duration;
  const alpha = 1 - progress; // Fade out
  
  // Three layers: outer glow, middle, core
  // Each with different thickness and opacity
};
```

#### Collision Detection
```typescript
// Check collision with all asteroids/bugs at laser Y position
asteroidsRef.current = asteroidsRef.current.filter((asteroid) => {
  const hitByLaser = Math.abs(asteroid.y - laser.y) < asteroid.radius;
  
  if (hitByLaser) {
    // Award points and create particles
    return false; // Remove asteroid
  }
  
  return true;
});
```

### Visual Design

#### Laser Appearance
```
┌─────────────────────────────────────┐
│  Outer Glow (red, 30% opacity)     │  ← 24px thick
│  ┌───────────────────────────────┐ │
│  │ Middle Layer (60% opacity)    │ │  ← 16px thick
│  │ ┌───────────────────────────┐ │ │
│  │ │ Core Beam (100% opacity)  │ │ │  ← 8px thick
│  │ └───────────────────────────┘ │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Cooldown Indicator
```
┌──────────────────────┐
│ Laser (B):           │
│ ┌──────────────────┐ │
│ │████████░░░░░░░░░░│ │  ← Progress bar
│ │      5s          │ │  ← Time remaining
│ └──────────────────┘ │
└──────────────────────┘
```

### Performance Considerations

- Laser é removido automaticamente após duração
- Apenas um laser pode estar ativo por vez
- Colisão é verificada apenas durante os 500ms ativos
- Efeito visual otimizado com canvas rendering
- Sem impacto significativo no framerate

### Player Strategy

#### Offensive
- Usar contra grupos de inimigos alinhados horizontalmente
- Timing crucial para maximizar destruição
- Combinar com movimento vertical para atingir diferentes alturas

#### Defensive
- Salvar para emergências (muitos bugs na tela)
- Usar contra nebulosas prestes a spawnar
- Limpar caminho quando cercado por bugs

#### Advanced
- Posicionar nave na altura ideal antes de ativar
- Usar quando bugs especiais estão alinhados
- Combinar com estruturas defensivas para cobertura total

### Notifications

- **Activation**: "⚡ LASER ACTIVATED!" (1 segundo)
- **Nebula Destroyed**: "💥 Nebula Destroyed! +50" (2 segundos)

### Future Enhancements

Potential improvements:
- Botão touch para mobile
- Laser vertical (tecla V)
- Laser diagonal
- Upgrade de duração com níveis
- Redução de cooldown com power-ups
- Diferentes cores de laser (azul = mais dano)
- Laser que atravessa múltiplas vezes
- Som de laser sci-fi
- Partículas ao longo do laser
- Laser que empurra inimigos antes de destruir
- Combo system (laser + disparo normal)
- Laser carregável (segurar B para mais potência)
