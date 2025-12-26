import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Constants ---
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
    home: "خانه",
    history: "تاریخچه",
    profile: "پروفایل",
    settings: "تنظیمات",
    login: "ورود / ثبت‌نام",
    logout: "خروج از حساب",
    prompts: [
      "۱. حس اصلی",
      "۲. شدت فرکانس",
      "۳. سطح انرژی",
      "۴. تمرکز ذهنی",
      "۵. نوع دریافت"
    ],
    moods: {
      [PrimaryMood.SAD]: "غمگین", [PrimaryMood.CALM]: "آرام", [PrimaryMood.LONELY]: "تنها",
      [PrimaryMood.ANXIOUS]: "مضطرب", [PrimaryMood.HAPPY]: "شاد", [PrimaryMood.ANGRY]: "خشمگین",
      [PrimaryMood.ROMANTIC]: "عاشقانه", [PrimaryMood.INSPIRED]: "الهام‌بخش"
    },
    intensity: { [Intensity.LOW]: "ملایم", [Intensity.MEDIUM]: "متوسط", [Intensity.HIGH]: "شدید" },
    energy: { [EnergyLevel.LOW]: "کم", [EnergyLevel.MEDIUM]: "متوسط", [EnergyLevel.HIGH]: "زیاد" },
    mental: { [MentalState.LIGHT]: "سطحی", [MentalState.MEDIUM]: "متعادل", [MentalState.DEEP]: "عمیق" },
    rec: { [RecommendationType.QUICK]: "فوری", [RecommendationType.PACK]: "بسته مود", [RecommendationType.THERAPY]: "درمانی" },
    scanning: "در حال کالیبره کردن...",
    discover: "مشاهده نتایج",
    reset: "اسکن دوباره",
    noHistory: "هنوز تاریخچه‌ای ثبت نشده است."
  },
  en: {
    title: "MOODFLIX",
    subtitle: "Cinematic Emotional Layer Analysis",
    home: "Home",
    history: "History",
    profile: "Profile",
    settings: "Settings",
    login: "Login / Sign Up",
    logout: "Logout",
    prompts: [
      "1. Core Mood",
      "2. Intensity",
      "3. Energy",
      "4. Focus",
      "5. Delivery"
    ],
    moods: {
      [PrimaryMood.SAD]: "Sad", [PrimaryMood.CALM]: "Calm", [PrimaryMood.LONELY]: "Lonely",
      [PrimaryMood.ANXIOUS]: "Anxious", [PrimaryMood.HAPPY]: "Happy", [PrimaryMood.ANGRY]: "Angry",
      [PrimaryMood.ROMANTIC]: "Romantic", [PrimaryMood.INSPIRED]: "Inspired"
    },
    intensity: { [Intensity.LOW]: "Mild", [Intensity.MEDIUM]: "Medium", [Intensity.HIGH]: "Intense" },
    energy: { [EnergyLevel.LOW]: "Low", [EnergyLevel.MEDIUM]: "Medium", [EnergyLevel.HIGH]: "High" },
    mental: { [MentalState.LIGHT]: "Light", [MentalState.MEDIUM]: "Balanced", [MentalState.DEEP]: "Deep" },
    rec: { [RecommendationType.QUICK]: "Instant", [RecommendationType.PACK]: "Mood Pack", [RecommendationType.THERAPY]: "Therapy" },
    scanning: "Calibrating...",
    discover: "Show Results",
    reset: "Recalibrate",
    noHistory: "No history found yet."
  }
};

// --- Components ---

