import type { Asteroid, DustParticle, Particle } from '@/modules/game/types/game';
import { GAME_CONFIG } from '@/modules/game/constants/game';

// ============================================================================
// Movement & Physics
// ============================================================================

export function updateBugMovement(
  bug: Asteroid,
  rocketX: number,
  rocketY: number,
  rocketWidth: number,
  rocketHeight: number
) {
  const rocketCenterX = rocketX + rocketWidth / 2;
  const rocketCenterY = rocketY + rocketHeight / 2;
  
  const dx = rocketCenterX - bug.x;
  const dy = rocketCenterY - bug.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > 0) {
    const normalizedX = dx / distance;
    const normalizedY = dy / distance;
    
    bug.x += normalizedX * bug.speed;
    bug.y += normalizedY * bug.speed;
    
    // Face the rocket
    bug.rotation = Math.atan2(dy, dx) + Math.PI / 2;
  }
}

export function updateAsteroidMovement(asteroid: Asteroid) {
  asteroid.y += asteroid.speed;
  asteroid.rotation += asteroid.rotationSpeed;
}

export function updateParticle(particle: Particle): boolean {
  particle.x += particle.vx;
  particle.y += particle.vy;
  particle.vy += 0.2; // Gravity
  particle.life -= 0.02;
  
  return particle.life > 0;
}

export function createExplosionParticles(
  x: number,
  y: number,
  color: string,
  count: number = 12
): Particle[] {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const speed = 2 + Math.random() * 4;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    particles.push({
      x,
      y,
      vx,
      vy,
      life: 1,
      maxLife: 1,
      color,
      size: 2 + Math.random() * 3,
    });
  }
  
  return particles;
}

// ============================================================================
// Dust & Nest Logic
// ============================================================================

export function emitDust(bug: Asteroid, now: number): DustParticle | null {
  if (!bug.isSpecial || !bug.lastDustEmission) return null;
  
  if (bug.dustEmitted === undefined) {
    bug.dustEmitted = 0;
  }
  
  if (bug.dustEmitted >= GAME_CONFIG.BUG.MAX_DUST_PARTICLES) return null;
  
  if (now - bug.lastDustEmission > GAME_CONFIG.BUG.DUST_EMISSION_INTERVAL) {
    bug.lastDustEmission = now;
    bug.dustEmitted += 1;
    
    return {
      x: bug.x + (Math.random() - 0.5) * bug.radius * GAME_CONFIG.BUG.DUST_SPREAD,
      y: bug.y + (Math.random() - 0.5) * bug.radius * GAME_CONFIG.BUG.DUST_SPREAD,
      createdAt: now,
      opacity: GAME_CONFIG.DUST.MIN_OPACITY + Math.random() * (GAME_CONFIG.DUST.MAX_OPACITY - GAME_CONFIG.DUST.MIN_OPACITY),
      size: GAME_CONFIG.DUST.MIN_SIZE + Math.random() * (GAME_CONFIG.DUST.MAX_SIZE - GAME_CONFIG.DUST.MIN_SIZE),
    };
  }
  
  return null;
}

export function findDustClusters(particles: DustParticle[], now: number): DustParticle[][] {
  const matureParticles = particles.filter((p) => {
    const age = now - p.createdAt;
    return age >= GAME_CONFIG.DUST.LIFETIME;
  });
  
  if (matureParticles.length < GAME_CONFIG.NEST.MIN_PARTICLES_TO_FORM) {
    return [];
  }
  
  const clusters: DustParticle[][] = [];
  
  matureParticles.forEach((particle) => {
    const cluster = matureParticles.filter((p) => {
      const dx = p.x - particle.x;
      const dy = p.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= GAME_CONFIG.NEST.PARTICLE_CLUSTER_RADIUS;
    });
    
    if (cluster.length >= GAME_CONFIG.NEST.MIN_PARTICLES_TO_FORM) {
      clusters.push(cluster);
    }
  });
  
  return clusters;
}

export function calculateClusterCenter(cluster: DustParticle[]): { x: number; y: number } {
  let centerX = 0;
  let centerY = 0;
  
  cluster.forEach((p) => {
    centerX += p.x;
    centerY += p.y;
  });
  
  return {
    x: centerX / cluster.length,
    y: centerY / cluster.length,
  };
}
