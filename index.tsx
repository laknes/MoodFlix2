
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  AppState, 
  MoodPack, 
  SavedMood, 
  Theme, 
  Language, 
  User, 
  PrimaryMood,
  Intensity,
  EnergyLevel,
  MentalState,
  RecommendationType
} from './types';
import { getMovieRecommendations } from './services/geminiService';
import { translations } from './translations';
import { loginUser, registerUser } from './services/authService';
import { getHistory, saveHistory } from './services/historyService';
import MoodSelector from './components/MoodSelector';
import RecommendationDisplay from './components/RecommendationDisplay';
import MoodHistory from './components/MoodHistory';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';

const LoadingState: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  return (
    <div className="flex flex-col items-center justify-center py-24 min-h-[60vh] text-center animate-fade-in px-4">
      <div className="relative w-32 h-32 mb-12">
        <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-red-600 font-black text-xs animate-pulse uppercase tracking-widest">Analysing</span>
        </div>
      </div>
      <h2 className="text-3xl md:text-5xl font-black text-white gradient-text uppercase tracking-tighter">{t.analyzing}</h2>
      <p className="mt-4 text-slate-500 font-bold opacity-60 max-w-xs">{t.scanningMessages[0]}</p>
    </div>
  );
};

const App: React.FC = () => {
  const [pack, setPack] = useState<MoodPack | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<SavedMood>>([]);
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('fa');
  const [view, setView] = useState<'home' | 'history' | 'settings' | 'profile' | 'admin' | 'auth'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [pendingSelection, setPendingSelection] = useState<AppState | null>(null);

  // Initialization
  useEffect(() => {
    const storedTheme = localStorage.getItem('moodflix_theme');
    const storedLang = localStorage.getItem('moodflix_lang');
    const savedUser = localStorage.getItem('moodflix_user');

    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
    }
    
    if (storedLang === 'fa' || storedLang === 'en') {
      setLanguage(storedLang);
    }

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        syncHistory(parsedUser.id);
      } catch(e) {
        localStorage.removeItem('moodflix_user');
      }
    }
  }, []);

  // Sync Global Attributes
  useEffect(() => {
    document.documentElement.className = theme;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('moodflix_theme', theme);
    localStorage.setItem('moodflix_lang', language);
  }, [theme, language]);

  const syncHistory = async (userId: string) => {
    try {
      const data = await getHistory(userId);
      setHistory(data);
    } catch (e) {
      console.error("Sync error", e);
    }
  };

  const handleAuthComplete = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    localStorage.setItem('moodflix_user', JSON.stringify(authenticatedUser));
    syncHistory(authenticatedUser.id);
    
    if (pendingSelection) {
      executeSelection(pendingSelection, authenticatedUser);
      setPendingSelection(null);
    } else {
      setView('home');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('moodflix_user');
    setHistory([]);
    setView('home');
    setPack(null);
  };

  const handleSelection = async (selection: AppState) => {
    if (!user) {
      setPendingSelection(selection);
      setView('auth');
      return;
    }
    await executeSelection(selection, user);
  };

  const executeSelection = async (selection: AppState, activeUser: User) => {
    setLoading(true);
    try {
      const result = await getMovieRecommendations(selection, language, activeUser);
      if (result) {
        setPack(result);
        if (selection.primaryMood) {
          const historyEntry = {
            userId: activeUser.id,
            mood: selection.primaryMood,
            intensity: selection.intensity || 'medium',
            movieTitle: result.movies[0].title,
            date: new Date().toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')
          };
          await saveHistory(historyEntry);
          await syncHistory(activeUser.id);
        }
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const t = translations[language];

  const renderContent = () => {
    if (loading) return <LoadingState language={language} />;

    switch(view) {
      case 'auth':
        return (
          <Auth 
            language={language} 
            onAuthComplete={handleAuthComplete} 
            onCancel={() => setView('home')} 
          />
        );
      case 'history':
        return <MoodHistory history={history} language={language} />;
      case 'profile':
        return (
          <div className="max-w-xl mx-auto py-24 text-center animate-fade-in px-4">
            <div className="w-32 h-32 bg-red-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-red-600/30 text-5xl font-black text-white">
              {user?.name?.[0].toUpperCase()}
            </div>
            <h2 className="text-5xl font-black gradient-text mb-4 tracking-tighter">{user?.name}</h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-xs mb-12">{user?.email}</p>
            <div className="grid grid-cols-2 gap-4 mb-12">
               <div className="glass-card p-6 rounded-3xl">
                  <p className="text-slate-500 text-[10px] font-black uppercase mb-2">Age</p>
                  <p className="text-2xl font-black">{user?.age}</p>
               </div>
               <div className="glass-card p-6 rounded-3xl">
                  <p className="text-slate-500 text-[10px] font-black uppercase mb-2">Syncs</p>
                  <p className="text-2xl font-black">{history.length}</p>
               </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-red-600 font-black uppercase tracking-widest text-sm hover:underline hover:brightness-125 transition-all"
            >
              {t.logout}
            </button>
          </div>
        );
      case 'home':
      default:
        if (pack) {
          return (
            <RecommendationDisplay 
              pack={pack} 
              onReset={() => setPack(null)} 
              language={language} 
              onToggleFavorite={() => {}}
              favorites={[]}
              userAge={user?.age || 18}
            />
          );
        }
        return <MoodSelector onComplete={handleSelection} language={language} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 flex flex-col ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar 
        theme={theme} 
        language={language} 
        user={user}
        onThemeToggle={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} 
        onLangToggle={setLanguage}
        activeView={view}
        onViewChange={setView}
      />

      <div className={`flex-grow px-4 md:px-12 pb-24 lg:pb-12 ${language === 'fa' ? 'lg:pr-24' : 'lg:pl-24'}`}>
        <header className="py-12 flex flex-col items-center">
           <h1 
            onClick={() => { setView('home'); setPack(null); }} 
            className="text-6xl md:text-9xl font-black text-red-600 tracking-tighter cursor-pointer hover:scale-105 transition-transform active:scale-95 select-none"
            style={{ textShadow: theme === 'dark' ? '0 0 40px rgba(229,9,20,0.4)' : 'none' }}
           >
            {t.title}
           </h1>
           <p className="text-slate-500 text-xs md:text-sm uppercase tracking-[0.5em] mt-4 font-black opacity-70 text-center">{t.subtitle}</p>
        </header>

        <main className="max-w-7xl mx-auto">
          {renderContent()}
        </main>
      </div>

      <style>{`
        .gradient-text {
          background: ${theme === 'dark' ? 'linear-gradient(to bottom right, #ffffff 40%, #64748b 100%)' : 'linear-gradient(to bottom right, #0f172a 40%, #475569 100%)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .glass-card {
          background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.015)' : 'rgba(0, 0, 0, 0.02)'};
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
        }
      `}</style>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
