
import React from 'react';
import { MoodPack, Language, MovieRecommendation } from '../types';
import { THEME_ICONS, MOOD_COLORS } from '../constants';
import { translations } from '../translations';

interface Props {
  pack: MoodPack;
  onReset: () => void;
  language: Language;
  onToggleFavorite: (movie: MovieRecommendation) => void;
  favorites: MovieRecommendation[];
}

const RecommendationDisplay: React.FC<Props> = ({ pack, onReset, language, onToggleFavorite, favorites }) => {
  const ThemeIcon = THEME_ICONS[pack.iconType] || THEME_ICONS.moon;
  const t = translations[language];
  const moodColor = pack.primaryMood ? MOOD_COLORS[pack.primaryMood] : '#E50914';

  const handleShare = async () => {
    const shareText = ` tonight's mood: ${pack.name}\n🎬 featured movie: ${pack.movies[0].title}\n✨ moodflix - emotional intelligence cinema`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Moodflix Vibe',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert(t.copied);
    }
  };

  const getCategoryLabel = (cat: string) => {
    return t.categories[cat as keyof typeof t.categories] || cat;
  };

  const isFavorited = (title: string) => favorites.some(f => f.title === title);

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-12 px-2 md:px-4 animate-in fade-in zoom-in duration-700">
      <div className="text-center mb-10 md:mb-16 flex flex-col items-center">
        <div 
          className="mb-4 md:mb-6 p-4 md:p-6 glass-card rounded-full scale-75 md:scale-100"
          style={{ borderColor: `${moodColor}4d`, backgroundColor: `${moodColor}0d`, boxShadow: `0 0 40px ${moodColor}26` }}
        >
          <div style={{ color: moodColor }}>
            {ThemeIcon}
          </div>
        </div>
        <h2 className="text-3xl md:text-5xl font-black gradient-text mb-4 md:mb-6 px-4">{pack.name}</h2>
        <div className="flex items-center justify-center gap-2 md:gap-4 max-w-2xl px-4">
          <div className="h-[1px] w-4 md:w-8 shrink-0" style={{ backgroundColor: moodColor }}></div>
          <p className="text-lg md:text-2xl text-slate-300 italic opacity-90 leading-relaxed">" {pack.emotionalQuote} "</p>
          <div className="h-[1px] w-4 md:w-8 shrink-0" style={{ backgroundColor: moodColor }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mb-12 md:mb-20">
        {pack.movies.map((movie, idx) => {
          const favorited = isFavorited(movie.title);
          return (
            <div 
              key={idx} 
              className="glass-card rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group flex flex-col transition-all duration-500 transform hover:-translate-y-2"
              style={{ '--hover-color': moodColor } as React.CSSProperties}
            >
              <div className="h-[250px] md:h-[400px] bg-slate-900 relative overflow-hidden">
                <img 
                  src={`https://img.omdbapi.com/?i=${movie.imdb_id}&apikey=f3d350b2&h=1000`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${movie.title}/500/800`;
                  }}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" 
                  alt={movie.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                
                <button 
                  onClick={() => onToggleFavorite(movie)}
                  className={`absolute top-4 left-4 p-3 rounded-full backdrop-blur-md transition-all z-10 ${favorited ? 'text-white' : 'bg-black/40 text-white/70 hover:text-white hover:bg-black/60'}`}
                  style={favorited ? { backgroundColor: moodColor } : {}}
                  title={favorited ? t.removeFromFav : t.saveToFav}
                >
                  <svg className="w-5 h-5" fill={favorited ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                <div className="absolute top-4 right-4">
                  <span 
                    className="text-white text-[10px] md:text-xs font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full uppercase"
                    style={{ backgroundColor: moodColor }}
                  >
                    {getCategoryLabel(movie.category)}
                  </span>
                </div>
                <div className={`absolute bottom-4 md:bottom-6 ${language === 'fa' ? 'right-4 md:right-6 text-right' : 'left-4 md:left-6 text-left'} right-4 md:right-6`}>
                    <h3 className="text-xl md:text-3xl font-black mb-1 leading-tight">{movie.title}</h3>
                    <p className="text-slate-400 font-bold text-xs md:text-sm mb-2">{movie.year} • {movie.genre}</p>
                    <div className={`flex items-center ${language === 'fa' ? 'justify-end' : 'justify-start'} gap-1 md:gap-2 text-[10px] md:text-xs font-bold`} style={{ color: moodColor }}>
                      <span>{t.bestTime} {movie.timeToWatch}</span>
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                </div>
              </div>
              <div className="p-6 md:p-8 flex-grow flex flex-col">
                <p className="text-slate-300 mb-4 md:mb-6 leading-relaxed text-sm md:text-base line-clamp-4">{movie.description}</p>
                <div className="bg-white/5 p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/10 mt-auto">
                  <p className="text-xs md:text-sm leading-relaxed italic" style={{ color: `${moodColor}dd` }}>
                    {movie.whyItFits}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-12 md:mb-16 px-2">
        <div 
          className="glass-card p-6 md:p-10 rounded-[1.5rem] md:rounded-[2rem] flex flex-col md:flex-row items-center gap-4 md:gap-6"
          style={{ borderColor: `${moodColor}1a` }}
        >
          <div 
            className="w-12 h-12 md:w-16 md:h-16 rounded-full border flex items-center justify-center shadow-lg shrink-0"
            style={{ backgroundColor: `${moodColor}1a`, borderColor: `${moodColor}33`, color: moodColor, boxShadow: `0 0 30px ${moodColor}1a` }}
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <div className="flex-grow text-center md:text-right">
            <h4 className="font-black text-lg md:text-xl mb-1">{t.musicAtmosphere}</h4>
            <p className="text-slate-400 text-sm md:text-lg leading-relaxed mb-4">{pack.suggestedMusic}</p>
            <div className="flex justify-center md:justify-start gap-2 md:gap-4">
              <a
                href={pack.spotifyLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-[#1DB954] text-white px-4 md:px-6 py-2 rounded-full text-[10px] md:text-xs font-black hover:brightness-110 transition-all"
              >
                Spotify
              </a>
              <a
                href={pack.soundcloudLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-[#FF3300] text-white px-4 md:px-6 py-2 rounded-full text-[10px] md:text-xs font-black hover:brightness-110 transition-all"
              >
                SoundCloud
              </a>
            </div>
          </div>
        </div>

        <div 
          className="glass-card p-6 md:p-10 rounded-[1.5rem] md:rounded-[2rem] flex flex-col justify-center items-center text-center gap-4 group"
          style={{ borderColor: `${moodColor}1a` }}
        >
           <button 
            onClick={handleShare}
            className="w-full md:w-auto bg-white text-black px-8 md:px-12 py-3 md:py-4 rounded-full font-black text-base md:text-lg hover:text-white transition-all transform active:scale-95 flex items-center justify-center gap-3"
            style={{ '--hover-bg': moodColor } as React.CSSProperties}
          >
            {t.shareVibe}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="text-center pb-12">
        <button 
          onClick={onReset}
          className="text-slate-500 transition-colors font-bold border-b border-transparent hover:border-white py-2 text-sm md:text-base"
          style={{ '--hover-text': moodColor } as React.CSSProperties}
        >
          {t.reset}
        </button>
      </div>

      <style>{`
        button:hover {
          background-color: var(--hover-bg, inherit);
        }
        .glass-card:hover {
          border-color: var(--hover-color, rgba(255,255,255,0.1)) !important;
        }
        button:hover {
          color: var(--hover-text, inherit);
        }
      `}</style>
    </div>
  );
};

export default RecommendationDisplay;
