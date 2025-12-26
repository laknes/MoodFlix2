
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// ==========================================
// 1. TYPES & ENUMS
// ==========================================

export enum PrimaryMood {
  SAD = 'sad', CALM = 'calm', LONELY = 'lonely', ANXIOUS = 'anxious',
  HAPPY = 'happy', ANGRY = 'angry', EMPTY = 'empty', HOPEFUL = 'hopeful',
  ROMANTIC = 'romantic', BORED = 'bored', TIRED = 'tired', NIHILISTIC = 'nihilistic',
  NOSTALGIC = 'nostalgic', INSPIRED = 'inspired', DREAMY = 'dreamy', EXCITED = 'excited',
  TENSE = 'tense', PLAYFUL = 'playful', GLOOMY = 'gloomy', STRESSED = 'stressed'
}

export enum RecommendationType { QUICK = 'quick', TRIPLE = 'triple', PACK = 'pack', THERAPY = 'therapy' }
export enum Intensity { LOW = 'low', MEDIUM = 'medium', HIGH = 'high' }
export enum EnergyLevel { VERY_LOW = 'very_low', LOW = 'low', MEDIUM = 'medium', HIGH = 'high' }
export enum MentalState { LIGHT = 'light', MEDIUM = 'medium', FUN = 'fun', DEEP = 'deep' }

export type IntensityLevel = 'low' | 'medium' | 'high';
export type MentalDepth = 'light' | 'medium' | 'deep';
export type EmotionalEffect = 'calming' | 'releasing' | 'motivating' | 'reflective';
export type Theme = 'dark' | 'light';
export type Language = 'fa' | 'en';
export type ContentRating = 'G' | 'PG' | 'PG-13' | 'R';

export interface User {
  id: string; name: string; email: string; age: number;
  avatar?: string; joinedAt: string; favoriteGenres: Array<string>;
  preferredActors: Array<string>; isAdmin?: boolean;
}

export interface MovieRecommendation {
  title: string; year: string; genre: string; description: string;
  whyItFits: string; rating: string; timeToWatch: string;
  category: 'SAFE' | 'CHALLENGING' | 'DEEP';
  imdb_id?: string; content_rating?: ContentRating;
  musicSuggestion?: string; spotifyLink?: string; soundcloudLink?: string;
}

export interface MoodPack {
  name: string; iconType: string; primaryMood: PrimaryMood;
  emotionalQuote: string; suggestedMusic: string;
  spotifyLink: string; soundcloudLink: string;
  movies: Array<MovieRecommendation>;
}

export interface SavedMood { date: string; mood: string; intensity: string; movieTitle: string; }

export interface AppState {
  primaryMood: PrimaryMood | null; intensity: Intensity | null;
  energy: EnergyLevel | null; mentalState: MentalState | null;
  recType: RecommendationType; avoidance: Array<string>;
}

// ==========================================
// 2. CONSTANTS & ICONS
// ==========================================

export const MOOD_COLORS: Record<string, string> = {
  sad: '#3B82F6', happy: '#F59E0B', anxious: '#F97316', angry: '#EF4444',
  bored: '#64748B', lonely: '#6366F1', romantic: '#EC4899', tired: '#8B5CF6',
  hopeful: '#10B981', nihilistic: '#1E293B', calm: '#06B6D4', empty: '#94A3B8',
  nostalgic: '#D97706', inspired: '#EAB308', dreamy: '#A78BFA', excited: '#F472B6',
  tense: '#475569', playful: '#FCD34D', gloomy: '#1E293B', stressed: '#DC2626'
};

