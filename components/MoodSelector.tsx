
import React, { useState, useEffect } from 'react';
import { PrimaryMood, Intensity, EnergyLevel, MentalState, RecommendationType, Language } from '../types';
import { MOOD_ICONS, REC_TYPE_ICONS, MOOD_COLORS } from '../constants';
import { translations } from '../translations';

interface Props {
  onComplete: (data: any) => void;
  language: Language;
}

const MoodSelector: React.FC<Props> = ({ onComplete, language }) => {
  const [step, setStep] = useState(1);
  const t = translations[language];
  const [selection, setSelection] = useState({
    primaryMood: null as PrimaryMood | null,
    intensity: null as Intensity | null,
    energy: null as EnergyLevel | null,
    mentalState: null as MentalState | null,
    recType: RecommendationType.PACK,
    avoidance: [] as string[]
  });

  const activeMoodColor = selection.primaryMood ? MOOD_COLORS[selection.primaryMood] : '#E50914';

  useEffect(() => {
    if (selection.primaryMood) {
      const color = MOOD_COLORS[selection.primaryMood];
      document.body.style.setProperty('--mood-accent', color);
      document.body.style.setProperty('background-image', `radial-gradient(circle at 50% -20%, ${color}15 0%, #020202 100%)`);
    }
  }, [selection.primaryMood]);

  const handleSelect = (key: string, value: any) => {
    setSelection(prev => ({ ...prev, [key]: value }));
    if (step < 5) setStep(s => s + 1);
  };

  const handleSkip = () => onComplete({ ...selection, primaryMood: null });

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fade-in w-full max-w-7xl mx-auto px-4">
            <div className="text-center mb-6 md:mb-10">
              <span className="text-red-700 font-black tracking-widest uppercase text-[10px] mb-2 block animate-pulse">Emotional Scan</span>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-black mb-3 md:mb-4 gradient-text tracking-tighter">{t.moodPrompt}</h2>
              <p className="max-w-xl mx-auto text-slate-500 text-[10px] sm:text-xs italic opacity-60 px-4">
                {t.layerInsights.primary}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-10 md:mb-12">
              {(Object.values(PrimaryMood) as PrimaryMood[]).map((mood) => (
                <button
                  key={mood}
                  onClick={() => handleSelect('primaryMood', mood)}
                  className="glass-card p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-2 md:gap-3 group relative overflow-hidden"
                  style={{ '--mood-hover': MOOD_COLORS[mood] } as React.CSSProperties}
                >
                  <div className="text-slate-600 group-hover:text-[var(--mood-hover)] transition-colors duration-300 scale-90 sm:scale-100">
                    {MOOD_ICONS[mood]}
                  </div>
                  <span className="font-black text-[8px] sm:text-[9px] uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-all text-center">
                    {t.moods[mood]}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              <button onClick={handleSkip} className="text-slate-500 hover:text-white font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all pb-1 border-b border-transparent hover:border-white">
                {t.skipButton}
              </button>
            </div>
          </div>
        );
      case 2:
      case 3:
      case 4:
        const layerInfo = [
          { key: 'intensity', prompt: 'intensityPrompt', options: Object.values(Intensity), trans: 'intensityLevels', label: 'Layer 02' },
          { key: 'energy', prompt: 'energyPrompt', options: Object.values(EnergyLevel), trans: 'energyLevels', label: 'Layer 03' },
          { key: 'mentalState', prompt: 'mentalPrompt', options: Object.values(MentalState), trans: 'mentalStates', label: 'Layer 04' }
        ][step - 2];

        return (
          <div className="animate-fade-in w-full px-4 max-w-xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <span className="font-black tracking-widest uppercase text-[10px] mb-2 block" style={{ color: activeMoodColor }}>{layerInfo.label}</span>
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 gradient-text tracking-tighter">{(t as any)[layerInfo.prompt]}</h2>
            </div>
            <div className="flex flex-col gap-3 md:gap-4">
              {layerInfo.options.map((v) => (
                <button
                  key={v}
                  onClick={() => handleSelect(layerInfo.key, v)}
                  className="glass-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-lg sm:text-2xl font-black hover:bg-white/5 transition-all active:scale-95 border border-white/5 hover:border-white/20"
                >
                  {(t as any)[layerInfo.trans][v]}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="animate-fade-in text-center w-full px-4 max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
               <span className="font-black tracking-widest uppercase text-[10px] mb-2 block" style={{ color: activeMoodColor }}>Final Layer</span>
               <h2 className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 gradient-text tracking-tighter">{t.recTypePrompt}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-10 md:mb-12">
              {(Object.values(RecommendationType) as RecommendationType[]).map((t_type) => (
                <button
                  key={t_type}
                  onClick={() => setSelection(prev => ({ ...prev, recType: t_type }))}
                  className={`p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border transition-all flex flex-col items-center gap-3 md:gap-4 glass-card hover:bg-white/5 ${selection.recType === t_type ? 'border-red-600/50 bg-red-600/10 shadow-lg shadow-red-600/5' : 'border-white/5'}`}
                >
                  <div className={`${selection.recType === t_type ? 'text-red-600' : 'text-slate-700'} transition-all duration-500 scale-90 sm:scale-100`}>
                    {REC_TYPE_ICONS[t_type]}
                  </div>
                  <span className="font-black text-[10px] sm:text-xs uppercase tracking-widest">
                    {t.recTypes[t_type]}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => onComplete(selection)}
              style={{ backgroundColor: activeMoodColor }}
              className="w-full bg-red-600 text-white py-5 sm:py-6 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-red-600/20"
            >
              {t.discover}
            </button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="py-6 sm:py-12 min-h-[60vh] md:min-h-[70vh] flex flex-col justify-center">
      {step > 1 && (
        <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2 z-[60]">
          {[1, 2, 3, 4, 5].map(i => (
            <div 
              key={i} 
              className={`h-1 w-6 sm:w-8 rounded-full transition-all duration-500 ${i <= step ? 'bg-red-600 shadow-[0_0_8px_rgba(229,9,20,0.5)]' : 'bg-white/5'}`} 
            />
          ))}
        </div>
      )}
      {renderStep()}
    </div>
  );
};

export default MoodSelector;
