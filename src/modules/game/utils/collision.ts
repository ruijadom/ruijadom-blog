import type { Bullet, Asteroid, BugNest } from '@/modules/game/types/game';

// ============================================================================
// Collision Detection
// ============================================================================

export function checkCircleCollision(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < r1 + r2;
}

export function checkBulletAsteroidCollision(bullet: Bullet, asteroid: Asteroid): boolean {
  return checkCircleCollision(bullet.x, bullet.y, 4, asteroid.x, asteroid.y, asteroid.radius);
}

export function checkRocketBugCollision(
  rocket: { x: number; y: number; width: number; height: number },
  bug: Asteroid
): boolean {
  const rocketCenterX = rocket.x + rocket.width / 2;
  const rocketCenterY = rocket.y + rocket.height / 2;
  const rocketRadius = Math.min(rocket.width, rocket.height) / 2;
  
  return checkCircleCollision(rocketCenterX, rocketCenterY, rocketRadius, bug.x, bug.y, bug.radius);
}

export function checkBulletNestCollision(bullet: Bullet, nest: BugNest): boolean {
  const dx = bullet.x - nest.x;
  const dy = bullet.y - nest.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < nest.radius + 4;
}

export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
