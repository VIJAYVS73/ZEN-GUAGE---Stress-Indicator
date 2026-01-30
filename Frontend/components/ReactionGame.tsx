
import React, { useState, useEffect, useRef } from 'react';
import { MousePointer2, Zap, Timer, Sparkles, Star, Trophy, Flame } from 'lucide-react';
import { GameDifficulty } from '../types';

interface Props {
  onComplete: (time: number) => void;
  difficulty: GameDifficulty;
}

const ReactionGame: React.FC<Props> = ({ onComplete, difficulty }) => {
  const [stage, setStage] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [resultTime, setResultTime] = useState<number>(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTest = () => {
    setStage('waiting');
    const delayRange = {
      easy: { min: 1800, max: 3500 },
      medium: { min: 1300, max: 3000 },
      hard: { min: 800, max: 2500 }
    }[difficulty];
    const delay = delayRange.min + Math.random() * (delayRange.max - delayRange.min);
    timerRef.current = setTimeout(() => {
      setStage('ready');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (stage === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      alert("Click too early. Resetting...");
      setStage('idle');
    } else if (stage === 'ready') {
      const diff = Date.now() - startTime;
      setResultTime(diff);
      setStage('result');
      // Add particle effect
      const newParticles = Array.from({ length: 12 }).map((_, i) => ({
        id: Date.now() + i,
        x: 50 + (Math.random() - 0.5) * 40,
        y: 50 + (Math.random() - 0.5) * 40
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Zap className="text-amber-500" size={24} />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Lightning Reflexes</h2>
        </div>
        <p className="text-sm text-slate-500">Wait for the ⚡ flash and click instantly!</p>
        {stage !== 'idle' && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <Timer size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {stage === 'waiting' ? 'Stay focused...' : stage === 'ready' ? 'CLICK NOW!' : 'Complete'}
            </span>
          </div>
        )}
      </div>

      <div className="relative w-full">
        <div 
          onClick={handleClick}
          className={`w-full aspect-square rounded-3xl flex items-center justify-center cursor-pointer transition-all duration-200 relative overflow-hidden ${
            stage === 'idle' ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-200 hover:border-slate-300' :
            stage === 'waiting' ? 'bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse' :
            stage === 'ready' ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 shadow-2xl shadow-orange-500/50 animate-bounce' :
            'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 shadow-2xl shadow-emerald-500/30'
          } ${stage === 'ready' ? 'scale-105' : ''} active:scale-95`}
        >
          {/* Animated background pattern */}
          {stage === 'waiting' && (
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400 to-transparent animate-pulse" />
            </div>
          )}
          
          {/* Particle effects */}
          {particles.map(p => (
            <Star 
              key={p.id}
              size={16}
              className="absolute text-yellow-300 animate-ping"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            />
          ))}

        <div className="text-center">
          {stage === 'idle' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Flame size={64} className="text-slate-300" />
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); startTest(); }}
                className="bg-white border-2 border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-50 hover:border-slate-300 hover:shadow-xl transition-all flex items-center gap-3"
              >
                <Zap size={20} /> Begin Test
              </button>
            </div>
          )}
          {stage === 'waiting' && (
             <div className="flex flex-col items-center gap-3">
               <div className="relative">
                 <div className="w-16 h-16 rounded-full border-4 border-slate-300 border-t-slate-600 animate-spin" />
                 <Timer className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400" size={24} />
               </div>
               <span className="text-sm font-bold text-slate-600 uppercase tracking-widest animate-pulse">Stay Ready...</span>
             </div>
          )}
          {stage === 'ready' && (
            <div className="flex flex-col items-center gap-3 animate-in zoom-in duration-150">
              <Zap size={80} className="text-white fill-white drop-shadow-2xl animate-pulse" />
              <span className="text-2xl font-black text-white uppercase tracking-wider drop-shadow-lg animate-bounce">NOW!</span>
            </div>
          )}
          {stage === 'result' && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="flex justify-center">
                <Trophy size={64} className="text-yellow-300 drop-shadow-xl" />
              </div>
              <div className="text-white">
                <p className="text-sm font-bold uppercase tracking-widest opacity-80 flex items-center justify-center gap-2">
                  <Sparkles size={16} /> Your Time
                </p>
                <p className="text-6xl font-black tabular-nums tracking-tighter drop-shadow-lg mt-2">
                  {resultTime}<span className="text-3xl">ms</span>
                </p>
                <p className="text-xs mt-2 opacity-70">
                  {resultTime < 200 ? '🔥 Lightning Fast!' : 
                   resultTime < 250 ? '⚡ Excellent!' : 
                   resultTime < 300 ? '👍 Good!' : 
                   '💪 Keep Practicing!'}
                </p>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {stage === 'result' && (
        <button 
          onClick={() => onComplete(resultTime)}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <Sparkles size={18} /> Continue to Next Game
        </button>
      )}

      {/* Progress indicator */}
      <div className="w-full space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span>Progress</span>
          <span>{stage === 'result' ? '100%' : stage === 'ready' ? '75%' : stage === 'waiting' ? '50%' : '0%'}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              stage === 'result' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 
              stage === 'ready' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 
              stage === 'waiting' ? 'bg-gradient-to-r from-slate-400 to-slate-500' : 
              'bg-slate-300'
            }`}
            style={{ width: stage === 'result' ? '100%' : stage === 'ready' ? '75%' : stage === 'waiting' ? '50%' : '0%' }} 
          />
        </div>
      </div>
    </div>
  );
};

export default ReactionGame;
