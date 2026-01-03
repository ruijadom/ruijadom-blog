'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useResourceSystem, useLevelSystem, useGamePersistence, useGameSounds } from '@/modules/game/hooks';
import type { DefensiveStructure } from '@/modules/game/types/game';
import Particles from '@/components/particles';
import { GameWelcomeScreen } from '@/modules/game/components/game-welcome-screen';
import { GameHelpScreen } from '@/modules/game/components/game-help-screen';
import { GamePauseScreen } from '@/modules/game/components/game-pause-screen';
import { GameOverScreen } from '@/modules/game/components/game-over-screen';
import { GameStatsScreen } from '@/modules/game/components/game-stats-screen';
import { GameContinueDialog } from '@/modules/game/components/game-continue-dialog';

interface Bullet {
  x: number;
  y: number;
  speed: number;
  owner: 'player' | 'satellite' | 'station';
  directionX?: number;
  directionY?: number;
}

interface Asteroid {
  x: number;
  y: number;
  radius: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  type: 'asteroid' | 'bug';
  isSpecial?: boolean;
  lastDustEmission?: number;
  dustEmitted?: number;
}

interface BugNebula {
  id: string;
  x: number;
  y: number;
  createdAt: number;
  spawnTime: number; // Time when it will spawn bugs (5 seconds after creation)
  radius: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface DeployAnimation {
  x: number;
  y: number;
  startTime: number;
  duration: number;
  type: 'satellite' | 'station';
}

interface LevelUpAnimation {
  startTime: number;
  duration: number;
  level: number;
}

interface HorizontalLaser {
  y: number;
  startTime: number;
  duration: number;
}

export function GameCanvas() {
  // Game state
  const [hasStarted, setHasStarted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  
  // Persistence hook
  const persistence = useGamePersistence({ autoSave: true, autoSaveInterval: 30000 });
  
  // Canvas and game refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocketRef = useRef({ x: 0, y: 0, width: 60, height: 80, speed: 8, lives: 3 });
  const bulletsRef = useRef<Bullet[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const deployAnimationsRef = useRef<DeployAnimation[]>([]);
  const levelUpAnimationRef = useRef<LevelUpAnimation | null>(null);
  const keysRef = useRef({ left: false, right: false, space: false, laser: false });
  const animationRef = useRef<number>();
  const lastShotRef = useRef(0);
  const lastAsteroidSpawnRef = useRef(0);
  const lastBugSpawnRef = useRef(0);
  const structuresRef = useRef<DefensiveStructure[]>([]);
  const lastResourceCheckRef = useRef(0);
  const lastDeployedAtRef = useRef(0);
  const notificationsRef = useRef<Array<{ 
    id: string;
    message: string; 
    timestamp: number; 
    duration: number;
    type: 'deploy' | 'levelup' | 'damage' | 'info';
  }>>([]);
  const damageFlashRef = useRef(0);
  const screenShakeRef = useRef({ x: 0, y: 0, intensity: 0 });
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const rocketInitializedRef = useRef(false);
  
  // Bug nebula system
  const bugNebulasRef = useRef<BugNebula[]>([]);
  const bugSpawnCountRef = useRef(0);
  
  // Horizontal laser system
  const horizontalLaserRef = useRef<HorizontalLaser | null>(null);
  const LASER_COOLDOWN = 10000; // 10 seconds cooldown
  const LASER_DURATION = 500; // 0.5 seconds active
  const laserCooldownRef = useRef(Date.now() - LASER_COOLDOWN); // Start ready
  
  // Resource system hook with deploy callback
  const { resources, collectResource, deployStructure, resetResources } = useResourceSystem((structure) => {
    console.log('📦 Deploy callback triggered!', {
      structureType: structure.type,
      structureId: structure.id,
      currentStructures: structuresRef.current.length
    });
    
    // Track structure deployment
    persistence.trackStructureDeploy();
    
    // Add deployed structure to our ref
    structuresRef.current.push(structure);
    
    // Add deploy animation
    deployAnimationsRef.current.push({
      x: structure.x,
      y: structure.y,
      startTime: Date.now(),
      duration: 1000,
      type: structure.type,
    });
    
    // Add notification
    const structureName = structure.type === 'satellite' ? '🛰️ Satellite' : '🏗️ Space Station';
    console.log('📢 Adding notification:', structureName);
    notificationsRef.current.push({
      id: `deploy-${Date.now()}`,
      message: `${structureName} Deployed!\n"${structure.quote}"`,
      timestamp: Date.now(),
      duration: 7000,
      type: 'deploy',
    });
  });

  // Level system hook
  const { level, checkLevelUp, resetLevel } = useLevelSystem(resources.totalCollected);

  // Sound system hook
  const sounds = useGameSounds();

  // Load high score from localStorage on mount
  useEffect(() => {
    try {
      const savedHighScore = localStorage.getItem('spaceDevGameHighScore');
      if (savedHighScore) {
        highScoreRef.current = parseInt(savedHighScore, 10);
      }
    } catch (e) {
      console.warn('Could not load high score:', e);
    }
  }, []);

  // Check for saved game on mount
  useEffect(() => {
    if (persistence.checkHasSave() && !hasStarted) {
      setShowContinueDialog(true);
    }
  }, [persistence, hasStarted]);

  // Always add game-active class to body
  useEffect(() => {
    document.body.classList.add('game-active');
    return () => document.body.classList.remove('game-active');
  }, []);

  // Reset game function
  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      rocketRef.current.x = canvas.width / 2 - rocketRef.current.width / 2;
      const bottomOffset = window.innerWidth < 768 ? 160 : 80;
      rocketRef.current.y = canvas.height - rocketRef.current.height - bottomOffset;
    }
    
    rocketRef.current.lives = 3;
    
    bulletsRef.current = [];
    asteroidsRef.current = [];
    structuresRef.current = [];
    notificationsRef.current = [];
    particlesRef.current = [];
    deployAnimationsRef.current = [];
    levelUpAnimationRef.current = null;
    bugNebulasRef.current = [];
    horizontalLaserRef.current = null;
    laserCooldownRef.current = Date.now() - LASER_COOLDOWN; // Start ready
    
    lastShotRef.current = 0;
    lastAsteroidSpawnRef.current = 0;
    lastBugSpawnRef.current = 0;
    lastResourceCheckRef.current = 0;
    lastDeployedAtRef.current = 0;
    damageFlashRef.current = 0;
    screenShakeRef.current = { x: 0, y: 0, intensity: 0 };
    scoreRef.current = 0;
    bugSpawnCountRef.current = 0;
    
    resetResources();
    resetLevel();
  }, [resetResources, resetLevel]);

