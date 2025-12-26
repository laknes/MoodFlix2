import React from 'react';
import { PrimaryMood, Intensity, EnergyLevel, MentalState, RecommendationType, Language } from '../types';
import { MOOD_ICONS, REC_TYPE_ICONS, MOOD_COLORS } from '../constants';
import { translations } from '../translations';

interface Props {
  onComplete: (data: any) => void;
  language: Language;
}

const MoodSelector: React.FC<Props> = ({ onComplete, language }) => {
  const [step, setStep] = React.useState(1);
  const t = translations[language];
  const [selection, setSelection] = React.useState({
    primaryMood: null as PrimaryMood | null,
    intensity: null as Intensity | null,
    energy: null as EnergyLevel | null,
    mentalState: null as MentalState | null,
    recType: RecommendationType.PACK,
    avoidance: [] as string[]
  });

  const activeMoodColor = selection.primaryMood ? MOOD_COLORS[selection.primaryMood] : '#E50914';

  // Apply visual atmosphere based on layers with smoother transition
  React.useEffect(() => {
    if (selection.primaryMood) {
      const color = MOOD_COLORS[selection.primaryMood];
      document.body.style.setProperty('--bg-gradient', `radial-gradient(circle at 50% -20%, ${color}0d 0%, #030303 100%)`);
    } else {
      document.body.style.setProperty('--bg-gradient', `radial-gradient(circle at 50% -20%, #150202 0%, #030303 100%)`);
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
    <div className="fixed left-6 lg:left-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-8 z-50">
      {[
        { id: 1, label: t.moods[selection.primaryMood!] || '---', active: step >= 1 && selection.primaryMood },
        { id: 2, label: t.intensityLevels[selection.intensity!] || '---', active: step >= 2 && selection.intensity },
        { id: 3, label: t.energyLevels[selection.energy!] || '---', active: step >= 3 && selection.energy },
        { id: 4, label: t.mentalStates[selection.mentalState!] || '---', active: step >= 4 && selection.mentalState }
      ].map((layer, idx) => (
        <div 
          key={idx}
          className={`flex items-center gap-6 group transition-all duration-1000 ${layer.active ? 'opacity-100' : 'opacity-[0.05]'}`}
        >
          <div 
            className={`w-[1px] h-12 rounded-full transition-all duration-1000 ${layer.active ? 'scale-y-100' : 'scale-y-25'}`}
            style={{ 
              backgroundColor: activeMoodColor, 
              boxShadow: layer.active ? `0 0 15px ${activeMoodColor}` : 'none' 
            }}
          />
          <div 
            className={`px-4 py-3 rounded-lg text-[8px] font-black uppercase tracking-[0.3em] border transition-all duration-700 premium-glass ${layer.active ? 'scale-100 opacity-100' : 'scale-90 opacity-40'}`}
            style={{ 
              borderColor: layer.active ? `${activeMoodColor}33` : 'rgba(255,255,255,0.02)',
              color: layer.active ? 'white' : 'rgba(255,255,255,0.2)'
            }}
          >
            {layer.label}
          </div>
        </div>
      ))}
    </div>
  );

  const BackgroundAura = () => (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      <div 
        className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[250px] animate-aura transition-all duration-[3s]"
        style={{ backgroundColor: `${activeMoodColor}08` }}
      />
      <div 
        className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[200px] animate-aura [animation-delay:5s] transition-all duration-[3s]"
        style={{ backgroundColor: `${activeMoodColor}05` }}
      />
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fade-in w-full max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-red-800 font-black tracking-[0.8em] uppercase text-[9px] md:text-xs mb-4 block animate-pulse">Emotional Layer Scan</span>
              <h2 className="text-4xl md:text-8xl font-black mb-6 leading-tight tracking-tighter px-4 gradient-text">{t.moodPrompt}</h2>
              <p className="max-w-xl mx-auto text-slate-500 text-sm md:text-lg leading-relaxed opacity-40 italic font-medium">
                {getCurrentInsight()}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 mb-16">
              {(Object.values(PrimaryMood) as PrimaryMood[]).map((mood, idx) => {
                const moodColor = MOOD_COLORS[mood];
                return (
                  <button
                    key={mood}
                    onClick={() => handleSelect('primaryMood', mood)}
                    style={{ 
                      '--mood-color': moodColor,
                      animationDelay: `${idx * 30}ms`
                    } as React.CSSProperties}
                    className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center gap-4 group hover:border-[var(--mood-color)]/20 relative overflow-hidden animate-fade-in"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--mood-color)] to-transparent opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700"></div>
                    <div className="text-slate-600 group-hover:text-[var(--mood-color)] group-hover:scale-105 transition-all duration-700">
                      {MOOD_ICONS[mood]}
                    </div>
                    <span className="font-black text-[9px] md:text-xs uppercase tracking-[0.25em] opacity-20 group-hover:opacity-100 transition-all text-center">
                      {t.moods[mood as keyof typeof t.moods]}
                    </span>
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-center px-4">
              <button
                onClick={handleSkip}
                className="group w-full md:w-auto flex items-center justify-center gap-4 px-10 md:px-14 py-6 md:py-7 rounded-full border border-white/5 hover:border-white/10 hover:bg-white/[0.01] transition-all text-slate-700 hover:text-slate-400"
              >
                <span className="font-black text-[10px] md:text-sm tracking-[0.5em] uppercase">{t.skipButton}</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
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
              <span className="font-black tracking-[0.8em] uppercase text-[9px] md:text-xs mb-4 block" style={{ color: activeMoodColor }}>{layerInfo.label}</span>
              <h2 className="text-4xl md:text-8xl font-black mb-6 leading-tight tracking-tighter px-4 gradient-text">{t[layerInfo.prompt as keyof typeof t] as string}</h2>
              <p className="max-w-xl mx-auto text-slate-500 text-sm md:text-lg opacity-40 italic font-medium">
                {getCurrentInsight()}
              </p>
            </div>
            <div className="flex flex-col gap-4 md:gap-6 max-w-2xl mx-auto">
              {layerInfo.options.map((v, idx) => (
                <button
                  key={v}
                  onClick={() => handleSelect(layerInfo.key, v)}
                  style={{ 
                    '--mood-color': activeMoodColor,
                    animationDelay: `${idx * 60}ms`
                  } as React.CSSProperties}
                  className="glass-card p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] hover:bg-white/[0.02] transition-all text-center text-xl md:text-3xl font-black hover:border-[var(--mood-color)]/25 active:scale-98 group relative overflow-hidden animate-fade-in"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--mood-color)] to-transparent opacity-0 group-hover:opacity-[0.04] transition-opacity duration-1000"></div>
                  {(t[layerInfo.trans as keyof typeof t] as any)[v]}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="animate-fade-in text-center w-full px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <span className="font-black tracking-[0.8em] uppercase text-[9px] md:text-xs mb-4 block" style={{ color: activeMoodColor }}>Final Layer: Delivery</span>
               <h2 className="text-4xl md:text-8xl font-black mb-6 leading-tight tracking-tighter px-4 gradient-text">{t.recTypePrompt}</h2>
               <p className="max-w-xl mx-auto text-slate-500 text-sm md:text-lg opacity-40 italic font-medium">
                {getCurrentInsight()}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8 mb-16 max-w-4xl mx-auto">
              {(Object.values(RecommendationType) as RecommendationType[]).map((t_type, idx) => (
                <button
                  key={t_type}
                  onClick={() => setSelection(prev => ({ ...prev, recType: t_type }))}
                  style={{ 
                    '--mood-color': activeMoodColor,
                    animationDelay: `${idx * 100}ms`
                  } as React.CSSProperties}
                  className={`p-10 md:p-14 rounded-[2rem] md:rounded-[3rem] border transition-all flex flex-col items-center gap-6 glass-card hover:bg-white/[0.01] active:scale-95 animate-fade-in ${selection.recType === t_type ? 'border-[var(--mood-color)]/30 bg-[var(--mood-color)]/5' : 'border-white/5 opacity-40'}`}
                >
                  <div className={`${selection.recType === t_type ? 'text-[var(--mood-color)]' : 'text-slate-700'} scale-110 md:scale-125 transition-all duration-1000`}>
                    {REC_TYPE_ICONS[t_type]}
                  </div>
                  <span className="font-black text-sm md:text-xl tracking-[0.3em] uppercase">
                    {t.recTypes[t_type as keyof typeof t.recTypes]}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex flex-col items-center gap-12">
              <button
                onClick={() => onComplete(selection)}
                style={{ 
                  backgroundColor: activeMoodColor, 
                  boxShadow: `0 30px 100px -20px ${activeMoodColor}4d` 
                }}
                className="w-full md:w-auto text-white px-16 md:px-36 py-7 md:py-9 rounded-full font-black text-xl md:text-3xl transition-all transform hover:-translate-y-1 active:scale-95 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out"></div>
                {t.discover}
              </button>
              <div className="flex items-center gap-4 text-slate-700 font-bold uppercase tracking-[0.6em] text-[8px] md:text-[10px] opacity-40">
                <div className="w-1 h-1 rounded-full bg-red-900"></div>
                Calibrating Sensory Input
                <div className="w-1 h-1 rounded-full bg-red-900"></div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 md:py-20 relative min-h-[80vh] flex flex-col justify-center">
      <BackgroundAura />
      <LayerIndicator />
      {step > 1 && (
        <div className="mb-16 md:mb-24 flex justify-center gap-2 md:gap-3 px-4 max-w-xl mx-auto w-full">
          {[1, 2, 3, 4, 5].map(i => (
            <button 
              key={i} 
              onClick={() => i < step && setStep(i)}
              style={{ 
                backgroundColor: i <= step ? activeMoodColor : 'rgba(255,255,255,0.03)',
                boxShadow: i === step ? `0 0 15px ${activeMoodColor}4d` : 'none'
              }}
              className={`h-1 flex-1 rounded-full transition-all duration-1000 ${i < step ? 'cursor-pointer opacity-100' : 'cursor-default opacity-20'}`} 
            />
          ))}
        </div>
      )}
      <div className="flex justify-center items-center flex-grow">
        {renderStep()}
      </div>
    </div>
  );
};

export default MoodSelector;