const MinimalIcon = ({ children }: { children: React.ReactNode }) => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const MOOD_ICONS: Record<string, React.ReactNode> = {
  sad: <MinimalIcon><path d="M7 10h.01M17 10h.01M12 18c-2 0-3-1-3-1m6 1s-1-1-3-1"/></MinimalIcon>,
  happy: <MinimalIcon><path d="M7 10h.01M17 10h.01M8 15s1.5 2 4 2 4-2 4-2"/></MinimalIcon>,
  anxious: <MinimalIcon><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/></MinimalIcon>,
  angry: <MinimalIcon><path d="m7 7 10 10M17 7 7 17"/></MinimalIcon>,
  bored: <MinimalIcon><path d="M5 12h14"/></MinimalIcon>,
  lonely: <MinimalIcon><circle cx="12" cy="12" r="1"/><circle cx="12" cy="12" r="10" opacity="0.1"/></MinimalIcon>,
  romantic: <MinimalIcon><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></MinimalIcon>,
  tired: <MinimalIcon><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></MinimalIcon>,
  hopeful: <MinimalIcon><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5"/></MinimalIcon>,
  nihilistic: <MinimalIcon><circle cx="12" cy="12" r="10"/><path d="M12 12h.01"/></MinimalIcon>,
  calm: <MinimalIcon><path d="M4 12h16"/></MinimalIcon>,
  empty: <MinimalIcon><circle cx="12" cy="12" r="10" strokeDasharray="2 4"/></MinimalIcon>,
  nostalgic: <MinimalIcon><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></MinimalIcon>,
  inspired: <MinimalIcon><path d="M12 2v2M12 20v2"/><circle cx="12" cy="12" r="4"/></MinimalIcon>,
  dreamy: <MinimalIcon><path d="M12 2v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/><circle cx="12" cy="12" r="4" opacity="0.3"/></MinimalIcon>,
  excited: <MinimalIcon><path d="m13 2-2 20h2L11 2zM17 7l-10 10M17 17 7 7"/></MinimalIcon>,
  tense: <MinimalIcon><path d="M4 4l16 16M4 20L20 4"/></MinimalIcon>,
  playful: <MinimalIcon><circle cx="8" cy="8" r="2"/><circle cx="16" cy="16" r="2"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/></MinimalIcon>,
  gloomy: <MinimalIcon><path d="M12 12c-4 0-7 3-7 7h14c0-4-3-7-7-7z"/></MinimalIcon>,
  stressed: <MinimalIcon><path d="M12 8v4M12 16h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></MinimalIcon>
};

export const REC_TYPE_ICONS: Record<string, React.ReactNode> = {
  quick: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  triple: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" /></svg>,
  pack: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2" /></svg>,
  therapy: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
};

// ==========================================
// 3. TRANSLATIONS
// ==========================================

