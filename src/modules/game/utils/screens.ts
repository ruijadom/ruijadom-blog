// ============================================================================
// Game Screens (Welcome, Help, Pause, Game Over)
// ============================================================================

export function drawWelcomeScreen(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
) {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = '#a855f7';
  ctx.font = 'bold 56px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SPACE DEV', centerX, centerY - 250);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Build Infrastructure, Not Just Bugs', centerX, centerY - 200);

  const boxWidth = Math.min(700, canvasWidth - 40);
  const boxHeight = 200;
  const boxX = centerX - boxWidth / 2;
  const boxY = centerY - 150;

  ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

  ctx.fillStyle = '#e5e7eb';
  ctx.font = '17px Arial';
  ctx.textAlign = 'center';
  
  const metaphorLines = [
    '🪨 Asteroids = Resources for building features',
    '🐛 Bugs = Problems that attack your project',
    '🛰️ Satellites = Automation tools that fight bugs',
    '🏗️ Space Stations = Infrastructure that prevents bugs',
    '',
    'Collect asteroids to deploy defensive structures!',
    'Build infrastructure to automate bug prevention.',
  ];

  let lineY = boxY + 30;
  metaphorLines.forEach((line) => {
    ctx.fillText(line, centerX, lineY);
    lineY += 24;
  });

  const controlsY = centerY + 90;
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 22px Arial';
  ctx.fillText('CONTROLS', centerX, controlsY);

  ctx.fillStyle = '#d1d5db';
  ctx.font = '17px Arial';
  ctx.fillText('← → or A D: Move', centerX - 150, controlsY + 40);
  ctx.fillText('Space: Shoot', centerX - 150, controlsY + 70);
  ctx.fillText('ESC: Pause', centerX + 150, controlsY + 40);
  ctx.fillText('R: Restart', centerX + 150, controlsY + 70);

  if (canvasWidth < 768) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '15px Arial';
    ctx.fillText('Touch controls available at bottom', centerX, controlsY + 100);
  }

  const buttonWidth = 300;
  const buttonHeight = 60;
  const buttonX = centerX - buttonWidth / 2;
  const buttonY = centerY + 200;

  ctx.shadowBlur = 20;
  ctx.shadowColor = '#a855f7';
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = '#9333ea';
  ctx.lineWidth = 3;
  ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Arial';
  ctx.fillText('START GAME', centerX, buttonY + buttonHeight / 2);

  ctx.fillStyle = '#9ca3af';
  ctx.font = '15px Arial';
  ctx.fillText('Click button or press SPACE to start', centerX, buttonY + buttonHeight + 30);
}

export function drawHelpOverlay(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
) {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HELP', centerX, centerY - 250);

  const boxWidth = Math.min(700, canvasWidth - 40);
  const boxHeight = 200;
  const boxX = centerX - boxWidth / 2;
  const boxY = centerY - 200;

  ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

  ctx.fillStyle = '#e5e7eb';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  
  const metaphorLines = [
    '🪨 Asteroids = Resources for building features',
    '🐛 Bugs = Problems that attack your project',
    '🛰️ Satellites = Automation tools that fight bugs',
    '🏗️ Space Stations = Infrastructure that prevents bugs',
    '',
    'Collect 20 asteroids to deploy a defensive structure.',
    'Quotes appear automatically when structures deploy!',
  ];

  let lineY = boxY + 25;
  metaphorLines.forEach((line) => {
    ctx.fillText(line, centerX, lineY);
    lineY += 24;
  });

  const controlsY = centerY + 50;
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 22px Arial';
  ctx.fillText('CONTROLS', centerX, controlsY);

  ctx.fillStyle = '#d1d5db';
  ctx.font = '17px Arial';
  ctx.fillText('← → or A D: Move', centerX - 150, controlsY + 40);
  ctx.fillText('Space: Shoot', centerX - 150, controlsY + 70);
  ctx.fillText('ESC: Pause', centerX + 150, controlsY + 40);
  ctx.fillText('R: Restart', centerX + 150, controlsY + 70);
  ctx.fillText('?: Toggle Help', centerX, controlsY + 100);

  if (canvasWidth < 768) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '15px Arial';
    ctx.fillText('Touch controls available at bottom', centerX, controlsY + 130);
  }

  ctx.fillStyle = '#a855f7';
  ctx.font = 'bold 22px Arial';
  ctx.fillText('Press ? or ESC to close', centerX, centerY + 200);
}