const Sidebar = ({ activeView, onViewChange, lang, onLangToggle, user }) => {
  const isRtl = lang === 'fa';
  const t = TRANSLATIONS[lang];

  const icons = {
    home: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    history: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    profile: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    globe: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
    auth: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
  };

  const NavItem = ({ id, icon, label }) => (
    <button
      onClick={() => onViewChange(id)}
      className={`flex flex-col lg:flex-row items-center gap-2 lg:gap-4 p-3 lg:p-4 rounded-2xl transition-all group ${
        activeView === id 
          ? 'text-white bg-red-600 shadow-lg shadow-red-600/30' 
          : 'text-slate-500 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="hidden lg:block text-xs font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-white/5 z-[100] flex justify-around p-2 pb-6">
        <NavItem id="home" icon={icons.home} label={t.home} />
        <NavItem id="history" icon={icons.history} label={t.history} />
        <NavItem id={user ? "profile" : "auth"} icon={user ? icons.profile : icons.auth} label={user ? t.profile : t.login} />
      </div>

      <div className={`hidden lg:flex fixed top-0 bottom-0 w-24 hover:w-64 transition-all duration-500 z-[100] flex-col glass-card border-none group/sidebar ${isRtl ? 'right-0' : 'left-0'}`}>
        <div className="p-8 flex items-center justify-center border-b border-white/5 mb-8">
          <h1 className="text-2xl font-black text-red-600 tracking-tighter">M</h1>
        </div>
        <nav className="flex-grow px-4 space-y-4">
          <NavItem id="home" icon={icons.home} label={t.home} />
          <NavItem id="history" icon={icons.history} label={t.history} />
          <NavItem id={user ? "profile" : "auth"} icon={user ? icons.profile : icons.auth} label={user ? t.profile : t.login} />
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={() => onLangToggle(lang === 'fa' ? 'en' : 'fa')} className="w-full flex items-center justify-center lg:justify-start gap-4 p-4 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all">
            {icons.globe}
            <span className="hidden group-hover/sidebar:block text-xs font-black uppercase tracking-widest">{lang === 'fa' ? 'English' : 'فارسی'}</span>
          </button>
        </div>
      </div>
    </>
  );
};

const AuthView = ({ lang, onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const t = TRANSLATIONS[lang];

  return (
    <div className="max-w-md mx-auto py-20 animate-fade-in px-4">
      <div className="glass-card p-10 rounded-[2.5rem] border-white/10 shadow-2xl">
        <h2 className="text-4xl font-black text-center mb-8 gradient-text">
          {isLogin ? (lang === 'fa' ? 'خوش آمدید' : 'Welcome') : (lang === 'fa' ? 'ثبت‌نام' : 'Sign Up')}
        </h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 block">{lang === 'fa' ? 'ایمیل' : 'Email'}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:border-red-600 outline-none transition-all font-bold"
              placeholder="example@mail.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 block">{lang === 'fa' ? 'رمز عبور' : 'Password'}</label>
            <input 
              type="password" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:border-red-600 outline-none transition-all font-bold"
              placeholder="••••••••"
            />
          </div>
          <button 
            onClick={() => onAuth({ email, name: email.split('@')[0] })}
            className="w-full bg-red-600 text-white font-black py-4 rounded-xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95"
          >
            {isLogin ? (lang === 'fa' ? 'ورود' : 'Login') : (lang === 'fa' ? 'ثبت‌نام' : 'Join')}
          </button>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-slate-500 font-bold text-sm hover:text-white transition-colors"
          >
            {isLogin ? (lang === 'fa' ? 'حساب ندارید؟ ثبت‌نام' : 'Need an account? Sign Up') : (lang === 'fa' ? 'قبلاً ثبت‌نام کرده‌اید؟ ورود' : 'Already have an account? Login')}
          </button>
        </div>
      </div>
    </div>
  );
};

const MoodSelector = ({ onComplete, lang }) => {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    primary: null, intensity: null, energy: null, mental: null, rec: RecommendationType.PACK
  });

  const t = TRANSLATIONS[lang];
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in px-4">
            {Object.entries(MOOD_ICONS).map(([mood, icon]) => (
              <button 
                key={mood}
                onClick={() => handleSelect('primary', mood)}
                className="glass-card p-8 rounded-[2.5rem] flex flex-col items-center gap-3 hover:scale-105 transition-all group hover:border-white/20 active:scale-95"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">{icon}</span>
                <span className="font-black text-[10px] uppercase tracking-widest opacity-60 group-hover:opacity-100">{t.moods[mood]}</span>
              </button>
            ))}
          </div>
        );
      case 2:
      case 3:
      case 4:
        const layer = [
          { key: 'intensity', options: Object.values(Intensity), trans: t.intensity },
          { key: 'energy', options: Object.values(EnergyLevel), trans: t.energy },
          { key: 'mental', options: Object.values(MentalState), trans: t.mental }
        ][step - 2];
        return (
          <div className="flex flex-col gap-3 max-w-lg mx-auto animate-fade-in w-full px-4">
            {layer.options.map((opt) => (
              <button 
                key={opt}
                onClick={() => handleSelect(layer.key, opt)}
                className="glass-card p-8 rounded-3xl text-xl font-black hover:bg-white/5 transition-all active:scale-95"
              >
                {layer.trans[opt]}
              </button>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col gap-3 max-w-lg mx-auto animate-fade-in w-full px-4">
             {Object.values(RecommendationType).map(opt => (
              <button 
                key={opt}
                onClick={() => handleSelect('rec', opt)}
                className="glass-card p-8 rounded-3xl text-xl font-black hover:bg-white/5 transition-all active:scale-95"
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
    <div className="py-12 text-center flex flex-col items-center">
      <div className="mb-12 px-4">
        <span className="text-[9px] font-black uppercase tracking-[0.8em] mb-2 block opacity-30 animate-pulse">Scanning L{step}</span>
        <h2 className="text-3xl md:text-7xl font-black tracking-tighter gradient-text leading-tight">{t.prompts[step-1]}</h2>
      </div>
      {renderStep()}
    </div>
  );
};

const Loading = ({ lang }) => (
  <div className="flex flex-col items-center justify-center py-40 animate-fade-in text-center px-4">
    <div className="relative w-32 h-32 mb-12">
      <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-red-600 font-black text-xl animate-pulse">SCAN</span>
      </div>
    </div>
    <h2 className="text-3xl font-black text-white tracking-widest uppercase">{TRANSLATIONS[lang].scanning}</h2>
  </div>
);

const Results = ({ data, onReset, lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="py-12 animate-fade-in max-w-6xl mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-8xl font-black gradient-text mb-8 tracking-tighter">{lang === 'fa' ? 'نتایج نهایی' : 'Final Results'}</h2>
        <div className="inline-block p-10 glass-card rounded-[2.5rem] relative">
          <p className="text-xl md:text-3xl text-slate-300 italic font-medium leading-relaxed max-w-3xl mx-auto"> "{data.quote}" </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
        {data.movies.map((m, i) => (
          <div key={i} className="glass-card p-10 rounded-[3rem] border-white/5 hover:border-white/20 transition-all hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-3xl md:text-5xl font-black leading-tight">{m.title}</h3>
              <span className="px-4 py-2 bg-white/5 rounded-xl text-xs font-black tracking-widest text-slate-500">{m.year}</span>
            </div>
            <p className="text-slate-400 mb-10 leading-relaxed text-lg font-medium">{m.reason}</p>
            <div className="flex items-center justify-between">
              <span className="px-5 py-2 bg-red-600/10 text-red-500 rounded-full text-xs font-black uppercase tracking-widest border border-red-600/20">IMDB: {m.rating}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center">
        <button onClick={onReset} className="text-slate-500 hover:text-white font-black uppercase tracking-[0.6em] transition-all text-sm border-b border-transparent hover:border-white pb-2">
          {t.reset}
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [view, setView] = useState('home');
  const [subView, setSubView] = useState('mood');
  const [results, setResults] = useState(null);
  const [lang, setLang] = useState('fa');
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const getRecommendations = async (selection) => {
    setSubView('loading');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      As a cinematic psychologist, suggest 2 movies based on:
      Mood: ${selection.primary}, Intensity: ${selection.intensity}, Energy: ${selection.energy}, Focus: ${selection.mental}, Mode: ${selection.rec}
      Return JSON ONLY. Lang: ${lang === 'fa' ? 'Persian' : 'English'}.
      Format: { "quote": "...", "movies": [{ "title": "...", "year": "...", "reason": "...", "rating": "..." }] }
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
      });
      const data = JSON.parse(response.text);
      setResults(data);
      setHistory(prev => [data, ...prev]);
      setSubView('results');
    } catch (e) {
      console.error(e);
      setSubView('mood');
    }
  };

  const renderContent = () => {
    if (view === 'auth') {
      return <AuthView lang={lang} onAuth={(u) => { setUser(u); setView('home'); }} />;
    }

    if (view === 'history') {
      return (
        <div className="py-20 max-w-4xl mx-auto px-4 animate-fade-in text-center">
          <h2 className="text-6xl font-black gradient-text mb-12">{TRANSLATIONS[lang].history}</h2>
          {history.length === 0 ? (
            <div className="glass-card p-20 rounded-[2rem] opacity-50">{TRANSLATIONS[lang].noHistory}</div>
          ) : (
            <div className="space-y-6">
              {history.map((h, i) => (
                <div key={i} className="glass-card p-8 rounded-[2rem] hover:bg-white/5 transition-all text-right">
                  <h3 className="text-2xl font-black mb-2">{h.movies[0].title} & {h.movies[1].title}</h3>
                  <p className="text-slate-400 italic">"{h.quote}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (view === 'profile') {
      return (
        <div className="py-24 max-w-xl mx-auto px-4 text-center animate-fade-in">
          <div className="w-24 h-24 bg-red-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-red-600/30 text-3xl font-black text-white">
             {user?.name?.[0].toUpperCase()}
          </div>
          <h2 className="text-5xl font-black gradient-text mb-4">{user?.name}</h2>
          <p className="text-slate-500 uppercase tracking-widest text-xs mb-10">{user?.email}</p>
          <button 
            onClick={() => setUser(null)}
            className="text-red-600 font-black uppercase tracking-widest text-sm hover:underline"
          >
            {TRANSLATIONS[lang].logout}
          </button>
        </div>
      );
    }

    switch (subView) {
      case 'mood': return <MoodSelector lang={lang} onComplete={getRecommendations} />;
      case 'loading': return <Loading lang={lang} />;
      case 'results': return <Results lang={lang} data={results} onReset={() => setSubView('mood')} />;
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${lang === 'fa' ? 'lg:pr-24' : 'lg:pl-24'}`}>
      <Sidebar 
        activeView={view} 
        onViewChange={setView}
        lang={lang}
        onLangToggle={setLang}
        user={user}
      />
      <header className="py-12 flex flex-col items-center">
        <h1 
          onClick={() => { setView('home'); setSubView('mood'); }} 
          className="text-6xl md:text-9xl font-black text-red-600 tracking-tighter mb-4 cursor-pointer select-none hover:scale-105 transition-transform"
          style={{ textShadow: '0 0 30px rgba(229, 9, 20, 0.4)' }}
        >
          {TRANSLATIONS[lang].title}
        </h1>
        <p className="text-slate-500 text-xs md:text-sm uppercase font-black tracking-[0.5em] opacity-60 text-center">{TRANSLATIONS[lang].subtitle}</p>
      </header>
      <main className="container mx-auto px-4 pb-32">
        {renderContent()}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);