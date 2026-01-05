
import React, { useState } from 'react';
import { translations } from '../translations';

const Sidebar = ({
  theme,
  language,
  user,
  onThemeToggle,
  onLangToggle,
  activeView,
  onViewChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const t = translations[language] ?? translations.en;
  const isRtl = language === 'fa';

  const NavItem = ({
    id,
    icon,
    label,
    mobile = false
  }) => (
    <button
      onClick={() => onViewChange(id)}
      className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-4 p-2 lg:p-4 rounded-xl transition-all flex-1 lg:w-full ${
        activeView === id
          ? 'text-red-600 lg:bg-red-600 lg:text-white lg:shadow-xl lg:shadow-red-600/20'
          : 'hover:bg-white/10 text-slate-400'
      }`}
    >
      <span className="flex-shrink-0 scale-90 lg:scale-110">{icon}</span>
      <span
        className={`text-[9px] md:text-[10px] lg:text-base font-bold whitespace-nowrap uppercase tracking-tighter lg:tracking-widest ${
          !isOpen && 'lg:hidden'
        } ${mobile ? '' : 'hidden lg:block'}`}
      >
        {label}
      </span>
    </button>
  );

  const HomeIcon = (
    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );

  const HistoryIcon = (
    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ProfileIcon = (
    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const AdminIcon = (
    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );

  const AboutIcon = (
    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <aside className={`fixed lg:relative bottom-0 left-0 right-0 lg:h-screen bg-slate-100 dark:bg-[#080808] border-t lg:border-t-0 ${isRtl ? 'lg:border-l' : 'lg:border-r'} border-black/5 dark:border-white/5 transition-all duration-500 z-50 flex lg:flex-col ${isOpen ? 'lg:w-64' : 'lg:w-20'}`}>
       <div className="hidden lg:flex flex-col items-center py-8 gap-8 w-full">
          <button onClick={() => setIsOpen(!isOpen)} className="p-3 hover:bg-white/10 rounded-xl text-slate-500">
             <svg className={`w-6 h-6 transition-transform ${isOpen && isRtl ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
             </svg>
          </button>
       </div>
       <div className="flex-1 flex lg:flex-col items-center justify-around lg:justify-start px-2 lg:px-4 py-2 lg:py-4 gap-2 lg:gap-4 w-full">
          <NavItem id="home" icon={HomeIcon} label={t.home} mobile />
          <NavItem id="history" icon={HistoryIcon} label={t.history} mobile />
          <NavItem id="about" icon={AboutIcon} label={t.about} mobile />
          {user && <NavItem id="profile" icon={ProfileIcon} label={t.profile} mobile />}
          {user?.isAdmin && <NavItem id="admin" icon={AdminIcon} label={t.admin} mobile />}
       </div>
    </aside>
  );
};

export default Sidebar;
