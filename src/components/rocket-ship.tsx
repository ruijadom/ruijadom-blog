'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useResourceSystem, useLevelSystem, DefensiveStructure } from './game-state';
import Particles from './particles';

interface Bullet {
  x: number;
  y: number;
  speed: number;
  owner: 'player' | 'satellite' | 'station';
  directionX?: number; // For structure bullets
  directionY?: number; // For structure bullets
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

export function RocketShip() {
  const [isGameVisible, setIsGameVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocketRef = useRef({ x: 0, y: 0, width: 60, height: 80, speed: 8, lives: 3 });
  const bulletsRef = useRef<Bullet[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const deployAnimationsRef = useRef<DeployAnimation[]>([]);
  const levelUpAnimationRef = useRef<LevelUpAnimation | null>(null);
  const keysRef = useRef({ left: false, right: false, space: false });
  const animationRef = useRef<number>();
  const lastShotRef = useRef(0);
  const lastAsteroidSpawnRef = useRef(0);
  const lastBugSpawnRef = useRef(0);
  const structuresRef = useRef<DefensiveStructure[]>([]);
  const lastResourceCheckRef = useRef(0);
  const notificationsRef = useRef<Array<{ 
    id: string;
    message: string; 
    timestamp: number; 
    duration: number;
    type: 'deploy' | 'levelup' | 'damage' | 'info';
  }>>([]);
  const damageFlashRef = useRef(0);
  const screenShakeRef = useRef({ x: 0, y: 0, intensity: 0 });
  const isGameOverRef = useRef(false);
  const finalScoreRef = useRef(0);
  const isPausedRef = useRef(false);
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const hasStartedRef = useRef(false);
  const showHelpRef = useRef(false);
  const rocketInitializedRef = useRef(false); // Moved outside useEffect
  
  // Resource system hook with deploy callback
  const { resources, collectResource, deployStructure, resetResources } = useResourceSystem((structure) => {
    // Add deployed structure to our ref
    structuresRef.current.push(structure);
    
    // Add deploy animation
    deployAnimationsRef.current.push({
      x: structure.x,
      y: structure.y,
      startTime: Date.now(),
      duration: 1000, // 1 second animation
      type: structure.type,
    });
    
    // Add notification with the quote - show for 5 seconds at the top
    const structureName = structure.type === 'satellite' ? '🛰️ Satellite' : '🏗️ Space Station';
    notificationsRef.current.push({
      id: `deploy-${Date.now()}`,
      message: `${structureName} Deployed!\n"${structure.quote}"`,
      timestamp: Date.now(),
      duration: 7000, // Show for 7 seconds
      type: 'deploy',
    });
  });

  // Level system hook
  const { level, checkLevelUp, resetLevel } = useLevelSystem(resources.totalCollected);

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

  // Reset game function
  const resetGame = useCallback(() => {
    // Reset rocket position
    const canvas = canvasRef.current;
    if (canvas) {
      rocketRef.current.x = canvas.width / 2 - rocketRef.current.width / 2;
      const bottomOffset = window.innerWidth < 768 ? 160 : 80;
      rocketRef.current.y = canvas.height - rocketRef.current.height - bottomOffset;
    }
    
    // Reset rocket lives
    rocketRef.current.lives = 3;
    
    // Clear all arrays
    bulletsRef.current = [];
    asteroidsRef.current = [];
    structuresRef.current = [];
    notificationsRef.current = [];
    particlesRef.current = [];
    deployAnimationsRef.current = [];
    levelUpAnimationRef.current = null;
    
    // Reset refs
    lastShotRef.current = 0;
    lastAsteroidSpawnRef.current = 0;
    lastBugSpawnRef.current = 0;
    lastResourceCheckRef.current = 0;
    damageFlashRef.current = 0;
    screenShakeRef.current = { x: 0, y: 0, intensity: 0 };
    isGameOverRef.current = false;
    isPausedRef.current = false;
    finalScoreRef.current = 0;
    scoreRef.current = 0;
    // Don't reset rocketInitializedRef here - it should persist
    
    // Reset resources and level using hooks
    resetResources();
    resetLevel();
  }, [resetResources, resetLevel]);

  // Track if rocket has been initialized - removed duplicate declaration

  // Manage game visibility class on body - separate effect to avoid cleanup issues
  useEffect(() => {
    if (isGameVisible) {
      document.body.classList.add('game-active');
    } else {
      document.body.classList.remove('game-active');
    }
    
    // Cleanup only when component unmounts completely
    return () => {
      if (!isGameVisible) {
        document.body.classList.remove('game-active');
      }
    };
  }, [isGameVisible]);

  // Reset rocket initialization when game visibility changes
  useEffect(() => {
    if (!isGameVisible) {
      rocketInitializedRef.current = false;
    }
  }, [isGameVisible]);


  useEffect(() => {
    if (!isGameVisible) return; // Don't initialize canvas if game is not visible
    
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
        
        // Reposition asteroids and bugs proportionally
        asteroidsRef.current.forEach((asteroid) => {
          asteroid.x = asteroid.x * widthRatio;
          asteroid.y = asteroid.y * heightRatio;
        });
        
        // Reposition bullets proportionally
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
      if (!hasStartedRef.current && (e.key === ' ' || e.key === 'Spacebar')) {
        e.preventDefault();
        hasStartedRef.current = true;
        return;
      }

      // ? key to toggle help (only when game has started)
      if (hasStartedRef.current && (e.key === '?' || e.key === '/')) {
        e.preventDefault();
        showHelpRef.current = !showHelpRef.current;
        return;
      }

      // ESC key to toggle pause or close help
      if (e.key === 'Escape') {
        e.preventDefault();
        
        // Close help if it's open
        if (showHelpRef.current) {
          showHelpRef.current = false;
          return;
        }
        
        // Don't allow pause if game is over or not started
        if (!isGameOverRef.current && hasStartedRef.current) {
          isPausedRef.current = !isPausedRef.current;
        }
        return;
      }

      // R key to reset game
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetGame();
        hasStartedRef.current = false; // Show welcome screen again
        showHelpRef.current = false; // Close help if open
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

    // Click handler for welcome screen
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Check if we're on the welcome screen
      if (!hasStartedRef.current) {
        // Check if click is on start button
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const buttonWidth = 300;
        const buttonHeight = 60;
        const buttonX = centerX - buttonWidth / 2;
        const buttonY = centerY + 200;

        if (
          clickX >= buttonX &&
          clickX <= buttonX + buttonWidth &&
          clickY >= buttonY &&
          clickY <= buttonY + buttonHeight
        ) {
          hasStartedRef.current = true;
        }
        return;
      }

      // Check if click is on help button
      const helpButtonSize = 50;
      const helpButtonX = canvas.width - helpButtonSize - 10;
      const helpButtonY = canvas.height - helpButtonSize - 70; // Moved up to make room for toggle button
      const adjustedY = canvas.width < 768 ? canvas.height - helpButtonSize - 230 : helpButtonY;
      
      const helpButtonCenterX = helpButtonX + helpButtonSize / 2;
      const helpButtonCenterY = adjustedY + helpButtonSize / 2;
      const distanceToHelpButton = Math.sqrt(
        Math.pow(clickX - helpButtonCenterX, 2) + Math.pow(clickY - helpButtonCenterY, 2)
      );

      if (distanceToHelpButton <= helpButtonSize / 2) {
        showHelpRef.current = !showHelpRef.current;
      }
    };

    canvas.addEventListener('click', handleCanvasClick);

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
      // Different colors based on owner
      let color = '#10b981'; // Default green for player
      if (bullet.owner === 'satellite') {
        color = '#3b82f6'; // Blue for satellite
      } else if (bullet.owner === 'station') {
        color = '#10b981'; // Green for station
      }

      ctx.fillStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    // Draw HUD
    const drawHUD = () => {
      // Top-left: Resources and progress to next deploy
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(10, 10, 200, 80);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      // Resources label
      ctx.fillText('Resources:', 20, 20);
      
      // Resource count with icon
      ctx.fillStyle = '#78716c';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`⛏️ ${resources.collected}`, 20, 45);
      
      // Progress to next deploy
      ctx.fillStyle = '#10b981';
      ctx.font = '14px Arial';
      ctx.fillText(`Next Deploy: ${resources.collected}/${resources.nextDeployAt}`, 20, 75);
      
      ctx.restore();

      // Top-center: Lives as hearts
      ctx.save();
      const heartSize = 30;
      const heartSpacing = 40;
      const totalWidth = rocketRef.current.lives * heartSpacing - 10;
      const startX = (canvas.width - totalWidth) / 2;
      const heartY = 20;

      // Background for hearts
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(startX - 15, heartY - 10, totalWidth + 30, 50);

      // Draw hearts
      ctx.font = `${heartSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      for (let i = 0; i < rocketRef.current.lives; i++) {
        ctx.fillText('❤️', startX + i * heartSpacing, heartY);
      }
      
      ctx.restore();

      // Top-right: Level, score, and high score
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      const rightBoxWidth = 180;
      ctx.fillRect(canvas.width - rightBoxWidth - 10, 10, rightBoxWidth, 110);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      // Level label
      ctx.fillText('Level:', canvas.width - rightBoxWidth, 20);
      
      // Level number
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(`${level.current}`, canvas.width - rightBoxWidth, 40);
      
      // Score
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`Score: ${scoreRef.current}`, canvas.width - rightBoxWidth, 75);
      
      // High score
      ctx.fillStyle = '#10b981';
      ctx.font = '12px Arial';
      ctx.fillText(`High: ${highScoreRef.current}`, canvas.width - rightBoxWidth, 95);
      
      ctx.restore();

      // Help button (?) moved up to make room for toggle button
      ctx.save();
      const helpButtonSize = 50;
      const helpButtonX = canvas.width - helpButtonSize - 10;
      const helpButtonY = canvas.height - helpButtonSize - 70; // Moved up
      
      // Adjust position if on mobile (to avoid touch controls)
      const adjustedY = canvas.width < 768 ? canvas.height - helpButtonSize - 230 : helpButtonY;

      // Button background
      ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.beginPath();
      ctx.arc(helpButtonX + helpButtonSize / 2, adjustedY + helpButtonSize / 2, helpButtonSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Button border
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(helpButtonX + helpButtonSize / 2, adjustedY + helpButtonSize / 2, helpButtonSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      // Question mark
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', helpButtonX + helpButtonSize / 2, adjustedY + helpButtonSize / 2);
      
      ctx.restore();
    };

    // Draw notifications
    const drawNotifications = () => {
      const now = Date.now();
      const centerX = canvas.width / 2;
      let yOffset = 120;
      const maxNotifications = 3; // Show max 3 notifications at once

      // Filter out expired notifications and draw active ones
      notificationsRef.current = notificationsRef.current.filter((notification) => {
        const age = now - notification.timestamp;
        if (age > notification.duration) return false;
        return true;
      });

      // Only show the most recent notifications
      const visibleNotifications = notificationsRef.current.slice(-maxNotifications);

      visibleNotifications.forEach((notification) => {
        const age = now - notification.timestamp;

        // Calculate opacity (fade in first 300ms, fade out last 500ms)
        let opacity = 1;
        if (age < 300) {
          opacity = age / 300;
        } else if (age > notification.duration - 500) {
          opacity = (notification.duration - age) / 500;
        }

        ctx.save();
        ctx.globalAlpha = opacity;

        // Get color based on notification type
        let borderColor = '#10b981'; // Default green
        let bgColor = 'rgba(0, 0, 0, 0.8)';
        
        switch (notification.type) {
          case 'deploy':
            borderColor = '#10b981'; // Green
            bgColor = 'rgba(16, 185, 129, 0.1)';
            break;
          case 'levelup':
            borderColor = '#fbbf24'; // Yellow
            bgColor = 'rgba(251, 191, 36, 0.1)';
            break;
          case 'damage':
            borderColor = '#ef4444'; // Red
            bgColor = 'rgba(239, 68, 68, 0.1)';
            break;
          case 'info':
            borderColor = '#3b82f6'; // Blue
            bgColor = 'rgba(59, 130, 246, 0.1)';
            break;
        }

        // Background
        ctx.fillStyle = bgColor;
        const padding = 20;
        const maxWidth = canvas.width * 0.6;
        const lineHeight = 20;
        
        // Split message by newlines first, then handle word wrap for each line
        const paragraphs = notification.message.split('\n');
        const allLines: string[] = [];
        
        ctx.font = 'bold 14px Arial';
        const maxLineWidth = maxWidth - padding * 2;
        
        // Process each paragraph for word wrapping
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
        
        // Calculate box dimensions based on actual content
        const boxHeight = Math.max(60, allLines.length * lineHeight + padding * 2);
        let maxTextWidth = 0;
        allLines.forEach((line) => {
          const metrics = ctx.measureText(line);
          maxTextWidth = Math.max(maxTextWidth, metrics.width);
        });
        const boxWidth = Math.min(maxTextWidth + padding * 2, maxWidth);

        // Add shadow for depth
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(centerX - boxWidth / 2, yOffset, boxWidth, boxHeight);
        ctx.shadowBlur = 0;

        // Border with glow
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 5;
        ctx.shadowColor = borderColor;
        ctx.strokeRect(centerX - boxWidth / 2, yOffset, boxWidth, boxHeight);
        ctx.shadowBlur = 0;

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 14px Arial';
        
        // Draw all lines
        let lineY = yOffset + padding + lineHeight / 2;
        allLines.forEach((line) => {
          ctx.fillText(line, centerX, lineY);
          lineY += lineHeight;
        });

        ctx.restore();

        yOffset += boxHeight + 10;
      });
    };

    // Draw game over screen
    const drawGameOver = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Game Over title
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GAME OVER', centerX, centerY - 120);

      // Final score
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.fillText(`Final Score: ${scoreRef.current}`, centerX, centerY - 40);

      // High score
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`High Score: ${highScoreRef.current}`, centerX, centerY);

      // Educational message
      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px Arial';
      const message1 = 'Balancing features and bugs is the key to success.';
      const message2 = 'Build infrastructure to automate bug prevention!';
      ctx.fillText(message1, centerX, centerY + 50);
      ctx.fillText(message2, centerX, centerY + 80);

      // Restart instruction
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Press R to restart', centerX, centerY + 130);
    };

    // Draw pause menu
    const drawPauseMenu = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Pause title
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PAUSED', centerX, centerY - 80);

      // Instructions
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.fillText('Press ESC to continue', centerX, centerY + 20);

      // Restart instruction
      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px Arial';
      ctx.fillText('Press R to restart', centerX, centerY + 60);
    };

    // Draw welcome screen
    const drawWelcomeScreen = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Background overlay - darker for better contrast
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Game title - using app's primary purple color
      ctx.fillStyle = '#a855f7'; // Purple-500
      ctx.font = 'bold 56px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SPACE DEV', centerX, centerY - 220);

      // Subtitle - using app's green accent
      ctx.fillStyle = '#10b981'; // Green-500
      ctx.font = 'bold 28px Arial';
      ctx.fillText('Build Infrastructure, Not Just Bugs', centerX, centerY - 170);

      // Metaphor explanation box - using purple theme
      const boxWidth = Math.min(700, canvas.width - 40);
      const boxHeight = 180;
      const boxX = centerX - boxWidth / 2;
      const boxY = centerY - 120;

      ctx.fillStyle = 'rgba(168, 85, 247, 0.1)'; // Purple with transparency
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx.strokeStyle = '#a855f7'; // Purple border
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      // Metaphor text - lighter gray for better readability
      ctx.fillStyle = '#e5e7eb'; // Gray-200
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

      let lineY = boxY + 25;
      metaphorLines.forEach((line) => {
        ctx.fillText(line, centerX, lineY);
        lineY += 24;
      });

      // Controls section - using yellow accent
      const controlsY = centerY + 80;
      ctx.fillStyle = '#fbbf24'; // Yellow-400
      ctx.font = 'bold 22px Arial';
      ctx.fillText('CONTROLS', centerX, controlsY);

      // Desktop controls - lighter text
      ctx.fillStyle = '#d1d5db'; // Gray-300
      ctx.font = '17px Arial';
      ctx.fillText('← → or A D: Move', centerX - 150, controlsY + 40);
      ctx.fillText('Space: Shoot', centerX - 150, controlsY + 70);
      ctx.fillText('ESC: Pause', centerX + 150, controlsY + 40);
      ctx.fillText('R: Restart', centerX + 150, controlsY + 70);

      // Mobile note
      if (canvas.width < 768) {
        ctx.fillStyle = '#9ca3af'; // Gray-400
        ctx.font = '15px Arial';
        ctx.fillText('Touch controls available at bottom', centerX, controlsY + 100);
      }

      // Start button - using app's primary purple
      const buttonWidth = 300;
      const buttonHeight = 60;
      const buttonX = centerX - buttonWidth / 2;
      const buttonY = centerY + 200;

      // Button background with glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#a855f7'; // Purple glow
      ctx.fillStyle = '#a855f7'; // Purple-500
      ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
      ctx.shadowBlur = 0;

      // Button border - darker purple
      ctx.strokeStyle = '#9333ea'; // Purple-600
      ctx.lineWidth = 3;
      ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

      // Button text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px Arial';
      ctx.fillText('START GAME', centerX, buttonY + buttonHeight / 2);

      // Instruction below button
      ctx.fillStyle = '#9ca3af'; // Gray-400
      ctx.font = '15px Arial';
      ctx.fillText('Click button or press SPACE to start', centerX, buttonY + buttonHeight + 30);
    };

    // Draw help overlay
    const drawHelpOverlay = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Help title - using yellow accent
      ctx.fillStyle = '#fbbf24'; // Yellow-400
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('HELP', centerX, centerY - 220);

      // Metaphor explanation box - using purple theme
      const boxWidth = Math.min(700, canvas.width - 40);
      const boxHeight = 180;
      const boxX = centerX - boxWidth / 2;
      const boxY = centerY - 170;

      ctx.fillStyle = 'rgba(168, 85, 247, 0.1)'; // Purple with transparency
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx.strokeStyle = '#a855f7'; // Purple border
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      // Metaphor text - lighter gray
      ctx.fillStyle = '#e5e7eb'; // Gray-200
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

      let lineY = boxY + 20;
      metaphorLines.forEach((line) => {
        ctx.fillText(line, centerX, lineY);
        lineY += 24;
      });

      // Controls section
      const controlsY = centerY + 30;
      ctx.fillStyle = '#fbbf24'; // Yellow-400
      ctx.font = 'bold 22px Arial';
      ctx.fillText('CONTROLS', centerX, controlsY);

      // Desktop controls - lighter text
      ctx.fillStyle = '#d1d5db'; // Gray-300
      ctx.font = '17px Arial';
      ctx.fillText('← → or A D: Move', centerX - 150, controlsY + 40);
      ctx.fillText('Space: Shoot', centerX - 150, controlsY + 70);
      ctx.fillText('ESC: Pause', centerX + 150, controlsY + 40);
      ctx.fillText('R: Restart', centerX + 150, controlsY + 70);
      ctx.fillText('?: Toggle Help', centerX, controlsY + 100);

      // Mobile note
      if (canvas.width < 768) {
        ctx.fillStyle = '#9ca3af'; // Gray-400
        ctx.font = '15px Arial';
        ctx.fillText('Touch controls available at bottom', centerX, controlsY + 130);
      }

      // Close instruction - using purple
      ctx.fillStyle = '#a855f7'; // Purple-500
      ctx.font = 'bold 22px Arial';
      ctx.fillText('Press ? or ESC to close', centerX, centerY + 200);
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

    // Draw satellite (blue, circular, with antenna)
    const drawSatellite = (structure: DefensiveStructure) => {
      ctx.save();
      ctx.translate(structure.x, structure.y);

      // Main body - circular with blue gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
      gradient.addColorStop(0, '#60a5fa');
      gradient.addColorStop(1, '#3b82f6');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.stroke();

      // Solar panels (left and right)
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-35, -8, 12, 16);
      ctx.fillRect(23, -8, 12, 16);

      // Solar panel details
      ctx.strokeStyle = '#60a5fa';
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
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(0, -35);
      ctx.stroke();

      // Antenna tip
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -35, 3, 0, Math.PI * 2);
      ctx.fill();

      // Center detail
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Draw space station (larger, green, multiple modules)
    const drawSpaceStation = (structure: DefensiveStructure) => {
      ctx.save();
      ctx.translate(structure.x, structure.y);

      // Central hub - larger with green gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
      gradient.addColorStop(0, '#4ade80');
      gradient.addColorStop(1, '#10b981');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating ring around station
      const rotation = (Date.now() / 2000) % (Math.PI * 2);
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, 40, rotation, rotation + Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 40, rotation + Math.PI, rotation + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Four modules extending from center
      ctx.fillStyle = '#065f46';
      // Top module
      ctx.fillRect(-8, -50, 16, 20);
      // Bottom module
      ctx.fillRect(-8, 30, 16, 20);
      // Left module
      ctx.fillRect(-50, -8, 20, 16);
      // Right module
      ctx.fillRect(30, -8, 20, 16);

      // Module details (windows)
      ctx.fillStyle = '#34d399';
      const modules = [
        { x: 0, y: -40 }, // top
        { x: 0, y: 40 },  // bottom
        { x: -40, y: 0 }, // left
        { x: 40, y: 0 },  // right
      ];
      modules.forEach((mod) => {
        ctx.fillRect(mod.x - 3, mod.y - 3, 6, 6);
      });

      // Communication dishes
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-45, -45, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(45, -45, 8, 0, Math.PI * 2);
      ctx.stroke();

      // Center core
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Create explosion particles
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

    // Draw particles
    const drawParticles = () => {
      particlesRef.current = particlesRef.current.filter((particle) => {
        // Update particle
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; // Gravity
        particle.life -= 0.02;
        
        if (particle.life <= 0) return false;
        
        // Draw particle
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

    // Draw deploy animations
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
        
        // Draw expanding ring
        const ringRadius = 30 + progress * 50;
        const color = anim.type === 'satellite' ? '#3b82f6' : '#10b981';
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw inner ring
        const innerRingRadius = 20 + progress * 30;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, innerRingRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw sparkles
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

    // Draw level-up animation
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
      
      // Fade in first 20%, stay visible 60%, fade out last 20%
      let opacity = 1;
      if (progress < 0.2) {
        opacity = progress / 0.2;
      } else if (progress > 0.8) {
        opacity = (1 - progress) / 0.2;
      }
      
      ctx.globalAlpha = opacity;
      
      // Scale animation - grow then shrink slightly
      const scale = progress < 0.3 ? 0.5 + (progress / 0.3) * 0.5 : 1 - (progress - 0.3) * 0.1;
      
      // Draw level-up text
      ctx.save();
      ctx.translate(centerX, centerY - 100);
      ctx.scale(scale, scale);
      
      // Glow effect
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#fbbf24';
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`LEVEL ${anim.level}`, 0, 0);
      
      ctx.restore();
      
      // Draw radiating lines
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

    // Generic circular collision detection (symmetric)
    const checkCircleCollision = (
      x1: number, y1: number, r1: number,
      x2: number, y2: number, r2: number
    ): boolean => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < r1 + r2;
    };

    // Check collision between bullet and asteroid (uses symmetric collision)
    const checkCollision = (bullet: Bullet, asteroid: Asteroid): boolean => {
      return checkCircleCollision(bullet.x, bullet.y, 4, asteroid.x, asteroid.y, asteroid.radius);
    };

    // Check collision between rocket and bug (uses symmetric collision)
    const checkRocketBugCollision = (rocket: { x: number; y: number; width: number; height: number }, bug: Asteroid): boolean => {
      // Use circular collision for simplicity
      const rocketCenterX = rocket.x + rocket.width / 2;
      const rocketCenterY = rocket.y + rocket.height / 2;
      const rocketRadius = Math.min(rocket.width, rocket.height) / 2;
      
      return checkCircleCollision(rocketCenterX, rocketCenterY, rocketRadius, bug.x, bug.y, bug.radius);
    };

    // Calculate distance between two points
    const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Find bugs within range of a defensive structure
    const findBugsInRange = (structure: DefensiveStructure): Asteroid[] => {
      return asteroidsRef.current.filter((asteroid) => {
        if (asteroid.type !== 'bug') return false;
        const distance = calculateDistance(structure.x, structure.y, asteroid.x, asteroid.y);
        return distance <= structure.range;
      });
    };

    // Spawn asteroids
    const spawnAsteroid = () => {
      const radius = 20 + Math.random() * 20;
      const x = Math.random() * canvas.width;
      const y = -radius;
      // Reduce speed on mobile (smaller screens)
      const isMobile = canvas.width < 768;
      const speedMultiplier = isMobile ? 0.6 : 1; // 40% slower on mobile
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

    // Spawn bugs
    const spawnBug = () => {
      const radius = 15 + Math.random() * 10;
      const x = Math.random() * canvas.width;
      const y = -radius;
      // Reduce speed on mobile (smaller screens)
      const isMobile = canvas.width < 768;
      const speedMultiplier = isMobile ? 0.6 : 1; // 40% slower on mobile
      // Use level-based speed for bugs
      const speed = (level.bugSpeed + Math.random()) * speedMultiplier;
      const rotationSpeed = (Math.random() - 0.5) * 0.05;

      asteroidsRef.current.push({
        x,
        y,
        radius,
        speed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed,
        type: 'bug',
      });
    };

    // Process defensive structure targeting and firing
    const processDefensiveStructures = (now: number) => {
      structuresRef.current.forEach((structure) => {
        // Check if cooldown has elapsed
        if (now - structure.lastShot < structure.fireRate) {
          return;
        }

        // Find bugs in range
        const bugsInRange = findBugsInRange(structure);
        if (bugsInRange.length === 0) {
          return;
        }

        // Target the nearest bug
        let nearestBug = bugsInRange[0];
        let nearestDistance = calculateDistance(structure.x, structure.y, nearestBug.x, nearestBug.y);

        for (let i = 1; i < bugsInRange.length; i++) {
          const distance = calculateDistance(structure.x, structure.y, bugsInRange[i].x, bugsInRange[i].y);
          if (distance < nearestDistance) {
            nearestBug = bugsInRange[i];
            nearestDistance = distance;
          }
        }

        // Calculate direction to target
        const dx = nearestBug.x - structure.x;
        const dy = nearestBug.y - structure.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const directionX = dx / distance;
        const directionY = dy / distance;

        // Fire bullet toward target
        const bulletSpeed = structure.type === 'satellite' ? 8 : 10;
        bulletsRef.current.push({
          x: structure.x,
          y: structure.y,
          speed: bulletSpeed,
          owner: structure.type,
          directionX,
          directionY,
        });

        // Update last shot time
        structure.lastShot = now;
      });
    };



    // Animation loop
    const animate = () => {
      const rocket = rocketRef.current;
      const now = Date.now();

      // Apply screen shake
      if (screenShakeRef.current.intensity > 0) {
        screenShakeRef.current.x = (Math.random() - 0.5) * screenShakeRef.current.intensity;
        screenShakeRef.current.y = (Math.random() - 0.5) * screenShakeRef.current.intensity;
        screenShakeRef.current.intensity *= 0.9; // Decay
        
        if (screenShakeRef.current.intensity < 0.5) {
          screenShakeRef.current = { x: 0, y: 0, intensity: 0 };
        }
      }

      ctx.save();
      ctx.translate(screenShakeRef.current.x, screenShakeRef.current.y);
      
      ctx.clearRect(-screenShakeRef.current.x, -screenShakeRef.current.y, canvas.width, canvas.height);

      // Apply damage flash
      const timeSinceDamage = now - damageFlashRef.current;
      if (timeSinceDamage < 200) {
        ctx.fillStyle = `rgba(220, 38, 38, ${0.3 * (1 - timeSinceDamage / 200)})`;
        ctx.fillRect(-screenShakeRef.current.x, -screenShakeRef.current.y, canvas.width, canvas.height);
      }

      // Show welcome screen if game hasn't started
      if (!hasStartedRef.current) {
        drawWelcomeScreen();
        ctx.restore();
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // If game is over, stop all updates and show game over screen
      if (isGameOverRef.current) {
        // Draw static game state
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
        drawRocket(rocket.x, rocket.y);
        drawHUD();
        
        // Draw game over screen on top
        drawGameOver();
        
        ctx.restore();
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // If game is paused, stop all updates and show pause menu
      if (isPausedRef.current) {
        // Draw static game state
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
        drawRocket(rocket.x, rocket.y);
        drawHUD();
        
        // Draw pause menu on top
        drawPauseMenu();
        
        ctx.restore();
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // If help is shown, pause game and show help overlay
      if (showHelpRef.current) {
        // Draw static game state
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
        drawRocket(rocket.x, rocket.y);
        drawHUD();
        
        // Draw help overlay on top
        drawHelpOverlay();
        
        ctx.restore();
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Move rocket with boundary constraints
      if (keysRef.current.left && rocket.x > 0) {
        rocket.x -= rocket.speed;
      }
      if (keysRef.current.right && rocket.x < canvas.width - rocket.width) {
        rocket.x += rocket.speed;
      }
      
      // Clamp rocket position to ensure it stays within bounds
      rocket.x = Math.max(0, Math.min(rocket.x, canvas.width - rocket.width));
      rocket.y = Math.max(0, Math.min(rocket.y, canvas.height - rocket.height));

      // Shoot bullets
      if (keysRef.current.space && now - lastShotRef.current > 200) {
        bulletsRef.current.push({
          x: rocket.x + rocket.width / 2,
          y: rocket.y,
          speed: 10,
          owner: 'player',
        });
        lastShotRef.current = now;
      }

      // Spawn asteroids periodically based on level
      // Adjust spawn rate for mobile (spawn less frequently)
      const isMobile = canvas.width < 768;
      const asteroidSpawnMultiplier = isMobile ? 1.5 : 1; // 50% slower spawn on mobile
      const bugSpawnMultiplier = isMobile ? 1.5 : 1; // 50% slower spawn on mobile
      
      if (now - lastAsteroidSpawnRef.current > level.asteroidSpawnRate * asteroidSpawnMultiplier) {
        spawnAsteroid();
        lastAsteroidSpawnRef.current = now;
      }

      // Spawn bugs periodically based on level
      if (now - lastBugSpawnRef.current > level.bugSpawnRate * bugSpawnMultiplier) {
        spawnBug();
        lastBugSpawnRef.current = now;
      }

      // Process defensive structure targeting and firing
      processDefensiveStructures(now);

      // Update and draw asteroids
      asteroidsRef.current = asteroidsRef.current.filter((asteroid) => {
        // Move asteroid/bug
        if (asteroid.type === 'bug') {
          // Bugs move toward the rocket
          const rocketCenterX = rocket.x + rocket.width / 2;
          const rocketCenterY = rocket.y + rocket.height / 2;
          
          // Calculate vector from bug to rocket
          const dx = rocketCenterX - asteroid.x;
          const dy = rocketCenterY - asteroid.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Normalize and apply to bug velocity
          if (distance > 0) {
            const normalizedX = dx / distance;
            const normalizedY = dy / distance;
            
            asteroid.x += normalizedX * asteroid.speed;
            asteroid.y += normalizedY * asteroid.speed;
          }
        } else {
          // Asteroids fall straight down
          asteroid.y += asteroid.speed;
        }
        
        asteroid.rotation += asteroid.rotationSpeed;
        
        // Check collision with rocket (only for bugs)
        if (asteroid.type === 'bug' && checkRocketBugCollision(rocket, asteroid)) {
          // Decrease lives
          rocket.lives -= 1;
          
          // Add damage notification
          notificationsRef.current.push({
            id: `damage-${Date.now()}`,
            message: '💥 Bug Hit! -1 Life',
            timestamp: Date.now(),
            duration: 2000,
            type: 'damage',
          });
          
          // Trigger visual feedback
          damageFlashRef.current = Date.now();
          screenShakeRef.current = { x: 0, y: 0, intensity: 10 };
          
          // Check for game over
          if (rocket.lives <= 0) {
            isGameOverRef.current = true;
            
            // Update high score if current score is higher
            if (scoreRef.current > highScoreRef.current) {
              highScoreRef.current = scoreRef.current;
              
              // Save to localStorage
              try {
                localStorage.setItem('spaceDevGameHighScore', highScoreRef.current.toString());
              } catch (e) {
                console.warn('Could not save high score:', e);
              }
            }
          }
          
          // Remove the bug
          return false;
        }
        
        // Remove entities that move off-screen (any boundary)
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

      // Update and draw bullets with collision detection
      bulletsRef.current = bulletsRef.current.filter((bullet) => {
        // Move bullet based on owner type
        if (bullet.owner === 'player') {
          // Player bullets move straight up
          bullet.y -= bullet.speed;
        } else {
          // Structure bullets move in their direction
          if (bullet.directionX !== undefined && bullet.directionY !== undefined) {
            bullet.x += bullet.directionX * bullet.speed;
            bullet.y += bullet.directionY * bullet.speed;
          }
        }
        
        // Check collision with asteroids
        let bulletHit = false;
        asteroidsRef.current = asteroidsRef.current.filter((asteroid) => {
          if (checkCollision(bullet, asteroid)) {
            bulletHit = true;
            
            // Increment score based on type
            if (asteroid.type === 'asteroid') {
              scoreRef.current += 10; // 10 points for asteroid
              collectResource();
              // Create brown/gray explosion particles for asteroids
              createExplosionParticles(asteroid.x, asteroid.y, '#78716c', 12);
            } else if (asteroid.type === 'bug') {
              scoreRef.current += 25; // 25 points for bug
              // Create red explosion particles for bugs
              createExplosionParticles(asteroid.x, asteroid.y, '#dc2626', 15);
            }
            
            return false;
          }
          return true;
        });
        
        if (bulletHit) return false;
        
        // Keep bullet if it's still on screen
        const onScreen = bullet.x > 0 && bullet.x < canvas.width && bullet.y > 0 && bullet.y < canvas.height;
        if (onScreen) {
          drawBullet(bullet);
          return true;
        }
        return false;
      });

      // Check for deploy threshold (every 20 resources)
      // Use exact equality to prevent multiple deploys
      if (resources.collected === resources.nextDeployAt && now - lastResourceCheckRef.current > 500) {
        deployStructure(canvas.width, canvas.height);
        lastResourceCheckRef.current = now;
      }

      // Check for level up
      const previousLevel = level.current;
      checkLevelUp();
      // If level changed, show notification and animation
      if (level.current > previousLevel) {
        notificationsRef.current.push({
          id: `levelup-${Date.now()}`,
          message: `🎉 Level ${level.current} Reached! Difficulty Increased!`,
          timestamp: Date.now(),
          duration: 4000,
          type: 'levelup',
        });
        
        // Trigger level-up animation
        levelUpAnimationRef.current = {
          startTime: Date.now(),
          duration: 2000, // 2 second animation
          level: level.current,
        };
      }

      // Draw defensive structures
      structuresRef.current.forEach((structure) => {
        if (structure.type === 'satellite') {
          drawSatellite(structure);
        } else {
          drawSpaceStation(structure);
        }
      });

      // Draw rocket
      drawRocket(rocket.x, rocket.y);

      // Draw particles (explosions)
      drawParticles();

      // Draw deploy animations
      drawDeployAnimations(now);

      // Draw HUD
      drawHUD();

      // Draw notifications
      drawNotifications();

      // Draw level-up animation (on top of everything)
      drawLevelUpAnimation(now);

      ctx.restore(); // Restore after screen shake transform

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // Don't remove game-active class here - it's managed by separate useEffect
      // Don't reset rocketInitializedRef here - it causes re-initialization on every render
      
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('click', handleCanvasClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resources.collected, resources.nextDeployAt, resources.totalCollected, collectResource, deployStructure, level.current, level.asteroidSpawnRate, level.bugSpawnRate, level.bugSpeed, checkLevelUp, resetGame, isGameVisible]);

  // Listen for play button click from the page
  useEffect(() => {
    const handlePlayClick = () => {
      setIsGameVisible(true);
      
      // Close sidebar if open
      const sidebarTrigger = document.querySelector('[data-sidebar="sidebar"]');
      if (sidebarTrigger) {
        const closeButton = document.querySelector('[data-sidebar-close]');
        if (closeButton instanceof HTMLElement) {
          closeButton.click();
        }
      }
    };

    const playButton = document.getElementById('play-game-button');
    if (playButton) {
      playButton.addEventListener('click', handlePlayClick);
    }

    return () => {
      if (playButton) {
        playButton.removeEventListener('click', handlePlayClick);
      }
    };
  }, []);

  // ESC key to exit game
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isGameVisible && !hasStartedRef.current) {
        e.preventDefault();
        setIsGameVisible(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isGameVisible]);

  return (
    <>
      {/* Exit game button - only show when game is visible */}
      {isGameVisible && (
        <button
          onClick={() => {
            setIsGameVisible(false);
            hasStartedRef.current = false;
          }}
          className="fixed right-4 top-4 z-[200] flex size-14 items-center justify-center rounded-full border-2 border-red-500 bg-red-500/30 text-2xl backdrop-blur-sm transition-all hover:scale-110 hover:bg-red-500/50 active:scale-95"
          aria-label="Exit game and return to site"
          title="Sair do jogo (ESC)"
        >
          ✕
        </button>
      )}

      {/* Particles background - only show when game is active */}
      {isGameVisible && (
        <div className="fixed inset-0 z-50">
          <Particles
            className="absolute inset-0"
            quantity={100}
            ease={80}
            refresh={false}
          />
        </div>
      )}

      {/* Canvas - only render when game is active */}
      {isGameVisible && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-[100] cursor-pointer"
          style={{ 
            background: 'transparent',
          }}
        />
      )}

      {/* Touch controls - only show when game is active and on mobile */}
      {isGameVisible && (
        <div className="fixed bottom-10 left-1/2 z-[150] flex -translate-x-1/2 gap-3 md:hidden">
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
            className="select-none rounded-lg bg-primary/30 px-8 py-4 text-3xl backdrop-blur-sm transition-all active:scale-95 active:bg-primary/50"
            aria-label="Move left"
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
            className="select-none rounded-lg bg-green-500/30 px-8 py-4 text-2xl backdrop-blur-sm transition-all active:scale-95 active:bg-green-500/50"
            aria-label="Fire"
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
            className="select-none rounded-lg bg-primary/30 px-8 py-4 text-3xl backdrop-blur-sm transition-all active:scale-95 active:bg-primary/50"
            aria-label="Move right"
          >
            →
          </button>
        </div>
      )}

      {/* Controls hint - only show when game is active and on desktop */}
      {isGameVisible && (
        <div className="pointer-events-none fixed bottom-4 left-4 z-[150] hidden rounded-lg bg-black/50 p-3 text-sm text-white backdrop-blur-sm md:block">
          <p>← → or A D: Move</p>
          <p>Space: Shoot</p>
          <p>ESC: Pause</p>
          <p>R: Restart</p>
        </div>
      )}
    </>
  );
}
