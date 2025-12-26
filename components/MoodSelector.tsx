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

  // Apply visual atmosphere based on layers
  useEffect(() => {
    if (selection.primaryMood) {
      const color = MOOD_COLORS[selection.primaryMood];
      document.body.style.setProperty('--bg-gradient', `radial-gradient(circle at 50% -20%, ${color}20 0%, #020202 100%)`);
    }
  }, [selection.primaryMood]);

  const nextStep = () => setStep(s => s + 1);

  const handleSelect = (key: string, value: any) => {
    setSelection(prev => ({ ...prev, [key]: value }));
    if (step < 5) nextStep();
  };

  const handleSkip = () => {
    onComplete({
      ...selection,
      primaryMood: null, 
    });
  };

  const getCurrentInsight = () => {
    switch (step) {
      case 1: return t.layerInsights.primary;
      case 2: return t.layerInsights.intensity;
      case 3: return t.layerInsights.energy;
      case 4: return t.layerInsights.depth;
      case 5: return t.layerInsights.delivery;
      default: return "";
    }
  };

  const LayerIndicator = () => (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-8 z-50">
      {[1, 2, 3, 4, 5].map(i => (
        <div 
          key={i} 
          className={`w-1 h-12 rounded-full transition-all duration-700 ${i <= step ? 'scale-y-100 opacity-100' : 'scale-y-50 opacity-10'}`}
          style={{ backgroundColor: activeMoodColor, boxShadow: i <= step ? `0 0 15px ${activeMoodColor}` : 'none' }}
        />
      ))}
      <div className="absolute left-6 top-0 bottom-0 flex flex-col justify-between py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest vertical-text">
        <span>Layer Scan</span>
      </div>
    </div>
  );

  const BackgroundAura = () => (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-40">
      <div 
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[200px] animate-aura"
        style={{ backgroundColor: `${activeMoodColor}15` }}
      />
      <div 
        className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[180px] animate-aura [animation-delay:5s]"
        style={{ backgroundColor: `${activeMoodColor}10` }}
      />
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fade-in w-full max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-20">
              <span className="text-red-700 font-black tracking-[0.5em] uppercase text-xs mb-4 block animate-pulse">Emotional Layer Scan</span>
              <h2 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tighter px-4 gradient-text">{t.moodPrompt}</h2>
              <p className="max-w-2xl mx-auto text-slate-400 text-base md:text-xl leading-relaxed opacity-60 italic">
                {getCurrentInsight()}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-20 px-4">
              {(Object.values(PrimaryMood) as PrimaryMood[]).map((mood) => {
                const moodColor = MOOD_COLORS[mood];
                return (
                  <button
                    key={mood}
                    onClick={() => handleSelect('primaryMood', mood)}
                    style={{ '--mood-color': moodColor } as React.CSSProperties}
                    className="glass-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-5 group hover:border-[var(--mood-color)]/30 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--mood-color)] to-transparent opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500"></div>
                    <div className="text-slate-600 group-hover:text-[var(--mood-color)] group-hover:scale-110 transition-all duration-500">
                      {MOOD_ICONS[mood]}
                    </div>
                    <span className="font-black text-[10px] md:text-xs uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-all text-center">
                      {t.moods[mood as keyof typeof t.moods]}
                    </span>
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleSkip}
                className="group flex items-center gap-6 px-12 py-8 rounded-full border border-white/5 hover:border-red-600/20 hover:bg-white/[0.02] transition-all text-slate-500 hover:text-slate-300"
              >
                <span className="font-black text-sm md:text-lg tracking-[0.4em] uppercase">{t.skipButton}</span>
                <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          </div>
        );
      case 2:
      case 3:
      case 4:
        const layerInfo = [
          { key: 'intensity', prompt: 'intensityPrompt', options: Object.values(Intensity), trans: 'intensityLevels', label: 'Layer 02: Intensity' },
          { key: 'energy', prompt: 'energyPrompt', options: Object.values(EnergyLevel), trans: 'energyLevels', label: 'Layer 03: Energy' },
          { key: 'mentalState', prompt: 'mentalPrompt', options: Object.values(MentalState), trans: 'mentalStates', label: 'Layer 04: Depth' }
        ][step - 2];

        return (
          <div className="animate-fade-in w-full px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="font-black tracking-[0.5em] uppercase text-xs mb-4 block" style={{ color: activeMoodColor }}>{layerInfo.label}</span>
              <h2 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tighter px-4 gradient-text">{t[layerInfo.prompt as keyof typeof t] as string}</h2>
              <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl opacity-60 italic">
                {getCurrentInsight()}
              </p>
            </div>
            <div className="flex flex-col gap-6 max-w-3xl mx-auto">
              {layerInfo.options.map((v) => (
                <button
                  key={v}
                  onClick={() => handleSelect(layerInfo.key, v)}
                  style={{ '--mood-color': activeMoodColor } as React.CSSProperties}
                  className="glass-card p-10 md:p-14 rounded-[2rem] md:rounded-[3rem] hover:bg-white/[0.02] transition-all text-center text-2xl md:text-4xl font-black hover:border-[var(--mood-color)]/30 active:scale-95 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--mood-color)] to-transparent opacity-0 group-hover:opacity-[0.05] transition-opacity duration-700"></div>
                  {(t[layerInfo.trans as keyof typeof t] as any)[v]}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="animate-fade-in text-center w-full px-4">
            <div className="text-center mb-16">
               <span className="font-black tracking-[0.5em] uppercase text-xs mb-4 block" style={{ color: activeMoodColor }}>Final Layer: Atmospheric Delivery</span>
               <h2 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tighter px-4 gradient-text">{t.recTypePrompt}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
              {(Object.values(RecommendationType) as RecommendationType[]).map((t_type) => (
                <button
                  key={t_type}
                  onClick={() => setSelection(prev => ({ ...prev, recType: t_type }))}
                  style={{ '--mood-color': activeMoodColor } as React.CSSProperties}
                  className={`p-12 md:p-16 rounded-[3rem] md:rounded-[4rem] border transition-all flex flex-col items-center gap-8 glass-card hover:bg-white/[0.02] active:scale-95 ${selection.recType === t_type ? 'border-[var(--mood-color)]/50 bg-[var(--mood-color)]/10 shadow-[0_0_80px_var(--mood-color)]/20' : 'border-white/5'}`}
                >
                  <div className={`${selection.recType === t_type ? 'text-[var(--mood-color)]' : 'text-slate-700'} scale-150 transition-all duration-700`}>
                    {REC_TYPE_ICONS[t_type]}
                  </div>
                  <span className="font-black text-xl md:text-2xl tracking-[0.2em] uppercase">
                    {t.recTypes[t_type as keyof typeof t.recTypes]}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => onComplete(selection)}
              style={{ backgroundColor: activeMoodColor, boxShadow: `0 20px 80px ${activeMoodColor}40` }}
              className="w-full md:w-auto text-white px-20 md:px-40 py-8 md:py-10 rounded-full font-black text-2xl md:text-4xl transition-all transform hover:-translate-y-2 active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              {t.discover}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-20 relative min-h-[80vh] flex flex-col justify-center">
      <BackgroundAura />
      <LayerIndicator />
      {step > 1 && (
        <div className="mb-20 flex justify-center gap-4 px-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div 
              key={i} 
              style={{ backgroundColor: i <= step ? activeMoodColor : 'rgba(255,255,255,0.05)' }}
              className={`h-2 flex-1 max-w-[120px] rounded-full transition-all duration-1000 ${i <= step ? 'opacity-100 shadow-[0_0_10px_var(--mood-color)]' : 'opacity-20'}`} 
            />
          ))}
        </div>
      )}
      <div className="flex justify-center items-center">
        {renderStep()}
      </div>
    </div>
  );
};

export default MoodSelector;