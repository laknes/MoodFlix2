import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---
enum PrimaryMood {
  SAD = 'sad', CALM = 'calm', LONELY = 'lonely', ANXIOUS = 'anxious', 
  HAPPY = 'happy', ANGRY = 'angry', ROMANTIC = 'romantic', INSPIRED = 'inspired'
}

enum Intensity { LOW = 'low', MEDIUM = 'medium', HIGH = 'high' }
enum EnergyLevel { LOW = 'low', MEDIUM = 'medium', HIGH = 'high' }
enum MentalState { LIGHT = 'light', MEDIUM = 'medium', DEEP = 'deep' }
enum RecommendationType { QUICK = 'quick', PACK = 'pack', THERAPY = 'therapy' }

// --- Constants ---
const MOOD_COLORS = {
  [PrimaryMood.SAD]: '#3b82f6',
  [PrimaryMood.CALM]: '#06b6d4',
  [PrimaryMood.LONELY]: '#6366f1',
  [PrimaryMood.ANXIOUS]: '#f97316',
  [PrimaryMood.HAPPY]: '#f59e0b',
  [PrimaryMood.ANGRY]: '#ef4444',
  [PrimaryMood.ROMANTIC]: '#ec4899',
  [PrimaryMood.INSPIRED]: '#8b5cf6'
};

const MOOD_ICONS = {
  [PrimaryMood.SAD]: '💧', [PrimaryMood.CALM]: '🌊', [PrimaryMood.LONELY]: '🕯️', 
  [PrimaryMood.ANXIOUS]: '🌀', [PrimaryMood.HAPPY]: '☀️', [PrimaryMood.ANGRY]: '🔥', 
  [PrimaryMood.ROMANTIC]: '🌹', [PrimaryMood.INSPIRED]: '✨'
};

const TRANSLATIONS = {
  fa: {
    title: "MOODFLIX",
    subtitle: "آنالیز لایه‌های احساسی سینما",
    prompts: [
      "لایه اول: احساس اصلی شما چیست؟",
      "لایه دوم: شدت این فرکانس چقدر است؟",
      "لایه سوم: سطح انرژی فیزیکی شما؟",
      "لایه چهارم: عمق تمرکز ذهنی مورد نیاز؟",
      "لایه آخر: سبک تحویل پیشنهاد؟"
    ],
    moods: {
      [PrimaryMood.SAD]: "غمگین", [PrimaryMood.CALM]: "آرام", [PrimaryMood.LONELY]: "تنها",
      [PrimaryMood.ANXIOUS]: "مضطرب", [PrimaryMood.HAPPY]: "شاد", [PrimaryMood.ANGRY]: "خشمگین",
      [PrimaryMood.ROMANTIC]: "عاشقانه", [PrimaryMood.INSPIRED]: "الهام‌بخش"
    },
    intensity: { [Intensity.LOW]: "ملایم", [Intensity.MEDIUM]: "متوسط", [Intensity.HIGH]: "شدید" },
    energy: { [EnergyLevel.LOW]: "کم", [EnergyLevel.MEDIUM]: "متوسط", [EnergyLevel.HIGH]: "زیاد" },
    mental: { [MentalState.LIGHT]: "سطحی و سرگرم‌کننده", [MentalState.MEDIUM]: "متعادل", [MentalState.DEEP]: "عمیق و فلسفی" },
    rec: { [RecommendationType.QUICK]: "فوری", [RecommendationType.PACK]: "بسته کامل", [RecommendationType.THERAPY]: "سینمادرمانی" },
    scanning: "در حال کالیبره کردن لایه‌ها...",
    discover: "اسکن و نمایش نتایج",
    reset: "بازگشت و کالیبراسیون دوباره"
  }
};

// --- Components ---

