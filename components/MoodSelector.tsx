
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

  // Apply visual atmosphere based on layers
  React.useEffect(() => {
    if (selection.primaryMood) {
      const color = MOOD_COLORS[selection.primaryMood];
      document.body.style.setProperty('--bg-gradient', `radial-gradient(circle at 50% -20%, ${color}33 0%, #050505 80%)`);
    } else {
      document.body.style.setProperty('--bg-gradient', `radial-gradient(circle at 50% -20%, #301010 0%, #050505 80%)`);
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

  const LayerIndicator = () => (
    <div className="fixed left-4 lg:left-12 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4 z-50">
      {[
        { id: 1, label: t.moods[selection.primaryMood!] || '...', active: step >= 1 && selection.primaryMood },
        { id: 2, label: t.intensityLevels[selection.intensity!] || '...', active: step >= 2 && selection.intensity },
        { id: 3, label: t.energyLevels[selection.energy!] || '...', active: step >= 3 && selection.energy },
        { id: 4, label: t.mentalStates[selection.mentalState!] || '...', active: step >= 4 && selection.mentalState }
      ].map((layer, idx) => (
        <div 
          key={idx}
          className={`layer-badge px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 border ${layer.active ? 'opacity-100 scale-100' : 'opacity-20 scale-90'}`}
          style={{ borderColor: layer.active ? activeMoodColor : 'rgba(255,255,255,0.1)', color: layer.active ? activeMoodColor : 'white' }}
        >
          Layer {idx + 1}: {layer.label}
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fade-in w-full">
            <div className="text-center mb-12">
              <span className="text-red-600 font-black tracking-[0.3em] uppercase text-xs md:text-sm mb-4 block">Layer 01: Emotional Foundation</span>
              <h2 className="text-3xl md:text-6xl font-black mb-6 leading-tight">{t.moodPrompt}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-20 px-4">
              {(Object.values(PrimaryMood) as PrimaryMood[]).map(mood => {
                const moodColor = MOOD_COLORS[mood];
                return (
                  <button
                    key={mood}
                    onClick={() => handleSelect('primaryMood', mood)}
                    style={{ '--mood-color': moodColor } as React.CSSProperties}
                    className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-4 group hover:border-[var(--mood-color)] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[var(--mood-color)] opacity-0 group-hover:opacity-[0.03] transition-opacity"></div>
                    <div className="text-slate-400 group-hover:text-[var(--mood-color)] transition-colors scale-90 md:scale-110">
                      {MOOD_ICONS[mood]}
                    </div>
                    <span className="font-black text-xs md:text-lg uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-all">
                      {t.moods[mood as keyof typeof t.moods]}
                    </span>
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-center px-4">
              <button
                onClick={handleSkip}
                className="group w-full md:w-auto flex items-center justify-center gap-4 px-8 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-3xl border border-white/10 hover:border-red-600/30 hover:bg-white/5 transition-all text-slate-400 hover:text-white"
              >
                <span className="font-black text-sm md:text-lg tracking-widest">{t.skipButton}</span>
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
          <div className="animate-fade-in w-full px-4">
            <div className="text-center mb-12">
              <span className="font-black tracking-[0.3em] uppercase text-xs md:text-sm mb-4 block" style={{ color: activeMoodColor }}>{layerInfo.label}</span>
              <h2 className="text-3xl md:text-6xl font-black mb-6 leading-tight">{t[layerInfo.prompt as keyof typeof t] as string}</h2>
            </div>
            <div className="flex flex-col gap-4 md:gap-6 max-w-xl mx-auto">
              {layerInfo.options.map(v => (
                <button
                  key={v}
                  onClick={() => handleSelect(layerInfo.key, v)}
                  style={{ '--mood-color': activeMoodColor } as React.CSSProperties}
                  className="glass-card p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] hover:bg-white/5 transition-all text-center text-xl md:text-3xl font-black hover:border-[var(--mood-color)] active:scale-95 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[var(--mood-color)] opacity-0 group-hover:opacity-[0.05] transition-opacity"></div>
                  {(t[layerInfo.trans as keyof typeof t] as any)[v]}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="animate-fade-in text-center w-full px-4">
            <div className="text-center mb-12">
               <span className="font-black tracking-[0.3em] uppercase text-xs md:text-sm mb-4 block" style={{ color: activeMoodColor }}>Final Layer: Delivery</span>
               <h2 className="text-3xl md:text-6xl font-black mb-6 leading-tight">{t.recTypePrompt}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-16 md:mb-24 max-w-4xl mx-auto">
              {(Object.values(RecommendationType) as RecommendationType[]).map(t_type => (
                <button
                  key={t_type}
                  onClick={() => setSelection(prev => ({ ...prev, recType: t_type }))}
                  style={{ '--mood-color': activeMoodColor } as React.CSSProperties}
                  className={`p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border transition-all flex flex-col items-center gap-4 md:gap-6 glass-card hover:bg-white/5 active:scale-95 ${selection.recType === t_type ? 'border-[var(--mood-color)] shadow-[0_0_30px_var(--mood-color)] shadow-opacity-20' : 'border-white/10 hover:border-white/30'}`}
                >
                  <div className={`${selection.recType === t_type ? 'text-[var(--mood-color)]' : 'text-slate-400'} scale-110 md:scale-125 transition-transform`}>
                    {REC_TYPE_ICONS[t_type]}
                  </div>
                  <span className="font-black text-lg md:text-2xl tracking-widest uppercase">
                    {t.recTypes[t_type as keyof typeof t.recTypes]}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => onComplete(selection)}
              style={{ backgroundColor: activeMoodColor }}
              className="w-full md:w-auto text-white px-12 md:px-24 py-5 md:py-8 rounded-full font-black text-xl md:text-4xl shadow-2xl transition-all transform hover:-translate-y-2 active:scale-95 mb-12 shadow-[var(--mood-color)]/20"
            >
              {t.discover}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-12 relative">
      <LayerIndicator />
      {step > 1 && (
        <div className="mb-12 md:mb-20 flex justify-center gap-2 md:gap-4 px-4">
          {[1, 2, 3, 4, 5].map(i => (
            <button 
              key={i} 
              onClick={() => i < step && setStep(i)}
              style={{ backgroundColor: i <= step ? activeMoodColor : 'rgba(255,255,255,0.05)' }}
              className={`h-1.5 md:h-2 flex-1 max-w-[120px] rounded-full transition-all duration-700 ${i < step ? 'cursor-pointer' : 'cursor-default'}`} 
            />
          ))}
        </div>
      )}
      <div className="flex justify-center">
        {renderStep()}
      </div>
    </div>
  );
};

export default MoodSelector;
