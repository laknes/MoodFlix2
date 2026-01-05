
import React, { useState, useEffect } from 'react';
import {
  PrimaryMood,
  Intensity,
  EnergyLevel,
  MentalState,
  RecommendationType
} from '../types.ts';
import { MOOD_ICONS, MOOD_COLORS } from '../constants.tsx';
import { translations } from '../translations.ts';

const MoodSelector = ({ onComplete, language }) => {
  const [step, setStep] = useState(1);
  const [hoveredMood, setHoveredMood] = useState(null);

  const t = translations[language] ?? translations.en;

  const [selection, setSelection] = useState({
    primaryMood: null,
    intensity: null,
    energy: null,
    mentalState: null,
    recType: RecommendationType.PACK,
    avoidance: []
  });

  const activeMoodColor =
    selection.primaryMood ? MOOD_COLORS[selection.primaryMood] : '#E50914';

  useEffect(() => {
    const color =
      hoveredMood
        ? MOOD_COLORS[hoveredMood]
        : selection.primaryMood
        ? MOOD_COLORS[selection.primaryMood]
        : '#E50914';

    document.body.style.setProperty('--mood-accent', color);
    document.body.style.setProperty(
      'background-image',
      `radial-gradient(circle at 50% -20%, ${color}20 0%, #020202 100%)`
    );
  }, [hoveredMood, selection.primaryMood]);

  const handleSelect = (key, value) => {
    setSelection(prev => ({ ...prev, [key]: value }));
    setTimeout(() => {
      if (step < 5) setStep(s => s + 1);
    }, 300);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fade-in w-full max-w-7xl mx-auto px-4 relative">
            <div className="text-center mb-16 relative z-10">
              <span className="text-netflix-red font-black tracking-[0.5em] uppercase text-[10px] mb-4 block animate-pulse">
                Layer 01: The Core
              </span>
              <h2 className="text-5xl md:text-8xl font-black mb-6 gradient-text tracking-tighter leading-tight">
                {t.moodPrompt}
              </h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs h-6">
                {hoveredMood ? t.moods[hoveredMood] : t.layerInsights.primary}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8 mb-12 relative z-10">
              {Object.values(PrimaryMood).map(mood => (
                <button
                  key={mood}
                  onMouseEnter={() => setHoveredMood(mood)}
                  onMouseLeave={() => setHoveredMood(null)}
                  onClick={() => handleSelect('primaryMood', mood)}
                  className="glass-card p-8 md:p-12 rounded-[2.5rem] hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-6 group relative overflow-hidden border border-white/5"
                  // Use type casting to allow CSS variables in style prop
                  style={{ '--mood-hover': MOOD_COLORS[mood] } as React.CSSProperties}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
                  <div className="text-slate-500 group-hover:text-[var(--mood-hover)] transition-all duration-700 scale-125 group-hover:drop-shadow-[0_0_20px_var(--mood-hover)]">
                    {MOOD_ICONS[mood]}
                  </div>
                  <span className="font-black text-[11px] uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-all text-center">
                    {t.moods[mood]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
      case 3:
      case 4: {
        const layers = [
          { key: 'intensity', prompt: 'intensityPrompt', options: Intensity, trans: 'intensityLevels', layer: '02' },
          { key: 'energy', prompt: 'energyPrompt', options: EnergyLevel, trans: 'energyLevels', layer: '03' },
          { key: 'mentalState', prompt: 'mentalPrompt', options: MentalState, trans: 'mentalStates', layer: '04' }
        ];

        const currentLayer = layers[step - 2];

        return (
          <div className="animate-fade-in w-full px-4 max-w-4xl mx-auto">
            <div className="text-center mb-16 md:mb-24">
              <span
                className="font-black tracking-[0.5em] uppercase text-[10px] mb-4 block"
                style={{ color: activeMoodColor }}
              >
                Layer {currentLayer.layer}: Nuance
              </span>
              <h2 className="text-5xl md:text-8xl font-black mb-8 gradient-text tracking-tighter leading-none">
                {t[currentLayer.prompt]}
              </h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                {t.layerInsights[currentLayer.key]}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.values(currentLayer.options).map(val => (
                <button
                  key={val}
                  onClick={() => handleSelect(currentLayer.key, val)}
                  className="glass-card group p-10 md:p-14 rounded-[3rem] text-2xl md:text-4xl font-black hover:bg-white/[0.05] transition-all active:scale-95 border border-white/5 relative overflow-hidden"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0 group-hover:w-2 transition-all duration-500"
                    style={{ backgroundColor: activeMoodColor }}
                  />
                  <span className="relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                    {t[currentLayer.trans][val]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 5:
        return (
          <div className="animate-fade-in text-center w-full px-4 max-w-5xl mx-auto">
            <div className="mb-16 md:mb-24">
              <span
                className="font-black tracking-[0.5em] uppercase text-[10px] mb-4 block"
                style={{ color: activeMoodColor }}
              >
                Layer 05: Delivery
              </span>
              <h2 className="text-5xl md:text-8xl font-black mb-8 gradient-text tracking-tighter leading-none">
                {t.recTypePrompt}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {Object.values(RecommendationType).map(type => (
                <button
                  key={type}
                  onClick={() =>
                    setSelection(prev => ({ ...prev, recType: type }))
                  }
                  className={`p-10 rounded-[3rem] border transition-all flex flex-col items-center gap-6 glass-card ${
                    selection.recType === type
                      ? 'border-netflix-red/50 bg-netflix-red/10 shadow-2xl'
                      : 'border-white/5'
                  }`}
                >
                  <span className="font-black text-xs uppercase tracking-[0.2em]">
                    {t.recTypes[type]}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => onComplete(selection)}
              style={{
                backgroundColor: activeMoodColor,
                boxShadow: `0 20px 50px ${activeMoodColor}40`
              }}
              className="px-16 md:px-24 py-6 md:py-10 rounded-[4rem] font-black text-2xl md:text-4xl hover:scale-105 active:scale-95 transition-all uppercase tracking-tighter"
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
    <div className="py-24 min-h-[80vh] flex flex-col justify-center items-center">
      {step > 1 && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 flex gap-4 z-50">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className={`h-1.5 w-12 md:w-20 rounded-full transition-all duration-700 ${
                i <= step ? 'shadow-lg' : 'bg-white/5'
              }`}
              style={{ backgroundColor: i <= step ? activeMoodColor : undefined }}
            />
          ))}
        </div>
      )}
      {renderStep()}
    </div>
  );
};

export default MoodSelector;
