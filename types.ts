
// Types for Moodflix application

export enum PrimaryMood {
  SAD = 'sad', CALM = 'calm', LONELY = 'lonely', ANXIOUS = 'anxious',
  HAPPY = 'happy', ANGRY = 'angry', EMPTY = 'empty', HOPEFUL = 'hopeful',
  ROMANTIC = 'romantic', BORED = 'bored', TIRED = 'tired', NIHILISTIC = 'nihilistic',
  NOSTALGIC = 'nostalgic', INSPIRED = 'inspired', DREAMY = 'dreamy', EXCITED = 'excited',
  TENSE = 'tense', PLAYFUL = 'playful', GLOOMY = 'gloomy', STRESSED = 'stressed'
}

export enum RecommendationType { QUICK = 'quick', TRIPLE = 'triple', PACK = 'pack', THERAPY = 'therapy' }
export enum Intensity { LOW = 'low', MEDIUM = 'medium', HIGH = 'high' }
export enum EnergyLevel { VERY_LOW = 'very_low', LOW = 'low', MEDIUM = 'medium', HIGH = 'high' }
export enum MentalState { LIGHT = 'light', MEDIUM = 'medium', FUN = 'fun', DEEP = 'deep' }

export type IntensityLevel = 'low' | 'medium' | 'high';
export type MentalDepth = 'light' | 'medium' | 'deep';
export type Theme = 'dark' | 'light';
export type Language = 'fa' | 'en';
export type ContentRating = 'G' | 'PG' | 'PG-13' | 'R';

export interface User {
  id: string;
  name: string;
  email: string;
  birthday: string;
  avatar?: string;
  joinedAt: string;
  favoriteGenres: string[];
  preferredActors: string[];
  isAdmin?: boolean;
  status: 'active' | 'suspended'; // Added status control
}

export interface MovieRecommendation {
  title: string;
  year: string;
  genre: string;
  description: string;
  whyItFits: string;
  rating: string;
  timeToWatch: string;
  category: 'SAFE' | 'CHALLENGING' | 'DEEP';
  imdb_id?: string;
  content_rating?: ContentRating;
  musicSuggestion?: string;
  spotifyLink?: string;
  soundcloudLink?: string;
}

export interface MoodPack {
  name: string;
  iconType: string;
  primaryMood: PrimaryMood;
  emotionalQuote: string;
  suggestedMusic: string;
  spotifyLink: string;
  soundcloudLink: string;
  movies: MovieRecommendation[];
}

export interface SavedMood {
  id?: string;
  userId: string;
  date: string;
  mood: string;
  intensity: string;
  movieTitle: string;
  timestamp?: string;
}

export interface AppState {
  primaryMood: PrimaryMood | null;
  intensity: Intensity | null;
  energy: EnergyLevel | null;
  mentalState: MentalState | null;
  recType: RecommendationType;
  avoidance: string[];
}

export interface SystemSettings {
  maintenanceMode: boolean;
  activeModel: 'gemini-3-flash-preview' | 'gemini-3-pro-preview';
  customSystemPrompt: string;
  allowGuestMode: boolean;
  // New AI Customization Parameters
  temperature: number;
  topP: number;
  topK: number;
}

export interface ApiKeyConfig {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  provider: string;
  usageCount: number;
}

export interface Movie {
  id: string;
  imdb_id: string;
  title: string;
  year: string;
  imdb_score: number;
  mood_tags: PrimaryMood[];
  intensity: IntensityLevel;
  energy_level: string;
  mental_depth: MentalDepth;
  emotional_effect: string;
  is_series: boolean;
  is_violent: boolean;
  is_extremely_sad: boolean;
  description_en: string;
  genres: string[];
  actors: string[];
  content_rating: ContentRating;
}