const MoodSelector = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    primary: null, intensity: null, energy: null, mental: null, rec: RecommendationType.PACK
  });

  const t = TRANSLATIONS.fa;
  const activeColor = selection.primary ? MOOD_COLORS[selection.primary] : '#E50914';

  useEffect(() => {
    if (selection.primary) {
      document.body.style.setProperty('--bg-gradient', `radial-gradient(circle at 50% -20%, ${MOOD_COLORS[selection.primary]}15 0%, #020202 100%)`);
    }
  }, [selection.primary]);

  const handleSelect = (key, value) => {
    const newSelection = { ...selection, [key]: value };
    setSelection(newSelection);
    if (step < 5) setStep(step + 1);
    else onComplete(newSelection);
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
            {Object.entries(MOOD_ICONS).map(([mood, icon]) => (
              <button 
                key={mood}
                onClick={() => handleSelect('primary', mood)}
                className="glass-card p-10 rounded-[3rem] flex flex-col items-center gap-4 hover:scale-105 transition-all group hover:border-white/20"
              >
                <span className="text-5xl group-hover:scale-125 transition-transform">{icon}</span>
                <span className="font-black text-sm uppercase tracking-widest opacity-60 group-hover:opacity-100">{t.moods[mood]}</span>
              </button>
            ))}
          </div>
        );
      case 2:
      case 3:
      case 4:
        const layer = [
          { key: 'intensity', options: Object.values(Intensity), trans: t.intensity, label: '02: Intensity' },
          { key: 'energy', options: Object.values(EnergyLevel), trans: t.energy, label: '03: Energy' },
          { key: 'mental', options: Object.values(MentalState), trans: t.mental, label: '04: Focus' }
        ][step - 2];
        return (
          <div className="flex flex-col gap-4 max-w-xl mx-auto animate-fade-in">
            {layer.options.map(opt => (
              <button 
                key={opt}
                onClick={() => handleSelect(layer.key, opt)}
                className="glass-card p-12 rounded-[2rem] text-3xl font-black hover:bg-white/5 transition-all"
              >
                {layer.trans[opt]}
              </button>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col gap-4 max-w-xl mx-auto animate-fade-in">
             {Object.values(RecommendationType).map(opt => (
              <button 
                key={opt}
                onClick={() => handleSelect('rec', opt)}
                className="glass-card p-12 rounded-[2rem] text-3xl font-black hover:bg-white/5 transition-all"
              >
                {t.rec[opt]}
              </button>
            ))}
          </div>
        )
      default: return null;
    }
  };

  return (
    <div className="py-20 text-center">
      <div className="mb-20">
        <span className="text-[10px] font-black uppercase tracking-[1em] mb-4 block opacity-40">Layer Scan {step}/5</span>
        <h2 className="text-5xl md:text-9xl font-black tracking-tighter gradient-text leading-tight">{t.prompts[step-1]}</h2>
      </div>
      {renderStep()}
    </div>
  );
};

const Loading = () => (
  <div className="flex flex-col items-center justify-center py-40 animate-fade-in">
    <div className="w-24 h-24 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-10"></div>
    <h2 className="text-4xl font-black text-red-600 animate-pulse tracking-widest">{TRANSLATIONS.fa.scanning}</h2>
  </div>
);

const Results = ({ data, onReset }) => {
  const t = TRANSLATIONS.fa;
  return (
    <div className="py-20 animate-fade-in">
      <div className="text-center mb-20">
        <h2 className="text-6xl md:text-8xl font-black gradient-text mb-6">تحلیل نهایی لایه‌ها</h2>
        <p className="text-xl text-slate-400 italic">" {data.quote} "</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
        {data.movies.map((m, i) => (
          <div key={i} className="glass-card p-10 rounded-[3rem] border-white/5 group hover:border-white/10 transition-all">
            <h3 className="text-4xl font-black mb-4">{m.title}</h3>
            <p className="text-slate-400 mb-8 leading-relaxed text-lg">{m.reason}</p>
            <div className="flex gap-4">
              <span className="px-4 py-2 bg-red-600/10 text-red-500 rounded-full text-xs font-black uppercase tracking-widest">IMDB: {m.rating}</span>
              <span className="px-4 py-2 bg-white/5 text-slate-500 rounded-full text-xs font-black uppercase tracking-widest">{m.year}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <button onClick={onReset} className="text-slate-500 hover:text-white font-black uppercase tracking-widest transition-colors">
          {t.reset}
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState('mood');
  const [results, setResults] = useState(null);

  const getRecommendations = async (selection) => {
    setView('loading');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      As a cinematic psychologist, suggest 2 movies based on these emotional layers:
      Primary Mood: ${selection.primary}
      Intensity: ${selection.intensity}
      Energy Level: ${selection.energy}
      Mental Focus: ${selection.mental}
      Delivery: ${selection.rec}
      
      Respond in JSON format:
      {
        "quote": "A poetic Persian quote matching the mood",
        "movies": [
          { "title": "Movie Name", "year": "2024", "reason": "Why it fits in Persian", "rating": "8.5" }
        ]
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
      });
      const data = JSON.parse(response.text);
      setResults(data);
      setView('results');
    } catch (e) {
      console.error(e);
      // Fallback data
      setResults({
        quote: "در تاریکی، سینما تنها فانوس ماست.",
        movies: [{ title: "The Shawshank Redemption", year: "1994", reason: "یک انتخاب کلاسیک برای امید و پایداری.", rating: "9.3" }]
      });
      setView('results');
    }
  };

  return (
    <div className="container mx-auto px-6">
      <header className="py-10 flex flex-col items-center">
        <h1 className="text-4xl md:text-7xl font-black netflix-red tracking-tighter mb-2">MOODFLIX</h1>
        <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.5em]">{TRANSLATIONS.fa.subtitle}</p>
      </header>

      <main>
        {view === 'mood' && <MoodSelector onComplete={getRecommendations} />}
        {view === 'loading' && <Loading />}
        {view === 'results' && <Results data={results} onReset={() => setView('mood')} />}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);