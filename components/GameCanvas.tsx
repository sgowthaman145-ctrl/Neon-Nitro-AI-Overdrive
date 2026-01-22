
import React, { useRef, useEffect, useState } from 'react';
import { GameStatus, Obstacle, PlayerCar } from '../types';

interface GameCanvasProps {
  status: GameStatus;
  onGameOver: (score: number) => void;
  onUpdateScore: (score: number, speed: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ status, onGameOver, onUpdateScore }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  
  // Game state refs (to avoid stale closures in game loop)
  const gameActiveRef = useRef(false);
  const scoreRef = useRef(0);
  const speedRef = useRef(100);
  const playerRef = useRef<PlayerCar>({
    x: 0,
    y: 0,
    width: 60,
    height: 100,
    speed: 0,
    targetX: 0
  });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const frameCountRef = useRef(0);

  // Initialize Game Logic
  const initGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    playerRef.current = {
      x: canvas.width / 2 - 30,
      y: canvas.height - 150,
      width: 50,
      height: 90,
      speed: 10,
      targetX: canvas.width / 2 - 25
    };
    obstaclesRef.current = [];
    scoreRef.current = 0;
    speedRef.current = 200;
    frameCountRef.current = 0;
  };

  useEffect(() => {
    gameActiveRef.current = status === GameStatus.PLAYING;
    if (status === GameStatus.PLAYING) {
      initGame();
    }
  }, [status]);

  const spawnObstacle = (canvasWidth: number) => {
    const laneWidth = canvasWidth / 3;
    const lane = Math.floor(Math.random() * 3);
    const types: Obstacle['type'][] = ['car', 'truck', 'pothole'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = ['#f472b6', '#34d399', '#facc15', '#60a5fa'];
    
    const newObstacle: Obstacle = {
      x: lane * laneWidth + (laneWidth / 2) - (type === 'truck' ? 35 : 25),
      y: -200,
      width: type === 'truck' ? 70 : 50,
      height: type === 'truck' ? 140 : 90,
      speed: speedRef.current / 40 + Math.random() * 2,
      type,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    obstaclesRef.current.push(newObstacle);
  };

  const update = (deltaTime: number) => {
    if (!gameActiveRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Smooth movement
    const dx = playerRef.current.targetX - playerRef.current.x;
    playerRef.current.x += dx * 0.15;

    // Difficulty scaling
    frameCountRef.current++;
    speedRef.current += 0.05;
    scoreRef.current += Math.floor(speedRef.current / 100);

    if (frameCountRef.current % Math.max(30, Math.floor(100 - speedRef.current / 20)) === 0) {
      spawnObstacle(canvas.width);
    }

    // Update Obstacles
    obstaclesRef.current.forEach((obs, index) => {
      obs.y += obs.speed + (speedRef.current / 50);

      // Collision Detection
      const p = playerRef.current;
      if (
        p.x < obs.x + obs.width &&
        p.x + p.width > obs.x &&
        p.y < obs.y + obs.height &&
        p.y + p.height > obs.y
      ) {
        gameActiveRef.current = false;
        onGameOver(scoreRef.current);
      }

      // Cleanup
      if (obs.y > canvas.height) {
        obstaclesRef.current.splice(index, 1);
      }
    });

    onUpdateScore(scoreRef.current, speedRef.current);
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Road
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Lane Markers
    const offset = (frameCountRef.current * (speedRef.current / 20)) % 100;
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
    ctx.setLineDash([40, 60]);
    ctx.lineWidth = 4;
    
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * (canvas.width / 3), -100 + offset);
      ctx.lineTo(i * (canvas.width / 3), canvas.height + 100);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Road Glow
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'rgba(236, 72, 153, 0.1)');
    gradient.addColorStop(0.5, 'transparent');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Obstacles
    obstaclesRef.current.forEach(obs => {
      ctx.shadowBlur = 15;
      ctx.shadowColor = obs.color;
      ctx.fillStyle = obs.color;
      
      // Car Body
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      
      // Headlights / Brake lights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(obs.x + 5, obs.y + obs.height - 5, 10, 5);
      ctx.fillRect(obs.x + obs.width - 15, obs.y + obs.height - 5, 10, 5);
      
      ctx.shadowBlur = 0;
    });

    // Draw Player Car
    const p = playerRef.current;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#22d3ee';
    
    // Sleek Cyber Car Body
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.moveTo(p.x + p.width / 2, p.y);
    ctx.lineTo(p.x + p.width, p.y + p.height * 0.8);
    ctx.lineTo(p.x + p.width, p.y + p.height);
    ctx.lineTo(p.x, p.y + p.height);
    ctx.lineTo(p.x, p.y + p.height * 0.8);
    ctx.closePath();
    ctx.fill();

    // Windshield
    ctx.fillStyle = '#000';
    ctx.fillRect(p.x + 5, p.y + 20, p.width - 10, 20);

    // Glowing Underglow
    ctx.shadowBlur = 30;
    ctx.fillStyle = 'rgba(34, 211, 238, 0.4)';
    ctx.fillRect(p.x - 5, p.y + p.height - 10, p.width + 10, 5);

    ctx.shadowBlur = 0;
  };

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      update(deltaTime);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) draw(ctx);
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActiveRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const laneWidth = canvas.width / 3;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        playerRef.current.targetX = Math.max(0, playerRef.current.targetX - laneWidth);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        playerRef.current.targetX = Math.min(canvas.width - playerRef.current.width, playerRef.current.targetX + laneWidth);
      }
    };

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 600;
      playerRef.current.y = canvas.height - 150;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    handleResize();

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="max-w-full max-h-full cursor-none shadow-[0_0_100px_rgba(34,211,238,0.1)]"
    />
  );
};

export default GameCanvas;
