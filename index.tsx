
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- TYPES ---
enum PrimaryMood {
  SAD = 'sad', CALM = 'calm', LONELY = 'lonely', ANXIOUS = 'anxious',
  HAPPY = 'happy', ANGRY = 'angry', EMPTY = 'empty', HOPEFUL = 'hopeful',
  ROMANTIC = 'romantic', BORED = 'bored', TIRED = 'tired', NIHILISTIC = 'nihilistic'
}

enum RecommendationType { QUICK = 'quick', TRIPLE = 'triple', PACK = 'pack', THERAPY = 'therapy' }
enum Intensity { LOW = 'low', MEDIUM = 'medium', HIGH = 'high' }
enum EnergyLevel { VERY_LOW = 'very_low', LOW = 'low', MEDIUM = 'medium', HIGH = 'high' }
enum MentalState { LIGHT = 'light', MEDIUM = 'medium', FUN = 'fun', DEEP = 'deep' }

interface MovieRecommendation {
  title: string; year: string; genre: string; description: string;
  whyItFits: string; rating: string; timeToWatch: string;
  category: 'SAFE' | 'CHALLENGING' | 'DEEP'; imdb_id?: string;
}

interface MoodPack {
  name: string; iconType: string; primaryMood: PrimaryMood;
  emotionalQuote: string; suggestedMusic: string; spotifyLink: string;
  soundcloudLink: string; movies: MovieRecommendation[];
}

// --- CONSTANTS ---
const MOOD_COLORS: Record<PrimaryMood, string> = {
  [PrimaryMood.SAD]: '#3b82f6', [PrimaryMood.HAPPY]: '#facc15',
  [PrimaryMood.ANXIOUS]: '#f97316', [PrimaryMood.ANGRY]: '#dc2626',
  [PrimaryMood.BORED]: '#92400e', [PrimaryMood.LONELY]: '#6366f1',
  [PrimaryMood.ROMANTIC]: '#ec4899', [PrimaryMood.TIRED]: '#a855f7',
  [PrimaryMood.HOPEFUL]: '#06b6d4', [PrimaryMood.NIHILISTIC]: '#475569',
  [PrimaryMood.CALM]: '#10b981', [PrimaryMood.EMPTY]: '#94a3b8'
};

const MOOD_ICONS: Record<PrimaryMood, React.ReactNode> = {
  [PrimaryMood.SAD]: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14H14M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [PrimaryMood.HAPPY]: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  [PrimaryMood.ANXIOUS]: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  [PrimaryMood.ANGRY]: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  [PrimaryMood.BORED]: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 12H6" /><circle cx="12" cy="12" r="9" strokeWidth={1.5} /></svg>,
  [PrimaryMood.LONELY]: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  [PrimaryMood.ROMANTIC]: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  [PrimaryMood.TIRED]: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  [PrimaryMood.HOPEFUL]: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>,
  [PrimaryMood.NIHILISTIC]: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeWidth={1.5} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0" /></svg>,
  [PrimaryMood.CALM]: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2M4 13H6m4 0v4a2 2 0 002 2h0a2 2 0 002-2v-4m-4 0h4" /></svg>,
  [PrimaryMood.EMPTY]: <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeWidth={1.5} strokeDasharray="4 4" /></svg>
};

const REC_TYPE_ICONS: Record<RecommendationType, React.ReactNode> = {
  [RecommendationType.QUICK]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  [RecommendationType.TRIPLE]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  [RecommendationType.PACK]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  [RecommendationType.THERAPY]: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
};

// --- TRANSLATIONS (Simplified inline) ---
const translations = {
  fa: {
    title: "MOODFLIX", subtitle: "لایه‌های احساسی سینما",
    moodPrompt: "لایه اول: احساس اصلی شما؟", intensityPrompt: "لایه دوم: شدت احساس؟",
    energyPrompt: "لایه سوم: سطح انرژی؟", mentalPrompt: "لایه چهارم: عمق تمرکز؟",
    recTypePrompt: "لایه آخر: سبک پیشنهاد؟", discover: "نمایش فرکانس نهایی",
    analyzing: "در حال آنالیز لایه‌ها...", reset: "تغییر لایه‌ها",
    moods: {
        sad: "غمگین", happy: "شاد", anxious: "مضطرب", angry: "عصبانی", bored: "بی‌حوصله",
        lonely: "تنها", romantic: "عاشقانه", tired: "خسته", hopeful: "امیدوار", nihilistic: "پوچ‌گرا",
        calm: "آرام", empty: "پوچ"
    },
    intensityLevels: { low: "ملایم", medium: "متوسط", high: "شدید" },
    energyLevels: { very_low: "خیلی کم", low: "کم", medium: "متوسط", high: "پرانرژی" },
    mentalStates: { light: "سرگرمی", medium: "متعادل", fun: "شاد", deep: "عمیق" },
    recTypes: { quick: "سریع", triple: "سه‌گانه", pack: "بسته مود", therapy: "سینمادرمانی" }
  }
};

