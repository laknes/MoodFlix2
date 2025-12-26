
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

export interface SavedMood { id?: string; userId: string; date: string; mood: string; intensity: string; movieTitle: string; timestamp?: string; }

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
    login: "ورود", signup: "ثبت‌نام", email: "ایمیل", password: "رمز عبور", fullName: "نام و نام خانوادگی",
    confirmPassword: "تایید رمز عبور", age: "سن شما", logout: "خروج", moodPrompt: "۱. حس اصلی شما؟",
    intensityPrompt: "۲. شدت این حس؟", energyPrompt: "۳. سطح انرژی فیزیکی؟", mentalPrompt: "۴. عمق تمرکز ذهنی؟",
    recTypePrompt: "۵. سبک پیشنهاد؟", discover: "مشاهده نتایج نهایی", skipButton: "سورپرایزم کن!",
    historyTitle: "تاریخچه مودهای شما", home: "خانه", history: "تاریخچه", profile: "پروفایل",
    admin: "پنل مدیریت", settings: "تنظیمات", darkMode: "تاریک", lightMode: "روشن", language: "زبان",
    categories: { SAFE: "انتخاب امن", CHALLENGING: "چالش برانگیز", DEEP: "سفر عمیق" },
    moods: { sad: "غمگین", calm: "آرام", lonely: "تنها", anxious: "مضطرب", happy: "شاد", angry: "خشمگین", empty: "پوچ", hopeful: "امیدوار", romantic: "عاشقانه", bored: "بی‌حوصله", tired: "خسته", nihilistic: "نیهیلیست", nostalgic: "نوستالژیک", inspired: "الهام‌بخش", dreamy: "رویایی", excited: "هیجان‌زده", tense: "پرتنش", playful: "شوخ‌طبع", gloomy: "تاریک", stressed: "پراسترس" },
    intensityLevels: { low: "ملایم", medium: "متوسط", high: "شدید" },
    energyLevels: { very_low: "خیلی کم", low: "کم", medium: "متوسط", high: "زیاد" },
    mentalStates: { light: "سطحی", medium: "متعادل", fun: "شاد", deep: "عمیق" },
    recTypes: { quick: "سریع", triple: "سه‌گانه", pack: "بسته کامل", therapy: "سینمادرمانی" },
    validation: {
      emailInvalid: "ایمیل معتبر نیست",
      passwordShort: "رمز عبور باید حداقل ۶ کاراکتر باشد",
      passwordMismatch: "رمز عبور و تایید آن مطابقت ندارند",
      nameRequired: "نام الزامی است",
      ageRequired: "سن الزامی است",
      ageRange: "سن باید بین ۱ تا ۱۲۰ باشد",
      strengthWeak: "ضعیف",
      strengthMedium: "متوسط",
      strengthStrong: "قوی"
    },
    scanningMessages: ["اسکن فرکانس‌ها..."], layerInsights: { primary: "حس پایه که اتمسفر را می‌سازد." },
    bestTime: "زمان تماشا:", ageRestrictionNotice: "محدودیت سنی فعال شد.", saveToFav: "ذخیره", removeFromFav: "حذف",
    shareTwitter: "توییتر", shareFacebook: "فیس‌بوک", copyLink: "کپی لینک", copied: "کپی شد!", shareMovie: "اشتراک",
    listenOnSpotify: "اسپاتیفای", listenOnSoundcloud: "سوندکلاود", musicAtmosphere: "موسیقی پیشنهادی", shareVibe: "اشتراک مود",
    reset: "تست دوباره", saveChanges: "ذخیره تغییرات", adminDash: "داشبورد مدیریت"
  },
  en: {
    title: "MOODFLIX", subtitle: "AI Movie Intelligence", analyzing: "Analyzing...",
    login: "Login", signup: "Sign Up", email: "Email", password: "Password", fullName: "Full Name",
    confirmPassword: "Confirm Password", age: "Your Age", logout: "Logout", moodPrompt: "1. Core Mood",
    intensityPrompt: "2. Feeling Intensity", energyPrompt: "3. Physical Energy", mentalPrompt: "4. Mental Depth",
    recTypePrompt: "5. Delivery Style", discover: "Show Final Matches", skipButton: "Surprise Me!",
    historyTitle: "Your recent vibes", home: "Home", history: "History", profile: "Profile",
    admin: "Admin Panel", settings: "Settings", darkMode: "Dark", lightMode: "Light", language: "Language",
    categories: { SAFE: "Safe Choice", CHALLENGING: "Challenging", DEEP: "Deep Dive" },
    moods: { sad: "Sad", calm: "Calm", lonely: "Lonely", anxious: "Anxious", happy: "Happy", angry: "Angry", empty: "Empty", hopeful: "Hopeful", romantic: "Romantic", bored: "Bored", tired: "Tired", nihilistic: "Nihilistic", nostalgic: "Nostalgic", inspired: "Inspired", dreamy: "Dreamy", excited: "Excited", tense: "Tense", playful: "Playful", gloomy: "Gloomy", stressed: "Stressed" },
    intensityLevels: { low: "Gentle", medium: "Medium", high: "Intense" },
    energyLevels: { very_low: "Very Low", low: "Low", medium: "Medium", high: "High" },
    mentalStates: { light: "Light", medium: "Balanced", fun: "Fun", deep: "Deep" },
    recTypes: { quick: "Quick", triple: "Triple", pack: "Full Pack", therapy: "Therapy" },
    validation: {
      emailInvalid: "Invalid email address",
      passwordShort: "Password must be at least 6 characters",
      passwordMismatch: "Passwords do not match",
      nameRequired: "Full name is required",
      ageRequired: "Age is required",
      ageRange: "Age must be between 1 and 120",
      strengthWeak: "Weak",
      strengthMedium: "Medium",
      strengthStrong: "Strong"
    },
    scanningMessages: ["Scanning..."], layerInsights: { primary: "The base frequency." },
    bestTime: "Best time:", ageRestrictionNotice: "Age restrictions applied.", saveToFav: "Save", removeFromFav: "Remove",
    shareTwitter: "Twitter", shareFacebook: "Facebook", copyLink: "Copy Link", copied: "Copied!", shareMovie: "Share",
    listenOnSpotify: "Spotify", listenOnSoundcloud: "SoundCloud", musicAtmosphere: "Music atmosphere", shareVibe: "Share vibe",
    reset: "Test again", saveChanges: "Save Changes", adminDash: "Admin Dashboard"
  }
};

