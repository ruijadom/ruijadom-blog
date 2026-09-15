import type { Asteroid, Bullet, DefensiveStructure, BugNest, DustParticle, DeployAnimation, LevelUpAnimation, Particle, Notification } from '@/modules/game/types/game';
import { COLORS } from '@/modules/game/constants/game';

// ============================================================================
// Rocket Drawing
// ============================================================================

export function drawRocket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  // Body (main triangle)
  ctx.fillStyle = COLORS.ROCKET.BODY;
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width, y + height * 0.6);
  ctx.lineTo(x, y + height * 0.6);
  ctx.closePath();
  ctx.fill();

  // JS text centered on rocket body
  ctx.save();
  ctx.fillStyle = COLORS.ROCKET.JS_TEXT;
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('JS', x + width / 2, y + height * 0.4);
  ctx.restore();

  // Wings
  ctx.fillStyle = COLORS.ROCKET.WINGS;
  ctx.beginPath();
  ctx.moveTo(x, y + height * 0.6);
  ctx.lineTo(x - 15, y + height * 0.8);
  ctx.lineTo(x + 10, y + height * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + width, y + height * 0.6);
  ctx.lineTo(x + width + 15, y + height * 0.8);
  ctx.lineTo(x + width - 10, y + height * 0.7);
  ctx.closePath();
  ctx.fill();

  // Flames
  const flameOffset = Math.sin(Date.now() / 100) * 5;
  ctx.fillStyle = COLORS.ROCKET.FLAMES.ORANGE;
  ctx.beginPath();
  ctx.moveTo(x + width * 0.3, y + height * 0.6);
  ctx.lineTo(x + width * 0.25, y + height + flameOffset);
  ctx.lineTo(x + width * 0.4, y + height * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = COLORS.ROCKET.FLAMES.RED;
  ctx.beginPath();
  ctx.moveTo(x + width * 0.7, y + height * 0.6);
  ctx.lineTo(x + width * 0.75, y + height + flameOffset);
  ctx.lineTo(x + width * 0.6, y + height * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = COLORS.ROCKET.FLAMES.YELLOW;
  ctx.beginPath();
  ctx.moveTo(x + width * 0.45, y + height * 0.6);
  ctx.lineTo(x + width * 0.5, y + height + flameOffset + 5);
  ctx.lineTo(x + width * 0.55, y + height * 0.6);
  ctx.closePath();
  ctx.fill();
}

// ============================================================================
// Bullet Drawing
// ============================================================================

export function drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet) {
  let color: string = COLORS.BULLET.PLAYER;
  if (bullet.owner === 'satellite') {
    color = COLORS.BULLET.SATELLITE;
  } else if (bullet.owner === 'station') {
    color = COLORS.BULLET.STATION;
  }

  ctx.fillStyle = color;
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ============================================================================
// Asteroid & Bug Drawing
// ============================================================================

export function drawAsteroid(ctx: CanvasRenderingContext2D, asteroid: Asteroid) {
  if (asteroid.type === 'bug') {
    drawBug(ctx, asteroid);
    return;
  }

  ctx.save();
  ctx.translate(asteroid.x, asteroid.y);
  ctx.rotate(asteroid.rotation);

  ctx.fillStyle = COLORS.ASTEROID.BODY;
  ctx.strokeStyle = COLORS.ASTEROID.DETAIL;
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  const points = 8;
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const variance = 0.7 + Math.sin(i * 2.5) * 0.3;
    const radius = asteroid.radius * variance;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Add some detail
  ctx.fillStyle = COLORS.ASTEROID.DETAIL;
  ctx.beginPath();
  ctx.arc(asteroid.radius * 0.3, -asteroid.radius * 0.2, asteroid.radius * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-asteroid.radius * 0.2, asteroid.radius * 0.3, asteroid.radius * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawBug(ctx: CanvasRenderingContext2D, bug: Asteroid) {
  ctx.save();
  ctx.translate(bug.x, bug.y);
  ctx.rotate(bug.rotation);

  const size = bug.radius;
  
  // Special bug aura
  if (bug.isSpecial) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.BUG.SPECIAL.AURA;
    ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Bug body
  ctx.fillStyle = bug.isSpecial ? COLORS.BUG.SPECIAL.BODY : COLORS.BUG.NORMAL.BODY;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.8, size, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bug head
  ctx.fillStyle = bug.isSpecial ? COLORS.BUG.SPECIAL.HEAD : COLORS.BUG.NORMAL.HEAD;
  ctx.beginPath();
  ctx.arc(0, -size * 0.7, size * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Antennae
  ctx.strokeStyle = bug.isSpecial ? COLORS.BUG.SPECIAL.HEAD : COLORS.BUG.NORMAL.HEAD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, -size * 1.1);
  ctx.lineTo(-size * 0.2, -size * 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.3, -size * 1.1);
  ctx.lineTo(size * 0.2, -size * 0.9);
  ctx.stroke();

  // Legs
  ctx.strokeStyle = COLORS.BUG.NORMAL.LEGS;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const yPos = -size * 0.3 + i * size * 0.3;
    ctx.beginPath();
    ctx.moveTo(-size * 0.8, yPos);
    ctx.lineTo(-size * 1.2, yPos + size * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.8, yPos);
    ctx.lineTo(size * 1.2, yPos + size * 0.2);
    ctx.stroke();
  }

  // Eyes
  ctx.fillStyle = COLORS.BUG.NORMAL.EYES;
  ctx.beginPath();
  ctx.arc(-size * 0.15, -size * 0.7, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.15, -size * 0.7, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ============================================================================
// Dust & Nest Drawing
// ============================================================================

export function drawDustParticle(
  ctx: CanvasRenderingContext2D,
  particle: DustParticle,
  now: number
) {
  const age = now - particle.createdAt;
  const lifeRatio = age / 20000;
  const pulse = Math.sin(now / 200) * 0.1 + 0.95;
  
  ctx.save();
  ctx.globalAlpha = particle.opacity * (1 - lifeRatio * 0.3);
  ctx.fillStyle = COLORS.DUST.PARTICLE;
  ctx.shadowBlur = 5;
  ctx.shadowColor = COLORS.DUST.GLOW;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

export function drawNest(ctx: CanvasRenderingContext2D, nest: BugNest, now: number) {
  const pulse = Math.sin(now / 300) * 0.05 + 1;
  
  ctx.save();
  ctx.translate(nest.x, nest.y);
  ctx.scale(pulse, pulse);
  
  // Nest body
  ctx.fillStyle = COLORS.NEST.BODY;
  ctx.strokeStyle = COLORS.NEST.VEINS;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, nest.radius * 1.2, nest.radius, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Red veins
  ctx.strokeStyle = COLORS.NEST.VEINS;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * nest.radius * 0.8, Math.sin(angle) * nest.radius * 0.6);
    ctx.stroke();
  }
  
  // Center core
  ctx.fillStyle = COLORS.NEST.CORE;
  ctx.beginPath();
  ctx.arc(0, 0, nest.radius * 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
  
  // Health bar
  if (nest.health < nest.maxHealth) {
    const barWidth = nest.radius * 2;
    const barHeight = 4;
    const barX = nest.x - barWidth / 2;
    const barY = nest.y - nest.radius - 10;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    const healthRatio = nest.health / nest.maxHealth;
    ctx.fillStyle = healthRatio > 0.5 ? '#10b981' : healthRatio > 0.25 ? '#fbbf24' : '#ef4444';
    ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);
  }
}

// ============================================================================
// Structure Drawing
// ============================================================================

export function drawSatellite(ctx: CanvasRenderingContext2D, structure: DefensiveStructure) {
  ctx.save();
  ctx.translate(structure.x, structure.y);

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
  gradient.addColorStop(0, COLORS.STRUCTURE.SATELLITE.GRADIENT_START);
  gradient.addColorStop(1, COLORS.STRUCTURE.SATELLITE.GRADIENT_END);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = COLORS.STRUCTURE.SATELLITE.RING;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.stroke();

  // Solar panels
  ctx.fillStyle = COLORS.STRUCTURE.SATELLITE.PANELS;
  ctx.fillRect(-35, -8, 12, 16);
  ctx.fillRect(23, -8, 12, 16);

  ctx.strokeStyle = COLORS.STRUCTURE.SATELLITE.PANEL_DETAIL;
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-35, -8 + i * 5.5);
    ctx.lineTo(-23, -8 + i * 5.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(23, -8 + i * 5.5);
    ctx.lineTo(35, -8 + i * 5.5);
    ctx.stroke();
  }

  // Antenna
  ctx.strokeStyle = COLORS.STRUCTURE.SATELLITE.ANTENNA;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(0, -35);
  ctx.stroke();

  ctx.fillStyle = COLORS.STRUCTURE.SATELLITE.ANTENNA_TIP;
  ctx.beginPath();
  ctx.arc(0, -35, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.STRUCTURE.SATELLITE.RING;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawSpaceStation(ctx: CanvasRenderingContext2D, structure: DefensiveStructure) {
  ctx.save();
  ctx.translate(structure.x, structure.y);

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
  gradient.addColorStop(0, COLORS.STRUCTURE.STATION.GRADIENT_START);
  gradient.addColorStop(1, COLORS.STRUCTURE.STATION.GRADIENT_END);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = COLORS.STRUCTURE.STATION.RING;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.stroke();

  // Rotating ring
  const rotation = (Date.now() / 2000) % (Math.PI * 2);
  ctx.strokeStyle = COLORS.STRUCTURE.STATION.ROTATING_RING;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.arc(0, 0, 40, rotation, rotation + Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 40, rotation + Math.PI, rotation + Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Modules
  ctx.fillStyle = COLORS.STRUCTURE.STATION.MODULES;
  ctx.fillRect(-8, -50, 16, 20);
  ctx.fillRect(-8, 30, 16, 20);
  ctx.fillRect(-50, -8, 20, 16);
  ctx.fillRect(30, -8, 20, 16);

  // Windows
  ctx.fillStyle = COLORS.STRUCTURE.STATION.WINDOWS;
  const modules = [
    { x: 0, y: -40 },
    { x: 0, y: 40 },
    { x: -40, y: 0 },
    { x: 40, y: 0 },
  ];
  modules.forEach((mod) => {
    ctx.fillRect(mod.x - 3, mod.y - 3, 6, 6);
  });

  // Dishes
  ctx.strokeStyle = COLORS.STRUCTURE.STATION.DISHES;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-45, -45, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(45, -45, 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = COLORS.STRUCTURE.STATION.CORE;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ============================================================================
// Particle & Animation Drawing
// ============================================================================

export function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle) {
  ctx.save();
  ctx.globalAlpha = particle.life;
  ctx.fillStyle = particle.color;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawDeployAnimation(
  ctx: CanvasRenderingContext2D,
  anim: DeployAnimation,
  now: number
) {
  const elapsed = now - anim.startTime;
  const progress = elapsed / anim.duration;
  const opacity = 1 - progress;
  const scale = 1 + progress * 0.5;
  
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(anim.x, anim.y);
  ctx.scale(scale, scale);
  
  const ringRadius = 30 + progress * 50;
  const color = anim.type === 'satellite' ? '#3b82f6' : '#10b981';
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  const innerRingRadius = 20 + progress * 30;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, innerRingRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + progress * Math.PI;
    const sparkleX = Math.cos(angle) * ringRadius;
    const sparkleY = Math.sin(angle) * ringRadius;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

export function drawLevelUpAnimation(
  ctx: CanvasRenderingContext2D,
  anim: LevelUpAnimation,
  now: number,
  canvasWidth: number,
  canvasHeight: number
) {
  const elapsed = now - anim.startTime;
  const progress = elapsed / anim.duration;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  ctx.save();
  
  let opacity = 1;
  if (progress < 0.2) {
    opacity = progress / 0.2;
  } else if (progress > 0.8) {
    opacity = (1 - progress) / 0.2;
  }
  
  ctx.globalAlpha = opacity;
  
  const scale = progress < 0.3 ? 0.5 + (progress / 0.3) * 0.5 : 1 - (progress - 0.3) * 0.1;
  
  ctx.save();
  ctx.translate(centerX, centerY - 100);
  ctx.scale(scale, scale);
  
  ctx.shadowBlur = 30;
  ctx.shadowColor = '#fbbf24';
  
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 72px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`LEVEL ${anim.level}`, 0, 0);
  
  ctx.restore();
  
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + progress * Math.PI * 2;
    const startRadius = 100;
    const endRadius = 100 + progress * 200;
    
    const startX = centerX + Math.cos(angle) * startRadius;
    const startY = centerY - 100 + Math.sin(angle) * startRadius;
    const endX = centerX + Math.cos(angle) * endRadius;
    const endY = centerY - 100 + Math.sin(angle) * endRadius;
    
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  
  ctx.restore();
}

// ============================================================================
// Notification Drawing
// ============================================================================

export function drawNotification(
  ctx: CanvasRenderingContext2D,
  notification: Notification,
  now: number,
  centerX: number,
  yOffset: number,
  maxWidth: number
): number {
  const age = now - notification.timestamp;
  
  let opacity = 1;
  if (age < 300) {
    opacity = age / 300;
  } else if (age > notification.duration - 500) {
    opacity = (notification.duration - age) / 500;
  }
  
  ctx.save();
  ctx.globalAlpha = opacity;
  
  let borderColor = '#10b981';
  let bgColor = 'rgba(0, 0, 0, 0.8)';
  
  switch (notification.type) {
    case 'deploy':
      borderColor = '#10b981';
      bgColor = 'rgba(16, 185, 129, 0.1)';
      break;
    case 'levelup':
      borderColor = '#fbbf24';
      bgColor = 'rgba(251, 191, 36, 0.1)';
      break;
    case 'damage':
      borderColor = '#ef4444';
      bgColor = 'rgba(239, 68, 68, 0.1)';
      break;
    case 'info':
      borderColor = '#3b82f6';
      bgColor = 'rgba(59, 130, 246, 0.1)';
      break;
  }
  
  ctx.fillStyle = bgColor;
  const padding = 20;
  const lineHeight = 20;
  
  const paragraphs = notification.message.split('\n');
  const allLines: string[] = [];
  
  ctx.font = 'bold 14px Arial';
  const maxLineWidth = maxWidth - padding * 2;
  
  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(' ');
    let line = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineWidth && i > 0) {
        allLines.push(line.trim());
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    if (line.trim()) {
      allLines.push(line.trim());
    }
  });
  
  const boxHeight = Math.max(60, allLines.length * lineHeight + padding * 2);
  let maxTextWidth = 0;
  allLines.forEach((line) => {
    const metrics = ctx.measureText(line);
    maxTextWidth = Math.max(maxTextWidth, metrics.width);
  });
  const boxWidth = Math.min(maxTextWidth + padding * 2, maxWidth);
  
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(centerX - boxWidth / 2, yOffset, boxWidth, boxHeight);
  ctx.shadowBlur = 0;
  
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 5;
  ctx.shadowColor = borderColor;
  ctx.strokeRect(centerX - boxWidth / 2, yOffset, boxWidth, boxHeight);
  ctx.shadowBlur = 0;
  
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 14px Arial';
  
  let lineY = yOffset + padding + lineHeight / 2;
  allLines.forEach((line) => {
    ctx.fillText(line, centerX, lineY);
    lineY += lineHeight;
  });
  
  ctx.restore();
  
  return boxHeight + 10;
}
