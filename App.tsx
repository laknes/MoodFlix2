
import React, { useState, useEffect } from 'react';
import MoodSelector from './components/MoodSelector';
import RecommendationDisplay from './components/RecommendationDisplay';
import MoodHistory from './components/MoodHistory';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import { AppState, MoodPack, SavedMood, Theme, Language, User, MovieRecommendation, SystemSettings, ApiKeyConfig } from './types';
import { getMovieRecommendations } from './services/geminiService';
import { translations } from './translations';

const LoadingState: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const [msgIndex, setMsgIndex] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % t.scanningMessages.length);
    }, 2500);

    const progInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return prev;
        const jump = Math.random() * 2;
        return Math.min(99, prev + jump);
      });
    }, 150);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, [t.scanningMessages.length]);

  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-24 min-h-[60vh] animate-fade-in relative overflow-hidden text-center">
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] border border-red-600/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
      </div>
      <div className="relative w-24 h-24 md:w-48 md:h-48 mb-8 md:mb-16 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="w-12 h-12 md:w-24 md:h-24 bg-red-600/20 rounded-full animate-pulse flex items-center justify-center">
          <span className="text-red-500 font-black text-lg md:text-2xl">{Math.floor(progress)}%</span>
        </div>
      </div>
      <div className="text-center relative z-10 space-y-4 px-6">
        <h2 className="text-2xl md:text-5xl font-black tracking-tight text-white mb-2">{t.analyzing}</h2>
        <div className="h-10 md:h-16 flex items-center justify-center">
          <p className="text-red-500 font-bold text-sm md:text-2xl animate-fade-in" key={msgIndex}>{t.scanningMessages[msgIndex]}</p>
        </div>
      </div>
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
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pendingSelection, setPendingSelection] = useState<AppState | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editAge, setEditAge] = useState<string>('');
  
  // Admin Configs
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [activeApiKey, setActiveApiKey] = useState<string | undefined>();

  useEffect(() => {
    // Load Core App State
    const savedHistory = localStorage.getItem('mood_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const actualSavedTheme = localStorage.getItem('moodflix_theme') as Theme;
    if (actualSavedTheme) setTheme(actualSavedTheme);

    const savedLang = localStorage.getItem('moodflix_lang') as Language;
    if (savedLang) setLanguage(savedLang);

    const savedUser = localStorage.getItem('moodflix_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setEditAge(parsedUser.age.toString());
      if (parsedUser.email === 'admin@moodflix.com') parsedUser.isAdmin = true;
    }

    // Load Admin Configs
    const savedSettings = localStorage.getItem('moodflix_system_settings');
    if (savedSettings) setSystemSettings(JSON.parse(savedSettings));

    const savedKeys = localStorage.getItem('moodflix_api_keys');
    if (savedKeys) {
      const keys: ApiKeyConfig[] = JSON.parse(savedKeys);
      const active = keys.find(k => k.isActive);
      if (active) setActiveApiKey(active.key);
    }

    // Mock Users
    setAllUsers([
      { id: '1', name: 'Admin', email: 'admin@moodflix.com', age: 30, joinedAt: new Date().toISOString(), favoriteGenres: [], preferredActors: [], isAdmin: true },
      { id: '2', name: 'User', email: 'user@example.com', age: 22, joinedAt: new Date().toISOString(), favoriteGenres: ['Drama'], preferredActors: [] }
    ]);
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    localStorage.setItem('moodflix_theme', theme);
  }, [theme, language]);

  const handleSelection = async (selection: AppState) => {
    if (!user) {
      setPendingSelection(selection);
      setView('auth');
      return;
    }
    await executeSelection(selection);
  };

  const executeSelection = async (selection: AppState) => {
    if (systemSettings?.maintenanceMode && !user?.isAdmin) {
      alert(language === 'fa' ? "سیستم در حال بروزرسانی است." : "System under maintenance.");
      return;
    }

    setLoading(true);
    const result = await getMovieRecommendations(
      selection, 
      language, 
      user, 
      activeApiKey,
      systemSettings || undefined
    );

    if (result) {
      setPack(result);
      if (selection.primaryMood) {
        const newEntry: SavedMood = {
          date: new Date().toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US'),
          mood: selection.primaryMood!,
          intensity: selection.intensity || 'medium',
          movieTitle: result.movies[0].title
        };
        const updatedHistory = [...history, newEntry].slice(-10);
        setHistory(updatedHistory);
        localStorage.setItem('mood_history', JSON.stringify(updatedHistory));
      }
    } else {
      alert("Error fetching recommendations.");
    }
    setLoading(false);
  };

  const onAuthComplete = (newUser: User) => {
    if (newUser.email === 'admin@moodflix.com') newUser.isAdmin = true;
    setUser(newUser);
    setEditAge(newUser.age.toString());
    
    if (pendingSelection) {
      setView('home');
      executeSelection(pendingSelection);
      setPendingSelection(null);
    } else {
      setView('profile');
    }
  };

  const handleUpdateProfile = () => {
    if (!user) return;
    const updatedUser = { ...user, age: parseInt(editAge) || user.age };
    setUser(updatedUser);
    localStorage.setItem('moodflix_user', JSON.stringify(updatedUser));
    setIsEditingProfile(false);
  };

  const t = translations[language];

  // Fix: Explicitly type newView to match the Sidebar union and prevent broader union to narrower union assignment errors.
  const handleNavChange = (newView: 'home' | 'history' | 'settings' | 'profile' | 'admin' | 'auth') => {
    if ((newView === 'profile' || newView === 'history') && !user) {
      setView('auth');
    } else {
      setView(newView);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 flex flex-col ${theme === 'dark' ? 'bg-[#050505] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar 
        theme={theme} 
        language={language} 
        user={user}
        onThemeToggle={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} 
        onLangToggle={setLanguage}
        activeView={view}
        onViewChange={handleNavChange}
      />

      <div className={`flex-grow transition-all duration-300 px-4 md:px-8 lg:px-12 pb-24 lg:pb-12 ${language === 'fa' ? 'lg:pr-24' : 'lg:pl-24'}`}>
        <header className="py-8 md:py-16 flex flex-col items-center px-4">
           <h1 onClick={() => { handleNavChange('home'); setPack(null); }} className="text-4xl sm:text-6xl md:text-8xl netflix-logo netflix-red cursor-pointer transition-all hover:scale-105 select-none">{t.title}</h1>
           <p className="text-slate-500 text-[9px] sm:text-xs md:text-sm uppercase tracking-[0.2em] sm:tracking-[0.4em] mt-4 md:mt-6 font-bold opacity-70 text-center">{t.subtitle}</p>
        </header>

        <main className="w-full max-w-7xl mx-auto mb-12">
          {view === 'auth' ? (
            <Auth 
              language={language} 
              onAuthComplete={onAuthComplete} 
              onCancel={() => setView('home')} 
            />
          ) : view === 'admin' ? (
            <AdminPanel 
              language={language} 
              users={allUsers} 
              onSync={() => alert("Syncing...")} 
              onSettingsUpdate={(settings) => {
                setSystemSettings(settings);
                const savedKeys = localStorage.getItem('moodflix_api_keys');
                if (savedKeys) {
                  const keys: ApiKeyConfig[] = JSON.parse(savedKeys);
                  const active = keys.find(k => k.isActive);
                  if (active) setActiveApiKey(active.key);
                }
              }}
            />
          ) : view === 'settings' ? (
            <div className="max-w-2xl mx-auto glass-card rounded-[2rem] p-6 md:p-12 text-center animate-fade-in">
               <h2 className="text-2xl md:text-4xl font-black mb-6 md:mb-8">{t.settings}</h2>
               <div className="flex flex-col gap-4 md:gap-6">
                 <button onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')} className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/5 font-bold hover:bg-white/10 transition-colors">
                    {language === 'fa' ? 'Switch to English' : 'تغییر به فارسی'}
                 </button>
                 <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/5 font-bold hover:bg-white/10 transition-colors">
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                 </button>
               </div>
            </div>
          ) : view === 'history' ? (
            <MoodHistory history={history} language={language} />
          ) : view === 'profile' ? (
            <div className="max-w-2xl mx-auto glass-card rounded-[2rem] p-6 md:p-12 text-center animate-fade-in">
              {user ? (
                <>
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-red-600 rounded-full mx-auto flex items-center justify-center text-2xl md:text-3xl font-black mb-6">{user.name[0]}</div>
                  <h2 className="text-2xl md:text-4xl font-black">{user.name}</h2>
                  <p className="text-slate-500 text-sm md:text-base mb-6">{user.email}</p>
                  
                  {isEditingProfile ? (
                    <div className="max-w-xs mx-auto space-y-4">
                      <div className="text-left">
                        <label className="block text-xs font-black text-slate-500 uppercase mb-2 tracking-widest">{t.age}</label>
                        <input
                          type="number"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-red-600 outline-none transition-all font-bold"
                          value={editAge}
                          onChange={e => setEditAge(e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={handleUpdateProfile}
                        className="w-full bg-red-600 text-white font-black py-3 rounded-xl hover:bg-red-700 transition-all"
                      >
                        {t.saveChanges}
                      </button>
                      <button 
                        onClick={() => setIsEditingProfile(false)}
                        className="w-full text-slate-500 text-sm font-bold hover:text-white transition-all"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="font-bold text-slate-300">
                        {t.age}: <span className="text-red-500">{user.age}</span>
                      </p>
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="text-red-600 font-bold hover:underline"
                      >
                        {t.editProfile}
                      </button>
                      <div className="pt-8">
                        <button onClick={() => setUser(null)} className="text-slate-500 text-sm font-bold hover:text-red-600 transition-colors uppercase tracking-widest">{t.logout}</button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12">
                   <p className="mb-8 text-slate-400 font-bold">{t.authRequired}</p>
                   <button onClick={() => setView('auth')} className="bg-red-600 px-8 md:px-12 py-3 md:py-4 rounded-full font-black text-white hover:bg-red-700 transition-all">{t.login}</button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full">
              {systemSettings?.maintenanceMode && !user?.isAdmin ? (
                <div className="text-center py-12 md:py-20 animate-fade-in px-4">
                   <h2 className="text-3xl md:text-4xl font-black mb-4">Under Maintenance</h2>
                   <p className="opacity-50 text-sm md:text-base">Moodflix is currently updating its emotional engine. We'll be back soon!</p>
                </div>
              ) : loading ? (
                <LoadingState language={language} />
              ) : pack ? (
                <RecommendationDisplay 
                  pack={pack} 
                  onReset={() => setPack(null)} 
                  language={language} 
                  onToggleFavorite={() => {}}
                  favorites={[]}
                  userAge={user?.age || 18}
                />
              ) : (
                <MoodSelector onComplete={handleSelection} language={language} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
