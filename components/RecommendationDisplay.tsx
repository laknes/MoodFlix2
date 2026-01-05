
import React, { useState, useEffect, useRef } from 'react';
import { THEME_ICONS, MOOD_COLORS } from '../constants.tsx';
import { translations } from '../translations.ts';

const ATMOSPHERIC_TRACKS = [
  { name: "Nebula Pulse", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { name: "Deep Space Echo", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { name: "Neon Rainfall", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

const MoviePoster = ({ imdbId, title, moodColor }) => {
  const [posterUrl, setPosterUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPoster = async () => {
      setLoading(true);
      const apiKey = 'f3d350b2';
      
      try {
        let data = null;
        if (imdbId && imdbId.startsWith('tt')) {
          const response = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}`);
          data = await response.json();
        }

        if (!data || data.Response === "False" || !data.Poster || data.Poster === "N/A") {
          const titleResponse = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`);
          data = await titleResponse.json();
        }

        if (isMounted) {
          if (data && data.Response === "True" && data.Poster && data.Poster !== "N/A") {
            setPosterUrl(data.Poster);
          } else {
            setPosterUrl(`https://picsum.photos/seed/${encodeURIComponent(title)}/500/800`);
          }
        }
      } catch (error) {
        if (isMounted) {
          setPosterUrl(`https://picsum.photos/seed/${encodeURIComponent(title)}/500/800`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPoster();
    return () => { isMounted = false; };
  }, [imdbId, title]);

  return (
    <div className="w-full h-full relative bg-slate-900 overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-10">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin"></div>
        </div>
      )}
      <img 
        src={posterUrl || ''}
        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${loading ? 'opacity-0' : 'opacity-60'}`}
        alt={title}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90" />
    </div>
  );
};

const RecommendationDisplay = ({ pack, onReset, language, onToggleFavorite, favorites = [], userAge }) => {
  const ThemeIcon = THEME_ICONS[pack.iconType] || THEME_ICONS.moon;
  const t = translations[language];
  const moodColor = pack.primaryMood ? MOOD_COLORS[pack.primaryMood] : '#E50914';
  
  const [activeShareMovie, setActiveShareMovie] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [savedLater, setSavedLater] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('savedForLaterMovies');
    if (saved) {
      try {
        setSavedLater(JSON.parse(saved));
      } catch (e) {
        setSavedLater([]);
      }
    }

    audioRef.current = new Audio(ATMOSPHERIC_TRACKS[currentTrackIdx].url);
    audioRef.current.volume = 0.4;
    
    const updateProgress = () => {
      if (audioRef.current) {
        const val = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setProgress(val || 0);
      }
    };

    audioRef.current.addEventListener('timeupdate', updateProgress);
    audioRef.current.addEventListener('ended', handleSkip);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', updateProgress);
        audioRef.current.removeEventListener('ended', handleSkip);
      }
    };
  }, [currentTrackIdx]);

  const handleSkip = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % ATMOSPHERIC_TRACKS.length);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const seekTo = (parseFloat(e.target.value) / 100) * (audioRef.current?.duration || 0);
    if (audioRef.current) audioRef.current.currentTime = seekTo;
    setProgress(parseFloat(e.target.value));
  };

  const getCategoryLabel = (cat) => t.categories[cat] || cat;
  const isFavorited = (title) => favorites.some(f => f.title === title);

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-12 px-3 md:px-4 animate-fade-in">
      <div className="text-center mb-10 md:mb-16 flex flex-col items-center">
        <div 
          className="mb-4 md:mb-6 p-4 md:p-6 glass-card rounded-full scale-90 md:scale-100"
          style={{ borderColor: `${moodColor}4d`, backgroundColor: `${moodColor}0d`, boxShadow: `0 0 40px ${moodColor}26` }}
        >
          <div style={{ color: moodColor }}>{ThemeIcon}</div>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black gradient-text mb-4 md:mb-6 px-4 uppercase tracking-tighter">{pack.name}</h2>
        <div className="flex items-center justify-center gap-2 md:gap-4 max-w-2xl px-4">
          <div className="h-[1px] w-4 md:w-8 shrink-0" style={{ backgroundColor: moodColor }}></div>
          <p className="text-base sm:text-xl md:text-2xl text-slate-300 italic opacity-90 leading-relaxed">" {pack.emotionalQuote} "</p>
          <div className="h-[1px] w-4 md:w-8 shrink-0" style={{ backgroundColor: moodColor }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mb-12 md:mb-20">
        {pack.movies.map((movie, idx) => (
          <div key={idx} className="glass-card rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group flex flex-col transition-all duration-500 transform hover:-translate-y-2 border border-white/5">
            <div className="h-[280px] sm:h-[350px] md:h-[450px] bg-slate-900 relative overflow-hidden">
              <MoviePoster imdbId={movie.imdb_id} title={movie.title} moodColor={moodColor} />
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                <span className="text-white text-[9px] sm:text-[10px] md:text-xs font-black px-2.5 py-1 md:px-3 md:py-1.5 rounded-full uppercase shadow-lg border border-white/10" style={{ backgroundColor: moodColor }}>{getCategoryLabel(movie.category)}</span>
              </div>
              <div className={`absolute bottom-4 md:bottom-6 ${language === 'fa' ? 'right-4 md:right-6 text-right' : 'left-4 md:left-6 text-left'} right-4 md:right-6`}>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-1 leading-tight group-hover:text-red-500 transition-colors uppercase tracking-tighter">{movie.title}</h3>
                <p className="text-slate-400 font-bold text-[10px] sm:text-xs md:text-sm mb-2 uppercase tracking-widest">{movie.year} • {movie.genre}</p>
              </div>
            </div>
            <div className="p-5 sm:p-6 md:p-8 flex-grow flex flex-col bg-white/[0.02]">
              <p className="text-slate-300 mb-5 md:mb-6 leading-relaxed text-xs sm:text-sm md:text-base line-clamp-4">{movie.description}</p>
              <div className="bg-white/5 p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/5 border-l-4 mt-auto" style={{ borderLeftColor: moodColor }}>
                <p className="text-[11px] sm:text-xs md:text-sm leading-relaxed italic opacity-80" style={{ color: `${moodColor}ee` }}>{movie.whyItFits}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-12 md:mb-16">
        <div className="glass-card p-6 md:p-8 lg:p-10 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center gap-6 md:gap-10 relative overflow-hidden group">
          <div className="absolute inset-0 pointer-events-none opacity-10 flex items-end justify-center gap-1 px-4 overflow-hidden">
             {[...Array(20)].map((_, i) => <div key={i} className="w-full bg-red-600 rounded-t-full transition-all duration-300" style={{ height: isPlaying ? `${Math.random() * 80 + 10}%` : '4px' }} />)}
          </div>
          <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border flex items-center justify-center shadow-xl shrink-0 relative z-10" style={{ backgroundColor: `${moodColor}10`, borderColor: `${moodColor}30`, color: moodColor }}>
             <button onClick={togglePlay} className="w-full h-full flex items-center justify-center hover:scale-110 transition-transform">{isPlaying ? <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}</button>
          </div>
          <div className="flex-grow text-center md:text-right relative z-10">
            <h4 className="font-black text-xl md:text-3xl mb-2 uppercase tracking-tighter">{t.musicAtmosphere}</h4>
            <p className="text-slate-400 text-sm md:text-lg font-bold mb-4 uppercase tracking-widest">{ATMOSPHERIC_TRACKS[currentTrackIdx].name}</p>
            <div className="space-y-4">
              <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="w-full h-1.5 bg-white/10 rounded-full accent-red-600 cursor-pointer appearance-none" />
              <button onClick={handleSkip} className="text-slate-400 hover:text-white transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center pb-8"><button onClick={onReset} className="text-slate-500 font-bold border-b border-transparent hover:border-slate-300 py-1 text-sm uppercase tracking-widest">{t.reset}</button></div>
    </div>
  );
};

export default RecommendationDisplay;
