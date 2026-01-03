# Rocket Ship

## Overview
Nave espacial interativa estilo cartoon na página principal que permite movimento lateral e disparo de projéteis, inspirado em Space Invaders.

## Implementation Details

### Location
- **Component**: `src/modules/game/components/rocket-ship.tsx`
- **Used in**: `src/app/page.tsx` (homepage only)
- **Exported from**: `src/modules/game/index.ts`
- **Module**: Game module with complete isolation

### Features
- Nave espacial desenhada em canvas com estilo cartoon
- Controles de teclado:
  - **Setas ← →** ou **A/D**: Mover para esquerda/direita
  - **Espaço**: Disparar projéteis
- Controles touch para mobile (botões na parte inferior)
- Animação de chamas do motor
- Projéteis verdes com efeito de brilho
- Taxa de disparo limitada (200ms entre disparos)
- Renderização em 60fps usando requestAnimationFrame

### Technical Details

#### Canvas Rendering
- Usa HTML5 Canvas API para desenho
- Animação suave com requestAnimationFrame
- Responsivo ao redimensionamento da janela
- Camada fixa com z-index 0 (atrás do conteúdo)

#### Rocket Design
- **Corpo**: Triângulo azul (#3b82f6)
- **Janela**: Círculo azul claro (#60a5fa)
- **Asas**: Triângulos azul escuro (#1e40af)
- **Chamas**: Animadas com cores laranja (#f59e0b), vermelho (#ef4444) e amarelo (#fbbf24)
- Dimensões: 60px largura × 80px altura

#### Controls
- **Desktop**: Teclado (setas ou WASD + espaço)
- **Mobile**: Botões touch na parte inferior da tela
- Velocidade de movimento: 8px por frame
- Velocidade de projéteis: 10px por frame

#### Bullets
- Cor verde (#10b981) com efeito de sombra/brilho
- Raio de 4px
- Disparados do centro da nave
- Removidos automaticamente quando saem da tela

### Performance
- Canvas rendering para performance otimizada
- Cleanup automático de projéteis fora da tela
- Limpeza de event listeners no unmount
- Animação única para todos os elementos

## Customization

### Adjusting Rocket Properties
Edit the rocket initialization in `rocket-ship.tsx`:

```typescript
const rocketRef = useRef({
  x: 0,           // Posição X inicial
  y: 0,           // Posição Y inicial
  width: 60,      // Largura da nave
  height: 80,     // Altura da nave
  speed: 8,       // Velocidade de movimento
});
```

### Changing Fire Rate
Adjust the delay between shots (in milliseconds):

```typescript
if (keysRef.current.space && now - lastShotRef.current > 200) {
  // 200ms = 5 disparos por segundo
}
```

### Customizing Colors
Update the colors in the `drawRocket` function:
- Body: `ctx.fillStyle = '#3b82f6'`
- Window: `ctx.fillStyle = '#60a5fa'`
- Wings: `ctx.fillStyle = '#1e40af'`
- Flames: `#f59e0b`, `#ef4444`, `#fbbf24`

Update bullet color in `drawBullet`:
- `ctx.fillStyle = '#10b981'`

## Mobile Support
- Touch controls automatically displayed on mobile (< md breakpoint)
- Three buttons: Left, Fire, Right
- Semi-transparent background with backdrop blur
- Positioned at bottom center of screen

## Browser Compatibility
- Uses HTML5 Canvas API (supported in all modern browsers)
- Requires JavaScript enabled
- Touch events for mobile devices
- Keyboard events for desktop

## Future Enhancements
Potential improvements:
- Add enemies/targets to shoot
- Implement score system
- Add sound effects for shooting and movement
- Power-ups and special weapons
- Particle effects on bullet impact
- Multiple bullet types
- Shield/health system
- Boss battles
- Leaderboard
- Game over/restart functionality
- Difficulty levels
- Background parallax scrolling
- Combo system for consecutive hits
