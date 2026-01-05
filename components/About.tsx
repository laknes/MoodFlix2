
import React from 'react';
import { translations } from '../translations';

const About = ({ language }) => {
  const t = translations[language].aboutPage;
  const isRtl = language === 'fa';

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in space-y-12">
      <div className="text-center">
        <h2 className="text-4xl md:text-6xl font-black gradient-text mb-4 uppercase tracking-tighter">
          {translations[language].about}
        </h2>
        <div className="h-1 w-24 bg-red-600 mx-auto rounded-full mb-12 shadow-lg shadow-red-600/20"></div>
      </div>

      <div className="grid grid-cols-1 gap-8 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-3xl rounded-full -mr-20 -mt-10"></div>
        
        <section className="glass-card p-8 md:p-12 rounded-[2.5rem] border border-white/5 relative z-10 transition-all hover:border-red-600/20 group">
          <div className={`flex items-center gap-4 mb-6 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
            <h3 className="text-2xl md:text-3xl font-black text-red-600">{t.missionTitle}</h3>
            <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="text-slate-400 text-lg leading-relaxed font-medium">
            {t.missionText}
          </p>
        </section>

        <section className="glass-card p-8 md:p-12 rounded-[2.5rem] border border-white/5 relative z-10 transition-all hover:border-red-600/20 group">
          <div className={`flex items-center gap-4 mb-6 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
            <h3 className="text-2xl md:text-3xl font-black text-red-600">{t.aiRoleTitle}</h3>
            <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75V19a2 2 0 11-4 0v-.25c0-1.035-.32-2.04-.92-2.85l-.547-.547z" />
              </svg>
            </div>
          </div>
          <p className="text-slate-400 text-lg leading-relaxed font-medium">
            {t.aiRoleText}
          </p>
        </section>

        <section className="glass-card p-8 md:p-12 rounded-[2.5rem] border border-white/5 relative z-10 transition-all hover:border-red-600/20 group">
          <div className={`flex items-center gap-4 mb-6 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
            <h3 className="text-2xl md:text-3xl font-black text-red-600">{t.teamTitle}</h3>
            <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-slate-400 text-lg leading-relaxed font-medium">
            {t.teamText}
          </p>
        </section>
      </div>
      
      <div className="text-center pt-8">
        <p className="text-slate-600 font-bold uppercase tracking-[0.3em] text-xs">
          © 2025 Cinematic Intelligence Lab
        </p>
      </div>
    </div>
  );
};

export default About;
