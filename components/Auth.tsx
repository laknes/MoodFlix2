
import React from 'react';
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
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple simulated auth
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-card w-full max-w-md p-10 rounded-[2.5rem] border-red-600/20 shadow-[0_0_50px_rgba(229,9,20,0.2)] animate-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black netflix-red mb-2">{mode === 'login' ? t.login : t.signup}</h2>
          <p className="text-slate-400 font-bold">{t.authRequired}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">{t.fullName}</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-red-600 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">{t.age}</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="120"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-red-600 outline-none transition-all"
                  value={formData.age}
                  placeholder={t.ageHint}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">{t.email}</label>
            <input
              type="email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-red-600 outline-none transition-all"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">{t.password}</label>
            <input
              type="password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-red-600 outline-none transition-all"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white font-black py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-red-600/20"
          >
            {mode === 'login' ? t.login : t.signup}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-slate-400 hover:text-white font-bold transition-all text-sm underline underline-offset-4"
          >
            {mode === 'login' ? t.noAccount : t.alreadyRegistered}
          </button>
          <br />
          <button
            onClick={onCancel}
            className="text-slate-600 hover:text-slate-400 font-bold text-xs"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
