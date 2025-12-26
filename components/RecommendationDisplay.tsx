import React, { useState } from 'react';
import { MoodPack, Language, MovieRecommendation } from '../types';
import { THEME_ICONS, MOOD_COLORS } from '../constants';
import { translations } from '../translations';

interface Props {
  pack: MoodPack;
  onReset: () => void;
  language: Language;
  onToggleFavorite: (movie: MovieRecommendation) => void;
  favorites: MovieRecommendation[];
  userAge?: number;
}

const RecommendationDisplay: React.FC<Props> = ({ pack, onReset, language, onToggleFavorite, favorites, userAge }) => {
  const ThemeIcon = THEME_ICONS[pack.iconType] || THEME_ICONS.moon;
  const t = translations[language];
  const moodColor = pack.primaryMood ? MOOD_COLORS[pack.primaryMood] : '#E50914';
  
  const [activeShareMovie, setActiveShareMovie] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const getShareText = (movie?: MovieRecommendation) => {
    if (movie) {
      return language === 'fa' 
        ? `🎬 پیشنهاد فیلم برای امشب: ${movie.title} (${movie.year})\n✨ تحلیل شده توسط MOODFLIX\n#سینما #مودفلیکس`
        : `🎬 Movie recommendation for tonight: ${movie.title} (${movie.year})\n✨ Analyzed by MOODFLIX\n#Cinema #Moodflix`;
    }
    return language === 'fa'
      ? `🌙 مود امشب من: ${pack.name}\n🎬 فیلم پیشنهادی: ${pack.movies[0].title}\n✨ کشف شده در MOODFLIX`
      : `🌙 My vibe tonight: ${pack.name}\n🎬 Featured movie: ${pack.movies[0].title}\n✨ Discovered on MOODFLIX`;
  };

  const shareToTwitter = (movie?: MovieRecommendation) => {
    const text = getShareText(movie);
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToFacebook = (movie?: MovieRecommendation) => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const copyToClipboard = (movie?: MovieRecommendation) => {
    const text = getShareText(movie);
    const feedbackId = movie ? movie.title : 'vibe';
    
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(feedbackId);
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  const getCategoryLabel = (cat: string) => {
    return (t.categories as any)[cat] || cat;
  };

  const isFavorited = (title: string) => favorites.some(f => f.title === title);

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-12 px-3 md:px-4 animate-in fade-in zoom-in duration-700">
      <div className="text-center mb-10 md:mb-16 flex flex-col items-center">
        <div 
          className="mb-4 md:mb-6 p-4 md:p-6 glass-card rounded-full scale-90 md:scale-100"
          style={{ borderColor: `${moodColor}4d`, backgroundColor: `${moodColor}0d`, boxShadow: `0 0 40px ${moodColor}26` }}
        >
          <div style={{ color: moodColor }}>
            {ThemeIcon}
          </div>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black gradient-text mb-4 md:mb-6 px-4">{pack.name}</h2>
        
        {userAge && userAge < 18 && (
          <div className="mb-4 bg-red-600/10 border border-red-600/20 px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold text-red-500 animate-pulse">
            {t.ageRestrictionNotice}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 md:gap-4 max-w-2xl px-4">
          <div className="h-[1px] w-4 md:w-8 shrink-0" style={{ backgroundColor: moodColor }}></div>
          <p className="text-base sm:text-xl md:text-2xl text-slate-300 italic opacity-90 leading-relaxed">" {pack.emotionalQuote} "</p>
          <div className="h-[1px] w-4 md:w-8 shrink-0" style={{ backgroundColor: moodColor }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mb-12 md:mb-20">
        {pack.movies.map((movie, idx) => {
          const favorited = isFavorited(movie.title);
          const isSharingThis = activeShareMovie === movie.title;
          const isCopied = copyFeedback === movie.title;
          
          return (
            <div 
              key={idx} 
              className="glass-card rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group flex flex-col transition-all duration-500 transform hover:-translate-y-2 border border-white/5"
              style={{ '--hover-color': moodColor } as React.CSSProperties}
            >
              <div className="h-[280px] sm:h-[350px] md:h-[450px] bg-slate-900 relative overflow-hidden">
                <img 
                  src={`https://img.omdbapi.com/?i=${movie.imdb_id}&apikey=f3d350b2&h=1000`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${movie.title}/500/800`;
                  }}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" 
                  alt={movie.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                  <button 
                    onClick={() => onToggleFavorite(movie)}
                    className={`p-2.5 sm:p-3 rounded-full backdrop-blur-md transition-all ${favorited ? 'text-white shadow-lg' : 'bg-black/40 text-white/70 hover:text-white hover:bg-black/60'}`}
                    // Fix: shadowColor is not a valid CSS property, using boxShadow instead.
                    style={favorited ? { backgroundColor: moodColor, boxShadow: `0 0 20px ${moodColor}80` } : {}}
                    title={favorited ? t.removeFromFav : t.saveToFav}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={favorited ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  <div className="relative">
                    <button 
                      onClick={() => setActiveShareMovie(isSharingThis ? null : movie.title)}
                      className={`p-2.5 sm:p-3 rounded-full backdrop-blur-md transition-all ${isSharingThis ? 'bg-white text-black' : 'bg-black/40 text-white/70 hover:text-white hover:bg-black/60'}`}
                      title={t.shareMovie}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    
                    {isSharingThis && (
                      <div className={`absolute top-0 ${language === 'fa' ? 'right-full mr-2' : 'left-full ml-2'} flex gap-2 animate-in slide-in-from-${language === 'fa' ? 'right' : 'left'}-2 duration-300`}>
                        <button onClick={() => shareToTwitter(movie)} className="p-2.5 bg-sky-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                        </button>
                        <button onClick={() => shareToFacebook(movie)} className="p-2.5 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </button>
                        <button 
                          onClick={() => copyToClipboard(movie)} 
                          className={`p-2.5 rounded-full shadow-lg hover:scale-110 transition-all ${isCopied ? 'bg-green-500 text-white' : 'bg-slate-700 text-white'}`}
                        >
                          {isCopied ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                  <span 
                    className="text-white text-[9px] sm:text-[10px] md:text-xs font-black px-2.5 py-1 md:px-3 md:py-1.5 rounded-full uppercase shadow-lg border border-white/10"
                    style={{ backgroundColor: moodColor }}
                  >
                    {getCategoryLabel(movie.category)}
                  </span>
                  {movie.content_rating && (
                    <span className="bg-black/70 text-white text-[8px] md:text-[10px] font-black px-2 py-1 rounded-md border border-white/10 uppercase tracking-tighter">
                      {movie.content_rating}
                    </span>
                  )}
                </div>
                
                <div className={`absolute bottom-4 md:bottom-6 ${language === 'fa' ? 'right-4 md:right-6 text-right' : 'left-4 md:left-6 text-left'} right-4 md:right-6`}>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-1 leading-tight group-hover:text-red-500 transition-colors">{movie.title}</h3>
                    <p className="text-slate-400 font-bold text-[10px] sm:text-xs md:text-sm mb-2">{movie.year} • {movie.genre}</p>
                    <div className={`flex items-center ${language === 'fa' ? 'justify-end' : 'justify-start'} gap-1.5 md:gap-2 text-[9px] sm:text-[10px] md:text-xs font-bold`} style={{ color: moodColor }}>
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{t.bestTime} {movie.timeToWatch}</span>
                    </div>
                </div>
              </div>
              <div className="p-5 sm:p-6 md:p-8 flex-grow flex flex-col bg-white/[0.02]">
                <p className="text-slate-300 mb-5 md:mb-6 leading-relaxed text-xs sm:text-sm md:text-base line-clamp-3 md:line-clamp-4">{movie.description}</p>
                
                <div className="flex flex-col gap-4 mt-auto">
                  {movie.musicSuggestion && (
                    <div className="bg-white/5 p-3 sm:p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-red-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                          <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-wider">Atmosphere</span>
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-[11px] leading-relaxed text-slate-400 font-medium line-clamp-2">
                        {movie.musicSuggestion}
                      </p>
                    </div>
                  )}

                  <div className="bg-white/5 p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/5 border-l-4" style={{ borderLeftColor: moodColor }}>
                    <p className="text-[11px] sm:text-xs md:text-sm leading-relaxed italic opacity-80" style={{ color: `${moodColor}ee` }}>
                      {movie.whyItFits}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-12 md:mb-16">
        <div 
          className="glass-card p-6 md:p-8 lg:p-10 rounded-[1.5rem] md:rounded-[2rem] flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border border-white/5"
          style={{ borderColor: `${moodColor}1a` }}
        >
          <div 
            className="w-14 h-14 md:w-16 md:h-16 rounded-full border flex items-center justify-center shadow-lg shrink-0"
            style={{ backgroundColor: `${moodColor}10`, borderColor: `${moodColor}20`, color: moodColor }}
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <div className="flex-grow text-center sm:text-right">
            <h4 className="font-black text-lg md:text-xl mb-1">{t.musicAtmosphere}</h4>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-4">{pack.suggestedMusic}</p>
            <div className="flex justify-center sm:justify-start gap-3">
              <a href={pack.spotifyLink} target="_blank" rel="noreferrer" className="bg-[#1DB954] text-white px-5 md:px-6 py-2 rounded-full text-[10px] md:text-xs font-black hover:scale-105 transition-all shadow-md">Spotify</a>
              <a href={pack.soundcloudLink} target="_blank" rel="noreferrer" className="bg-[#FF3300] text-white px-5 md:px-6 py-2 rounded-full text-[10px] md:text-xs font-black hover:scale-105 transition-all shadow-md">SC</a>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 lg:p-10 rounded-[1.5rem] md:rounded-[2rem] flex flex-col justify-center items-center text-center gap-4 border border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.shareVibe}</p>
          <div className="flex gap-3 sm:gap-4 w-full justify-center max-w-sm">
            <button onClick={() => shareToTwitter()} className="flex-1 bg-sky-500 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col items-center gap-1.5 hover:bg-sky-600 transition-all active:scale-95 shadow-lg shadow-sky-500/10">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              <span className="text-[8px] sm:text-[9px] font-black uppercase">Twitter</span>
            </button>
            <button onClick={() => shareToFacebook()} className="flex-1 bg-blue-600 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col items-center gap-1.5 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/10">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span className="text-[8px] sm:text-[9px] font-black uppercase">Facebook</span>
            </button>
            <button onClick={() => copyToClipboard()} className={`flex-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col items-center gap-1.5 transition-all shadow-lg ${copyFeedback === 'vibe' ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-slate-200'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              <span className="text-[8px] sm:text-[9px] font-black uppercase">{copyFeedback === 'vibe' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="text-center pb-8 md:pb-12 px-4">
        <button 
          onClick={onReset}
          className="text-slate-500 transition-all font-bold border-b border-transparent hover:border-slate-300 py-1 text-xs sm:text-sm md:text-base opacity-60 hover:opacity-100"
        >
          {t.reset}
        </button>
      </div>
    </div>
  );
};

export default RecommendationDisplay;
