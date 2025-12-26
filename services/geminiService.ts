
import { GoogleGenAI, Type } from "@google/genai";
import { AppState, MovieRecommendation, MoodPack, PrimaryMood, IntensityLevel, EnergyLevel, MentalDepth, Movie, Language, User, SystemSettings } from "../types";
import { MOVIE_DATABASE } from "../data/movies";
import { getTopRecommendations } from "./scoringEngine";
import { translations } from "../translations";

export const getMovieRecommendations = async (
  state: AppState, 
  language: Language, 
  user: User | null,
  dynamicApiKey?: string,
  settings?: SystemSettings
) => {
  // Use dynamic API key from admin panel if provided, otherwise fallback to environment variable
  const apiKey = dynamicApiKey || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  const { primaryMood, intensity, energy, mentalState, avoidance } = state;
  const t = translations[language];

  const isPopularMode = !primaryMood;

  // Internal Mapping
  const moodMap: Record<string, PrimaryMood> = {
    'sad': PrimaryMood.SAD,
    'happy': PrimaryMood.HAPPY,
    'anxious': PrimaryMood.ANXIOUS,
    'angry': PrimaryMood.ANGRY,
    'lonely': PrimaryMood.LONELY,
    'romantic': PrimaryMood.ROMANTIC,
    'calm': PrimaryMood.CALM,
    'hopeful': PrimaryMood.HOPEFUL,
    'empty': PrimaryMood.EMPTY,
    'bored': PrimaryMood.BORED,
    'tired': PrimaryMood.TIRED,
    'nihilistic': PrimaryMood.NIHILISTIC
  };

  const intensityMap: Record<string, IntensityLevel> = { 'low': 'low', 'medium': 'medium', 'high': 'high' };
  const energyMap: Record<string, string> = { 'very_low': 'very_low', 'low': 'low', 'medium': 'medium', 'high': 'high' };
  const depthMap: Record<string, MentalDepth> = { 'light': 'light', 'medium': 'medium', 'fun': 'light', 'deep': 'deep' };

  const targetMood = isPopularMode ? PrimaryMood.HAPPY : (moodMap[state.primaryMood as any] || PrimaryMood.CALM);
  const targetIntensity = intensityMap[state.intensity as any] || 'medium';
  const targetEnergy = energyMap[state.energy as any] || 'medium';
  const targetDepth = depthMap[state.mentalState as any] || 'medium';

  // 1. Get exact movies from Scoring Engine with User Context
  let safe: Movie, challenge: Movie, deep: Movie;

  if (isPopularMode) {
    const userAge = user?.age || 18;
    const sorted = [...MOVIE_DATABASE]
      .filter(m => {
        if (userAge < 17 && m.content_rating === 'R') return false;
        if (userAge < 13 && m.content_rating === 'PG-13') return false;
        return true;
      })
      .sort((a, b) => b.imdb_score - a.imdb_score);
    
    safe = sorted[0] || MOVIE_DATABASE[0];
    challenge = sorted[sorted.length - 1] || MOVIE_DATABASE[0]; 
    deep = sorted.find(m => m.mental_depth === 'deep') || sorted[1] || MOVIE_DATABASE[0];
  } else {
    const recs = getTopRecommendations(
      MOVIE_DATABASE as Movie[],
      targetMood,
      targetIntensity,
      targetEnergy,
      targetDepth,
      avoidance,
      user
    );
    safe = recs.safe;
    challenge = recs.challenge;
    deep = recs.deep;
  }

  // 2. Build Prompt
  const moodName = primaryMood ? t.moods[primaryMood as keyof typeof t.moods] : (language === 'fa' ? 'عادی' : 'Neutral');
  const intensityName = intensity ? t.intensityLevels[intensity as keyof typeof t.intensityLevels] : '';
  
  const userAge = user?.age || 18;
  const ageConstraint = userAge < 18 
    ? `CRITICAL: The user is only ${userAge} years old. You MUST justify why each movie is SAFE and suitable for their age.` 
    : "The user is an adult.";

  const moodDesc = isPopularMode 
    ? `User is looking for popular movies. ${ageConstraint}` 
    : `User mood: ${moodName}, Intensity: ${intensityName}. Age ${userAge}. Fav Genres: ${user?.favoriteGenres.join(',')}. ${ageConstraint}`;

  // Custom instruction from admin panel
  const customInstruction = settings?.customSystemPrompt || t.aiInstruction;

  const prompt = `You are an empathetic cinematic expert.
${customInstruction}
Context: ${moodDesc}
Language: ${language}

Movies to analyze:
1. ${safe.title} (Rating: ${safe.content_rating})
2. ${challenge.title} (Rating: ${challenge.content_rating})
3. ${deep.title} (Rating: ${deep.content_rating})

Return detailed emotional reasoning and a perfectly matching music vibe for each in JSON format.
For each movie, include a 'musicSearchQuery' field that is a highly specific search string (e.g., "Hans Zimmer Interstellar style ambient" or "Slow Lo-fi Jazz for raining nights") that would yield the best atmospheric results on Spotify and SoundCloud.`;

  try {
    const response = await ai.models.generateContent({
      model: settings?.activeModel || 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emotionalQuote: { type: Type.STRING },
            packTitle: { type: Type.STRING },
            safe: {
              type: Type.OBJECT,
              properties: {
                whyItFits: { type: Type.STRING },
                description: { type: Type.STRING },
                musicSuggestion: { type: Type.STRING },
                musicSearchQuery: { type: Type.STRING },
                timeToWatch: { type: Type.STRING }
              }
            },
            challenge: { type: Type.OBJECT, properties: { whyItFits: { type: Type.STRING }, description: { type: Type.STRING }, musicSuggestion: { type: Type.STRING }, musicSearchQuery: { type: Type.STRING }, timeToWatch: { type: Type.STRING } } },
            deep: { type: Type.OBJECT, properties: { whyItFits: { type: Type.STRING }, description: { type: Type.STRING }, musicSuggestion: { type: Type.STRING }, musicSearchQuery: { type: Type.STRING }, timeToWatch: { type: Type.STRING } } }
          }
        }
      }
    });

    const aiData = JSON.parse(response.text || "{}");
    
    const getMovieRec = (aiPart: any, movie: Movie, category: 'SAFE' | 'CHALLENGING' | 'DEEP'): MovieRecommendation => {
      // Prioritize explicit search query, then suggestion text, then movie title + vibe
      const musicQuery = aiPart?.musicSearchQuery || aiPart?.musicSuggestion || (movie.title + " atmospheric soundtrack");
      
      return {
        title: movie.title,
        year: movie.year,
        genre: movie.genres.join(', '),
        description: aiPart?.description || movie.description_en,
        whyItFits: aiPart?.whyItFits || "Matches your vibe.",
        rating: movie.imdb_score.toString(),
        timeToWatch: aiPart?.timeToWatch || "Tonight",
        category,
        imdb_id: movie.imdb_id,
        content_rating: movie.content_rating,
        musicSuggestion: aiPart?.musicSuggestion || "Cinematic Vibe",
        spotifyLink: `https://open.spotify.com/search/${encodeURIComponent(musicQuery)}`,
        soundcloudLink: `https://soundcloud.com/search?q=${encodeURIComponent(musicQuery)}`
      };
    };

    const mainMusicQuery = aiData.safe?.musicSearchQuery || aiData.safe?.musicSuggestion || "cinematic movie soundtrack";

    return {
      name: aiData.packTitle || t.recTypes.pack,
      iconType: isPopularMode ? 'sparkles' : 'heart',
      primaryMood: targetMood,
      emotionalQuote: aiData.emotionalQuote,
      suggestedMusic: aiData.safe?.musicSuggestion || "Chill Lo-Fi",
      spotifyLink: `https://open.spotify.com/search/${encodeURIComponent(mainMusicQuery)}`,
      soundcloudLink: `https://soundcloud.com/search?q=${encodeURIComponent(mainMusicQuery)}`,
      movies: [
        getMovieRec(aiData.safe, safe, 'SAFE'),
        getMovieRec(aiData.challenge, challenge, 'CHALLENGING'),
        getMovieRec(aiData.deep, deep, 'DEEP')
      ]
    } as MoodPack;

  } catch (e) {
    console.error("AI Error:", e);
    return null;
  }
};
