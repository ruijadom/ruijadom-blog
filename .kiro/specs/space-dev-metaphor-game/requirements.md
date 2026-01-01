# Requirements Document

## Introduction

Um jogo interativo na homepage que usa uma metáfora espacial para ilustrar conceitos fundamentais de desenvolvimento de software: a importância de construir infraestrutura e ferramentas (features) ao invés de apenas corrigir bugs. O jogo demonstra que focar exclusivamente em bugs cria um ciclo vicioso, enquanto investir em automação e infraestrutura reduz bugs naturalmente.

## Glossary

- **Game_System**: O sistema completo do jogo incluindo renderização, física, controles e lógica
- **Rocket**: A nave espacial controlada pelo jogador
- **Asteroid**: Objeto que representa recursos/features (minério) que o jogador deve coletar
- **Bug_Enemy**: Inimigo que representa bugs de software e ataca o jogador
- **Satellite**: Estrutura defensiva deployada após coletar recursos, que automaticamente destrói bugs
- **Space_Station**: Estrutura defensiva avançada com maior capacidade de destruir bugs
- **Resource_Counter**: Contador de asteroides coletados
- **Deploy_System**: Sistema que gerencia a criação de satélites e estações espaciais
- **Level_System**: Sistema de progressão que aumenta dificuldade e complexidade
- **HUD**: Interface visual que mostra estatísticas e progresso do jogador
- **Wave_System**: Sistema que gera ondas progressivas de asteroides e bugs

## Requirements

### Requirement 1: Controles e Movimento da Nave

**User Story:** Como jogador, quero controlar uma nave espacial com teclado e touch, para que eu possa navegar pelo espaço e interagir com o jogo.

#### Acceptance Criteria

1. WHEN o jogador pressiona as setas esquerda/direita ou A/D, THE Rocket SHALL mover-se horizontalmente na direção correspondente
2. WHEN o jogador pressiona espaço, THE Rocket SHALL disparar um projétil
3. WHEN o jogador está em dispositivo mobile, THE Game_System SHALL exibir controles touch na parte inferior da tela
4. WHEN o Rocket atinge os limites da tela, THE Rocket SHALL permanecer dentro dos limites visíveis
5. THE Rocket SHALL ter taxa de disparo limitada a um projétil a cada 200ms

### Requirement 2: Sistema de Asteroides (Recursos)

**User Story:** Como jogador, quero coletar asteroides que representam recursos para construir features, para que eu possa progredir no jogo e fazer deploys.

#### Acceptance Criteria

1. WHEN o jogo inicia, THE Game_System SHALL gerar asteroides em posições aleatórias na parte superior da tela
2. WHEN um asteroide é gerado, THE Asteroid SHALL mover-se verticalmente em direção à parte inferior da tela
3. WHEN um projétil colide com um asteroide, THE Game_System SHALL destruir o asteroide e incrementar o Resource_Counter
4. WHEN um asteroide sai da tela pela parte inferior, THE Game_System SHALL remover o asteroide sem penalidade
5. THE Asteroid SHALL ter aparência visual distinta (cor marrom/cinza, formato irregular)
6. WHEN o Resource_Counter atinge múltiplos de 20, THE Deploy_System SHALL permitir deploy de estrutura defensiva

### Requirement 3: Sistema de Bugs (Inimigos)

**User Story:** Como jogador, quero enfrentar bugs que representam problemas de software, para que o jogo ilustre o desafio de gerenciar bugs sem infraestrutura adequada.

#### Acceptance Criteria

1. WHEN o jogo progride, THE Wave_System SHALL gerar Bug_Enemy em intervalos regulares
2. WHEN um Bug_Enemy é gerado, THE Bug_Enemy SHALL mover-se em direção ao Rocket
3. WHEN um projétil colide com um Bug_Enemy, THE Game_System SHALL destruir o Bug_Enemy
4. WHEN um Bug_Enemy colide com o Rocket, THE Game_System SHALL reduzir a vida do jogador
5. THE Bug_Enemy SHALL ter aparência visual distinta (cor vermelha, formato de inseto/glitch)
6. WHEN o nível aumenta, THE Wave_System SHALL aumentar a frequência e velocidade dos Bug_Enemy

### Requirement 4: Sistema de Deploy (Satélites e Estações)

**User Story:** Como jogador, quero fazer deploy de satélites e estações espaciais após coletar recursos, para que eu possa automatizar a destruição de bugs e ilustrar a importância de infraestrutura.

#### Acceptance Criteria

1. WHEN o Resource_Counter atinge 20, THE Deploy_System SHALL criar um Satellite em posição estratégica
2. WHEN o Resource_Counter atinge 40, THE Deploy_System SHALL criar uma Space_Station em posição estratégica
3. WHEN um Bug_Enemy entra no alcance de um Satellite, THE Satellite SHALL disparar automaticamente contra o Bug_Enemy
4. WHEN um Bug_Enemy entra no alcance de uma Space_Station, THE Space_Station SHALL disparar automaticamente com maior taxa de fogo que um Satellite
5. THE Satellite SHALL ter alcance de detecção de 200 pixels
6. THE Space_Station SHALL ter alcance de detecção de 300 pixels
7. WHEN uma estrutura defensiva é deployada, THE HUD SHALL exibir notificação visual
8. THE Deploy_System SHALL resetar o Resource_Counter para 0 após cada deploy

### Requirement 5: Sistema de Níveis e Progressão

