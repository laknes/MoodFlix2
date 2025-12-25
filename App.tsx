
import React from 'react';
import MoodSelector from './components/MoodSelector';
import RecommendationDisplay from './components/RecommendationDisplay';
import MoodHistory from './components/MoodHistory';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import { AppState, MoodPack, SavedMood, Theme, Language, User, MovieRecommendation } from './types';
import { getMovieRecommendations } from './services/geminiService';
import { translations } from './translations';

const App: React.FC = () => {
  const [pack, setPack] = React.useState<MoodPack | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [history, setHistory] = React.useState<SavedMood[]>([]);
  const [theme, setTheme] = React.useState<Theme>('dark');
  const [language, setLanguage] = React.useState<Language>('fa');
  const [view, setView] = React.useState<'home' | 'history' | 'settings' | 'profile' | 'admin'>('home');
  const [user, setUser] = React.useState<User | null>(null);
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [showAuth, setShowAuth] = React.useState(false);
  const [pendingSelection, setPendingSelection] = React.useState<AppState | null>(null);
  const [actorInput, setActorInput] = React.useState('');

  React.useEffect(() => {
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
      if (parsedUser.email === 'admin@moodflix.com') parsedUser.isAdmin = true;
    }

    setAllUsers([
      { id: '1', name: 'Admin', email: 'admin@moodflix.com', age: 30, joinedAt: new Date().toISOString(), favoriteGenres: [], preferredActors: [], isAdmin: true },
      { id: '2', name: 'Sarah', email: 'sarah@example.com', age: 22, joinedAt: new Date().toISOString(), favoriteGenres: ['Drama'], preferredActors: ['Jim Carrey'] }
    ]);
  }, []);

  React.useEffect(() => {
    document.documentElement.className = theme;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('moodflix_theme', theme);
  }, [theme, language]);

  const handleSelection = async (selection: AppState) => {
    if (!user) {
      setPendingSelection(selection);
      setShowAuth(true);
      return;
    }
    await executeSelection(selection);
  };

  const executeSelection = async (selection: AppState) => {
    setLoading(true);
    const result = await getMovieRecommendations(selection, language, user);
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
      alert(language === 'fa' ? "مشکلی در دریافت پیشنهادات پیش آمد." : "Something went wrong.");
    }
    setLoading(false);
  };

  const onAuthComplete = (newUser: User) => {
    if (newUser.email === 'admin@moodflix.com') newUser.isAdmin = true;
    setUser(newUser);
    setShowAuth(false);
    if (pendingSelection) {
      executeSelection(pendingSelection);
      setPendingSelection(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('moodflix_user');
    setUser(null);
    setView('home');
    setPack(null);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('moodflix_lang', lang);
  };

  const handleToggleFavorite = (movie: MovieRecommendation) => {
    if (!user) return;
    const currentFavs = user.favoriteMovies || [];
    const exists = currentFavs.find(f => f.title === movie.title);
    
    let updatedFavs;
    if (exists) {
      updatedFavs = currentFavs.filter(f => f.title !== movie.title);
    } else {
      updatedFavs = [...currentFavs, movie];
    }
    
    const updatedUser = { ...user, favoriteMovies: updatedFavs };
    setUser(updatedUser);
    localStorage.setItem('moodflix_user', JSON.stringify(updatedUser));
  };

  const updatePreferences = (genres: string[], actors: string[], age?: number) => {
    if (!user) return;
    const updatedUser = { ...user, favoriteGenres: genres, preferredActors: actors, age: age !== undefined ? age : user.age };
    setUser(updatedUser);
    localStorage.setItem('moodflix_user', JSON.stringify(updatedUser));
  };

  const handleAddActor = () => {
    if (!user || !actorInput.trim()) return;
    const currentActors = user.preferredActors || [];
    if (!currentActors.includes(actorInput.trim())) {
      updatePreferences(user.favoriteGenres, [...currentActors, actorInput.trim()]);
    }
    setActorInput('');
  };

  const handleRemoveActor = (actor: string) => {
    if (!user) return;
    const updatedActors = (user.preferredActors || []).filter(a => a !== actor);
    updatePreferences(user.favoriteGenres, updatedActors);
  };

  const handleToggleGenre = (genre: string) => {
    if (!user) return;
    const currentGenres = user.favoriteGenres || [];
    let updatedGenres;
    if (currentGenres.includes(genre)) {
      updatedGenres = currentGenres.filter(g => g !== genre);
    } else {
      updatedGenres = [...currentGenres, genre];
    }
    updatePreferences(updatedGenres, user.preferredActors);
  };

  const handleAdminSync = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(translations[language].adminDashboard.success);
    }, 1500);
  };

  const t = translations[language];

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col ${theme === 'dark' ? 'bg-[#050505] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar 
        theme={theme} 
        language={language} 
        user={user}
        onThemeToggle={toggleTheme} 
        onLangToggle={toggleLanguage}
        activeView={view as any}
        onViewChange={setView as any}
      />

      {showAuth && (
        <Auth 
          language={language} 
          onAuthComplete={onAuthComplete} 
          onCancel={() => { setShowAuth(false); setPendingSelection(null); }} 
        />
      )}

      <div className={`flex-grow transition-all duration-300 px-4 md:px-8 lg:px-12 pb-24 lg:pb-12 ${language === 'fa' ? 'lg:pr-24' : 'lg:pl-24'}`}>
        <header className="py-8 md:py-16 flex flex-col items-center">
          <div 
            className="flex flex-col items-center gap-2 group cursor-pointer animate-fade-in" 
            onClick={() => { setView('home'); setPack(null); }}
          >
             <h1 className="text-5xl md:text-8xl netflix-logo netflix-red transition-all duration-500 group-hover:scale-105 group-hover:brightness-110">
               {t.title}
             </h1>
             <div className="h-1 w-16 md:w-32 bg-red-600 rounded-full group-hover:w-48 transition-all duration-500"></div>
          </div>
          <p className="text-slate-500 text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.4em] mt-6 font-bold opacity-70 text-center px-4">
            {t.subtitle}
          </p>
        </header>

        <main className="w-full max-w-7xl mx-auto mb-12">
          {view === 'admin' ? (
            <AdminPanel language={language} users={allUsers} onSync={handleAdminSync} />
          ) : view === 'settings' ? (
            <div className="max-w-2xl mx-auto glass-card rounded-[2rem] p-6 md:p-12 space-y-6 md:space-y-10 animate-fade-in">
              <h2 className="text-2xl md:text-4xl font-black mb-8">{t.settings}</h2>
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-lg md:text-xl font-bold">{t.darkMode}</span>
                <button 
                  onClick={toggleTheme} 
                  className="text-3xl hover:scale-110 transition-transform p-2"
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? '🌙' : '☀️'}
                </button>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 gap-6">
                <span className="text-lg md:text-xl font-bold">{t.language}</span>
                <div className="flex gap-4">
                  <button 
                    onClick={() => toggleLanguage('fa')} 
                    className={`flex-1 md:flex-none px-8 py-3 rounded-full font-bold transition-all text-sm md:text-base border ${language === 'fa' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20' : 'bg-white/10 border-transparent hover:bg-white/20'}`}
                  >
                    فارسی
                  </button>
                  <button 
                    onClick={() => toggleLanguage('en')} 
                    className={`flex-1 md:flex-none px-8 py-3 rounded-full font-bold transition-all text-sm md:text-base border ${language === 'en' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20' : 'bg-white/10 border-transparent hover:bg-white/20'}`}
                  >
                    English
                  </button>
                </div>
              </div>
              {user && (
                <div className="flex flex-col gap-3 p-6 bg-white/5 rounded-2xl border border-white/5">
                  <label className="text-lg md:text-xl font-bold">{t.age}</label>
                  <input
                    type="number"
                    className="bg-black/40 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-red-600 transition-all font-bold"
                    value={user.age}
                    onChange={(e) => updatePreferences(user.favoriteGenres, user.preferredActors, parseInt(e.target.value))}
                  />
                </div>
              )}
            </div>
          ) : view === 'profile' ? (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              <div className="glass-card rounded-[2rem] p-6 md:p-12 text-center">
                {user ? (
                  <>
                    <div className="w-24 h-24 md:w-40 md:h-40 bg-gradient-to-br from-red-600 to-red-800 rounded-full mx-auto flex items-center justify-center text-4xl md:text-6xl font-black mb-6 shadow-2xl shadow-red-600/20">
                      {user.name[0]}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black">{user.name}</h2>
                    <p className="text-slate-400 font-bold text-base md:text-xl">{user.email}</p>
                    <p className="text-red-500 font-black text-sm mt-2">{t.age}: {user.age}</p>
                    {user.isAdmin && (
                      <button onClick={() => setView('admin')} className="mt-4 inline-block bg-red-600/20 text-red-500 px-4 py-1 rounded-full text-xs font-black uppercase">Admin Profile</button>
                    )}
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-8"></div>
                    <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-2xl mx-auto">
                      <div className="p-4 md:p-8 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Joined</p>
                        <p className="text-sm md:text-2xl font-black">{new Date(user.joinedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="p-4 md:p-8 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Sessions</p>
                        <p className="text-sm md:text-2xl font-black">{history.length}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="mt-12 text-red-600 font-black hover:bg-red-600/10 px-10 py-4 rounded-full transition-all border border-red-600/30 text-base md:text-lg w-full md:w-auto"
                    >
                      {t.logout}
                    </button>
                  </>
                ) : (
                  <div className="py-20">
                    <p className="text-xl md:text-2xl text-slate-400 mb-10 font-bold">{t.authRequired}</p>
                    <button
                      onClick={() => setShowAuth(true)}
                      className="bg-red-600 text-white font-black px-12 py-5 rounded-full text-xl md:text-2xl shadow-2xl shadow-red-600/30 hover:bg-red-700 transition-all transform hover:-translate-y-1"
                    >
                      {t.login}
                    </button>
                  </div>
                )}
              </div>

              {user && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass-card rounded-[2rem] p-6 md:p-12 space-y-10">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-black mb-6">{t.preferredGenres}</h3>
                      <div className="flex flex-wrap gap-3">
                        {t.genreList.map((genre: string) => (
                          <button
                            key={genre}
                            onClick={() => handleToggleGenre(genre)}
                            className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-sm md:text-base border transition-all ${
                              user.favoriteGenres.includes(genre)
                                ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                            }`}
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl md:text-3xl font-black mb-6">{t.preferredActors}</h3>
                      <div className="flex gap-2 mb-6">
                        <input
                          type="text"
                          placeholder={t.preferredActors}
                          className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 md:px-6 outline-none focus:border-red-600 transition-all text-sm md:text-base"
                          value={actorInput}
                          onChange={(e) => setActorInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddActor()}
                        />
                        <button
                          onClick={handleAddActor}
                          className="bg-red-600 text-white px-4 md:px-6 py-3 rounded-xl font-black text-sm md:text-base hover:bg-red-700 transition-all"
                        >
                          {t.addActor}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {(user.preferredActors || []).map((actor) => (
                          <div
                            key={actor}
                            className="bg-white/10 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 group hover:border-red-600/40 transition-all"
                          >
                            <span className="font-bold text-sm md:text-base">{actor}</span>
                            <button
                              onClick={() => handleRemoveActor(actor)}
                              className="text-slate-500 hover:text-red-500 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-[2rem] p-6 md:p-12 flex flex-col">
                    <h3 className="text-2xl md:text-3xl font-black mb-8">{t.favorites}</h3>
                    {user.favoriteMovies && user.favoriteMovies.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {user.favoriteMovies.map((movie, idx) => (
                          <div key={idx} className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 group flex flex-col">
                            <div className="h-40 bg-slate-900 relative">
                              <img 
                                src={`https://img.omdbapi.com/?i=${movie.imdb_id}&apikey=f3d350b2&h=600`}
                                onError={(e) => (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${movie.title}/400/300`}
                                className="w-full h-full object-cover opacity-50"
                                alt={movie.title}
                              />
                              <button 
                                onClick={() => handleToggleFavorite(movie)}
                                className="absolute top-3 left-3 p-2 bg-red-600 text-white rounded-full shadow-lg"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>
                            </div>
                            <div className="p-5 flex-grow flex flex-col">
                              <h4 className="font-black text-lg mb-1">{movie.title}</h4>
                              <p className="text-slate-500 text-xs mb-3">{movie.year} • {movie.genre}</p>
                              <p className="text-slate-300 text-sm line-clamp-3 mb-4">{movie.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 font-bold">{t.noFavorites}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : view === 'history' ? (
            <MoodHistory history={history} language={language} />
          ) : (
            <div className="w-full">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 md:py-48">
                  <div className="relative w-20 h-20 md:w-32 md:h-32 mb-12">
                     <div className="absolute inset-0 border-8 border-red-600/10 rounded-full"></div>
                     <div className="absolute inset-0 border-8 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-2xl md:text-4xl font-black mb-4 tracking-tight">{t.analyzing}</p>
                  <p className="text-slate-500 text-base md:text-xl text-center max-w-md px-4">{t.analyzingSub}</p>
                </div>
              ) : pack ? (
                <RecommendationDisplay 
                  pack={pack} 
                  onReset={() => setPack(null)} 
                  language={language} 
                  onToggleFavorite={handleToggleFavorite}
                  favorites={user?.favoriteMovies || []}
                />
              ) : (
                <MoodSelector onComplete={handleSelection} language={language} />
              )}
            </div>
          )}
        </main>
      </div>

      <footer className="w-full bg-black/40 backdrop-blur-sm py-8 md:py-12 border-t border-white/5 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          <div className="text-2xl md:text-3xl netflix-logo netflix-red opacity-80">{t.title}</div>
          <div className="text-[10px] md:text-sm text-slate-500 font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase">
            {t.tagline} • 2024
          </div>
          <div className="h-1 w-12 bg-red-600/30 rounded-full mt-4"></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
