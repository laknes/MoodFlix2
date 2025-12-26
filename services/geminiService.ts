
import { AppState, MoodPack, Language, User, SystemSettings } from "../types";

/**
 * Communicates with the hardened backend API to get recommendations.
 * This keeps the API key secure and allows for server-side processing.
 */
// Fix: Added optional apiKey and settings parameters to match the call site in App.tsx
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
        userContext: user ? { age: user.age, name: user.name } : null,
        apiKey, // Forwarding the custom API key if provided
        settings // Forwarding system settings if provided
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Mapping backend response to our MoodPack interface
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
