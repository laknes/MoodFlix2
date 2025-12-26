
import React, { useState, useEffect } from 'react';
import MoodSelector from './components/MoodSelector';
import RecommendationDisplay from './components/RecommendationDisplay';
import MoodHistory from './components/MoodHistory';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import Profile from './components/Profile';
import { AppState, MoodPack, SavedMood, Theme, Language, User, SystemSettings } from './types';
import { getMovieRecommendations } from './services/geminiService';
import { translations } from './translations';
import { loginUser, registerUser } from './services/authService';
import { getHistory, saveHistory } from './services/historyService';

const LoadingState: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24 min-h-[50vh] text-center animate-fade-in">
      <div className="w-16 h-16 md:w-24 md:h-24 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-8"></div>
      <h2 className="text-2xl md:text-3xl font-black text-black dark:text-white">{t.analyzing}</h2>
    </div>
  );
};

const App: React.FC = () => {
  const [pack, setPack] = useState<MoodPack | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SavedMood[]>([]);
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('fa');
  const [view, setView] = useState<'home' | 'history' | 'settings' | 'profile' | 'admin' | 'auth'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [pendingSelection, setPendingSelection] = useState<AppState | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme || 'dark';
    const savedLang = localStorage.getItem('lang') as Language || 'fa';
    const savedUser = localStorage.getItem('user');

    setTheme(savedTheme);
    setLanguage(savedLang);
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        syncHistory(parsedUser.id);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    localStorage.setItem('theme', theme);
    localStorage.setItem('lang', language);
  }, [theme, language]);

  const syncHistory = async (userId: string) => {
    try {
      const data = await getHistory(userId);
      setHistory(data);
    } catch (e) {
      console.error("Sync error", e);
    }
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
    setLoading(false);
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Also update in global user list for admin mock
    const allUsers = JSON.parse(localStorage.getItem('moodflix_all_users') || '[]');
    const idx = allUsers.findIndex((u: any) => u.id === updatedUser.id);
    if (idx !== -1) {
      allUsers[idx] = updatedUser;
      localStorage.setItem('moodflix_all_users', JSON.stringify(allUsers));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setView('home');
    setPack(null);
  };

  const t = translations[language];

  return (
    <div className={`min-h-screen transition-all duration-500 flex flex-col ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar 
        theme={theme} 
        language={language} 
        user={user}
        onThemeToggle={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} 
        onLangToggle={setLanguage}
        activeView={view}
        onViewChange={setView}
      />

      <div className={`flex-grow px-4 md:px-12 pb-[100px] lg:pb-12 ${language === 'fa' ? 'lg:pr-32' : 'lg:pl-32'}`}>
        <header className="py-8 md:py-16 flex flex-col items-center">
           <h1 
            onClick={() => { setView('home'); setPack(null); }} 
            className="text-4xl sm:text-6xl md:text-8xl font-black text-red-600 tracking-tighter cursor-pointer hover:scale-105 transition-transform"
           >
             {t.title}
           </h1>
           <p className="text-slate-500 text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.3em] md:tracking-[0.5em] mt-2 md:mt-4 font-bold opacity-70">
             {t.subtitle}
           </p>
        </header>

        <main className="max-w-7xl mx-auto w-full">
          {loading ? (
            <LoadingState language={language} />
          ) : view === 'auth' ? (
            <Auth 
              language={language} 
              onAuthComplete={(u) => { 
                setUser(u); 
                localStorage.setItem('user', JSON.stringify(u));
                setView('home'); 
                syncHistory(u.id); 
                if(pendingSelection) executeSelection(pendingSelection, u); 
                
                // Add to global list for admin mock
                const allUsers = JSON.parse(localStorage.getItem('moodflix_all_users') || '[]');
                if (!allUsers.find((x: any) => x.email === u.email)) {
                  allUsers.push(u);
                  localStorage.setItem('moodflix_all_users', JSON.stringify(allUsers));
                }
              }} 
              onCancel={() => setView('home')} 
            />
          ) : view === 'history' ? (
            <MoodHistory history={history} language={language} />
          ) : view === 'profile' && user ? (
            <Profile 
              user={user} 
              language={language} 
              onUpdate={handleProfileUpdate} 
              onLogout={handleLogout}
            />
          ) : view === 'admin' && user?.isAdmin ? (
            <AdminPanel 
              language={language} 
              users={JSON.parse(localStorage.getItem('moodflix_all_users') || '[]')}
              onSync={() => {
                const u = JSON.parse(localStorage.getItem('moodflix_all_users') || '[]');
                syncHistory(user.id);
                alert(language === 'fa' ? 'داده‌ها همگام‌سازی شد' : 'Data synchronized');
              }}
            />
          ) : pack ? (
            <RecommendationDisplay 
              pack={pack} 
              onReset={() => setPack(null)} 
              language={language} 
              onToggleFavorite={() => {}}
              favorites={[]}
              userAge={user ? (new Date().getFullYear() - new Date(user.birthday).getFullYear()) : 18}
            />
          ) : (
            <MoodSelector onComplete={handleSelection} language={language} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
