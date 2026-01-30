
import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Star, Zap, Heart, Moon, Sun, Cloud, Flame, Droplet } from 'lucide-react';
import { GameDifficulty } from '../types';

interface Props {
  onComplete: (score: number) => void;
  difficulty: GameDifficulty;
}

const GRID_SIZE = 3;

// Color themes for variety
const COLOR_THEMES = [
  { bg: 'bg-indigo-600', light: 'bg-indigo-100', border: 'border-indigo-200' },
  { bg: 'bg-purple-600', light: 'bg-purple-100', border: 'border-purple-200' },
  { bg: 'bg-pink-600', light: 'bg-pink-100', border: 'border-pink-200' },
  { bg: 'bg-emerald-600', light: 'bg-emerald-100', border: 'border-emerald-200' },
  { bg: 'bg-amber-600', light: 'bg-amber-100', border: 'border-amber-200' },
];

// Icons for visual variety
const ICONS = [Star, Zap, Heart, Moon, Sun, Cloud, Flame, Droplet, Brain];

const MemoryGame: React.FC<Props> = ({ onComplete, difficulty }) => {
  const [pattern, setPattern] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [stage, setStage] = useState<'idle' | 'showing' | 'playing' | 'result'>('idle');
  const [level, setLevel] = useState(1);
  const [currentHighlight, setCurrentHighlight] = useState<number>(-1);
  const [colorTheme, setColorTheme] = useState(0);
  const [showIcons, setShowIcons] = useState(false);

  const difficultyConfig = {
    easy: { baseLen: 3, maxLevel: 2, showBase: 1700, showStep: 300, showDuration: 500 },
    medium: { baseLen: 4, maxLevel: 3, showBase: 1300, showStep: 250, showDuration: 400 },
    hard: { baseLen: 5, maxLevel: 4, showBase: 1000, showStep: 200, showDuration: 350 }
  }[difficulty];

  const startRound = () => {
    const len = difficultyConfig.baseLen + Math.floor(level / 2);
    const newPattern = [];
    for (let i = 0; i < len; i++) {
      newPattern.push(Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE)));
    }
    setPattern(newPattern);
    setUserSequence([]);
    setColorTheme(Math.floor(Math.random() * COLOR_THEMES.length));
    setShowIcons(Math.random() > 0.5);
    setStage('showing');
  };

  // Animate pattern one by one
  useEffect(() => {
    if (stage === 'showing') {
      let index = 0;
      const interval = setInterval(() => {
        if (index < pattern.length) {
          setCurrentHighlight(pattern[index]);
          setTimeout(() => setCurrentHighlight(-1), difficultyConfig.showDuration);
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => setStage('playing'), 400);
        }
      }, difficultyConfig.showDuration + 200);
      
      return () => clearInterval(interval);
    }
  }, [stage, pattern, difficultyConfig.showDuration]);

  const handleGridClick = (index: number) => {
    if (stage !== 'playing') return;
    
    const nextUserSeq = [...userSequence, index];
    setUserSequence(nextUserSeq);
    
    // Flash the clicked cell
    setCurrentHighlight(index);
    setTimeout(() => setCurrentHighlight(-1), 200);
    
    const isCorrectSoFar = nextUserSeq.every((val, i) => val === pattern[i]);
    if (!isCorrectSoFar) {
      setStage('result');
    } else if (nextUserSeq.length === pattern.length) {
      if (level < difficultyConfig.maxLevel) {
        setLevel(level + 1);
        setTimeout(startRound, 800);
      } else {
        setStage('result');
      }
    }
  };

  const calculateScore = () => {
    const correctCount = userSequence.filter((v, i) => v === pattern[i]).length;
    return Math.round((correctCount / pattern.length) * 100);
  };

  const theme = COLOR_THEMES[colorTheme];

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Brain className="text-indigo-600" size={24} />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Memory Challenge</h2>
        </div>
        <p className="text-sm text-slate-500">Watch carefully and repeat the sequence.</p>
        {stage !== 'idle' && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Level {level}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{pattern.length} tiles</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 relative">
        {Array.from({ length: 9 }).map((_, i) => {
          const isHighlighted = currentHighlight === i;
          const isInPattern = userSequence.includes(i);
          const Icon = ICONS[i];
          
          return (
            <div
              key={i}
              onClick={() => handleGridClick(i)}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center ${
                isHighlighted ? `${theme.bg} scale-110 shadow-2xl shadow-${theme.bg}/50 rotate-3` :
                isInPattern ? `${theme.light} border-2 ${theme.border}` :
                'bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:scale-105'
              }`}
            >
              {showIcons && !isHighlighted && !isInPattern && (
                <Icon size={20} className="text-slate-300" />
              )}
              {isHighlighted && <Sparkles size={24} className="text-white animate-pulse" />}
            </div>
          );
        })}
      </div>

      <div className="h-14 flex flex-col items-center gap-2">
        {stage === 'idle' && (
          <button 
            onClick={startRound}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Brain size={18} /> Start Memory Test
          </button>
        )}
        {stage === 'showing' && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest animate-pulse">Watch & Memorize</p>
            <div className="flex gap-1">
              {pattern.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full ${idx < userSequence.length ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>
        )}
        {stage === 'playing' && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Click the sequence</p>
            <div className="flex gap-1">
              {pattern.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx < userSequence.length ? `${theme.bg}` : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>
        )}
        {stage === 'result' && (
          <div className="flex flex-col items-center gap-3">
            <span className="text-lg font-bold text-slate-900">Accuracy: {calculateScore()}%</span>
            <button 
              onClick={() => onComplete(calculateScore())}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryGame;
