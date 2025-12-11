'use client';

import { useEffect, useRef } from 'react';

interface Bullet {
  x: number;
  y: number;
  speed: number;
}

export function RocketShip() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocketRef = useRef({ x: 0, y: 0, width: 60, height: 80, speed: 8 });
  const bulletsRef = useRef<Bullet[]>([]);
  const keysRef = useRef({ left: false, right: false, space: false });
  const animationRef = useRef<number>();
  const lastShotRef = useRef(0);

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

      // Window
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(x + rocket.width / 2, y + rocket.height * 0.3, 12, 0, Math.PI * 2);
      ctx.fill();

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

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rocket = rocketRef.current;

      // Move rocket
      if (keysRef.current.left && rocket.x > 0) {
        rocket.x -= rocket.speed;
      }
      if (keysRef.current.right && rocket.x < canvas.width - rocket.width) {
        rocket.x += rocket.speed;
      }

      // Shoot bullets
      const now = Date.now();
      if (keysRef.current.space && now - lastShotRef.current > 200) {
        bulletsRef.current.push({
          x: rocket.x + rocket.width / 2,
          y: rocket.y,
          speed: 10,
        });
        lastShotRef.current = now;
      }

      // Update and draw bullets
      bulletsRef.current = bulletsRef.current.filter((bullet) => {
        bullet.y -= bullet.speed;
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
        <p>← → ou A D: Mover</p>
        <p>Espaço: Disparar</p>
      </div>
    </>
  );
}
