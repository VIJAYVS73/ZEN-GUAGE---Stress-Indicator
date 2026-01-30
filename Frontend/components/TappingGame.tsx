
import React, { useState, useEffect, useRef } from 'react';
import { Target, Zap, TrendingUp, Award, Hand } from 'lucide-react';
import { GameDifficulty } from '../types';

interface Props {
  onComplete: (tapsPerSec: number) => void;
  difficulty: GameDifficulty;
}

const TappingGame: React.FC<Props> = ({ onComplete, difficulty }) => {
  const duration = difficulty === 'easy' ? 6 : difficulty === 'hard' ? 4 : 5;
  const [ripples, setRipples] = useState<Array<{ id: number }>>([]);
  const [combo, setCombo] = useState(0);
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [stage, setStage] = useState<'idle' | 'playing' | 'result'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTapping = () => {
    setCount(0);
    setTimeLeft(duration);
    setCombo(0);
    setRipples([]);
    setStage('playing');
  };

  useEffect(() => {
    if (stage === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timerRef.current!);
    } else if (timeLeft === 0 && stage === 'playing') {
      setStage('result');
    }
  }, [stage, timeLeft]);
  const handleTap = () => {
    setCount(c => c + 1);
    setCombo(c => c + 1);
    
    // Create ripple effect
    const newRipple = { id: Date.now() };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  const getComboColor = () => {
    if (combo > 30) return 'from-purple-500 to-pink-500';
    if (combo > 20) return 'from-red-500 to-orange-500';
    if (combo > 10) return 'from-yellow-500 to-amber-500';
    return 'from-blue-500 to-indigo-500';
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Hand className="text-indigo-600" size={24} />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Turbo Tapper</h2>
        </div>
        <p className="text-sm text-slate-500">Tap as fast as you can! Build your combo!</p>
        {stage === 'playing' && combo > 5 && (
          <div className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${getComboColor()} text-white rounded-full text-xs font-black uppercase tracking-widest animate-pulse shadow-lg`}>
            <Zap size={14} /> {combo}x COMBO!
          </div>
        )}
      </div>

      <div className="relative w-32 h-32 flex items-center justify-center">
        {stage !== 'idle' && (
          <>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="64" cy="64" r="58" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle cx="64" cy="64" r="58" fill="none" 
                className={`transition-all duration-1000 linear`}
                stroke={`url(#gradient-${stage})`}
                strokeWidth="10" 
                strokeDasharray={364} 
                strokeDashoffset={364 - (364 * (duration - timeLeft)) / duration}
                strokeLinecap="round" 
              />
              <defs>
                <linearGradient id="gradient-playing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="gradient-result" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center">
              <span className="text-3xl font-black text-slate-900">{timeLeft}</span>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-widest">sec</span>
            </div>
          </>
        )}
      </div>

      <div className="w-full">
        {stage === 'idle' && (
          <div className="space-y-4">
            <div className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-100">
              <div className="text-center space-y-2">
                <Target size={48} className="mx-auto text-indigo-400" />
                <p className="text-sm text-slate-600">Test your finger speed and endurance!</p>
              </div>
            </div>
            <button 
              onClick={startTapping}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 rounded-3xl font-black text-xl shadow-xl hover:shadow-2xl hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Zap size={28} /> Start Tapping Challenge
            </button>
          </div>
        )}
        {stage === 'playing' && (
          <div className="relative">
            <button 
              onPointerDown={handleTap}
              className={`w-full h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl text-white flex flex-col items-center justify-center transition-all active:scale-95 select-none shadow-2xl relative overflow-hidden ${combo > 10 ? 'animate-pulse' : ''}`}
            >
              {/* Ripple effects */}
              {ripples.map(ripple => (
                <div 
                  key={ripple.id}
                  className="absolute inset-0 bg-white/30 rounded-3xl animate-ping"
                  style={{ animationDuration: '600ms' }}
                />
              ))}
              
              <span className="text-7xl font-black tabular-nums drop-shadow-xl relative z-10">{count}</span>
              <span className="text-sm font-bold uppercase tracking-widest opacity-90 mt-2 relative z-10">TAP HERE!</span>
              
              {/* Sparkle effects for high combos */}
              {combo > 15 && (
                <div className="absolute top-4 right-4">
                  <Zap size={24} className="text-yellow-300 animate-bounce" />
                </div>
              )}
            </button>
          </div>
        )}
        {stage === 'result' && (
          <div className="space-y-6 w-full animate-in fade-in zoom-in duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-100 text-center">
                <TrendingUp size={24} className="mx-auto text-indigo-500 mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Speed</p>
                <p className="text-3xl font-black text-slate-900">{(count / duration).toFixed(1)}</p>
                <p className="text-xs text-slate-500 mt-1">taps/sec</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-100 text-center">
                <Award size={24} className="mx-auto text-emerald-500 mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                <p className="text-3xl font-black text-slate-900">{count}</p>
                <p className="text-xs text-slate-500 mt-1">taps</p>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl text-center">
              <p className="text-sm font-bold text-yellow-900">
                {count / duration > 8 ? '🔥 Blazing Speed!' : 
                 count / duration > 6 ? '⚡ Excellent!' : 
                 count / duration > 4 ? '👍 Good Job!' : 
                 '💪 Keep Training!'}
              </p>
            </div>
            
            <button 
              onClick={() => onComplete(count / duration)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-2xl font-black text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Continue Assessment →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TappingGame;
