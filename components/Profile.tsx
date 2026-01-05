import React, { useState } from 'react';
import { translations } from '../translations';
import { updateUserProfile } from '../services/authService';

const GENRE_OPTIONS = [
  "Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Romance", 
  "Documentary", "Animation", "Thriller", "Adventure", "Fantasy", 
  "Crime", "Mystery", "Biography", "History", "Musical", "Western"
];

const Profile = ({ user, language, onUpdate, onLogout }) => {
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: user.name,
    birthday: user.birthday || '',
    favoriteGenres: user.favoriteGenres || [],
    preferredActors: user.preferredActors?.join(', ') || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const calculateAge = (birthday) => {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const age = calculateAge(formData.birthday);
      const updated = await updateUserProfile({
        id: user.id,
        name: formData.name,
        birthday: formData.birthday,
        age: age,
        favoriteGenres: formData.favoriteGenres,
        preferredActors: formData.preferredActors.split(',').map(s => s.trim()).filter(Boolean)
      });
      onUpdate(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genre) => {
    setFormData(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-16 px-4 animate-fade-in">
      <div className="glass-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-3xl rounded-full -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-red-600/10 rounded-full flex items-center justify-center text-4xl font-black text-red-600 border border-red-600/20 shadow-2xl shadow-red-600/10">
              {user.name[0].toUpperCase()}
            </div>
            <div className="text-center md:text-right">
              <h2 className="text-3xl md:text-5xl font-black gradient-text mb-2">{t.profile}</h2>
              <p className="text-slate-600 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">{user.email}</p>
              <div className="flex items-center justify-center md:justify-end gap-2 mt-2">
                <span className="px-3 py-1 bg-red-600/10 text-netflix-red rounded-full text-[10px] font-black uppercase tracking-widest border border-red-600/20">
                  {calculateAge(user.birthday)} Years Old
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-600/10 text-red-600 border border-red-600/20 rounded-xl font-black text-sm hover:bg-red-600 hover:text-white transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t.logout}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">{t.fullName}</label>
              <input 
                type="text" 
                className="w-full bg-slate-200/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold text-slate-800 dark:text-white"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">{t.birthday}</label>
              <input 
                type="date" 
                className="w-full bg-slate-200/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold text-slate-800 dark:text-white"
                value={formData.birthday}
                onChange={e => setFormData({ ...formData, birthday: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">
              {language === 'fa' ? 'ژانرهای مورد علاقه' : 'Favorite Genres'}
            </label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map(genre => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black transition-all border ${
                    formData.favoriteGenres.includes(genre)
                      ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'bg-slate-200 dark:bg-white/5 border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-500 hover:border-red-600/30'
                  }`}
                >
                  {genre.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">
              {language === 'fa' ? 'بازیگران مورد علاقه (با کاما جدا کنید)' : 'Preferred Actors (comma separated)'}
            </label>
            <textarea 
              className="w-full bg-slate-200/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-4 focus:border-red-600 outline-none transition-all font-bold min-h-[100px] text-slate-800 dark:text-white"
              placeholder="e.g. Christopher Nolan, Cillian Murphy"
              value={formData.preferredActors}
              onChange={e => setFormData({ ...formData, preferredActors: e.target.value })}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full md:w-auto px-12 bg-red-600 text-white font-black py-4 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-red-600/20 uppercase text-sm"
            >
              {loading ? '...' : t.saveChanges}
            </button>
            {success && (
              <span className="text-emerald-600 dark:text-emerald-500 font-bold text-sm animate-fade-in">
                {language === 'fa' ? 'پروفایل با موفقیت بروزرسانی شد' : 'Profile updated successfully'}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;