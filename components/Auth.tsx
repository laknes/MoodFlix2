
import React, { useState } from 'react';
import { Language, User } from '../types';
import { translations } from '../translations';

interface Props {
  language: Language;
  onAuthComplete: (user: User) => void;
  onCancel: () => void;
}

const Auth: React.FC<Props> = ({ language, onAuthComplete, onCancel }) => {
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    name: '',
    age: ''
  });
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signup') {
        if (!formData.age) {
            alert(language === 'fa' ? 'لطفا سن خود را وارد کنید' : 'Please enter your age');
            return;
        }
        if (!ageConfirmed) {
            alert(language === 'fa' ? 'لطفا تاییدیه سن را علامت بزنید' : 'Please confirm your age');
            return;
        }
    }

    // Simulated Authentication
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name || formData.email.split('@')[0],
      email: formData.email,
      age: parseInt(formData.age) || 18,
      joinedAt: new Date().toISOString(),
      favoriteGenres: [],
      preferredActors: []
    };
    
    localStorage.setItem('moodflix_user', JSON.stringify(user));
    onAuthComplete(user);
  };

  return (
    <div className="w-full max-w-lg mx-auto py-6 md:py-12 animate-fade-in">
      <div className="glass-card p-8 md:p-14 rounded-[2.5rem] md:rounded-[3.5rem] border-white/10 shadow-[0_0_80px_rgba(229,9,20,0.15)]">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-black netflix-red mb-4 tracking-tighter">
            {mode === 'login' ? t.login : t.signup}
          </h2>
          <p className="text-slate-400 font-bold text-sm md:text-base">
            {mode === 'signup' ? t.ageHint : t.authRequired}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div className="space-y-5 animate-in slide-in-from-top-4 duration-500">
              <div>
                <label className="block text-[10px] md:text-xs font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">{t.fullName}</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold placeholder:text-slate-700 text-lg"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">{t.age}</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="120"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold placeholder:text-slate-700 text-lg"
                  placeholder="18"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3 py-2 bg-red-600/5 px-4 rounded-xl border border-red-600/10">
                <input 
                  type="checkbox" 
                  id="ageConfirm"
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                  checked={ageConfirmed}
                  onChange={e => setAgeConfirmed(e.target.checked)}
                />
                <label htmlFor="ageConfirm" className="text-xs md:text-sm font-bold text-slate-400 cursor-pointer select-none">
                  {t.ageGateConfirmation}
                </label>
              </div>
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] md:text-xs font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">{t.email}</label>
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold placeholder:text-slate-700 text-lg"
                placeholder="email@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">{t.password}</label>
              <input
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold placeholder:text-slate-700 text-lg"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white font-black py-5 rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95 text-xl mt-4"
          >
            {mode === 'login' ? t.login : t.signup}
          </button>
        </form>

        <div className="mt-12 text-center space-y-6">
          <p className="text-slate-500 font-bold">
            {mode === 'login' ? t.noAccount : t.alreadyRegistered}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="mx-2 text-white hover:text-red-500 font-black transition-all underline underline-offset-8 decoration-red-600/50"
            >
              {mode === 'login' ? t.signup : t.login}
            </button>
          </p>
          <div className="flex justify-center pt-4 border-t border-white/5">
            <button
              onClick={onCancel}
              className="text-slate-600 hover:text-white font-black text-xs uppercase tracking-[0.3em] transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