  // Handle start game
  const handleStartGame = useCallback(() => {
    console.log('🎮 Starting new game');
    resetGame();
    setHasStarted(true);
    setIsGameOver(false);
    setShowContinueDialog(false);
    persistence.clearSave();
    persistence.startGameSession();
  }, [resetGame, persistence]);

  // Handle continue game
  const handleContinueGame = useCallback(() => {
    console.log('📂 Continuing saved game');
    const save = persistence.loadGameState();
    if (!save) {
      console.error('No save found!');
      handleStartGame();
      return;
    }
    
    // Restore game state
    scoreRef.current = save.score;
    rocketRef.current.lives = save.lives;
    
    // Restore resources
    resetResources();
    for (let i = 0; i < save.resources.totalCollected; i++) {
      collectResource();
    }
    
    // Restore structures
    structuresRef.current = save.structures.map(s => ({
      ...s,
      id: `${s.type}-${Date.now()}-${Math.random()}`,
      quote: '',
      health: s.type === 'satellite' ? 100 : 200,
      maxHealth: s.type === 'satellite' ? 100 : 200,
      lastShot: 0,
      fireRate: s.type === 'satellite' ? 1000 : 2000,
      range: s.type === 'satellite' ? 300 : 400,
    }));
    
    setHasStarted(true);
    setShowContinueDialog(false);
    persistence.startGameSession();
  }, [persistence, handleStartGame, resetResources, collectResource]);

  // Handle restart
  const handleRestart = useCallback(() => {
    console.log('🔄 Restarting game');
    resetGame();
    setIsGameOver(false);
    setHasStarted(true);
    persistence.clearSave();
    persistence.startGameSession();
  }, [resetGame, persistence]);

  // Handle view stats
  const handleViewStats = useCallback(() => {
    console.log('📊 Opening stats screen');
    setShowStats(true);
    // Pause the game when viewing stats (only if game has started and not already game over)
    if (hasStarted && !isGameOver) {
      setIsPaused(true);
    }
  }, [hasStarted, isGameOver]);

  // Handle close stats
  const handleCloseStats = useCallback(() => {
    console.log('📊 Closing stats screen');
    setShowStats(false);
    // Resume the game when closing stats (only if it was paused by stats)
    if (hasStarted && !isGameOver && isPaused) {
      setIsPaused(false);
    }
  }, [hasStarted, isGameOver, isPaused]);

  // Main game loop with canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const oldWidth = canvas.width;
      const oldHeight = canvas.height;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Only position rocket on first initialization
      if (!rocketInitializedRef.current) {
        rocketRef.current.x = canvas.width / 2 - rocketRef.current.width / 2;
        const bottomOffset = window.innerWidth < 768 ? 160 : 80;
        rocketRef.current.y = canvas.height - rocketRef.current.height - bottomOffset;
        rocketInitializedRef.current = true;
      } else if (oldWidth > 0 && oldHeight > 0) {
        // On resize, scale rocket position proportionally
        const xRatio = canvas.width / oldWidth;
        const yRatio = canvas.height / oldHeight;
        rocketRef.current.x = rocketRef.current.x * xRatio;
        rocketRef.current.y = rocketRef.current.y * yRatio;
      }
      
      // Reposition defensive structures proportionally if canvas was previously sized
      if (oldWidth > 0 && oldHeight > 0) {
        const widthRatio = canvas.width / oldWidth;
        const heightRatio = canvas.height / oldHeight;
        
        structuresRef.current.forEach((structure) => {
          structure.x = structure.x * widthRatio;
          structure.y = structure.y * heightRatio;
        });
        
        asteroidsRef.current.forEach((asteroid) => {
          asteroid.x = asteroid.x * widthRatio;
          asteroid.y = asteroid.y * heightRatio;
        });
        
        bulletsRef.current.forEach((bullet) => {
          bullet.x = bullet.x * widthRatio;
          bullet.y = bullet.y * heightRatio;
        });
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space key to start game from welcome screen
      if (!hasStarted && (e.key === ' ' || e.key === 'Spacebar')) {
        e.preventDefault();
        handleStartGame();
        return;
      }

      // ? key to toggle help (only when game has started)
      if (hasStarted && (e.key === '?' || e.key === '/')) {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      // ESC key to toggle pause or close help
      if (e.key === 'Escape') {
        e.preventDefault();
        
        // Close help if it's open
        if (showHelp) {
          setShowHelp(false);
          return;
        }
        
        // Don't allow pause if game is over or not started
        if (!isGameOver && hasStarted) {
          setIsPaused(prev => !prev);
        }
        return;
      }

      // R key to reset game
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRestart();
        return;
      }

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
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        keysRef.current.laser = true;
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
      if (e.key === 'b' || e.key === 'B') {
        keysRef.current.laser = false;
      }
    };

