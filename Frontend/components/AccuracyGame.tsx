
import React, { useState, useEffect, useCallback } from 'react';
import { Target, MousePointer2, Crosshair, Award, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { GameDifficulty } from '../types';

interface Props {
  onComplete: (accuracy: number) => void;
  difficulty: GameDifficulty;
}

const AccuracyGame: React.FC<Props> = ({ onComplete, difficulty }) => {
  const totalTargets = difficulty === 'easy' ? 8 : difficulty === 'hard' ? 14 : 10;
  const targetSizeClass = difficulty === 'hard' ? 'w-10 h-10' : difficulty === 'easy' ? 'w-14 h-14' : 'w-12 h-12';
  const [hitEffects, setHitEffects] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [streak, setStreak] = useState(0);
  const [targetColors] = useState(['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500']);
  const [currentColor, setCurrentColor] = useState(0);
  const [stage, setStage] = useState<'idle' | 'playing' | 'result'>('idle');
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [hits, setHits] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [targetsSpawned, setTargetsSpawned] = useState(0);

  const spawnTarget = useCallback(() => {
    const x = Math.floor(Math.random() * 80) + 10; // 10% to 90%
    const y = Math.floor(Math.random() * 80) + 10;
    setTargetPos({ x, y });
    setTargetsSpawned(prev => prev + 1);
  }, []);

  const startTest = () => {
    setStreak(0);
    setHitEffects([]);
    setCurrentColor(0);
    setStage('playing');
    setHits(0);
    setTotalClicks(0);
    setTargetsSpawned(0);
    spawnTarget();
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (stage !== 'playing') return;
    // Miss - reset streak
    if (streak > 0) {
      setStreak(0);
    }
    setTotalClicks(prev => prev + 1);
  };

  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stage !== 'playing') return;
    
    // Create hit effect
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (parentRect) {
      const hitEffect = {
        id: Date.now(),
        x: ((rect.left + rect.width / 2 - parentRect.left) / parentRect.width) * 100,
        y: ((rect.top + rect.height / 2 - parentRect.top) / parentRect.height) * 100
      };
      setHitEffects(prev => [...prev, hitEffect]);
      setTimeout(() => {
        setHitEffects(prev => prev.filter(h => h.id !== hitEffect.id));
      }, 800);
    }
    
    setHits(prev => prev + 1);
    setStreak(prev => prev + 1);
    setTotalClicks(prev => prev + 1);
    setCurrentColor((prev) => (prev + 1) % targetColors.length);

    if (targetsSpawned >= totalTargets) {
      setStage('result');
    } else {
      spawnTarget();
    }
  };

  const accuracy = totalClicks > 0 ? Math.round((hits / totalClicks) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Crosshair className="text-red-500" size={24} />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sniper Challenge</h2>
        </div>
        <p className="text-sm text-slate-500">Hit every target with precision!</p>
        {stage === 'playing' && streak > 3 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-xs font-black uppercase tracking-widest animate-pulse shadow-lg">
            <Zap size={14} /> {streak} Hit Streak! 🔥
          </div>
        )}
      </div>

      <div 
        onClick={handleContainerClick}
        className="relative w-full aspect-square bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 border-2 border-slate-200 rounded-3xl overflow-hidden cursor-crosshair shadow-inner"
      >
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
        
        {/* Hit effects */}
        {hitEffects.map(effect => (
          <div 
            key={effect.id}
            className="absolute pointer-events-none"
            style={{ left: `${effect.x}%`, top: `${effect.y}%` }}
          >
            <div className="absolute -translate-x-1/2 -translate-y-1/2">
              <Sparkles size={32} className="text-yellow-400 animate-ping" />
              <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50 animate-pulse" />
            </div>
          </div>
        ))}

        {stage === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
            <div className="text-center space-y-3">
              <Crosshair size={64} className="mx-auto text-slate-300" />
              <div className="space-y-1">
                <p className="text-lg font-bold text-slate-900">Test Your Precision</p>
                <p className="text-xs text-slate-500">Click only the targets - avoid misses!</p>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); startTest(); }}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:from-red-700 hover:to-orange-700 transition-all active:scale-95 flex items-center gap-3"
            >
              <Target size={24} /> Begin Challenge
            </button>
          </div>
        )}

        {stage === 'playing' && (
          <>
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <div className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-bold text-slate-600 uppercase tracking-widest shadow-sm">
                Target {targetsSpawned}/{totalTargets}
              </div>
              <div className="px-3 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white uppercase tracking-widest shadow-sm">
                ✓ {hits} Hits
              </div>
            </div>
            
            <div 
              onClick={handleTargetClick}
              className={`absolute ${targetSizeClass} flex items-center justify-center ${targetColors[currentColor]} rounded-full shadow-2xl transition-all duration-100 active:scale-75 -translate-x-1/2 -translate-y-1/2 animate-pulse cursor-pointer hover:scale-110`}
              style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                <Target size={difficulty === 'hard' ? 20 : 28} className="text-white drop-shadow-lg relative z-10" />
              </div>
            </div>
          </>
        )}

        {stage === 'result' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white/95 to-slate-50/95 backdrop-blur-sm animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-4">
              <Award size={64} className={`mx-auto ${accuracy >= 90 ? 'text-yellow-500' : accuracy >= 70 ? 'text-blue-500' : 'text-slate-400'}`} />
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Precision Score</p>
                <p className="text-7xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent tracking-tighter">{accuracy}%</p>
                <p className="text-sm font-bold text-slate-600">
                  {accuracy >= 95 ? '🎯 Perfect Sniper!' : 
                   accuracy >= 85 ? '🔥 Sharpshooter!' : 
                   accuracy >= 70 ? '👍 Nice Aim!' : 
                   '💪 Keep Practicing!'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 w-full">
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-100 text-center">
          <TrendingUp size={20} className="mx-auto text-emerald-500 mb-1" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hits</p>
          <p className="text-2xl font-black text-slate-900">{hits}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border-2 border-red-100 text-center">
          <MousePointer2 size={20} className="mx-auto text-red-500 mb-1" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Misses</p>
          <p className="text-2xl font-black text-slate-900">{totalClicks - hits}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100 text-center">
          <Zap size={20} className="mx-auto text-purple-500 mb-1" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</p>
          <p className="text-2xl font-black text-slate-900">{accuracy}%</p>
        </div>
      </div>

      {stage === 'result' && (
        <button 
          onClick={() => onComplete(accuracy)}
          className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-5 rounded-2xl font-black text-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center gap-2"
        >
          <Sparkles size={20} /> Complete Assessment →
        </button>
      )}
    </div>
  );
};

export default AccuracyGame;
