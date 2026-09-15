# Bug Dust Trail & Nests Feature

## Overview
Implementar um sistema onde bugs especiais (a cada 3 bugs) deixam um rastro de poeira que, após 20 segundos, se transforma em um ninho que gera múltiplos bugs.

## Requirements

### 1. Bug Especial com Rastro de Poeira
- **Frequência**: A cada 3 bugs spawned, o terceiro deve ser um "bug especial"
- **Identificação Visual**: Bug especial deve ter uma aparência ligeiramente diferente (ex: cor mais escura, brilho, partículas ao redor)
- **Comportamento**: Enquanto se move, deixa um rastro de partículas de poeira atrás dele
- **Rastro**: As partículas de poeira ficam fixas no local onde foram deixadas

### 2. Sistema de Partículas de Poeira
- **Aparência**: Pequenas partículas cinza/marrom escuro com leve transparência
- **Frequência de Emissão**: A cada 100-200ms enquanto o bug especial está vivo
- **Duração**: As partículas permanecem no mapa por 20 segundos
- **Efeito Visual**: Leve brilho ou pulsação para indicar que são "ativas"
- **Quantidade**: 2-3 partículas por emissão

### 3. Transformação em Ninho
- **Timing**: Após 20 segundos, as partículas de poeira se agrupam e formam um ninho
- **Condição**: Apenas se houver pelo menos 5 partículas de poeira próximas (raio de 100px)
- **Animação**: Transição visual das partículas se juntando para formar o ninho
- **Aparência do Ninho**: 
  - Forma oval/circular
  - Cor marrom escuro com detalhes vermelhos
  - Tamanho: ~60px de diâmetro
  - Efeito de pulsação

### 4. Geração de Bugs do Ninho
- **Timing**: Ninho gera bugs a cada 5 segundos
- **Quantidade por Spawn**: 2-3 bugs por vez
- **Duração do Ninho**: Ninho permanece ativo por 30 segundos ou até ser destruído
- **Vida do Ninho**: 50 pontos de vida (5 tiros para destruir)
- **Pontuação**: Destruir um ninho dá 100 pontos

### 5. Mecânica de Destruição
- **Ninho Destrutível**: Jogador pode atirar no ninho para destruí-lo
- **Feedback Visual**: Ninho pisca/treme quando atingido
- **Explosão**: Quando destruído, cria partículas de explosão
- **Estruturas Defensivas**: Satélites e estações espaciais também podem atirar nos ninhos

## Technical Implementation

### Data Structures

```typescript
interface DustParticle {
  x: number;
  y: number;
  createdAt: number;
  opacity: number;
  size: number;
}

interface BugNest {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  createdAt: number;
  lastSpawn: number;
  spawnInterval: number; // 5000ms
  maxDuration: number; // 30000ms
  radius: number;
}

interface Asteroid {
  // ... existing properties
  isSpecial?: boolean; // For special bugs that leave dust
  lastDustEmission?: number; // Timestamp of last dust emission
}
```

### Key Functions

1. **spawnBug()** - Modificar para marcar cada 3º bug como especial
2. **emitDust()** - Criar partículas de poeira no caminho do bug especial
3. **updateDustParticles()** - Atualizar e verificar se devem formar ninhos
4. **formNest()** - Agrupar partículas próximas e criar ninho
5. **drawDustParticle()** - Renderizar partículas de poeira
6. **drawNest()** - Renderizar ninho com animação de pulsação
7. **updateNests()** - Gerenciar spawn de bugs e duração dos ninhos
8. **checkNestCollision()** - Detectar colisão de projéteis com ninhos

### Visual Design

#### Bug Especial
- Corpo: Vermelho mais escuro (#991b1b)
- Brilho: Aura amarela ao redor (#fbbf24 com opacity 0.3)
- Partículas: Pequenas partículas amarelas flutuando ao redor

#### Partículas de Poeira
- Cor: #78716c (cinza/marrom)
- Tamanho: 3-5px
- Opacity: 0.6-0.8
- Efeito: Leve pulsação (scale 0.9-1.1)

#### Ninho
- Forma: Oval irregular
- Cor base: #57534e (marrom escuro)
- Detalhes: Linhas vermelhas (#dc2626)
- Animação: Pulsação suave (scale 0.95-1.05)
- Barra de vida: Acima do ninho quando atingido

### Game Balance

#### Pontuação
- Bug normal: 25 pontos
- Bug especial: 35 pontos
- Destruir ninho: 100 pontos
- Bug nascido de ninho: 25 pontos

#### Dificuldade
- Ninhos aumentam a pressão no jogador
- Jogador deve priorizar destruir ninhos antes que gerem muitos bugs
- Estruturas defensivas ajudam a controlar ninhos

### Notifications

Adicionar notificações para eventos importantes:
- "⚠️ Special Bug Detected!" - Quando bug especial aparece
- "🪹 Nest Formed!" - Quando ninho é criado
- "💥 Nest Destroyed! +100" - Quando ninho é destruído
- "⚠️ Nest Spawning Bugs!" - Quando ninho gera bugs

## Testing Checklist

- [ ] Bug especial aparece a cada 3 bugs
- [ ] Bug especial deixa rastro de poeira
- [ ] Partículas de poeira permanecem por 20 segundos
- [ ] Partículas próximas formam ninho após 20 segundos
- [ ] Ninho gera bugs a cada 5 segundos
- [ ] Ninho pode ser destruído com 5 tiros
- [ ] Ninho desaparece após 30 segundos
- [ ] Estruturas defensivas atacam ninhos
- [ ] Pontuação correta para cada ação
- [ ] Notificações aparecem nos momentos certos
- [ ] Performance não é afetada com múltiplos ninhos

## Future Enhancements

- Diferentes tipos de ninhos (mais resistentes, spawn mais rápido)
- Ninhos que se movem lentamente
- Ninhos que disparam projéteis
- Power-up que destrói todos os ninhos na tela
- Ninho "rainha" que gera bugs especiais
- Efeito sonoro para formação e destruição de ninhos