    // Canvas click handler for help button
    const handleCanvasClick = (e: MouseEvent) => {
      if (!hasStarted || isGameOver) return;
      
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Help button position
      const helpButtonSize = 50;
      const helpButtonX = canvas.width - helpButtonSize - 10;
      const helpButtonY = canvas.width < 768 
        ? canvas.height - helpButtonSize - 230 
        : canvas.height - helpButtonSize - 70;
      
      // Check if click is within help button
      const dx = clickX - (helpButtonX + helpButtonSize / 2);
      const dy = clickY - (helpButtonY + helpButtonSize / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < helpButtonSize / 2) {
        setShowHelp(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('click', handleCanvasClick);

    // Drawing functions
    const drawRocket = (x: number, y: number) => {
      const rocket = rocketRef.current;
      
      // Body
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

    const drawBullet = (bullet: Bullet) => {
      let color = '#10b981';
      if (bullet.owner === 'satellite') {
        color = '#3b82f6';
      } else if (bullet.owner === 'station') {
        color = '#10b981';
      }

      ctx.fillStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawAsteroid = (asteroid: Asteroid) => {
      if (asteroid.type === 'bug') {
        drawBug(asteroid);
        return;
      }

      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.rotation);

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

      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.arc(asteroid.radius * 0.3, -asteroid.radius * 0.2, asteroid.radius * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-asteroid.radius * 0.2, asteroid.radius * 0.3, asteroid.radius * 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawBug = (bug: Asteroid) => {
      ctx.save();
      ctx.translate(bug.x, bug.y);
      ctx.rotate(bug.rotation);

      const size = bug.radius;
      
      if (bug.isSpecial) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#fbbf24';
        ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = bug.isSpecial ? '#991b1b' : '#dc2626';
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.8, size, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = bug.isSpecial ? '#7f1d1d' : '#991b1b';
      ctx.beginPath();
      ctx.arc(0, -size * 0.7, size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = bug.isSpecial ? '#7f1d1d' : '#991b1b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-size * 0.3, -size * 1.1);
      ctx.lineTo(-size * 0.2, -size * 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(size * 0.3, -size * 1.1);
      ctx.lineTo(size * 0.2, -size * 0.9);
      ctx.stroke();

      for (let i = 0; i < 3; i++) {
        const legY = -size * 0.3 + i * size * 0.3;
        ctx.beginPath();
        ctx.moveTo(-size * 0.8, legY);
        ctx.lineTo(-size * 1.2, legY + size * 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(size * 0.8, legY);
        ctx.lineTo(size * 1.2, legY + size * 0.2);
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-size * 0.15, -size * 0.7, size * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(size * 0.15, -size * 0.7, size * 0.12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-size * 0.15, -size * 0.7, size * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(size * 0.15, -size * 0.7, size * 0.06, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawHorizontalLaser = (laser: HorizontalLaser, now: number) => {
      const elapsed = now - laser.startTime;
      const progress = elapsed / laser.duration;
      
      if (progress >= 1) return;
      
      ctx.save();
      
      // Laser beam effect with multiple layers
      const alpha = 1 - progress;
      const thickness = 8;
      
      // Outer glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ef4444';
      ctx.strokeStyle = `rgba(239, 68, 68, ${alpha * 0.3})`;
      ctx.lineWidth = thickness * 3;
      ctx.beginPath();
      ctx.moveTo(0, laser.y);
      ctx.lineTo(canvas.width, laser.y);
      ctx.stroke();
      
      // Middle layer
      ctx.shadowBlur = 10;
      ctx.strokeStyle = `rgba(248, 113, 113, ${alpha * 0.6})`;
      ctx.lineWidth = thickness * 2;
      ctx.beginPath();
      ctx.moveTo(0, laser.y);
      ctx.lineTo(canvas.width, laser.y);
      ctx.stroke();
      
      // Core beam
      ctx.shadowBlur = 5;
      ctx.strokeStyle = `rgba(254, 202, 202, ${alpha})`;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(0, laser.y);
      ctx.lineTo(canvas.width, laser.y);
      ctx.stroke();
      
      ctx.shadowBlur = 0;
      ctx.restore();
    };

    const drawHUD = () => {
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

      ctx.save();
      const heartSize = 30;
      const heartSpacing = 40;
      const totalWidth = rocketRef.current.lives * heartSpacing - 10;
      const startX = (canvas.width - totalWidth) / 2;
      const heartY = 20;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(startX - 15, heartY - 10, totalWidth + 30, 50);

      ctx.font = `${heartSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      for (let i = 0; i < rocketRef.current.lives; i++) {
        ctx.fillText('❤️', startX + i * heartSpacing, heartY);
      }
      
      ctx.restore();

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      const rightBoxWidth = 180;
      ctx.fillRect(canvas.width - rightBoxWidth - 10, 10, rightBoxWidth, 110);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      ctx.fillText('Level:', canvas.width - rightBoxWidth, 20);
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(`${level.current}`, canvas.width - rightBoxWidth, 40);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`Score: ${scoreRef.current}`, canvas.width - rightBoxWidth, 75);
      
      ctx.fillStyle = '#10b981';
      ctx.font = '12px Arial';
      ctx.fillText(`High: ${highScoreRef.current}`, canvas.width - rightBoxWidth, 95);
      
      ctx.restore();

      // Laser cooldown indicator
      ctx.save();
      const now = Date.now();
      const timeSinceLastLaser = now - laserCooldownRef.current;
      const cooldownProgress = Math.min(timeSinceLastLaser / LASER_COOLDOWN, 1);
      const laserBoxWidth = 180;
      const laserBoxX = canvas.width - laserBoxWidth - 10;
      const laserBoxY = 130;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(laserBoxX, laserBoxY, laserBoxWidth, 60);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Laser (B):', laserBoxX + 10, laserBoxY + 10);
      
      // Cooldown bar
      const barWidth = laserBoxWidth - 20;
      const barHeight = 20;
      const barX = laserBoxX + 10;
      const barY = laserBoxY + 32;
      
      // Background
      ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Progress
      if (cooldownProgress >= 1) {
        ctx.fillStyle = '#10b981'; // Green when ready
      } else {
        ctx.fillStyle = '#ef4444'; // Red when cooling down
      }
      ctx.fillRect(barX, barY, barWidth * cooldownProgress, barHeight);
      
      // Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
      
      // Text
      if (cooldownProgress >= 1) {
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('READY!', barX + barWidth / 2, barY + 5);
      } else {
        const remainingTime = Math.ceil((LASER_COOLDOWN - timeSinceLastLaser) / 1000);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${remainingTime}s`, barX + barWidth / 2, barY + 5);
      }
      
      ctx.restore();

      ctx.save();
      const helpButtonSize = 50;
      const helpButtonX = canvas.width - helpButtonSize - 10;
      const helpButtonY = canvas.width < 768 
        ? canvas.height - helpButtonSize - 230 
        : canvas.height - helpButtonSize - 70;

      ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.beginPath();
      ctx.arc(helpButtonX + helpButtonSize / 2, helpButtonY + helpButtonSize / 2, helpButtonSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(helpButtonX + helpButtonSize / 2, helpButtonY + helpButtonSize / 2, helpButtonSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', helpButtonX + helpButtonSize / 2, helpButtonY + helpButtonSize / 2);
      
      ctx.restore();
    };

    const drawNotifications = () => {
      const now = Date.now();
      const centerX = canvas.width / 2;
      let yOffset = 120;

      notificationsRef.current = notificationsRef.current.filter((notification) => {
        const age = now - notification.timestamp;
        if (age > notification.duration) return false;
        return true;
      });

      const visibleNotifications = notificationsRef.current.slice(0, 3);

      visibleNotifications.forEach((notification) => {
        const age = now - notification.timestamp;
        const fadeInDuration = 200;
        const fadeOutDuration = 500;
        let opacity = 1;

        if (age < fadeInDuration) {
          opacity = age / fadeInDuration;
        } else if (age > notification.duration - fadeOutDuration) {
          opacity = (notification.duration - age) / fadeOutDuration;
        }

        ctx.save();
        ctx.globalAlpha = opacity;

        let borderColor = '#10b981';
        let bgColor = 'rgba(16, 185, 129, 0.1)';

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
        const maxWidth = canvas.width * 0.6;
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

        yOffset += boxHeight + 10;
      });
    };

    const drawSatellite = (structure: DefensiveStructure) => {
      ctx.save();
      ctx.translate(structure.x, structure.y);

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
      gradient.addColorStop(0, '#60a5fa');
      gradient.addColorStop(1, '#3b82f6');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#93c5fd';
      ctx.fillRect(-40, -5, 35, 10);
      ctx.fillRect(5, -5, 35, 10);

      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-40 + i * 10, -5);
        ctx.lineTo(-40 + i * 10, 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(5 + i * 10, -5);
        ctx.lineTo(5 + i * 10, 5);
        ctx.stroke();
      }

      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(0, -35);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -35, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawSpaceStation = (structure: DefensiveStructure) => {
      ctx.save();
      ctx.translate(structure.x, structure.y);

      const time = Date.now() / 1000;
      ctx.rotate(time * 0.2);

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 45, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      const modules = [
        { x: 0, y: -40 },
        { x: 0, y: 40 },
        { x: -40, y: 0 },
        { x: 40, y: 0 },
      ];
      modules.forEach((mod) => {
        ctx.fillRect(mod.x - 3, mod.y - 3, 6, 6);
      });

      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-45, -45, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(45, -45, 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawBugNebula = (nebula: BugNebula) => {
      const now = Date.now();
      const age = now - nebula.createdAt;
      const timeUntilSpawn = nebula.spawnTime - now;
      
      // Pulsing effect that gets faster as spawn time approaches
      const pulseSpeed = Math.max(100, timeUntilSpawn / 10);
      const pulseIntensity = 0.7 + Math.sin(now / pulseSpeed) * 0.3;
      
      // Rotation for swirling effect
      const rotation = (age / 2000) * Math.PI * 2;

      ctx.save();
      ctx.translate(nebula.x, nebula.y);
      ctx.rotate(rotation);

      // Outer glow layers (green nebula effect)
      for (let i = 3; i > 0; i--) {
        const glowRadius = nebula.radius * (1 + i * 0.3) * pulseIntensity;
        const alpha = (0.15 / i) * pulseIntensity;
        
        ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`; // Green
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main nebula body with gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.radius);
      gradient.addColorStop(0, `rgba(52, 211, 153, ${0.8 * pulseIntensity})`); // Bright green center
      gradient.addColorStop(0.5, `rgba(16, 185, 129, ${0.5 * pulseIntensity})`); // Medium green
      gradient.addColorStop(1, `rgba(5, 150, 105, ${0.2 * pulseIntensity})`); // Dark green edge
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, nebula.radius, 0, Math.PI * 2);
      ctx.fill();

      // Swirling particles effect
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + rotation * 2;
        const distance = nebula.radius * 0.6;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        ctx.fillStyle = `rgba(167, 243, 208, ${0.6 * pulseIntensity})`; // Light green
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Inner core
      ctx.fillStyle = `rgba(236, 253, 245, ${0.4 * pulseIntensity})`; // Very light green
      ctx.beginPath();
      ctx.arc(0, 0, nebula.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const updateBugNebulas = (now: number) => {
      bugNebulasRef.current = bugNebulasRef.current.filter((nebula) => {
        // Check if nebula should spawn bugs
        if (now >= nebula.spawnTime) {
          console.log('🌫️ Nebula spawning! Creating 2 bugs');
          
          // Spawn 2 bugs from this nebula
          for (let i = 0; i < 2; i++) {
            const angle = (i / 2) * Math.PI * 2 + Math.random();
            const distance = 20;
            const x = nebula.x + Math.cos(angle) * distance;
            const y = nebula.y + Math.sin(angle) * distance;
            
            const radius = 15 + Math.random() * 10;
            const isMobile = canvas.width < 768;
            const speedMultiplier = isMobile ? 0.6 : 1;
            const speed = (level.bugSpeed + Math.random()) * speedMultiplier;
            
            asteroidsRef.current.push({
              x,
              y,
              radius,
              speed,
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.05,
              type: 'bug',
              isSpecial: false, // Spawned bugs are not special
            });
          }
          
          // Create explosion particles at nebula location
          createExplosionParticles(nebula.x, nebula.y, '#10b981', 12);
          sounds.playNebulaWarning();
          
          notificationsRef.current.push({
            id: `nebula-spawned-${Date.now()}`,
            message: '🌫️ Nebula Spawned 2 Bugs!',
            timestamp: now,
            duration: 2000,
            type: 'damage',
          });
          
          // Remove the nebula
          return false;
        }
        
        return true;
      });
    };

    const createExplosionParticles = (x: number, y: number, color: string, count: number = 12) => {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const speed = 2 + Math.random() * 4;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        particlesRef.current.push({
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
    };

    const drawParticles = () => {
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2;
        particle.life -= 0.02;
        
        if (particle.life <= 0) return false;
        
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        return true;
      });
    };

    const drawDeployAnimations = (now: number) => {
      deployAnimationsRef.current = deployAnimationsRef.current.filter((anim) => {
        const elapsed = now - anim.startTime;
        if (elapsed > anim.duration) return false;
        
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
        return true;
      });
    };

    const drawLevelUpAnimation = (now: number) => {
      if (!levelUpAnimationRef.current) return;
      
      const anim = levelUpAnimationRef.current;
      const elapsed = now - anim.startTime;
      
      if (elapsed > anim.duration) {
        levelUpAnimationRef.current = null;
        return;
      }
      
      const progress = elapsed / anim.duration;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
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
    };

    const checkCircleCollision = (
      x1: number, y1: number, r1: number,
      x2: number, y2: number, r2: number
    ): boolean => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < r1 + r2;
    };

    const checkCollision = (bullet: Bullet, asteroid: Asteroid): boolean => {
      return checkCircleCollision(bullet.x, bullet.y, 4, asteroid.x, asteroid.y, asteroid.radius);
    };

    const checkRocketBugCollision = (rocket: { x: number; y: number; width: number; height: number }, bug: Asteroid): boolean => {
      const rocketCenterX = rocket.x + rocket.width / 2;
      const rocketCenterY = rocket.y + rocket.height / 2;
      const rocketRadius = Math.min(rocket.width, rocket.height) / 2;
      
      return checkCircleCollision(rocketCenterX, rocketCenterY, rocketRadius, bug.x, bug.y, bug.radius);
    };



    const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const findBugsInRange = (structure: DefensiveStructure): Asteroid[] => {
      return asteroidsRef.current.filter((asteroid) => {
        if (asteroid.type !== 'bug') return false;
        const distance = calculateDistance(structure.x, structure.y, asteroid.x, asteroid.y);
        return distance <= structure.range;
      });
    };



    const spawnAsteroid = () => {
      const radius = 20 + Math.random() * 20;
      const x = Math.random() * canvas.width;
      const y = -radius;
      const isMobile = canvas.width < 768;
      const speedMultiplier = isMobile ? 0.6 : 1;
      const speed = (1 + Math.random() * 2) * speedMultiplier;
      const rotationSpeed = (Math.random() - 0.5) * 0.05;

      asteroidsRef.current.push({
        x,
        y,
        radius,
        speed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed,
        type: 'asteroid',
      });
    };

    const spawnBug = () => {
      const radius = 15 + Math.random() * 10;
      const x = Math.random() * canvas.width;
      const y = -radius;
      const isMobile = canvas.width < 768;
      const speedMultiplier = isMobile ? 0.6 : 1;
      const speed = (level.bugSpeed + Math.random()) * speedMultiplier;
      const rotationSpeed = (Math.random() - 0.5) * 0.05;

      bugSpawnCountRef.current += 1;
      const isSpecial = bugSpawnCountRef.current % 3 === 0;

      asteroidsRef.current.push({
        x,
        y,
        radius,
        speed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed,
        type: 'bug',
        isSpecial,
        lastDustEmission: isSpecial ? Date.now() : undefined,
        dustEmitted: isSpecial ? 0 : undefined,
      });
      
      if (isSpecial) {
        notificationsRef.current.push({
          id: `special-bug-${Date.now()}`,
          message: '⚠️ Special Bug Detected!',
          timestamp: Date.now(),
          duration: 2000,
          type: 'info',
        });
      }
    };







    const processDefensiveStructures = (now: number) => {
      structuresRef.current.forEach((structure) => {
        if (now - structure.lastShot < structure.fireRate) {
          return;
        }

        const bugsInRange = findBugsInRange(structure);
        if (bugsInRange.length === 0) {
          return;
        }

        let nearestBug = bugsInRange[0];
        let nearestDistance = calculateDistance(structure.x, structure.y, nearestBug.x, nearestBug.y);

        for (let i = 1; i < bugsInRange.length; i++) {
          const distance = calculateDistance(structure.x, structure.y, bugsInRange[i].x, bugsInRange[i].y);
          if (distance < nearestDistance) {
            nearestBug = bugsInRange[i];
            nearestDistance = distance;
          }
        }

        const dx = nearestBug.x - structure.x;
        const dy = nearestBug.y - structure.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const directionX = dx / distance;
        const directionY = dy / distance;

        const bulletSpeed = structure.type === 'satellite' ? 8 : 10;
        bulletsRef.current.push({
          x: structure.x,
          y: structure.y,
          speed: bulletSpeed,
          owner: structure.type,
          directionX,
          directionY,
        });

        structure.lastShot = now;
      });
    };

    // Main animation loop
    const animate = () => {
      const rocket = rocketRef.current;
      const now = Date.now();

      if (screenShakeRef.current.intensity > 0) {
        screenShakeRef.current.x = (Math.random() - 0.5) * screenShakeRef.current.intensity;
        screenShakeRef.current.y = (Math.random() - 0.5) * screenShakeRef.current.intensity;
        screenShakeRef.current.intensity *= 0.9;
        
        if (screenShakeRef.current.intensity < 0.5) {
          screenShakeRef.current = { x: 0, y: 0, intensity: 0 };
        }
      }

      ctx.save();
      ctx.translate(screenShakeRef.current.x, screenShakeRef.current.y);
      
      ctx.clearRect(-screenShakeRef.current.x, -screenShakeRef.current.y, canvas.width, canvas.height);

      const timeSinceDamage = now - damageFlashRef.current;
      if (timeSinceDamage < 200) {
        ctx.fillStyle = `rgba(220, 38, 38, ${0.3 * (1 - timeSinceDamage / 200)})`;
        ctx.fillRect(-screenShakeRef.current.x, -screenShakeRef.current.y, canvas.width, canvas.height);
      }

      if (isGameOver || isPaused || showHelp || showStats) {
        asteroidsRef.current.forEach((asteroid) => {
          drawAsteroid(asteroid);
        });
        bulletsRef.current.forEach((bullet) => {
          drawBullet(bullet);
        });
        structuresRef.current.forEach((structure) => {
          if (structure.type === 'satellite') {
            drawSatellite(structure);
          } else {
            drawSpaceStation(structure);
          }
        });
        bugNebulasRef.current.forEach((nebula) => {
          drawBugNebula(nebula);
        });
        drawRocket(rocket.x, rocket.y);
        
        // Draw horizontal laser if active (even when paused)
        if (horizontalLaserRef.current) {
          drawHorizontalLaser(horizontalLaserRef.current, now);
        }
        
        drawHUD();
        
        ctx.restore();
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (keysRef.current.left && rocket.x > 0) {
        rocket.x -= rocket.speed;
      }
      if (keysRef.current.right && rocket.x < canvas.width - rocket.width) {
        rocket.x += rocket.speed;
      }
      
      rocket.x = Math.max(0, Math.min(rocket.x, canvas.width - rocket.width));
      rocket.y = Math.max(0, Math.min(rocket.y, canvas.height - rocket.height));

      if (keysRef.current.space && now - lastShotRef.current > 200) {
        bulletsRef.current.push({
          x: rocket.x + rocket.width / 2,
          y: rocket.y,
          speed: 10,
          owner: 'player',
        });
        lastShotRef.current = now;
        sounds.playLaserShot();
      }

      // Horizontal laser activation
      if (keysRef.current.laser && !horizontalLaserRef.current) {
        const timeSinceLastLaser = now - laserCooldownRef.current;
        if (timeSinceLastLaser >= LASER_COOLDOWN) {
          // Activate laser at rocket's Y position
          horizontalLaserRef.current = {
            y: rocket.y + rocket.height / 2,
            startTime: now,
            duration: LASER_DURATION,
          };
          laserCooldownRef.current = now;
          sounds.playHorizontalLaser();
          
          notificationsRef.current.push({
            id: `laser-${now}`,
            message: '⚡ LASER ACTIVATED!',
            timestamp: now,
            duration: 1000,
            type: 'info',
          });
        }
      }

      const isMobile = canvas.width < 768;
      const asteroidSpawnMultiplier = isMobile ? 1.5 : 1;
      const bugSpawnMultiplier = isMobile ? 1.5 : 1;
      
      if (now - lastAsteroidSpawnRef.current > level.asteroidSpawnRate * asteroidSpawnMultiplier) {
        spawnAsteroid();
        lastAsteroidSpawnRef.current = now;
      }

      if (now - lastBugSpawnRef.current > level.bugSpawnRate * bugSpawnMultiplier) {
        spawnBug();
        lastBugSpawnRef.current = now;
      }

      processDefensiveStructures(now);

      // Check laser collisions with asteroids/bugs
      if (horizontalLaserRef.current) {
        const laser = horizontalLaserRef.current;
        const elapsed = now - laser.startTime;
        
        if (elapsed >= laser.duration) {
          horizontalLaserRef.current = null;
        } else {
          // Check collision with all asteroids/bugs at laser Y position
          asteroidsRef.current = asteroidsRef.current.filter((asteroid) => {
            const hitByLaser = Math.abs(asteroid.y - laser.y) < asteroid.radius;
            
            if (hitByLaser) {
              if (asteroid.type === 'asteroid') {
                scoreRef.current += 10;
                collectResource();
                persistence.trackResourceCollect();
              } else {
                scoreRef.current += 20;
                persistence.trackBugKill();
                
                // If it's a special bug, create nebula
                if (asteroid.isSpecial) {
                  console.log('🌫️ Special bug destroyed by laser! Creating nebula');
                  
                  bugNebulasRef.current.push({
                    id: `nebula-${now}`,
                    x: asteroid.x,
                    y: asteroid.y,
                    createdAt: now,
                    spawnTime: now + 5000,
                    radius: 30,
                  });
                  
                  notificationsRef.current.push({
                    id: `nebula-created-${now}`,
                    message: '🌫️ Bug Nebula Created!',
                    timestamp: now,
                    duration: 2000,
                    type: 'info',
                  });
                }
              }
              
              createExplosionParticles(
                asteroid.x,
                asteroid.y,
                asteroid.type === 'asteroid' ? '#78716c' : '#dc2626',
                8
              );
              sounds.playExplosion();
              
              return false;
            }
            
            return true;
          });
          
          // Check collision with nebulas
          bugNebulasRef.current = bugNebulasRef.current.filter((nebula) => {
            const hitByLaser = Math.abs(nebula.y - laser.y) < nebula.radius;
            
            if (hitByLaser) {
              scoreRef.current += 50;
              createExplosionParticles(nebula.x, nebula.y, '#10b981', 16);
              sounds.playExplosion();
              notificationsRef.current.push({
                id: `nebula-destroyed-${now}`,
                message: '💥 Nebula Destroyed! +50',
                timestamp: now,
                duration: 2000,
                type: 'info',
              });
              return false;
            }
            
            return true;
          });
        }
      }

      asteroidsRef.current = asteroidsRef.current.filter((asteroid) => {
        if (asteroid.type === 'bug') {
          const rocketCenterX = rocket.x + rocket.width / 2;
          const rocketCenterY = rocket.y + rocket.height / 2;
          
          const dx = rocketCenterX - asteroid.x;
          const dy = rocketCenterY - asteroid.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const normalizedX = dx / distance;
            const normalizedY = dy / distance;
            
            asteroid.x += normalizedX * asteroid.speed;
            asteroid.y += normalizedY * asteroid.speed;
            
            asteroid.rotation = Math.atan2(dy, dx) + Math.PI / 2;
          }
          
          // Special bugs no longer emit dust while alive
          // They drop eggs when destroyed
        } else {
          asteroid.y += asteroid.speed;
          asteroid.rotation += asteroid.rotationSpeed;
        }
        
        if (asteroid.type === 'bug' && !isPaused && !isGameOver && checkRocketBugCollision(rocket, asteroid)) {
          rocket.lives -= 1;
          sounds.playHit();
          
          notificationsRef.current.push({
            id: `damage-${Date.now()}`,
            message: '💥 Bug Hit! -1 Life',
            timestamp: Date.now(),
            duration: 2000,
            type: 'damage',
          });
          
          damageFlashRef.current = Date.now();
          screenShakeRef.current = { x: 0, y: 0, intensity: 10 };
          
          if (rocket.lives <= 0) {
            setIsGameOver(true);
            persistence.endGameSession(scoreRef.current, level.current);
            
            if (scoreRef.current > highScoreRef.current) {
              highScoreRef.current = scoreRef.current;
              
              try {
                localStorage.setItem('spaceDevGameHighScore', highScoreRef.current.toString());
              } catch (e) {
                console.warn('Could not save high score:', e);
              }
            }
          }
          
          return false;
        }
        
        const margin = asteroid.radius * 2;
        const isOffScreen = 
          asteroid.x < -margin || 
          asteroid.x > canvas.width + margin ||
          asteroid.y < -margin || 
          asteroid.y > canvas.height + margin;
        
        if (isOffScreen) {
          return false;
        }
        
        drawAsteroid(asteroid);
        return true;
      });

      bulletsRef.current = bulletsRef.current.filter((bullet) => {
        if (bullet.owner === 'player') {
          bullet.y -= bullet.speed;
        } else {
          if (bullet.directionX !== undefined && bullet.directionY !== undefined) {
            bullet.x += bullet.directionX * bullet.speed;
            bullet.y += bullet.directionY * bullet.speed;
          }
        }
        
        let bulletHit = false;
        asteroidsRef.current = asteroidsRef.current.filter((asteroid) => {
          if (checkCollision(bullet, asteroid)) {
            bulletHit = true;
            
            if (asteroid.type === 'asteroid') {
              scoreRef.current += 10;
              collectResource();
              persistence.trackResourceCollect();
            } else {
              scoreRef.current += 20;
              persistence.trackBugKill();
              
              // If it's a special bug, drop 1 nebula
              if (asteroid.isSpecial) {
                console.log('🌫️ Special bug destroyed! Creating nebula');
                
                bugNebulasRef.current.push({
                  id: `nebula-${Date.now()}`,
                  x: asteroid.x,
                  y: asteroid.y,
                  createdAt: now,
                  spawnTime: now + 5000, // Spawn bugs after 5 seconds
                  radius: 30,
                });
                
                notificationsRef.current.push({
                  id: `nebula-created-${Date.now()}`,
                  message: '🌫️ Bug Nebula Created!',
                  timestamp: now,
                  duration: 2000,
                  type: 'info',
                });
              }
            }
            
            createExplosionParticles(
              asteroid.x,
              asteroid.y,
              asteroid.type === 'asteroid' ? '#78716c' : '#dc2626',
              8
            );
            sounds.playExplosion();
            
            return false;
          }
          return true;
        });
        

        
        if (bulletHit) return false;
        
        if (bullet.y < -10 || bullet.y > canvas.height + 10 || 
            bullet.x < -10 || bullet.x > canvas.width + 10) {
          return false;
        }
        
        drawBullet(bullet);
        return true;
      });

      updateBugNebulas(now);

      if (now - lastResourceCheckRef.current > 100) {
        const deployThreshold = 20;
        if (resources.collected >= deployThreshold && 
            resources.totalCollected > lastDeployedAtRef.current) {
          const deployCount = Math.floor(resources.collected / deployThreshold);
          
          for (let i = 0; i < deployCount; i++) {
            deployStructure(canvas.width, canvas.height);
            sounds.playDeploy();
          }
          
          lastDeployedAtRef.current = resources.totalCollected;
        }
        
        // Check for level up
        const previousLevel = level.current;
        checkLevelUp();
        
        // If level changed, show animation
        if (level.current > previousLevel) {
          persistence.trackLevelReached(level.current);
          levelUpAnimationRef.current = {
            startTime: now,
            duration: 2000,
            level: level.current,
          };
          sounds.playLevelUp();
          
          notificationsRef.current.push({
            id: `levelup-${Date.now()}`,
            message: `🎉 Level ${level.current}!`,
            timestamp: now,
            duration: 3000,
            type: 'levelup',
          });
        }
        
        lastResourceCheckRef.current = now;
      }

      bugNebulasRef.current.forEach((nebula) => {
        drawBugNebula(nebula);
      });

      structuresRef.current.forEach((structure) => {
        if (structure.type === 'satellite') {
          drawSatellite(structure);
        } else {
          drawSpaceStation(structure);
        }
      });

      drawRocket(rocket.x, rocket.y);
      drawParticles();
      drawDeployAnimations(now);
      drawLevelUpAnimation(now);
      
      // Draw horizontal laser if active
      if (horizontalLaserRef.current) {
        drawHorizontalLaser(horizontalLaserRef.current, now);
      }
      
      drawHUD();
      drawNotifications();

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('click', handleCanvasClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [hasStarted, showHelp, isPaused, isGameOver, showStats, resources, level, collectResource, deployStructure, checkLevelUp, handleStartGame, handleRestart, persistence, sounds]);

  return (
    <>
      {/* Particles background */}
      <div className="fixed inset-0 z-50">
        <Particles />
      </div>
      
      {/* Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 z-[100]" />
      
      {/* Touch controls for mobile */}
      <div className="fixed bottom-10 left-1/2 z-[150] flex -translate-x-1/2 gap-3 md:hidden">
        <button
          onTouchStart={() => (keysRef.current.left = true)}
          onTouchEnd={() => (keysRef.current.left = false)}
          className="size-16 rounded-full bg-primary/80 text-2xl font-bold text-white shadow-lg backdrop-blur-sm active:scale-95"
        >
          ←
        </button>
        <button
          onTouchStart={() => (keysRef.current.space = true)}
          onTouchEnd={() => (keysRef.current.space = false)}
          className="size-16 rounded-full bg-red-500/80 text-2xl font-bold text-white shadow-lg backdrop-blur-sm active:scale-95"
        >
          🔥
        </button>
        <button
          onTouchStart={() => (keysRef.current.right = true)}
          onTouchEnd={() => (keysRef.current.right = false)}
          className="size-16 rounded-full bg-primary/80 text-2xl font-bold text-white shadow-lg backdrop-blur-sm active:scale-95"
        >
          →
        </button>
      </div>
      
      {/* Game screens */}
      {!hasStarted && !showContinueDialog && !showStats && (
        <GameWelcomeScreen 
          onStart={handleStartGame} 
          onViewStats={handleViewStats}
        />
      )}
      
      {showContinueDialog && persistence.loadGameState() && (
        <GameContinueDialog
          save={persistence.loadGameState()!}
          onContinue={handleContinueGame}
          onNewGame={handleStartGame}
        />
      )}
      
      {showHelp && (
        <GameHelpScreen onClose={() => setShowHelp(false)} />
      )}
      
      {isPaused && !isGameOver && (
        <GamePauseScreen 
          onResume={() => setIsPaused(false)}
          onRestart={handleRestart}
          onViewStats={handleViewStats}
        />
      )}
      
      {isGameOver && (
        <GameOverScreen
          score={scoreRef.current}
          highScore={highScoreRef.current}
          onRestart={handleRestart}
          onViewStats={handleViewStats}
        />
      )}
      
      {showStats && (
        <GameStatsScreen
          statistics={persistence.getStats()}
          leaderboard={persistence.getLeaderboardData()}
          onClose={handleCloseStats}
        />
      )}
    </>
  );
}