export const translations = {
  fa: {
    title: "MOODFLIX", subtitle: "تحلیل سینمایی هوشمند", analyzing: "در حال آنالیز...",
    logout: "خروج", moodPrompt: "۱. حس اصلی شما؟", intensityPrompt: "۲. شدت این حس؟",
    energyPrompt: "۳. سطح انرژی فیزیکی؟", mentalPrompt: "۴. عمق تمرکز ذهنی؟",
    recTypePrompt: "۵. سبک پیشنهاد؟", discover: "مشاهده نتایج نهایی", skipButton: "سورپرایزم کن!",
    historyTitle: "تاریخچه مودهای شما", home: "خانه", history: "تاریخچه", profile: "پروفایل",
    admin: "پنل مدیریت", settings: "تنظیمات", darkMode: "تاریک", lightMode: "روشن", language: "زبان",
    categories: { SAFE: "انتخاب امن", CHALLENGING: "چالش برانگیز", DEEP: "سفر عمیق" },
    moods: { sad: "غمگین", calm: "آرام", lonely: "تنها", anxious: "مضطرب", happy: "شاد", angry: "خشمگین", empty: "پوچ", hopeful: "امیدوار", romantic: "عاشقانه", bored: "بی‌حوصله", tired: "خسته", nihilistic: "نیهیلیست", nostalgic: "نوستالژیک", inspired: "الهام‌بخش", dreamy: "رویایی", excited: "هیجان‌زده", tense: "پرتنش", playful: "شوخ‌طبع", gloomy: "تاریک", stressed: "پراسترس" },
    intensityLevels: { low: "ملایم", medium: "متوسط", high: "شدید" },
    energyLevels: { very_low: "خیلی کم", low: "کم", medium: "متوسط", high: "زیاد" },
    mentalStates: { light: "سطحی", medium: "متعادل", fun: "شاد", deep: "عمیق" },
    recTypes: { quick: "سریع", triple: "سه‌گانه", pack: "بسته کامل", therapy: "سینمادرمانی" },
    scanningMessages: ["اسکن فرکانس‌ها..."], layerInsights: { primary: "حس پایه که اتمسفر را می‌سازد." },
    bestTime: "زمان تماشا:", ageRestrictionNotice: "محدودیت سنی فعال شد.", saveToFav: "ذخیره", removeFromFav: "حذف",
    shareTwitter: "توییتر", shareFacebook: "فیس‌بوک", copyLink: "کپی لینک", copied: "کپی شد!", shareMovie: "اشتراک",
    listenOnSpotify: "اسپاتیفای", listenOnSoundcloud: "سوندکلاود", musicAtmosphere: "موسیقی پیشنهادی", shareVibe: "اشتراک مود",
    reset: "تست دوباره"
  },
  en: {
    title: "MOODFLIX", subtitle: "AI Movie Intelligence", analyzing: "Analyzing...",
    logout: "Logout", moodPrompt: "1. Core Mood", intensityPrompt: "2. Feeling Intensity",
    energyPrompt: "3. Physical Energy", mentalPrompt: "4. Mental Depth",
    recTypePrompt: "5. Delivery Style", discover: "Show Final Matches", skipButton: "Surprise Me!",
    historyTitle: "Your recent vibes", home: "Home", history: "History", profile: "Profile",
    admin: "Admin Panel", settings: "Settings", darkMode: "Dark", lightMode: "Light", language: "Language",
    categories: { SAFE: "Safe Choice", CHALLENGING: "Challenging", DEEP: "Deep Dive" },
    moods: { sad: "Sad", calm: "Calm", lonely: "Lonely", anxious: "Anxious", happy: "Happy", angry: "Angry", empty: "Empty", hopeful: "Hopeful", romantic: "Romantic", bored: "Bored", tired: "Tired", nihilistic: "Nihilistic", nostalgic: "Nostalgic", inspired: "Inspired", dreamy: "Dreamy", excited: "Excited", tense: "Tense", playful: "Playful", gloomy: "Gloomy", stressed: "Stressed" },
    intensityLevels: { low: "Gentle", medium: "Medium", high: "Intense" },
    energyLevels: { very_low: "Very Low", low: "Low", medium: "Medium", high: "High" },
    mentalStates: { light: "Light", medium: "Balanced", fun: "Fun", deep: "Deep" },
    recTypes: { quick: "Quick", triple: "Triple", pack: "Full Pack", therapy: "Therapy" },
    scanningMessages: ["Scanning..."], layerInsights: { primary: "The base frequency." },
    bestTime: "Best time:", ageRestrictionNotice: "Age restrictions applied.", saveToFav: "Save", removeFromFav: "Remove",
    shareTwitter: "Twitter", shareFacebook: "Facebook", copyLink: "Copy Link", copied: "Copied!", shareMovie: "Share",
    listenOnSpotify: "Spotify", listenOnSoundcloud: "SoundCloud", musicAtmosphere: "Music atmosphere", shareVibe: "Share vibe",
    reset: "Test again"
  }
};

// ==========================================
// 4. SERVICES
// ==========================================

export const getHistory = async (userId: string): Promise<Array<SavedMood>> => {
  const response = await fetch(`/api/history?userId=${userId}`);
  return response.json();
};

export const saveHistory = async (entry: any): Promise<void> => {
  await fetch('/api/history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) });
};

export const getMovieRecommendations = async (state: AppState, language: Language, user: User | null): Promise<MoodPack | null> => {
  try {
    const response = await fetch('/api/recommendations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...state, language, userContext: user ? { age: user.age, name: user.name } : null })
    });
    const data = await response.json();
    return {
      name: data.packTitle || "Mood Pack",
      iconType: 'sparkles',
      primaryMood: state.primaryMood as any,
      emotionalQuote: data.quote,
      suggestedMusic: "Cinematic Atmosphere",
      spotifyLink: "#", soundcloudLink: "#",
      movies: data.movies.map((m: any) => ({ ...m, category: m.category || 'SAFE', whyItFits: m.reason, timeToWatch: "Tonight" }))
    };
  } catch (e) { return null; }
};

// ==========================================
// 5. COMPONENTS
// ==========================================