// --- COMPONENTS ---
const App = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<MoodPack | null>(null);
  const [selection, setSelection] = useState({
    primaryMood: null as PrimaryMood | null,
    intensity: null as Intensity | null,
    energy: null as EnergyLevel | null,
    mentalState: null as MentalState | null,
    recType: RecommendationType.PACK
  });

  const t = translations.fa;
  const activeColor = selection.primaryMood ? MOOD_COLORS[selection.primaryMood] : '#E50914';

  useEffect(() => {
    if (selection.primaryMood) {
      document.body.style.setProperty('--bg-gradient', `radial-gradient(circle at 50% -20%, ${MOOD_COLORS[selection.primaryMood]}33 0%, #050505 80%)`);
    }
  }, [selection.primaryMood]);

  const handleSelect = (key: string, value: any) => {
    setSelection(prev => ({ ...prev, [key]: value }));
    if (step < 5) setStep(s => s + 1);
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Suggest 3 movies for a user in this state: 
      Mood: ${selection.primaryMood}, Intensity: ${selection.intensity}, Energy: ${selection.energy}, Mental State: ${selection.mentalState}.
      Delivery Type: ${selection.recType}.
      Return JSON with fields: emotionalQuote, packTitle, movies (array of 3: title, year, genre, description, whyItFits, rating, timeToWatch, category).
      Language: Persian (Farsi).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    emotionalQuote: { type: Type.STRING },
                    packTitle: { type: Type.STRING },
                    movies: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                year: { type: Type.STRING },
                                genre: { type: Type.STRING },
                                description: { type: Type.STRING },
                                whyItFits: { type: Type.STRING },
                                rating: { type: Type.STRING },
                                timeToWatch: { type: Type.STRING },
                                category: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        }
      });
      
      const data = JSON.parse(response.text);
      setPack({
        name: data.packTitle || "فرکانس اختصاصی شما",
        iconType: 'sparkles',
        primaryMood: selection.primaryMood!,
        emotionalQuote: data.emotionalQuote,
        suggestedMusic: "موسیقی متن متناسب با لایه‌های روحی شما",
        spotifyLink: "#", soundcloudLink: "#",
        movies: data.movies
      });
    } catch (e) {
      console.error(e);
      alert("خطا در ارتباط با هوش مصنوعی");
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen animate-fade-in">
        <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-8"></div>
        <h2 className="text-4xl font-black">{t.analyzing}</h2>
    </div>
  );

  if (pack) return (
    <div className="max-w-7xl mx-auto py-20 px-4 animate-fade-in">
        <div className="text-center mb-16">
            <h2 className="text-6xl font-black mb-4" style={{ color: activeColor }}>{pack.name}</h2>
            <p className="text-2xl italic opacity-70">" {pack.emotionalQuote} "</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pack.movies.map((m, i) => (
                <div key={i} className="glass-card p-8 rounded-[2.5rem] border-white/10 hover:border-red-600/30 transition-all transform hover:-translate-y-2">
                    <h3 className="text-3xl font-black mb-2">{m.title}</h3>
                    <p className="text-red-500 font-bold mb-4">{m.year} • {m.genre}</p>
                    <p className="opacity-80 mb-6 leading-relaxed">{m.description}</p>
                    <div className="bg-white/5 p-4 rounded-xl text-sm italic border border-white/5" style={{ color: activeColor }}>{m.whyItFits}</div>
                </div>
            ))}
        </div>
        <div className="text-center mt-20">
            <button onClick={() => { setPack(null); setStep(1); }} className="text-slate-500 hover:text-white transition-colors underline">{t.reset}</button>
        </div>
    </div>
  );

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-5xl">
                {Object.values(PrimaryMood).map(mood => (
                    <button key={mood} onClick={() => handleSelect('primaryMood', mood)} className="glass-card p-10 rounded-[2.5rem] flex flex-col items-center gap-4 hover:scale-105 transition-all group border-white/5 hover:border-white/20">
                        <div className="text-slate-400 group-hover:text-red-600 transition-colors">{MOOD_ICONS[mood]}</div>
                        <span className="font-black text-lg uppercase tracking-widest">{t.moods[mood]}</span>
                    </button>
                ))}
            </div>
        );
      case 2:
      case 3:
      case 4:
        const layer = [
            { key: 'intensity', prompt: t.intensityPrompt, opts: Object.values(Intensity), trans: t.intensityLevels },
            { key: 'energy', prompt: t.energyPrompt, opts: Object.values(EnergyLevel), trans: t.energyLevels },
            { key: 'mentalState', prompt: t.mentalPrompt, opts: Object.values(MentalState), trans: t.mentalStates }
        ][step-2];
        return (
            <div className="flex flex-col gap-6 w-full max-w-xl">
                <h2 className="text-4xl md:text-6xl font-black text-center mb-12">{layer.prompt}</h2>
                {layer.opts.map(opt => (
                    <button key={opt} onClick={() => handleSelect(layer.key, opt)} className="glass-card p-10 rounded-[2.5rem] text-3xl font-black hover:bg-white/5 transition-all border-white/5 hover:border-red-600/30">
                        {(layer.trans as any)[opt]}
                    </button>
                ))}
            </div>
        );
      case 5:
        return (
            <div className="flex flex-col gap-8 w-full max-w-4xl">
                <h2 className="text-4xl md:text-6xl font-black text-center mb-12">{t.recTypePrompt}</h2>
                <div className="grid grid-cols-2 gap-6">
                    {Object.values(RecommendationType).map(rt => (
                        <button key={rt} onClick={() => handleSelect('recType', rt)} className="glass-card p-10 rounded-[2.5rem] flex flex-col items-center gap-4 group border-white/5 hover:border-red-600/30">
                            <div className="text-slate-400 group-hover:text-red-600">{REC_TYPE_ICONS[rt]}</div>
                            <span className="font-black text-xl">{t.recTypes[rt]}</span>
                        </button>
                    ))}
                </div>
                <button onClick={getRecommendations} className="mt-12 bg-red-600 text-white p-8 rounded-full text-3xl font-black shadow-2xl hover:scale-105 transition-all">{t.discover}</button>
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4">
        <header className="text-center mb-20 animate-fade-in">
            <h1 className="text-6xl md:text-9xl netflix-logo netflix-red mb-2">{t.title}</h1>
            <p className="text-sm md:text-xl tracking-[0.4em] opacity-50 uppercase font-bold">{t.subtitle}</p>
        </header>
        <main className="w-full flex justify-center animate-fade-in">
            {renderStep()}
        </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
