import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Constants (Replacing Enums for Browser Compatibility) ---
const PrimaryMood = {
  SAD: 'sad', CALM: 'calm', LONELY: 'lonely', ANXIOUS: 'anxious', 
  HAPPY: 'happy', ANGRY: 'angry', ROMANTIC: 'romantic', INSPIRED: 'inspired'
};

const Intensity = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' };
const EnergyLevel = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' };
const MentalState = { LIGHT: 'light', MEDIUM: 'medium', DEEP: 'deep' };
const RecommendationType = { QUICK: 'quick', PACK: 'pack', THERAPY: 'therapy' };

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
      document.body.style.setProperty('--mood-accent', MOOD_COLORS[selection.primary]);
      document.body.style.setProperty('background-image', `radial-gradient(circle at 50% -20%, ${MOOD_COLORS[selection.primary]}15 0%, #020202 100%)`);
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in px-4">
            {Object.entries(MOOD_ICONS).map(([mood, icon]) => (
              <button 
                key={mood}
                onClick={() => handleSelect('primary', mood)}
                className="glass-card p-10 md:p-14 rounded-[3rem] flex flex-col items-center gap-4 hover:scale-105 transition-all group hover:border-white/20 active:scale-95"
              >
                <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform">{icon}</span>
                <span className="font-black text-xs md:text-sm uppercase tracking-widest opacity-60 group-hover:opacity-100">{t.moods[mood]}</span>
              </button>
            ))}
          </div>
        );
      case 2:
      case 3:
      case 4:
        const layer = [
          { key: 'intensity', options: Object.values(Intensity), trans: t.intensity, label: 'Intensity Scan' },
          { key: 'energy', options: Object.values(EnergyLevel), trans: t.energy, label: 'Energy Scan' },
          { key: 'mental', options: Object.values(MentalState), trans: t.mental, label: 'Depth Scan' }
        ][step - 2];
        return (
          <div className="flex flex-col gap-4 max-w-xl mx-auto animate-fade-in w-full px-4">
            {layer.options.map((opt, idx) => (
              <button 
                key={opt}
                onClick={() => handleSelect(layer.key, opt)}
                className="glass-card p-12 rounded-[2rem] text-2xl md:text-3xl font-black hover:bg-white/5 transition-all active:scale-95 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                <span className="relative z-10">{layer.trans[opt]}</span>
              </button>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col gap-4 max-w-xl mx-auto animate-fade-in w-full px-4">
             {Object.values(RecommendationType).map(opt => (
              <button 
                key={opt}
                onClick={() => handleSelect('rec', opt)}
                className="glass-card p-12 rounded-[2rem] text-2xl md:text-3xl font-black hover:bg-white/5 transition-all active:scale-95"
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
    <div className="py-12 md:py-20 text-center flex flex-col items-center">
      <div className="mb-12 md:mb-20 px-4">
        <span className="text-[10px] md:text-xs font-black uppercase tracking-[1em] mb-4 block opacity-30 animate-pulse">L{step} Scanner Active</span>
        <h2 className="text-4xl md:text-8xl font-black tracking-tighter gradient-text leading-tight max-w-4xl">{t.prompts[step-1]}</h2>
      </div>
      {renderStep()}
      
      {step > 1 && (
        <div className="mt-20 flex gap-2 md:gap-3">
          {[1,2,3,4,5].map(i => (
            <div 
              key={i} 
              className={`h-1 w-8 md:w-12 rounded-full transition-all duration-700 ${i <= step ? 'opacity-100' : 'opacity-10'}`}
              style={{ backgroundColor: activeColor, boxShadow: i === step ? `0 0 10px ${activeColor}` : 'none' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Loading = () => (
  <div className="flex flex-col items-center justify-center py-40 animate-fade-in text-center px-4">
    <div className="relative w-32 h-32 md:w-48 md:h-48 mb-12">
      <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-4 border-2 border-white/10 rounded-full animate-aura"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-red-600 font-black text-2xl animate-pulse">MOOD</span>
      </div>
    </div>
    <h2 className="text-3xl md:text-5xl font-black text-white tracking-widest uppercase">{TRANSLATIONS.fa.scanning}</h2>
    <p className="mt-4 text-slate-500 font-bold max-w-md italic opacity-60">در حال جستجوی فرکانس‌های مشابه در تاریخ سینما...</p>
  </div>
);

const Results = ({ data, onReset }) => {
  const t = TRANSLATIONS.fa;
  return (
    <div className="py-12 md:py-20 animate-fade-in max-w-6xl mx-auto px-4">
      <div className="text-center mb-16 md:mb-24">
        <h2 className="text-5xl md:text-8xl font-black gradient-text mb-8 tracking-tighter">تحلیل نهایی لایه‌ها</h2>
        <div className="inline-block p-6 md:p-10 glass-card rounded-[2.5rem] relative">
          <span className="absolute -top-4 -right-4 text-5xl opacity-20">"</span>
          <p className="text-xl md:text-3xl text-slate-300 italic font-medium leading-relaxed"> {data.quote} </p>
          <span className="absolute -bottom-4 -left-4 text-5xl opacity-20">"</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-20">
        {data.movies.map((m, i) => (
          <div key={i} className="glass-card p-10 md:p-14 rounded-[3rem] border-white/5 group hover:border-white/20 transition-all hover:premium-glow transform hover:-translate-y-2">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-3xl md:text-5xl font-black leading-tight">{m.title}</h3>
              <span className="px-4 py-2 bg-white/5 rounded-xl text-xs font-black tracking-widest text-slate-500">{m.year}</span>
            </div>
            <p className="text-slate-400 mb-10 leading-relaxed text-lg md:text-xl font-medium">{m.reason}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <span className="px-5 py-2 bg-red-600/10 text-red-500 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border border-red-600/20">IMDB: {m.rating}</span>
                <span className="px-5 py-2 bg-white/5 text-slate-500 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border border-white/10">S:01</span>
              </div>
              <svg className="w-8 h-8 text-slate-800 group-hover:text-red-600 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center pb-20">
        <button onClick={onReset} className="text-slate-500 hover:text-white font-black uppercase tracking-[0.6em] transition-all text-sm md:text-base border-b border-transparent hover:border-white pb-2">
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
      Delivery Mode: ${selection.rec}
      
      Return a valid JSON object ONLY. Language: Persian (Farsi).
      Schema:
      {
        "quote": "A short poetic Persian quote matching the mood",
        "movies": [
          { "title": "Movie Name", "year": "Year", "reason": "Detailed psycholocial reason in Persian", "rating": "8.5" }
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
      // Fallback in case of API failure
      setResults({
        quote: "در سکوت شب، سینما تنها پناهگاه ذهن‌های جستجوگر است.",
        movies: [
          { title: "Interstellar", year: "2014", reason: "سفری برای کشف ابعاد ناشناخته روح و زمان، مناسب برای مود فعلی شما.", rating: "8.7" },
          { title: "Soul", year: "2020", reason: "نگاهی عمیق و در عین حال لطیف به معنای زندگی و اشتیاق‌های انسانی.", rating: "8.0" }
        ]
      });
      setView('results');
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8">
      <header className="py-12 md:py-16 flex flex-col items-center">
        <h1 
          onClick={() => { setView('mood'); setResults(null); }} 
          className="text-5xl md:text-8xl font-black text-red-600 tracking-tighter mb-4 cursor-pointer select-none hover:scale-105 transition-transform"
          style={{ textShadow: '0 0 30px rgba(229, 9, 20, 0.4)' }}
        >
          {TRANSLATIONS.fa.title}
        </h1>
        <p className="text-slate-500 text-xs md:text-sm uppercase font-black tracking-[0.5em] opacity-60 text-center">{TRANSLATIONS.fa.subtitle}</p>
      </header>

      <main>
        {view === 'mood' && <MoodSelector onComplete={getRecommendations} />}
        {view === 'loading' && <Loading />}
        {view === 'results' && <Results data={results} onReset={() => setView('mood')} />}
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}