const Sidebar: React.FC<any> = ({ theme, language, user, onThemeToggle, onLangToggle, activeView, onViewChange }) => {
  const t = translations[language];
  const isRtl = language === 'fa';
  return (
    <div className={`fixed ${isRtl ? 'right-0' : 'left-0'} top-0 bottom-0 w-24 bg-black/40 backdrop-blur-xl border-x border-white/5 z-50 flex flex-col items-center py-8 gap-8`}>
      <h2 className="text-red-600 font-black text-2xl tracking-tighter">M</h2>
      <button onClick={() => onViewChange('home')} className={`p-4 rounded-xl ${activeView === 'home' ? 'text-red-600 bg-red-600/10' : 'text-slate-500 hover:text-white'}`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      </button>
      <button onClick={() => onViewChange('history')} className={`p-4 rounded-xl ${activeView === 'history' ? 'text-red-600 bg-red-600/10' : 'text-slate-500 hover:text-white'}`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </button>
      <button onClick={() => onViewChange('profile')} className={`p-4 rounded-xl ${activeView === 'profile' ? 'text-red-600 bg-red-600/10' : 'text-slate-500 hover:text-white'}`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      </button>
      <div className="mt-auto flex flex-col gap-4">
        <button onClick={onThemeToggle} className="text-slate-500 hover:text-white transition-colors">
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
        <button onClick={() => onLangToggle(language === 'fa' ? 'en' : 'fa')} className="text-slate-500 hover:text-white font-black text-xs">
          {language === 'fa' ? 'EN' : 'FA'}
        </button>
      </div>
    </div>
  );
};

const MoodSelector: React.FC<any> = ({ onComplete, language }) => {
  const [step, setStep] = useState(1);
  const t = translations[language];
  const [selection, setSelection] = useState<AppState>({ primaryMood: null, intensity: null, energy: null, mentalState: null, recType: RecommendationType.PACK, avoidance: [] });

  const handleSelect = (key: string, value: any) => {
    const next = { ...selection, [key]: value };
    setSelection(next);
    if (step < 5) setStep(step + 1);
    else onComplete(next);
  };

  const renderStep = () => {
    if (step === 1) return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Object.values(PrimaryMood).map(m => (
          <button key={m} onClick={() => handleSelect('primaryMood', m)} className="glass-card p-6 rounded-3xl hover:scale-105 transition-all flex flex-col items-center gap-2 group">
             <div style={{ color: MOOD_COLORS[m] }} className="opacity-60 group-hover:opacity-100">{MOOD_ICONS[m]}</div>
             <span className="text-[10px] font-black uppercase opacity-40">{t.moods[m]}</span>
          </button>
        ))}
      </div>
    );
    // Generic step renderer for 2, 3, 4
    const layer = [
      { key: 'intensity', prompt: t.intensityPrompt, options: Object.values(Intensity), trans: t.intensityLevels },
      { key: 'energy', prompt: t.energyPrompt, options: Object.values(EnergyLevel), trans: t.energyLevels },
      { key: 'mentalState', prompt: t.mentalPrompt, options: Object.values(MentalState), trans: t.mentalStates }
    ][step - 2];

    if (step < 5) return (
      <div className="max-w-xl mx-auto text-center space-y-8">
        <h2 className="text-4xl font-black gradient-text">{layer.prompt}</h2>
        <div className="flex flex-col gap-3">
          {layer.options.map(o => (
            <button key={o} onClick={() => handleSelect(layer.key, o)} className="glass-card p-6 rounded-2xl text-xl font-black hover:bg-white/5 transition-all">
              {(layer.trans as any)[o]}
            </button>
          ))}
        </div>
      </div>
    );

    return (
       <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-black gradient-text">{t.recTypePrompt}</h2>
          <div className="grid grid-cols-2 gap-4">
             {Object.values(RecommendationType).map(type => (
                <button key={type} onClick={() => handleSelect('recType', type)} className="glass-card p-8 rounded-3xl flex flex-col items-center gap-4 hover:border-red-600/50 transition-all">
                   {REC_TYPE_ICONS[type]}
                   <span className="font-black uppercase text-xs">{t.recTypes[type]}</span>
                </button>
             ))}
          </div>
       </div>
    );
  };

  return <div className="py-12 animate-fade-in">{renderStep()}</div>;
};

const RecommendationDisplay: React.FC<any> = ({ pack, onReset, language }) => {
  const t = translations[language];
  const color = MOOD_COLORS[pack.primaryMood] || '#E50914';
  const [activeShare, setActiveShare] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const getShareText = (movie?: MovieRecommendation) => {
    if (movie) {
      return language === 'fa' 
        ? `🎬 پیشنهاد فیلم بر اساس مود من: ${movie.title} (${movie.year})\n✨ تحلیل شده توسط MOODFLIX\n#سینما #مودفلیکس`
        : `🎬 Movie recommendation for my vibe: ${movie.title} (${movie.year})\n✨ Analyzed by MOODFLIX\n#Cinema #Moodflix`;
    }
    return language === 'fa'
      ? `🌙 مود الان من: ${pack.name}\n🎬 فیلم پیشنهادی: ${pack.movies[0].title}\n✨ کشف شده در MOODFLIX`
      : `🌙 My current vibe: ${pack.name}\n🎬 Featured movie: ${pack.movies[0].title}\n✨ Discovered on MOODFLIX`;
  };

  const shareTwitter = (movie?: MovieRecommendation) => {
    const text = getShareText(movie);
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareFacebook = (movie?: MovieRecommendation) => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const copyToClipboard = (movie?: MovieRecommendation) => {
    const text = getShareText(movie);
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(movie ? movie.title : 'pack');
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  return (
    <div className="space-y-12 animate-fade-in">
       <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <h2 className="text-5xl font-black gradient-text">{pack.name}</h2>
            <div className="relative">
               <button 
                onClick={() => setActiveShare(activeShare === 'pack' ? null : 'pack')}
                className="p-3 glass-card rounded-full text-slate-500 hover:text-white transition-all"
               >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
               </button>
               {activeShare === 'pack' && (
                 <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 glass-card p-2 rounded-2xl flex gap-2 z-50 animate-fade-in whitespace-nowrap">
                   <button onClick={() => shareTwitter()} className="p-2 hover:bg-white/5 rounded-xl text-[#1DA1F2]" title={t.shareTwitter}>
                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                   </button>
                   <button onClick={() => shareFacebook()} className="p-2 hover:bg-white/5 rounded-xl text-[#4267B2]" title={t.shareFacebook}>
                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                   </button>
                   <button onClick={() => copyToClipboard()} className={`p-2 hover:bg-white/5 rounded-xl transition-colors ${copyFeedback === 'pack' ? 'text-green-500' : 'text-slate-500'}`} title={t.copyLink}>
                      {copyFeedback === 'pack' ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      )}
                   </button>
                 </div>
               )}
            </div>
          </div>
          <p className="text-xl italic opacity-70">"{pack.emotionalQuote}"</p>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pack.movies.map((m: any, i: number) => (
            <div key={i} className="glass-card rounded-[2rem] overflow-hidden flex flex-col border-white/5 hover:border-red-600/30 transition-all relative group">
               <div className="h-64 bg-slate-900 relative">
                  <img src={`https://picsum.photos/seed/${m.title}/500/800`} className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                     <div>
                        <h3 className="text-2xl font-black">{m.title}</h3>
                        <p className="text-xs opacity-60">{m.year} • {m.genre}</p>
                     </div>
                     <div className="relative">
                        <button 
                          onClick={() => setActiveShare(activeShare === m.title ? null : m.title)}
                          className="p-2 bg-black/40 backdrop-blur-md rounded-lg text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                        {activeShare === m.title && (
                          <div className="absolute bottom-full mb-2 right-0 glass-card p-1.5 rounded-xl flex gap-1 z-50 animate-fade-in shadow-2xl">
                            <button onClick={() => shareTwitter(m)} className="p-2 hover:bg-white/5 rounded-lg text-[#1DA1F2]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></button>
                            <button onClick={() => shareFacebook(m)} className="p-2 hover:bg-white/5 rounded-lg text-[#4267B2]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></button>
                            <button onClick={() => copyToClipboard(m)} className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${copyFeedback === m.title ? 'text-green-500' : 'text-white/70'}`}>
                               {copyFeedback === m.title ? (
                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                               ) : (
                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                               )}
                            </button>
                          </div>
                        )}
                     </div>
                  </div>
               </div>
               <div className="p-6 flex-grow space-y-4">
                  <p className="text-sm opacity-80 leading-relaxed">{m.description}</p>
                  <p className="text-xs italic" style={{ color: color }}>{m.whyItFits}</p>
               </div>
            </div>
          ))}
       </div>
       <div className="text-center pt-8">
          <button onClick={onReset} className="px-10 py-4 glass-card rounded-2xl text-slate-500 font-black hover:text-white hover:border-red-600/50 transition-all uppercase tracking-widest text-xs">
            {t.reset}
          </button>
       </div>
    </div>
  );
};

// ==========================================
// 6. MAIN APP
// ==========================================

const LoadingState: React.FC<{ language: Language }> = ({ language }) => (
  <div className="flex flex-col items-center justify-center py-24 min-h-[60vh] text-center">
    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-8"></div>
    <h2 className="text-3xl font-black text-white">{translations[language].analyzing}</h2>
  </div>
);

const App: React.FC = () => {
  const [pack, setPack] = useState<MoodPack | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<SavedMood>>([]);
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('fa');
  const [view, setView] = useState<'home' | 'history' | 'profile' | 'auth'>('home');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('moodflix_theme') as Theme || 'dark';
    const savedLang = localStorage.getItem('moodflix_lang') as Language || 'fa';
    const savedUser = localStorage.getItem('moodflix_user');
    setTheme(savedTheme); setLanguage(savedLang);
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
        getHistory(u.id).then(setHistory);
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('moodflix_theme', theme);
    localStorage.setItem('moodflix_lang', language);
  }, [theme, language]);

  const handleSelection = async (selection: AppState) => {
    setLoading(true);
    const result = await getMovieRecommendations(selection, language, user);
    if (result) {
      setPack(result);
      if (user && selection.primaryMood) {
        const entry = { userId: user.id, mood: selection.primaryMood, intensity: selection.intensity || 'medium', movieTitle: result.movies[0].title, date: new Date().toLocaleDateString() };
        await saveHistory(entry);
        getHistory(user.id).then(setHistory);
      }
    }
    setLoading(false);
  };

  const renderContent = () => {
    if (loading) return <LoadingState language={language} />;
    if (view === 'history') return (
       <div className="max-w-4xl mx-auto py-12 space-y-6">
          <h2 className="text-4xl font-black text-center mb-12">{translations[language].historyTitle}</h2>
          {history.length === 0 ? <p className="text-center opacity-40">No entries yet.</p> : history.map((h, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl flex justify-between items-center">
               <div>
                  <p className="font-black">{translations[language].moods[h.mood as keyof typeof translations.fa.moods]}</p>
                  <p className="text-xs opacity-50">{h.date}</p>
               </div>
               <p className="font-black text-red-600">{h.movieTitle}</p>
            </div>
          ))}
       </div>
    );
    if (pack) return <RecommendationDisplay pack={pack} onReset={() => setPack(null)} language={language} />;
    return <MoodSelector onComplete={handleSelection} language={language} />;
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 flex flex-col ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar theme={theme} language={language} user={user} onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} onLangToggle={setLanguage} activeView={view} onViewChange={setView} />
      <div className={`flex-grow px-4 md:px-12 pb-24 ${language === 'fa' ? 'lg:pr-32' : 'lg:pl-32'}`}>
        <header className="py-12 flex flex-col items-center">
           <h1 onClick={() => { setView('home'); setPack(null); }} className="text-6xl font-black text-red-600 tracking-tighter cursor-pointer">{translations[language].title}</h1>
           <p className="text-slate-500 text-xs uppercase tracking-[0.5em] mt-2 font-black opacity-60">{translations[language].subtitle}</p>
        </header>
        <main className="max-w-6xl mx-auto">{renderContent()}</main>
      </div>
      <style>{`
        .gradient-text { background: linear-gradient(to bottom right, #ffffff 40%, #64748b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .glass-card { background: rgba(255, 255, 255, 0.015); backdrop-filter: blur(40px) saturate(180%); -webkit-backdrop-filter: blur(40px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.05); }
      `}</style>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
