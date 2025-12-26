
import React from 'react';
import { Theme, Language, User } from '../types';
import { translations } from '../translations';

// Fix: Adding 'auth' to the supported views to match App.tsx state and prevent type mismatch errors
interface Props {
  theme: Theme;
  language: Language;
  user: User | null;
  onThemeToggle: () => void;
  onLangToggle: (lang: Language) => void;
  activeView: 'home' | 'history' | 'settings' | 'profile' | 'admin' | 'auth';
  onViewChange: (view: 'home' | 'history' | 'settings' | 'profile' | 'admin' | 'auth') => void;
}

const Sidebar: React.FC<Props> = ({ theme, language, user, onThemeToggle, onLangToggle, activeView, onViewChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const t = translations[language];
  const isRtl = language === 'fa';

  const NavItem = ({ id, icon, label, mobile }: { id: any, icon: React.ReactNode, label: string, mobile?: boolean }) => (
    <button
      onClick={() => onViewChange(id)}
      className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-4 p-2 lg:p-4 rounded-xl transition-all flex-1 lg:w-full ${
        activeView === id 
          ? 'text-red-600 lg:bg-red-600 lg:text-white lg:shadow-xl lg:shadow-red-600/20' 
          : 'hover:bg-white/10 text-slate-400'
      }`}
    >
      <span className="flex-shrink-0 scale-90 lg:scale-110">{icon}</span>
      <span className={`text-[9px] md:text-[10px] lg:text-base font-bold whitespace-nowrap uppercase tracking-tighter lg:tracking-widest ${!isOpen && 'lg:hidden'} ${mobile ? '' : 'hidden lg:block'}`}>
        {label}
      </span>
    </button>
  );

  const HomeIcon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
  const HistoryIcon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  const ProfileIcon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
  const SettingsIcon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  const AdminIcon = <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;

  const MoonIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
  const SunIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>;
  const GlobeIcon = <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;

  return (
    <>
      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-2xl border-t border-white/5 z-[150] flex items-center justify-around px-4 py-2 safe-area-inset-bottom">
        <NavItem mobile id="home" label={t.home} icon={HomeIcon} />
        <NavItem mobile id="history" label={t.history} icon={HistoryIcon} />
        {user?.isAdmin && <NavItem mobile id="admin" label={t.admin} icon={AdminIcon} />}
        <NavItem mobile id="profile" label={t.profile} icon={ProfileIcon} />
      </div>

      {/* Desktop Sidebar */}
      <div 
        className={`hidden lg:flex fixed top-0 bottom-0 z-[100] transition-all duration-300 glass-card border-none flex-col ${
          isOpen ? 'w-72' : 'w-24'
        } ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} border-white/10`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="p-10 flex items-center justify-center border-b border-white/5 mb-8">
          <h2 className={`netflix-logo netflix-red transition-all duration-500 ${isOpen ? 'text-4xl' : 'text-2xl'}`}>
            {isOpen ? t.title : t.title[0]}
          </h2>
        </div>

        <nav className="flex-grow px-4 space-y-3">
          <NavItem id="home" label={t.home} icon={HomeIcon} />
          <NavItem id="history" label={t.history} icon={HistoryIcon} />
          <NavItem id="profile" label={t.profile} icon={ProfileIcon} />
          {user?.isAdmin && <NavItem id="admin" label={t.admin} icon={AdminIcon} />}
          <NavItem id="settings" label={t.settings} icon={SettingsIcon} />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-6">
          {isOpen ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.darkMode}</label>
                <button 
                  onClick={onThemeToggle}
                  className="w-full bg-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors border border-white/5"
                >
                  <span className="text-sm font-bold">{theme === 'dark' ? t.darkMode : t.lightMode}</span>
                  <span className="text-xl">{theme === 'dark' ? MoonIcon : SunIcon}</span>
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.language}</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onLangToggle('fa')}
                    className={`flex-1 p-3 rounded-xl text-xs font-black transition-all border ${language === 'fa' ? 'bg-red-600 border-red-600 text-white' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                  >
                    فارسی
                  </button>
                  <button 
                    onClick={() => onLangToggle('en')}
                    className={`flex-1 p-3 rounded-xl text-xs font-black transition-all border ${language === 'en' ? 'bg-red-600 border-red-600 text-white' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8 py-4">
              <button onClick={onThemeToggle} className="text-slate-400 hover:text-red-500 hover:scale-125 transition-all">
                {theme === 'dark' ? MoonIcon : SunIcon}
              </button>
              <button 
                onClick={() => onLangToggle(language === 'fa' ? 'en' : 'fa')} 
                className="text-slate-400 hover:text-red-500 hover:scale-125 transition-all"
              >
                {GlobeIcon}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
