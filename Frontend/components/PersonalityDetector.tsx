import React, { useMemo, useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

type TraitScores = {
  extrovert: number;
  planner: number;
  resilient: number;
};

type AnswerOption = {
  label: string;
  scores: Partial<TraitScores>;
};

type Question = {
  prompt: string;
  options: AnswerOption[];
};

const QUESTIONS: Question[] = [
  {
    prompt: 'In a free hour, you prefer to…',
    options: [
      { label: 'Meet people or join a group activity', scores: { extrovert: 2 } },
      { label: 'Do a solo hobby or quiet activity', scores: { extrovert: 0 } },
      { label: 'Switch between both depending on mood', scores: { extrovert: 1 } }
    ]
  },
  {
    prompt: 'When starting a task, you usually…',
    options: [
      { label: 'Make a plan and follow steps', scores: { planner: 2 } },
      { label: 'Jump in and adapt as you go', scores: { planner: 0 } },
      { label: 'Sketch a light plan, then improvise', scores: { planner: 1 } }
    ]
  },
  {
    prompt: 'Unexpected changes make you feel…',
    options: [
      { label: 'Energized and curious', scores: { resilient: 2 } },
      { label: 'A bit uneasy until it settles', scores: { resilient: 1 } },
      { label: 'Stressed and distracted', scores: { resilient: 0 } }
    ]
  },
  {
    prompt: 'You recharge best by…',
    options: [
      { label: 'Social time and shared experiences', scores: { extrovert: 2 } },
      { label: 'Quiet time and personal space', scores: { extrovert: 0 } },
      { label: 'A balance of both', scores: { extrovert: 1 } }
    ]
  },
  {
    prompt: 'Your work style is closest to…',
    options: [
      { label: 'Structured, consistent, and focused', scores: { planner: 2 } },
      { label: 'Creative, flexible, and fast-moving', scores: { planner: 0 } },
      { label: 'Goal-focused with room for changes', scores: { planner: 1 } }
    ]
  }
];

const getPersonality = (scores: TraitScores) => {
  const extro = scores.extrovert >= 3;
  const plan = scores.planner >= 3;
  const resilient = scores.resilient >= 3;

  if (extro && plan) {
    return {
      title: 'Social Strategist',
      description: 'You thrive with people and like structure. You lead well and keep momentum through clear plans.'
    };
  }

  if (extro && !plan) {
    return {
      title: 'Creative Explorer',
      description: 'You gain energy from connection and discovery. You adapt quickly and enjoy variety.'
    };
  }

  if (!extro && plan) {
    return {
      title: 'Calm Planner',
      description: 'You prefer focus and clarity. Your strength is steady progress and thoughtful decisions.'
    };
  }

  return {
    title: 'Reflective Improviser',
    description: 'You enjoy quiet focus and flexible paths. You balance careful thinking with openness to change.'
  };
};

const PersonalityDetector: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<TraitScores>({ extrovert: 0, planner: 0, resilient: 0 });
  const [completed, setCompleted] = useState(false);

  const progress = Math.round((currentIndex / QUESTIONS.length) * 100);

  const handleAnswer = (option: AnswerOption) => {
    setScores(prev => ({
      extrovert: prev.extrovert + (option.scores.extrovert ?? 0),
      planner: prev.planner + (option.scores.planner ?? 0),
      resilient: prev.resilient + (option.scores.resilient ?? 0)
    }));

    if (currentIndex + 1 >= QUESTIONS.length) {
      setCompleted(true);
      return;
    }
    setCurrentIndex(prev => prev + 1);
  };

  const personality = useMemo(() => getPersonality(scores), [scores]);

  const reset = () => {
    setCurrentIndex(0);
    setScores({ extrovert: 0, planner: 0, resilient: 0 });
    setCompleted(false);
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Personality Detector</h3>
            <p className="text-xs text-slate-500">Answer a few questions to get your profile.</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{progress}%</span>
      </div>

      {!completed ? (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-800">{QUESTIONS[currentIndex].prompt}</p>
          <div className="space-y-2">
            {QUESTIONS[currentIndex].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-sm"
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Result</span>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">{personality.title}</p>
            <p className="text-sm text-slate-600 mt-1">{personality.description}</p>
          </div>
          <button
            onClick={reset}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
          >
            Retake Questions
          </button>
        </div>
      )}
    </div>
  );
};

export default PersonalityDetector;