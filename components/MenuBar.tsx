
import React, { useState, useEffect } from 'react';
import { translations } from '../translations.ts';

const MenuBar = ({ language, setLanguage, activeView, onViewChange, user, resetApp, theme, setTheme }) => {
  const t = translations[language] || translations.fa;
  const isRtl = language === 'fa';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLink = ({ id, label }) => (
    <button 
      onClick={() => {
        onViewChange(id);
        setIsMobileMenuOpen(false);
        if (id === 'home') resetApp();
      }}
      className={`px-4 py-2 font-bold uppercase tracking-widest text-[11px] transition-all relative group ${activeView === id ? 'text-netflix-red' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
    >
      {label}
      <span className={`absolute bottom-0 left-4 right-4 h-0.5 bg-netflix-red transition-all duration-300 ${activeView === id ? 'opacity-100 shadow-[0_0_10px_#E50914]' : 'opacity-0 group-hover:opacity-100'}`}></span>
    </button>
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex items-center justify-between px-6 md:px-12 py-3 md:py-4 ${isScrolled ? 'bg-white/80 dark:bg-black/90 backdrop-blur-3xl border-b border-black/5 dark:border-white/5 shadow-xl' : 'bg-transparent'}`}>
      <div className={`flex items-center gap-12 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
        <h1 
          onClick={resetApp} 
          className="text-2xl md:text-3xl font-black text-netflix-red cursor-pointer tracking-tighter uppercase transform hover:scale-105 transition-transform"
        >
          {t.title}
        </h1>
        <div className={`hidden lg:flex items-center gap-2 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
          <NavLink id="home" label={t.home} />
          <NavLink id="history" label={t.history} />
          <NavLink id="about" label={t.about} />
          {user?.isAdmin && <NavLink id="admin" label={t.admin} />}
        </div>
      </div>

      <div className={`flex items-center gap-3 md:gap-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Modern Language Toggle */}
        <button 
          onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
          className="group relative flex items-center gap-2 px-3 py-1.5 bg-slate-200/50 dark:bg-white/10 hover:bg-slate-300/50 dark:hover:bg-white/20 rounded-full transition-all border border-black/5 dark:border-white/10"
        >
          <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-netflix-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
            {language === 'fa' ? 'EN' : 'FA'}
          </span>
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 bg-slate-200/50 dark:bg-white/10 hover:bg-slate-300/50 dark:hover:bg-white/20 rounded-full transition-all border border-black/5 dark:border-white/10"
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464a1 1 0 10-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/></svg>
          ) : (
            <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
          )}
        </button>

        {/* Profile / Login */}
        {user ? (
          <button 
            onClick={() => onViewChange('profile')} 
            className="flex items-center gap-2 p-1.5 bg-slate-200/50 dark:bg-white/10 hover:bg-slate-300/50 dark:hover:bg-white/20 rounded-full transition-all border border-black/5 dark:border-white/10 group"
          >
            <div className="w-8 h-8 bg-red-600/10 rounded-full flex items-center justify-center font-black text-xs text-netflix-red border border-red-600/20 shadow-sm">
              {user.name[0].toUpperCase()}
            </div>
            <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white pr-2">{user.name}</span>
          </button>
        ) : (
          <button 
            onClick={() => onViewChange('profile')} 
            className="flex items-center gap-2 px-5 py-2 bg-netflix-red text-white rounded-full transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-red-600/20 border border-red-600/30 group"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">{t.login}</span>
          </button>
        )}

        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-slate-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[60px] bg-white/95 dark:bg-black/95 backdrop-blur-3xl lg:hidden animate-fade-in flex flex-col p-12 gap-8 text-center">
          <NavLink id="home" label={t.home} />
          <NavLink id="history" label={t.history} />
          <NavLink id="about" label={t.about} />
          {user?.isAdmin && <NavLink id="admin" label={t.admin} />}
        </div>
      )}
    </nav>
  );
};

export default MenuBar;