**User Story:** Como jogador, quero progredir através de níveis com dificuldade crescente, para que o jogo demonstre como a complexidade aumenta sem infraestrutura adequada.

#### Acceptance Criteria

1. WHEN o jogo inicia, THE Level_System SHALL começar no nível 1
2. WHEN o jogador coleta 50 asteroides totais, THE Level_System SHALL avançar para o próximo nível
3. WHEN o nível aumenta, THE Wave_System SHALL aumentar a taxa de spawn de Bug_Enemy em 20%
4. WHEN o nível aumenta, THE Wave_System SHALL aumentar a velocidade dos Bug_Enemy em 10%
5. WHEN o nível aumenta, THE HUD SHALL exibir notificação de mudança de nível
6. THE Level_System SHALL manter registro do nível atual e total de asteroides coletados

### Requirement 6: Interface HUD (Heads-Up Display)

**User Story:** Como jogador, quero ver estatísticas em tempo real do jogo, para que eu possa acompanhar meu progresso e entender a metáfora do desenvolvimento.

#### Acceptance Criteria

1. THE HUD SHALL exibir o Resource_Counter atual no canto superior esquerdo
2. THE HUD SHALL exibir o nível atual no canto superior direito
3. THE HUD SHALL exibir a vida do jogador como barra de progresso
4. THE HUD SHALL exibir contador de satélites deployados
5. THE HUD SHALL exibir contador de estações espaciais deployadas
6. THE HUD SHALL exibir progresso até o próximo deploy (X/20 recursos)
7. WHEN uma estrutura é deployada, THE HUD SHALL exibir mensagem motivacional sobre infraestrutura
8. THE HUD SHALL usar cores consistentes com o tema do site (azul, verde)

### Requirement 7: Sistema de Colisão e Física

**User Story:** Como desenvolvedor, quero um sistema de detecção de colisão preciso, para que todas as interações do jogo funcionem corretamente.

#### Acceptance Criteria

1. WHEN dois objetos se sobrepõem, THE Game_System SHALL detectar a colisão usando detecção circular
2. WHEN um projétil colide com um asteroide, THE Game_System SHALL remover ambos os objetos
3. WHEN um projétil colide com um Bug_Enemy, THE Game_System SHALL remover ambos os objetos
4. WHEN um Bug_Enemy colide com o Rocket, THE Game_System SHALL aplicar dano e remover o Bug_Enemy
5. WHEN um projétil de Satellite colide com Bug_Enemy, THE Game_System SHALL remover ambos os objetos
6. THE Game_System SHALL processar colisões a cada frame de animação

### Requirement 8: Mensagens Educacionais e Metáfora

**User Story:** Como visitante do site, quero entender a metáfora sobre desenvolvimento de software através do jogo, para que eu aprenda sobre boas práticas de engenharia.

#### Acceptance Criteria

1. WHEN o jogo inicia, THE HUD SHALL exibir mensagem explicando a metáfora
2. WHEN um Satellite é deployado, THE HUD SHALL exibir frase educacional em inglês sobre automação, ferramentas ou boas práticas
3. WHEN uma Space_Station é deployada, THE HUD SHALL exibir frase educacional em inglês sobre infraestrutura, arquitetura ou dívida técnica
4. WHEN o jogador clica em um Satellite deployado, THE Game_System SHALL exibir a frase educacional associada a esse Satellite
5. WHEN o jogador clica em uma Space_Station deployada, THE Game_System SHALL exibir a frase educacional associada a essa Space_Station
6. WHEN o jogador perde, THE HUD SHALL exibir mensagem sobre a importância de balancear features e bugs
7. THE Game_System SHALL incluir tooltip ou modal explicativo acessível durante o jogo
8. THE Deploy_System SHALL selecionar frases aleatórias de um conjunto de citações sobre desenvolvimento de software
9. THE HUD SHALL exibir frases educacionais com destaque visual (tooltip, modal ou overlay)
10. THE Game_System SHALL incluir no mínimo 10 frases diferentes para Satellite e 10 para Space_Station

### Requirement 9: Renderização e Performance

**User Story:** Como jogador, quero uma experiência visual suave e responsiva, para que o jogo seja agradável de jogar em qualquer dispositivo.

#### Acceptance Criteria

1. THE Game_System SHALL renderizar todos os elementos usando HTML5 Canvas
2. THE Game_System SHALL manter taxa de atualização de 60fps usando requestAnimationFrame
3. WHEN a janela é redimensionada, THE Game_System SHALL ajustar o canvas proporcionalmente
4. THE Game_System SHALL limpar objetos fora da tela para otimizar performance
5. THE Game_System SHALL usar cores e estilos consistentes com o design do site
6. THE Game_System SHALL aplicar efeitos visuais (brilho, sombras) sem impactar performance

### Requirement 10: Estados do Jogo e Persistência

**User Story:** Como jogador, quero poder pausar, reiniciar e ver meu melhor desempenho, para que eu possa controlar minha experiência de jogo.

#### Acceptance Criteria

1. WHEN o jogador pressiona ESC, THE Game_System SHALL pausar o jogo
2. WHEN o jogo está pausado, THE HUD SHALL exibir menu com opções de continuar ou reiniciar
3. WHEN o jogador perde todas as vidas, THE Game_System SHALL exibir tela de game over
4. WHEN o jogo termina, THE Game_System SHALL salvar o melhor score em localStorage
5. THE HUD SHALL exibir o melhor score (high score) durante o jogo
6. WHEN o jogador clica em reiniciar, THE Game_System SHALL resetar todos os contadores e estados
