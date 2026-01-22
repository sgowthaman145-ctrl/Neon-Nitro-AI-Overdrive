
import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import { GameStatus, GameState } from './types';
import { getAICommentary } from './geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.START,
    score: 0,
    highScore: parseInt(localStorage.getItem('neon_nitro_high_score') || '0'),
    speed: 100,
    commentary: "Welcome to the Grid, Driver. Ready to burn some neon?",
    lastCommentaryScore: 0
  });

  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchCommentary = async (event: 'start' | 'crash' | 'high_speed' | 'milestone') => {
    setIsAiLoading(true);
    const text = await getAICommentary(event, gameState.score, Math.floor(gameState.speed));
    setGameState(prev => ({ ...prev, commentary: text }));
    setIsAiLoading(false);
  };

  const handleStart = () => {
    setGameState(prev => ({
      ...prev,
      status: GameStatus.PLAYING,
      score: 0,
      speed: 100,
      lastCommentaryScore: 0
    }));
    fetchCommentary('start');
  };

  const handleGameOver = (finalScore: number) => {
    const newHighScore = Math.max(gameState.highScore, finalScore);
    localStorage.setItem('neon_nitro_high_score', newHighScore.toString());
    
    setGameState(prev => ({
      ...prev,
      status: GameStatus.GAME_OVER,
      score: finalScore,
      highScore: newHighScore
    }));
    fetchCommentary('crash');
  };

  const updateScore = useCallback((newScore: number, currentSpeed: number) => {
    setGameState(prev => {
      // Check for milestones every 500 points
      const shouldUpdateCommentary = newScore - prev.lastCommentaryScore >= 500;
      if (shouldUpdateCommentary) {
        fetchCommentary('milestone');
        return { 
          ...prev, 
          score: newScore, 
          speed: currentSpeed, 
          lastCommentaryScore: newScore 
        };
      }
      return { ...prev, score: newScore, speed: currentSpeed };
    });
  }, [gameState.lastCommentaryScore]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar for PC / Bottom Bar for Mobile */}
      <div className="md:w-80 w-full bg-neutral-900 border-r border-cyan-500/30 p-6 flex flex-col justify-between z-20 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 italic tracking-tighter mb-2">
            NEON NITRO
          </h1>
          <p className="text-xs text-cyan-400/60 uppercase tracking-widest font-bold mb-8">AI Overdrive Edition</p>
          
          <div className="space-y-6">
            <div className="p-4 bg-black/50 border border-cyan-500/20 rounded-lg">
              <span className="text-[10px] text-cyan-400 uppercase font-bold block mb-1">Live Commentary</span>
              <p className="text-sm text-neutral-200 italic leading-relaxed min-h-[40px]">
                {isAiLoading ? (
                  <span className="animate-pulse flex items-center gap-2">
                    <i className="fa-solid fa-microchip text-fuchsia-500"></i> Thinking...
                  </span>
                ) : (
                  `"${gameState.commentary}"`
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-black/30 rounded border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase block">High Score</span>
                <span className="text-xl font-mono text-fuchsia-400">{gameState.highScore}</span>
              </div>
              <div className="text-center p-3 bg-black/30 rounded border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase block">Status</span>
                <span className={`text-xs font-bold uppercase ${gameState.status === GameStatus.PLAYING ? 'text-green-400' : 'text-red-400'}`}>
                  {gameState.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block text-[10px] text-neutral-600 space-y-2 mt-4">
          <p><i className="fa-solid fa-keyboard mr-2"></i> Use LEFT / RIGHT ARROWS or A / D</p>
          <p><i className="fa-solid fa-bolt mr-2"></i> Avoid obstacles, gain speed</p>
          <p className="text-cyan-500/50">© 2024 CYBER SYSTEMS CORP</p>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 relative bg-[#050505] overflow-hidden flex items-center justify-center">
        <GameCanvas 
          status={gameState.status} 
          onGameOver={handleGameOver} 
          onUpdateScore={updateScore} 
        />
        
        <HUD score={gameState.score} speed={gameState.speed} />

        {/* Start Overlay */}
        {gameState.status === GameStatus.START && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 p-4">
            <div className="text-center max-w-md animate-in fade-in zoom-in duration-300">
              <i className="fa-solid fa-car-side text-6xl text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]"></i>
              <h2 className="text-5xl font-black text-white mb-4 italic">READY TO DRIVE?</h2>
              <p className="text-neutral-400 mb-8">Dodge high-speed drones and neon debris in the ultimate survival race. Powered by Gemini AI Intelligence.</p>
              <button 
                onClick={handleStart}
                className="group relative px-12 py-4 bg-cyan-500 text-black font-black text-xl italic skew-x-[-12deg] transition-all hover:bg-fuchsia-500 hover:scale-110 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10">INITIALIZE ENGINE</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState.status === GameStatus.GAME_OVER && (
          <div className="absolute inset-0 bg-fuchsia-900/40 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-4">
            <div className="bg-black border-2 border-fuchsia-500 p-12 text-center max-w-lg shadow-[0_0_50px_rgba(217,70,239,0.5)] transform -rotate-2">
              <h2 className="text-7xl font-black text-fuchsia-500 mb-2 italic tracking-tighter">CRASHED!</h2>
              <div className="h-1 w-full bg-fuchsia-500 mb-6"></div>
              <p className="text-2xl text-white mb-8 font-mono">FINAL SCORE: {gameState.score}</p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={handleStart}
                  className="px-8 py-3 bg-cyan-500 text-black font-bold hover:bg-white transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-rotate-right"></i> TRY AGAIN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
