
import { GoogleGenAI, Type } from "@google/genai";

export const getMovieRecommendations = async (state, language, user) => {
  // Always initialize inside the function to ensure process.env.API_KEY is available
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `You are a world-class cinematic psychologist. Analyze the mood state and return a matched cinematic experience.
  
  RULES:
  1. Age: ${user?.age ? `User age is ${user.age}. Strictly follow content ratings.` : 'PG-13 only.'}
  2. Language: Return all text in ${language === 'fa' ? 'Farsi' : 'English'}.
  3. Genres: ${user?.favoriteGenres?.join(', ') || 'Any'}.
  4. Accuracy: Return REAL IMDb IDs (starting with 'tt').
  5. JSON: Match the schema exactly.`;

  const prompt = `Movie pack for mood: ${state.primaryMood}, intensity: ${state.intensity}, energy: ${state.energy}, depth: ${state.mentalState}, style: ${state.recType}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            packTitle: { type: Type.STRING },
            quote: { type: Type.STRING },
            movies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  year: { type: Type.STRING },
                  genre: { type: Type.STRING },
                  description: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  imdb_id: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["title", "year", "reason", "imdb_id", "category"]
              }
            }
          },
          required: ["packTitle", "quote", "movies"]
        }
      }
    });

    const data = JSON.parse(response.text);

    return {
      name: data.packTitle,
      iconType: 'sparkles',
      primaryMood: state.primaryMood,
      emotionalQuote: data.quote,
      movies: data.movies.map((m) => ({
        ...m,
        whyItFits: m.reason,
        timeToWatch: language === 'fa' ? "امشب" : "Tonight"
      }))
    };
  } catch (error) {
    console.error("Gemini synthesis error:", error);
    return null;
  }
};
