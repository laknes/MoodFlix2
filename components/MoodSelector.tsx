
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fade-in w-full">
            <h2 className="text-2xl md:text-5xl font-black mb-8 md:mb-16 text-center px-4 leading-tight">{t.moodPrompt}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-8 mb-12 md:mb-20">
              {(Object.values(PrimaryMood) as PrimaryMood[]).map(mood => {
                const moodColor = MOOD_COLORS[mood];
                return (
                  <button
                    key={mood}
                    onClick={() => handleSelect('primaryMood', mood)}
                    style={{ '--mood-color': moodColor } as React.CSSProperties}
                    className="glass-card p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-3 md:gap-6 group hover:border-[var(--mood-color)]"
                  >
                    <div className="text-slate-400 group-hover:text-[var(--mood-color)] transition-colors scale-90 md:scale-125">
                      {MOOD_ICONS[mood]}
                    </div>
                    <span className="font-black text-xs md:text-xl uppercase tracking-widest opacity-80 group-hover:opacity-100">
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
                <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-black text-sm md:text-lg tracking-widest">{t.skipButton}</span>
              </button>
            </div>
          </div>
        );
      case 2:
      case 3:
      case 4:
        const promptKey = step === 2 ? 'intensityPrompt' : step === 3 ? 'energyPrompt' : 'mentalPrompt';
        const key = step === 2 ? 'intensity' : step === 3 ? 'energy' : 'mentalState';
        const options = step === 2 ? Object.values(Intensity) : step === 3 ? Object.values(EnergyLevel) : Object.values(MentalState);
        const transKey = step === 2 ? 'intensityLevels' : step === 3 ? 'energyLevels' : 'mentalStates';
        const activeMoodColor = selection.primaryMood ? MOOD_COLORS[selection.primaryMood] : '#E50914';

        return (
          <div className="animate-fade-in w-full px-4">
            <h2 className="text-2xl md:text-5xl font-black mb-8 md:mb-16 text-center leading-tight">{t[promptKey]}</h2>
            <div className="flex flex-col gap-4 md:gap-6 max-w-xl mx-auto">
              {options.map(v => (
                <button
                  key={v}
                  onClick={() => handleSelect(key, v)}
                  style={{ '--mood-color': activeMoodColor } as React.CSSProperties}
                  className="glass-card p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] hover:bg-white/5 transition-all text-center text-xl md:text-3xl font-black hover:border-[var(--mood-color)] active:scale-95"
                >
                  {(t[transKey] as any)[v]}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        const moodColorFinal = selection.primaryMood ? MOOD_COLORS[selection.primaryMood] : '#E50914';
        return (
          <div className="animate-fade-in text-center w-full px-4">
            <h2 className="text-3xl md:text-5xl font-black mb-12 md:mb-16 leading-tight">{t.recTypePrompt}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mb-16 md:mb-24 max-w-4xl mx-auto">
              {(Object.values(RecommendationType) as RecommendationType[]).map(t_type => (
                <button
                  key={t_type}
                  onClick={() => setSelection(prev => ({ ...prev, recType: t_type }))}
                  style={{ '--mood-color': moodColorFinal } as React.CSSProperties}
                  className={`p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border transition-all flex flex-col items-center gap-4 md:gap-8 glass-card hover:bg-white/5 active:scale-95 ${selection.recType === t_type ? 'border-[var(--mood-color)]' : 'border-white/10 hover:border-white/30'}`}
                >
                  <div className={`${selection.recType === t_type ? 'text-[var(--mood-color)]' : 'text-slate-400'} scale-110 md:scale-150`}>
                    {REC_TYPE_ICONS[t_type]}
                  </div>
                  <span className="font-black text-lg md:text-2xl tracking-widest">
                    {t.recTypes[t_type as keyof typeof t.recTypes]}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => onComplete(selection)}
              style={{ backgroundColor: moodColorFinal }}
              className="w-full md:w-auto text-white px-12 md:px-24 py-5 md:py-8 rounded-full font-black text-xl md:text-3xl shadow-2xl transition-all transform hover:-translate-y-2 active:scale-95 mb-12"
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
    <div className="max-w-6xl mx-auto py-6 md:py-12">
      {step > 1 && (
        <div className="mb-12 md:mb-20 flex justify-center gap-2 md:gap-4 px-4">
          {[1, 2, 3, 4, 5].map(i => (
            <button 
              key={i} 
              onClick={() => i < step && setStep(i)}
              style={{ backgroundColor: i <= step ? (selection.primaryMood ? MOOD_COLORS[selection.primaryMood] : '#E50914') : 'rgba(255,255,255,0.1)' }}
              className={`h-1.5 md:h-3 flex-1 max-w-[80px] rounded-full transition-all duration-700 ${i < step ? 'cursor-pointer' : 'cursor-default'}`} 
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
