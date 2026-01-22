
import React from 'react';

interface HUDProps {
  score: number;
  speed: number;
}

const HUD: React.FC<HUDProps> = ({ score, speed }) => {
  return (
    <div className="absolute top-6 right-6 pointer-events-none z-10 flex flex-col items-end gap-2">
      <div className="bg-black/80 border-r-4 border-cyan-500 px-6 py-2 shadow-lg">
        <span className="text-[10px] text-cyan-400 font-bold uppercase block tracking-[0.2em]">Distance (m)</span>
        <span className="text-4xl font-mono text-white tabular-nums leading-none">{score}</span>
      </div>
      
      <div className="bg-black/80 border-r-4 border-fuchsia-500 px-6 py-2 shadow-lg flex items-baseline gap-2">
        <div className="text-right">
          <span className="text-[10px] text-fuchsia-400 font-bold uppercase block tracking-[0.2em]">Velocity</span>
          <span className="text-2xl font-mono text-white tabular-nums leading-none">{Math.floor(speed)}</span>
        </div>
        <span className="text-xs text-fuchsia-400 font-bold">km/h</span>
      </div>

      <div className="w-48 h-1 bg-neutral-800 mt-2 overflow-hidden rounded-full border border-neutral-700">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all duration-300"
          style={{ width: `${Math.min(100, speed / 10)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default HUD;
