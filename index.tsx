
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import MenuBar from './components/MenuBar.tsx';
import MoodSelector from './components/MoodSelector.tsx';
import RecommendationDisplay from './components/RecommendationDisplay.tsx';
import Auth from './components/Auth.tsx';
import Profile from './components/Profile.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import About from './components/About.tsx';
import MoodHistory from './components/MoodHistory.tsx';
import { translations } from './translations.ts';
import { getMovieRecommendations } from './services/geminiService.ts';
import { getHistory, saveHistory } from './services/historyService.ts';

function App() {
  const [user, setUser] = useState(null);
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('fa');
  const [view, setView] = useState('home');
  const [theme, setTheme] = useState('dark');
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('moodflix_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      loadUserHistory(parsed.id);
    }
    const savedLang = localStorage.getItem('moodflix_lang');
    if (savedLang) setLanguage(savedLang);
    const savedTheme = localStorage.getItem('moodflix_theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('moodflix_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('moodflix_theme', theme);
    document.body.className = theme === 'dark' ? 'bg-[#020202] text-white' : 'bg-slate-50 text-slate-900';
  }, [theme]);

  const loadUserHistory = async (userId) => {
    try {
      const data = await getHistory(userId);
      setHistory(data);
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const handleSelection = async (selection) => {
    setLoading(true);
    try {
      const result = await getMovieRecommendations(selection, language, user);
      if (result) {
        setPack(result);
        if (user) {
          const historyEntry = {
            userId: user.id,
            date: new Date().toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US'),
            mood: selection.primaryMood,
            intensity: selection.intensity,
            movieTitle: result.movies[0].title
          };
          await saveHistory(historyEntry);
          loadUserHistory(user.id);
        }
      }
    } catch (e) {
      console.error("Selection failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = (userData) => {
    setUser(userData);
    localStorage.setItem('moodflix_user', JSON.stringify(userData));
    setView('home');
    loadUserHistory(userData.id);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('moodflix_user');
    setView('home');
    setPack(null);
  };

  const handleToggleFavorite = (movie) => {
    setFavorites(prev => {
      const exists = prev.find(f => (f.imdb_id === movie.imdb_id && movie.imdb_id) || f.title === movie.title);
      if (exists) {
        return prev.filter(f => !((f.imdb_id === movie.imdb_id && movie.imdb_id) || f.title === movie.title));
      }
      return [...prev, movie];
    });
  };

  const currentTranslations = translations[language] || translations.fa;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="py-48 text-center animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-netflix-red border-t-transparent rounded-full animate-spin mb-8"></div>
          <h2 className="text-3xl font-black uppercase tracking-tighter gradient-text">
            {currentTranslations.analyzing}
          </h2>
          <p className="text-slate-500 text-xs mt-4 uppercase tracking-[0.3em]">Neural link established...</p>
        </div>
      );
    }

    if (pack) {
      return (
        <RecommendationDisplay 
          pack={pack} 
          onReset={() => setPack(null)} 
          language={language} 
          userAge={user?.age}
          onToggleFavorite={handleToggleFavorite}
          favorites={favorites}
        />
      );
    }

    switch (view) {
      case 'profile':
        return user ? (
          <Profile user={user} language={language} onUpdate={setUser} onLogout={handleLogout} />
        ) : (
          <Auth language={language} onAuthComplete={handleAuth} onCancel={() => setView('home')} />
        );
      case 'history':
        return user ? (
          <MoodHistory history={history} language={language} />
        ) : (
          <Auth language={language} onAuthComplete={handleAuth} onCancel={() => setView('home')} />
        );
      case 'admin':
        return user?.isAdmin ? (
          <AdminPanel 
            language={language} 
            onSync={() => loadUserHistory(user.id)} 
            onSettingsUpdate={() => {}}
          />
        ) : (
          <div className="py-32 text-center font-black uppercase text-red-600">Access Denied</div>
        );
      case 'about':
        return <About language={language} />;
      default:
        return <MoodSelector onComplete={handleSelection} language={language} />;
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-700 pt-24 ${theme === 'dark' ? 'dark' : 'light'}`}>
      <MenuBar 
        language={language} 
        setLanguage={setLanguage}
        activeView={view} 
        onViewChange={(v) => { setView(v); setPack(null); }} 
        user={user} 
        resetApp={() => { setView('home'); setPack(null); }}
        theme={theme}
        setTheme={setTheme}
      />
      
      <main className="max-w-7xl mx-auto pb-32 px-4">
        {renderContent()}
      </main>
      
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] opacity-40">
          Moodflix Cinematic Intelligence &copy; 2025
        </p>
      </footer>

      <style>{`
        .gradient-text {
          background: linear-gradient(to bottom right, currentColor 40%, #64748b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}

const container = document.getElementById('root');
if (container) createRoot(container).render(<App />);
