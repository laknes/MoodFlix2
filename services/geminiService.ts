
import { AppState, MoodPack, Language, User, SystemSettings } from "../types";

/**
 * Communicates with the hardened backend API to get recommendations.
 * This keeps the API key secure and allows for server-side processing.
 */
export const getMovieRecommendations = async (
  state: AppState, 
  language: Language, 
  user: User | null,
  apiKey?: string,
  settings?: SystemSettings
): Promise<MoodPack | null> => {
  try {
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...state,
        language,
        userContext: user ? { 
          age: user.age, 
          name: user.name,
          favoriteGenres: user.favoriteGenres,
          preferredActors: user.preferredActors
        } : null,
        apiKey,
        settings
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return {
      name: data.packTitle || "Mood Pack",
      iconType: state.primaryMood ? 'heart' : 'sparkles',
      primaryMood: state.primaryMood as any,
      emotionalQuote: data.quote,
      suggestedMusic: "Cinematic Atmosphere",
      spotifyLink: "#",
      soundcloudLink: "#",
      movies: data.movies.map((m: any) => ({
        ...m,
        category: m.category || 'SAFE',
        whyItFits: m.reason,
        timeToWatch: "Tonight",
        musicSuggestion: "Atmospheric Score"
      }))
    } as MoodPack;

  } catch (error) {
    console.error("Failed to fetch from Moodflix API:", error);
    return null;
  }
};