export function drawPauseMenu(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
) {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = '#3b82f6';
  ctx.font = 'bold 64px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', centerX, centerY - 80);

  ctx.fillStyle = '#ffffff';
  ctx.font = '24px Arial';
  ctx.fillText('Press ESC to continue', centerX, centerY + 20);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '20px Arial';
  ctx.fillText('Press R to restart', centerX, centerY + 60);
}

export function drawGameOver(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  score: number,
  highScore: number
) {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 72px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GAME OVER', centerX, centerY - 120);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Arial';
  ctx.fillText(`Final Score: ${score}`, centerX, centerY - 40);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`High Score: ${highScore}`, centerX, centerY);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '20px Arial';
  const message1 = 'Balancing features and bugs is the key to success.';
  const message2 = 'Build infrastructure to automate bug prevention!';
  ctx.fillText(message1, centerX, centerY + 50);
  ctx.fillText(message2, centerX, centerY + 80);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Press R to restart', centerX, centerY + 130);
}

export function drawHUD(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  resources: { collected: number; nextDeployAt: number },
  lives: number,
  level: number,
  score: number,
  highScore: number
) {
  // Top-left: Resources
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(10, 10, 200, 80);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Resources:', 20, 20);
  
  ctx.fillStyle = '#78716c';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`⛏️ ${resources.collected}`, 20, 45);
  
  ctx.fillStyle = '#10b981';
  ctx.font = '14px Arial';
  ctx.fillText(`Next Deploy: ${resources.collected}/${resources.nextDeployAt}`, 20, 75);
  ctx.restore();

  // Top-center: Lives
  ctx.save();
  const heartSize = 30;
  const heartSpacing = 40;
  const totalWidth = lives * heartSpacing - 10;
  const startX = (canvasWidth - totalWidth) / 2;
  const heartY = 20;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(startX - 15, heartY - 10, totalWidth + 30, 50);

  ctx.font = `${heartSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  for (let i = 0; i < lives; i++) {
    ctx.fillText('❤️', startX + i * heartSpacing, heartY);
  }
  ctx.restore();

  // Top-right: Level & Score
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  const rightBoxWidth = 180;
  ctx.fillRect(canvasWidth - rightBoxWidth - 10, 10, rightBoxWidth, 110);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Level:', canvasWidth - rightBoxWidth, 20);
  
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 32px Arial';
  ctx.fillText(`${level}`, canvasWidth - rightBoxWidth, 40);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px Arial';
  ctx.fillText(`Score: ${score}`, canvasWidth - rightBoxWidth, 75);
  
  ctx.fillStyle = '#10b981';
  ctx.font = '12px Arial';
  ctx.fillText(`High: ${highScore}`, canvasWidth - rightBoxWidth, 95);
  ctx.restore();

  // Help button
  ctx.save();
  const helpButtonSize = 50;
  const helpButtonX = canvasWidth - helpButtonSize - 10;
  const helpButtonY = canvasHeight - helpButtonSize - 70;
  const adjustedY = canvasWidth < 768 ? canvasHeight - helpButtonSize - 230 : helpButtonY;

  ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
  ctx.beginPath();
  ctx.arc(helpButtonX + helpButtonSize / 2, adjustedY + helpButtonSize / 2, helpButtonSize / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(helpButtonX + helpButtonSize / 2, adjustedY + helpButtonSize / 2, helpButtonSize / 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', helpButtonX + helpButtonSize / 2, adjustedY + helpButtonSize / 2);
  ctx.restore();
}
