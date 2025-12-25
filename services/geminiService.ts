
import { GoogleGenAI, Type } from "@google/genai";
import { AppState, MovieRecommendation, MoodPack, PrimaryMood, IntensityLevel, EnergyLevel, MentalDepth, Movie, Language, User } from "../types";
import { MOVIE_DATABASE } from "../data/movies";
import { getTopRecommendations } from "./scoringEngine";
import { translations } from "../translations";

export const getMovieRecommendations = async (state: AppState, language: Language, user: User | null) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    const sorted = [...MOVIE_DATABASE].sort((a, b) => b.imdb_score - a.imdb_score);
    safe = sorted[0];
    challenge = sorted[sorted.length - 1]; 
    deep = sorted.find(m => m.mental_depth === 'deep') || sorted[1];
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

  // 2. Use AI to generate human-like reasons and descriptions in the correct language
  const moodName = primaryMood ? t.moods[primaryMood as keyof typeof t.moods] : (language === 'fa' ? 'عادی' : 'Neutral');
  const intensityName = intensity ? t.intensityLevels[intensity as keyof typeof t.intensityLevels] : '';
  
  const userAge = user?.age || 18;
  const ageConstraint = userAge < 18 ? "The user is under 18. Suggest only family-friendly or age-appropriate movies. STRICTLY NO R-RATED OR ADULT CONTENT." : "The user is an adult.";

  const moodDesc = isPopularMode 
    ? `User is looking for popular movies. ${ageConstraint} Language: ${language}.` 
    : `User mood: ${moodName}, Intensity: ${intensityName}. User profile: Age ${userAge}, Fav Genres: ${user?.favoriteGenres.join(',')}, Fav Actors: ${user?.preferredActors.join(',')}. ${ageConstraint} Language: ${language}.`;

  const prompt = `You are an empathetic cinematic expert.
${moodDesc}
Instructions: ${t.aiInstruction}

Movie 1 (Safe): ${safe.title}
Movie 2 (Different): ${challenge.title}
Movie 3 (Deep): ${deep.title}

For each, explain why it fits specifically for this user's mood and taste, describe it briefly, and suggest a music vibe.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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
              },
              required: ["whyItFits", "description", "musicSuggestion", "musicSearchQuery", "timeToWatch"],
              propertyOrdering: ["whyItFits", "description", "musicSuggestion", "musicSearchQuery", "timeToWatch"]
            },
            challenge: {
              type: Type.OBJECT,
              properties: {
                whyItFits: { type: Type.STRING },
                description: { type: Type.STRING },
                musicSuggestion: { type: Type.STRING },
                musicSearchQuery: { type: Type.STRING },
                timeToWatch: { type: Type.STRING }
              },
              required: ["whyItFits", "description", "musicSuggestion", "musicSearchQuery", "timeToWatch"],
              propertyOrdering: ["whyItFits", "description", "musicSuggestion", "musicSearchQuery", "timeToWatch"]
            },
            deep: {
              type: Type.OBJECT,
              properties: {
                whyItFits: { type: Type.STRING },
                description: { type: Type.STRING },
                musicSuggestion: { type: Type.STRING },
                musicSearchQuery: { type: Type.STRING },
                timeToWatch: { type: Type.STRING }
              },
              required: ["whyItFits", "description", "musicSuggestion", "musicSearchQuery", "timeToWatch"],
              propertyOrdering: ["whyItFits", "description", "musicSuggestion", "musicSearchQuery", "timeToWatch"]
            }
          },
          required: ["emotionalQuote", "packTitle", "safe", "challenge", "deep"],
          propertyOrdering: ["emotionalQuote", "packTitle", "safe", "challenge", "deep"]
        }
      }
    });

    const aiData = JSON.parse(response.text || "{}");
    
    const getMovieRec = (aiPart: any, movie: Movie, category: 'SAFE' | 'CHALLENGING' | 'DEEP'): MovieRecommendation => ({
      title: movie.title,
      year: movie.year,
      genre: movie.genres.join(', '),
      description: aiPart?.description || movie.description_en || (language === 'fa' ? "توضیحی در دسترس نیست." : "No description available."),
      whyItFits: aiPart?.whyItFits || (language === 'fa' ? "این فیلم با وضعیت فعلی شما همخوانی بالایی دارد." : "This movie fits your current vibe perfectly."),
      rating: movie.imdb_score.toString(),
      timeToWatch: aiPart?.timeToWatch || (language === 'fa' ? "امشب، در سکوت" : "Tonight, in silence"),
      category,
      imdb_id: movie.imdb_id
    });

    const moviesList: MovieRecommendation[] = [
      getMovieRec(aiData.safe, safe, 'SAFE'),
      getMovieRec(aiData.challenge, challenge, 'CHALLENGING'),
      getMovieRec(aiData.deep, deep, 'DEEP')
    ];

    const searchQuery = encodeURIComponent(aiData.safe?.musicSearchQuery || "cinema soundtrack");

    return {
      name: isPopularMode ? (aiData.packTitle || t.popularTitle) : (aiData.packTitle || t.recTypes.pack),
      iconType: isPopularMode ? 'sparkles' : 'heart',
      primaryMood: targetMood, // Pass mood through for styling
      emotionalQuote: aiData.emotionalQuote || (language === 'fa' ? "در سینما، ما چشم‌های دیگری پیدا می‌کنیم." : "In cinema, we find other eyes."),
      suggestedMusic: aiData.safe?.musicSuggestion || t.musicAtmosphere,
      spotifyLink: `https://open.spotify.com/search/${searchQuery}`,
      soundcloudLink: `https://soundcloud.com/search?q=${searchQuery}`,
      movies: moviesList
    } as MoodPack;

  } catch (e) {
    console.error("Gemini API Error details:", e);
    return null;
  }
};