// ==========================================
// 4. SERVICES
// ==========================================

export const loginUser = async (credentials: any): Promise<User> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  return response.json();
};

export const registerUser = async (formData: any): Promise<User> => {
  const response = await fetch('/api/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }
  return response.json();
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await fetch('/api/user/update', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Update failed');
  }
  return response.json();
};

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
      body: JSON.stringify({ ...state, language, userContext: user ? { age: user.age, name: user.name, favoriteGenres: user.favoriteGenres, preferredActors: user.preferredActors } : null })
    });
    const data = await response.json();
    return {
      name: data.packTitle || "Mood Pack",
      iconType: 'sparkles',
      primaryMood: (state.primaryMood as PrimaryMood),
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
    <div className={`fixed ${isRtl ? 'right-0' : 'left-0'} top-0 bottom-0 w-24 bg-white/70 dark:bg-black/40 backdrop-blur-xl border-x border-black/10 dark:border-white/5 z-50 flex flex-col items-center py-8 gap-8`}>
      <h2 className="text-red-600 font-black text-2xl tracking-tighter">M</h2>
      <button onClick={() => onViewChange('home')} className={`p-4 rounded-xl transition-all ${activeView === 'home' ? 'text-red-600 bg-red-600/10' : 'text-slate-500 hover:text-red-600 dark:hover:text-white'}`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      </button>
      <button onClick={() => onViewChange('history')} className={`p-4 rounded-xl transition-all ${activeView === 'history' ? 'text-red-600 bg-red-600/10' : 'text-slate-500 hover:text-red-600 dark:hover:text-white'}`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </button>
      {user?.isAdmin && (
        <button onClick={() => onViewChange('admin')} className={`p-4 rounded-xl transition-all ${activeView === 'admin' ? 'text-red-600 bg-red-600/10' : 'text-slate-500 hover:text-red-600 dark:hover:text-white'}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </button>
      )}
      <button onClick={() => onViewChange(user ? 'profile' : 'auth')} className={`p-4 rounded-xl transition-all ${['profile', 'auth'].includes(activeView) ? 'text-red-600 bg-red-600/10' : 'text-slate-500 hover:text-red-600 dark:hover:text-white'}`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      </button>
      <div className="mt-auto flex flex-col gap-4">
        <button onClick={onThemeToggle} className="text-slate-500 hover:text-red-600 dark:hover:text-white transition-colors">
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
        <button onClick={() => onLangToggle(language === 'fa' ? 'en' : 'fa')} className="text-slate-500 hover:text-red-600 dark:hover:text-white font-black text-xs">
          {language === 'fa' ? 'EN' : 'FA'}
        </button>
      </div>
    </div>
  );
};

const Auth: React.FC<any> = ({ language, onAuthComplete, onCancel }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', name: '', age: '' });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);
  const t = translations[language];

  const calcStrength = (p: string) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s = 1;
    if (p.length >= 8 && /[0-9]/.test(p) && /[a-z]/i.test(p)) s = 2;
    if (p.length >= 10 && /[^a-z0-9]/i.test(p)) s = 3;
    return s;
  };

  const validate = () => {
    const e: any = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = t.validation.emailInvalid;
    if (formData.password.length < 6) e.password = t.validation.passwordShort;
    if (mode === 'signup') {
      if (!formData.name) e.name = t.validation.nameRequired;
      if (formData.password !== formData.confirmPassword) e.confirmPassword = t.validation.passwordMismatch;
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) e.age = t.validation.ageRange;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const u = mode === 'login' 
        ? await loginUser({ email: formData.email, password: formData.password }) 
        : await registerUser(formData);
      onAuthComplete(u);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-fade-in">
      <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl">
        <h2 className="text-4xl font-black text-center mb-8 gradient-text uppercase tracking-tighter">{mode === 'login' ? t.login : t.signup}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <input type="text" placeholder={t.fullName} className={`w-full bg-black/5 dark:bg-white/5 border ${errors.name ? 'border-red-500' : 'border-black/20 dark:border-white/10'} rounded-xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold dark:text-white`} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          )}
          <input type="email" placeholder={t.email} className={`w-full bg-black/5 dark:bg-white/5 border ${errors.email ? 'border-red-500' : 'border-black/20 dark:border-white/10'} rounded-xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold dark:text-white`} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          <div>
            <input type="password" placeholder={t.password} className={`w-full bg-black/5 dark:bg-white/5 border ${errors.password ? 'border-red-500' : 'border-black/20 dark:border-white/10'} rounded-xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold dark:text-white`} value={formData.password} onChange={e => { setFormData({ ...formData, password: e.target.value }); setStrength(calcStrength(e.target.value)); }} />
            {mode === 'signup' && formData.password && (
              <div className="mt-2 h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                <div className={`h-full transition-all ${strength >= 1 ? 'bg-red-500 w-1/3' : 'w-0'}`} />
                <div className={`h-full transition-all ${strength >= 2 ? 'bg-yellow-500 w-1/3' : 'w-0'}`} />
                <div className={`h-full transition-all ${strength >= 3 ? 'bg-green-500 w-1/3' : 'w-0'}`} />
              </div>
            )}
          </div>
          {mode === 'signup' && (
            <>
              <input type="password" placeholder={t.confirmPassword} className={`w-full bg-black/5 dark:bg-white/5 border ${errors.confirmPassword ? 'border-red-500' : 'border-black/20 dark:border-white/10'} rounded-xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold dark:text-white`} value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
              <input type="number" placeholder={t.age} className={`w-full bg-black/5 dark:bg-white/5 border ${errors.age ? 'border-red-500' : 'border-black/20 dark:border-white/10'} rounded-xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold dark:text-white`} value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
            </>
          )}
          <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-black py-5 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-red-600/20 uppercase">{loading ? '...' : (mode === 'login' ? t.login : t.signup)}</button>
        </form>
        <div className="mt-8 text-center"><button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-white font-bold text-sm transition-all">{mode === 'login' ? "حساب ندارید؟ ثبت‌نام" : "قبلاً ثبت‌نام کرده‌اید؟ ورود"}</button></div>
      </div>
    </div>
  );
};

const Profile: React.FC<any> = ({ user, language, onUpdate, onLogout }) => {
  const t = translations[language];
  const [formData, setFormData] = useState({ name: user.name, age: user.age.toString(), favoriteGenres: user.favoriteGenres || [], preferredActors: user.preferredActors?.join(', ') || '' });
  const [loading, setLoading] = useState(false);

  const GENRE_OPTIONS = ["Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Romance", "Adventure", "Fantasy", "Thriller"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await updateUserProfile({ ...formData, id: user.id, age: parseInt(formData.age), preferredActors: formData.preferredActors.split(',').map(s => s.trim()).filter(Boolean) });
      onUpdate(u);
      alert(language === 'fa' ? 'بروزرسانی شد!' : 'Updated!');
    } catch (err) { alert('Update failed'); }
    finally { setLoading(false); }
  };

  const toggleGenre = (g: string) => {
    setFormData(p => ({ ...p, favoriteGenres: p.favoriteGenres.includes(g) ? p.favoriteGenres.filter(i => i !== g) : [...p.favoriteGenres, g] }));
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
      <div className="glass-card p-10 rounded-[2.5rem]">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-black gradient-text">{t.profile}</h2>
          <button onClick={onLogout} className="px-6 py-2 bg-red-600/10 text-red-600 border border-red-600/20 rounded-xl font-black text-sm hover:bg-red-600 hover:text-white transition-all">
            {t.logout}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase px-1">{t.fullName}</label><input type="text" className="w-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/10 rounded-xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold dark:text-white" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase px-1">{t.age}</label><input type="number" className="w-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/10 rounded-xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold dark:text-white" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} /></div>
          </div>
          <div className="space-y-4"><label className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase px-1">{language === 'fa' ? 'ژانرهای مورد علاقه' : 'Favorite Genres'}</label><div className="flex flex-wrap gap-2">{GENRE_OPTIONS.map(g => (<button key={g} type="button" onClick={() => toggleGenre(g)} className={`px-4 py-2 rounded-full text-xs font-black transition-all border ${formData.favoriteGenres.includes(g) ? 'bg-red-600 border-red-600 text-white' : 'bg-black/5 dark:bg-white/5 border-black/20 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-red-600/50'}`}>{g}</button>))}</div></div>
          <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase px-1">{language === 'fa' ? 'بازیگران مورد علاقه' : 'Preferred Actors'}</label><textarea className="w-full bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/10 rounded-2xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold dark:text-white min-h-[100px]" value={formData.preferredActors} onChange={e => setFormData({ ...formData, preferredActors: e.target.value })} /></div>
          <button type="submit" disabled={loading} className="px-12 bg-red-600 text-white font-black py-4 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-red-600/20 uppercase text-sm">{loading ? '...' : t.saveChanges}</button>
        </form>
      </div>
    </div>
  );
};

const AdminPanel: React.FC<any> = ({ language, theme }) => {
  const t = translations[language];
  const [stats, setStats] = useState<any>({ totalUsers: 0, totalHistory: 0 });
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // In a real app, this would fetch from /api/admin/stats
    // For now, we simulate with local storage access since it's a mock DB
    const usersStr = localStorage.getItem('moodflix_all_users') || '[]';
    const usersData = JSON.parse(usersStr);
    setUsers(usersData);
    setStats({ totalUsers: usersData.length, totalHistory: 120 });
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fade-in">
      <div className="glass-card p-10 rounded-[3rem]">
        <h2 className="text-4xl font-black gradient-text mb-10">{t.adminDash}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-8 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/10 dark:border-white/10">
            <p className="text-xs font-black text-slate-500 uppercase mb-2">Total Users</p>
            <p className="text-4xl font-black text-red-600">{stats.totalUsers}</p>
          </div>
          <div className="p-8 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/10 dark:border-white/10">
            <p className="text-xs font-black text-slate-500 uppercase mb-2">System Status</p>
            <p className="text-xl font-black text-green-500">Active & Healthy</p>
          </div>
          <div className="p-8 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/10 dark:border-white/10">
            <p className="text-xs font-black text-slate-500 uppercase mb-2">API Usage</p>
            <p className="text-xl font-black text-blue-500">Within Limits</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-slate-500 uppercase text-[10px] font-black">
                <th className="py-4 px-2">Name</th>
                <th className="py-4 px-2">Email</th>
                <th className="py-4 px-2">Age</th>
                <th className="py-4 px-2">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {users.map((u, i) => (
                <tr key={i} className="text-sm dark:text-white">
                  <td className="py-4 px-2 font-bold">{u.name}</td>
                  <td className="py-4 px-2 opacity-60">{u.email}</td>
                  <td className="py-4 px-2">{u.age}</td>
                  <td className="py-4 px-2 text-[10px]">{new Date(u.joinedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          <button key={m} onClick={() => handleSelect('primaryMood', m)} className="glass-card p-6 rounded-3xl hover:scale-105 transition-all flex flex-col items-center gap-2 group border border-black/10 dark:border-white/5 shadow-sm">
             <div style={{ color: MOOD_COLORS[m] }} className="opacity-60 group-hover:opacity-100">{MOOD_ICONS[m as PrimaryMood]}</div>
             <span className="text-[10px] font-black uppercase opacity-60 group-hover:opacity-100 text-slate-800 dark:text-white/40">{t.moods[m as keyof typeof t.moods]}</span>
          </button>
        ))}
      </div>
    );
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
            <button key={o} onClick={() => handleSelect(layer.key, o)} className="glass-card p-6 rounded-2xl text-xl font-black hover:bg-black/5 dark:hover:bg-white/5 transition-all text-slate-800 dark:text-white">
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
                <button key={type} onClick={() => handleSelect('recType', type)} className="glass-card p-8 rounded-3xl flex flex-col items-center gap-4 hover:border-red-600/50 transition-all shadow-md">
                   <div className="text-slate-600 dark:text-white">{REC_TYPE_ICONS[type]}</div>
                   <span className="font-black uppercase text-xs text-slate-800 dark:text-white/70">{t.recTypes[type as keyof typeof t.recTypes]}</span>
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
    if (movie) return language === 'fa' ? `🎬 پیشنهاد فیلم بر اساس مود من: ${movie.title} (${movie.year})\n✨ تحلیل شده توسط MOODFLIX` : `🎬 Movie recommendation: ${movie.title} (${movie.year})\n✨ Analyzed by MOODFLIX`;
    return language === 'fa' ? `🌙 مود الان من: ${pack.name}\n🎬 فیلم پیشنهادی: ${pack.movies[0].title}` : `🌙 My vibe: ${pack.name}\n🎬 Movie: ${pack.movies[0].title}`;
  };

  const copyToClipboard = (movie?: MovieRecommendation) => {
    navigator.clipboard.writeText(getShareText(movie)).then(() => {
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
               <button onClick={() => setActiveShare(activeShare === 'pack' ? null : 'pack')} className="p-3 glass-card rounded-full text-slate-500 hover:text-red-600 dark:hover:text-white transition-all shadow-sm"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
               {activeShare === 'pack' && (<div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 glass-card p-2 rounded-2xl flex gap-2 z-50 animate-fade-in whitespace-nowrap"><button onClick={() => copyToClipboard()} className={`p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors font-bold text-sm ${copyFeedback === 'pack' ? 'text-green-500' : 'text-slate-700 dark:text-slate-400'}`}>{copyFeedback === 'pack' ? "کپی شد" : t.copyLink}</button></div>)}
            </div>
          </div>
          <p className="text-xl italic text-slate-700 dark:text-slate-400 opacity-90">"{pack.emotionalQuote}"</p>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pack.movies.map((m: any, i: number) => (
            <div key={i} className="glass-card rounded-[2rem] overflow-hidden flex flex-col border border-black/10 dark:border-white/5 hover:border-red-600/30 transition-all relative group shadow-xl">
               <div className="h-64 bg-slate-300 dark:bg-slate-900 relative"><img src={`https://picsum.photos/seed/${m.title}/500/800`} className="w-full h-full object-cover opacity-60 dark:opacity-50 group-hover:scale-105 transition-transform duration-700" /><div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black/80 to-transparent" /><div className="absolute bottom-4 left-4 right-4 flex justify-between items-end"><div><h3 className="text-2xl font-black text-slate-900 dark:text-white">{m.title}</h3><p className="text-xs font-bold text-slate-700 dark:text-white/60">{m.year} • {m.genre}</p></div><button onClick={() => copyToClipboard(m)} className={`p-2 bg-black/10 dark:bg-black/40 backdrop-blur-md rounded-lg text-slate-800 dark:text-white/70 hover:text-red-600 dark:hover:text-white transition-all ${copyFeedback === m.title ? 'text-green-500' : ''}`}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg></button></div></div>
               <div className="p-6 flex-grow space-y-4"><p className="text-sm font-medium text-slate-800 dark:text-slate-300 opacity-90 leading-relaxed">{m.description}</p><p className="text-xs italic font-bold" style={{ color: color }}>{m.whyItFits}</p></div>
            </div>
          ))}
       </div>
       <div className="text-center"><button onClick={onReset} className="text-slate-500 font-bold hover:text-red-600 dark:hover:text-white transition-colors">{t.reset}</button></div>
    </div>
  );
};

// ==========================================
// 6. MAIN APP
// ==========================================

const LoadingState: React.FC<{ language: Language }> = ({ language }) => (
  <div className="flex flex-col items-center justify-center py-24 min-h-[60vh] text-center"><div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-8"></div><h2 className="text-3xl font-black text-slate-800 dark:text-white">{translations[language].analyzing}</h2></div>
);

const App: React.FC = () => {
  const [pack, setPack] = useState<MoodPack | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<SavedMood>>([]);
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('fa');
  const [view, setView] = useState<'home' | 'history' | 'profile' | 'auth' | 'admin'>('home');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('moodflix_theme') as Theme || 'dark';
    const savedLang = localStorage.getItem('moodflix_lang') as Language || 'fa';
    const savedUserStr = localStorage.getItem('moodflix_user');
    setTheme(savedTheme); setLanguage(savedLang);
    if (savedUserStr) { 
      try { 
        const u = JSON.parse(savedUserStr); 
        setUser(u); 
        getHistory(u.id).then(setHistory); 
      } catch(e) {} 
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.body.className = theme;
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

  const handleAuth = (u: User) => { 
    setUser(u); 
    setView('home'); 
    localStorage.setItem('moodflix_user', JSON.stringify(u)); 
    // Fix: Maintain a local list of all users for admin dashboard mock
    const allUsers = JSON.parse(localStorage.getItem('moodflix_all_users') || '[]');
    if (!allUsers.find((x: any) => x.email === u.email)) {
      allUsers.push(u);
      localStorage.setItem('moodflix_all_users', JSON.stringify(allUsers));
    }
    getHistory(u.id).then(setHistory); 
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
    setPack(null);
    localStorage.removeItem('moodflix_user');
  };

  const renderContent = () => {
    if (loading) return <LoadingState language={language} />;
    if (view === 'auth') return <Auth language={language} onAuthComplete={handleAuth} onCancel={() => setView('home')} />;
    if (view === 'profile' && user) return <Profile user={user} language={language} onUpdate={setUser} onLogout={handleLogout} />;
    if (view === 'admin' && user?.isAdmin) return <AdminPanel language={language} theme={theme} />;
    if (view === 'history') return (
       <div className="max-w-4xl mx-auto py-12 space-y-6">
          <h2 className="text-4xl font-black text-center mb-12 text-slate-900 dark:text-white">{translations[language].historyTitle}</h2>
          {history.length === 0 ? <p className="text-center opacity-40 dark:text-white">No entries yet.</p> : history.map((h, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl flex justify-between items-center shadow-md"><div><p className="font-black text-slate-900 dark:text-white">{translations[language].moods[h.mood as keyof typeof translations.fa.moods] || h.mood}</p><p className="text-xs text-slate-500 opacity-70">{h.date}</p></div><p className="font-black text-red-600">{h.movieTitle}</p></div>
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
           <h1 onClick={() => { setView('home'); setPack(null); }} className="text-6xl font-black text-red-600 tracking-tighter cursor-pointer drop-shadow-sm">{translations[language].title}</h1>
           <p className="text-slate-500 text-xs uppercase tracking-[0.5em] mt-2 font-black opacity-60">{translations[language].subtitle}</p>
        </header>
        <main className="max-w-6xl mx-auto">{renderContent()}</main>
      </div>
      <style>{`
        /* Dynamic Theme Styles */
        .glass-card {
          background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.015)' : 'rgba(255, 255, 255, 0.95)'};
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)'};
        }
        
        .gradient-text {
          background: ${theme === 'dark' 
            ? 'linear-gradient(to bottom right, #ffffff 40%, #64748b 100%)' 
            : 'linear-gradient(to bottom right, #0f172a 40%, #334155 100%)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        body.light {
          background-image: radial-gradient(circle at 50% -20%, rgba(229, 9, 20, 0.04) 0%, #f8fafc 100%);
        }
      `}</style>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
