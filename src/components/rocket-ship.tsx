'use client';

import { useEffect, useRef } from 'react';

interface Bullet {
  x: number;
  y: number;
  speed: number;
}

interface Asteroid {
  x: number;
  y: number;
  radius: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  type: 'asteroid' | 'bug';
}

export function RocketShip() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocketRef = useRef({ x: 0, y: 0, width: 60, height: 80, speed: 8 });
  const bulletsRef = useRef<Bullet[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const keysRef = useRef({ left: false, right: false, space: false });
  const animationRef = useRef<number>();
  const lastShotRef = useRef(0);
  const lastAsteroidSpawnRef = useRef(0);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      rocketRef.current.x = canvas.width / 2 - rocketRef.current.width / 2;
      // Mobile: more space at bottom for controls (160), Desktop: less space (40px)
      const bottomOffset = window.innerWidth < 768 ? 160 : 80;
      rocketRef.current.y = canvas.height - rocketRef.current.height - bottomOffset;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      }
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        keysRef.current.space = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
      if (e.key === ' ' || e.key === 'Spacebar') {
        keysRef.current.space = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Draw rocket
    const drawRocket = (x: number, y: number) => {
      const rocket = rocketRef.current;
      
      // Body (main triangle)
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(x + rocket.width / 2, y);
      ctx.lineTo(x + rocket.width, y + rocket.height * 0.6);
      ctx.lineTo(x, y + rocket.height * 0.6);
      ctx.closePath();
      ctx.fill();

      // JS text centered on rocket body
      ctx.save();
      ctx.fillStyle = '#f7df1e';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('JS', x + rocket.width / 2, y + rocket.height * 0.4);
      ctx.restore();

      // Wings
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.moveTo(x, y + rocket.height * 0.6);
      ctx.lineTo(x - 15, y + rocket.height * 0.8);
      ctx.lineTo(x + 10, y + rocket.height * 0.7);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x + rocket.width, y + rocket.height * 0.6);
      ctx.lineTo(x + rocket.width + 15, y + rocket.height * 0.8);
      ctx.lineTo(x + rocket.width - 10, y + rocket.height * 0.7);
      ctx.closePath();
      ctx.fill();

      // Flames
      const flameOffset = Math.sin(Date.now() / 100) * 5;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(x + rocket.width * 0.3, y + rocket.height * 0.6);
      ctx.lineTo(x + rocket.width * 0.25, y + rocket.height + flameOffset);
      ctx.lineTo(x + rocket.width * 0.4, y + rocket.height * 0.7);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(x + rocket.width * 0.7, y + rocket.height * 0.6);
      ctx.lineTo(x + rocket.width * 0.75, y + rocket.height + flameOffset);
      ctx.lineTo(x + rocket.width * 0.6, y + rocket.height * 0.7);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(x + rocket.width * 0.45, y + rocket.height * 0.6);
      ctx.lineTo(x + rocket.width * 0.5, y + rocket.height + flameOffset + 5);
      ctx.lineTo(x + rocket.width * 0.55, y + rocket.height * 0.6);
      ctx.closePath();
      ctx.fill();
    };

    // Draw bullet
    const drawBullet = (bullet: Bullet) => {
      ctx.fillStyle = '#10b981';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#10b981';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    // Draw asteroid
    const drawAsteroid = (asteroid: Asteroid) => {
      if (asteroid.type === 'bug') {
        drawBug(asteroid);
        return;
      }

      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.rotation);

      // Draw irregular asteroid shape
      ctx.fillStyle = '#78716c';
      ctx.strokeStyle = '#57534e';
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
      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.arc(asteroid.radius * 0.3, -asteroid.radius * 0.2, asteroid.radius * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-asteroid.radius * 0.2, asteroid.radius * 0.3, asteroid.radius * 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Draw bug
    const drawBug = (bug: Asteroid) => {
      ctx.save();
      ctx.translate(bug.x, bug.y);
      ctx.rotate(bug.rotation);

      const size = bug.radius;

      // Bug body
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.8, size, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bug head
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(0, -size * 0.7, size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Antennae
      ctx.strokeStyle = '#991b1b';
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
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const yPos = -size * 0.3 + i * size * 0.3;
        // Left legs
        ctx.beginPath();
        ctx.moveTo(-size * 0.8, yPos);
        ctx.lineTo(-size * 1.2, yPos + size * 0.2);
        ctx.stroke();
        // Right legs
        ctx.beginPath();
        ctx.moveTo(size * 0.8, yPos);
        ctx.lineTo(size * 1.2, yPos + size * 0.2);
        ctx.stroke();
      }

      // Eyes
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-size * 0.15, -size * 0.7, size * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(size * 0.15, -size * 0.7, size * 0.12, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Check collision between bullet and asteroid
    const checkCollision = (bullet: Bullet, asteroid: Asteroid): boolean => {
      const dx = bullet.x - asteroid.x;
      const dy = bullet.y - asteroid.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < asteroid.radius + 4;
    };

    // Spawn asteroids
    const spawnAsteroid = () => {
      const isBug = Math.random() < 0.3; // 30% chance of spawning a bug
      const radius = isBug ? 15 + Math.random() * 10 : 20 + Math.random() * 20;
      const x = Math.random() * canvas.width;
      const y = -radius;
      const speed = isBug ? 2 + Math.random() * 2 : 1 + Math.random() * 2;
      const rotationSpeed = (Math.random() - 0.5) * 0.05;

      asteroidsRef.current.push({
        x,
        y,
        radius,
        speed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed,
        type: isBug ? 'bug' : 'asteroid',
      });
    };



    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rocket = rocketRef.current;
      const now = Date.now();

      // Move rocket
      if (keysRef.current.left && rocket.x > 0) {
        rocket.x -= rocket.speed;
      }
      if (keysRef.current.right && rocket.x < canvas.width - rocket.width) {
        rocket.x += rocket.speed;
      }

      // Shoot bullets
      if (keysRef.current.space && now - lastShotRef.current > 200) {
        bulletsRef.current.push({
          x: rocket.x + rocket.width / 2,
          y: rocket.y,
          speed: 10,
        });
        lastShotRef.current = now;
      }

      // Spawn asteroids periodically
      if (now - lastAsteroidSpawnRef.current > 2000) {
        spawnAsteroid();
        lastAsteroidSpawnRef.current = now;
      }

      // Update and draw asteroids
      asteroidsRef.current = asteroidsRef.current.filter((asteroid) => {
        asteroid.y += asteroid.speed;
        asteroid.rotation += asteroid.rotationSpeed;
        
        if (asteroid.y < canvas.height + asteroid.radius) {
          drawAsteroid(asteroid);
          return true;
        }
        return false;
      });

      // Update and draw bullets with collision detection
      bulletsRef.current = bulletsRef.current.filter((bullet) => {
        bullet.y -= bullet.speed;
        
        // Check collision with asteroids
        let bulletHit = false;
        asteroidsRef.current = asteroidsRef.current.filter((asteroid) => {
          if (checkCollision(bullet, asteroid)) {
            bulletHit = true;
            // Create explosion effect
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2;
              ctx.fillStyle = '#f59e0b';
              ctx.beginPath();
              ctx.arc(
                asteroid.x + Math.cos(angle) * 10,
                asteroid.y + Math.sin(angle) * 10,
                3,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
            return false;
          }
          return true;
        });
        
        if (bulletHit) return false;
        
        if (bullet.y > 0) {
          drawBullet(bullet);
          return true;
        }
        return false;
      });

      // Draw rocket
      drawRocket(rocket.x, rocket.y);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[5]"
        style={{ background: 'transparent' }}
      />
      <div className="fixed bottom-10 left-1/2 z-[100] flex -translate-x-1/2 gap-3 md:hidden">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            keysRef.current.left = true;
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            keysRef.current.left = false;
          }}
          onMouseDown={() => (keysRef.current.left = true)}
          onMouseUp={() => (keysRef.current.left = false)}
          onMouseLeave={() => (keysRef.current.left = false)}
          className="select-none rounded-lg bg-primary/30 px-8 py-4 text-3xl backdrop-blur-sm active:scale-95 active:bg-primary/50"
        >
          ←
        </button>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            keysRef.current.space = true;
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            keysRef.current.space = false;
          }}
          onMouseDown={() => (keysRef.current.space = true)}
          onMouseUp={() => (keysRef.current.space = false)}
          onMouseLeave={() => (keysRef.current.space = false)}
          className="select-none rounded-lg bg-green-500/30 px-8 py-4 text-2xl backdrop-blur-sm active:scale-95 active:bg-green-500/50"
        >
          🚀
        </button>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            keysRef.current.right = true;
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            keysRef.current.right = false;
          }}
          onMouseDown={() => (keysRef.current.right = true)}
          onMouseUp={() => (keysRef.current.right = false)}
          onMouseLeave={() => (keysRef.current.right = false)}
          className="select-none rounded-lg bg-primary/30 px-8 py-4 text-3xl backdrop-blur-sm active:scale-95 active:bg-primary/50"
        >
          →
        </button>
      </div>
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] hidden rounded-lg bg-black/50 p-3 text-sm text-white backdrop-blur-sm md:block">
        <p>← → or A D: Move</p>
        <p>Space: Shoot</p>
      </div>
    </>
  );
}
