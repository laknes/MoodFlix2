
export enum PrimaryMood {
  SAD = 'sad',
  CALM = 'calm',
  LONELY = 'lonely',
  ANXIOUS = 'anxious',
  HAPPY = 'happy',
  ANGRY = 'angry',
  EMPTY = 'empty',
  HOPEFUL = 'hopeful',
  ROMANTIC = 'romantic',
  BORED = 'bored',
  TIRED = 'tired',
  NIHILISTIC = 'nihilistic'
}

export enum RecommendationType {
  QUICK = 'quick',
  TRIPLE = 'triple',
  PACK = 'pack',
  THERAPY = 'therapy'
}

export enum Intensity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum EnergyLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum MentalState {
  LIGHT = 'light',
  MEDIUM = 'medium',
  FUN = 'fun',
  DEEP = 'deep'
}

export type IntensityLevel = 'low' | 'medium' | 'high';
export type MentalDepth = 'light' | 'medium' | 'deep';
export type EmotionalEffect = 'calming' | 'releasing' | 'motivating' | 'reflective';
export type Theme = 'dark' | 'light';
export type Language = 'fa' | 'en';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string;
  favoriteGenres: string[];
  preferredActors: string[];
  favoriteMovies?: MovieRecommendation[];
  isAdmin?: boolean;
}

export interface Movie {
  id: string;
  imdb_id: string;
  title: string;
  year: string;
  imdb_score: number;
  mood_tags: PrimaryMood[];
  intensity: IntensityLevel;
  energy_level: 'very_low' | 'low' | 'medium' | 'high';
  mental_depth: MentalDepth;
  emotional_effect: EmotionalEffect;
  is_series: boolean;
  is_violent: boolean;
  is_extremely_sad: boolean;
  description_en: string;
  genres: string[];
  actors?: string[];
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
}

export interface MoodPack {
  name: string;
  iconType: string;
  primaryMood: PrimaryMood; // Persistent mood for styling
  emotionalQuote: string;
  suggestedMusic: string;
  spotifyLink: string;
  soundcloudLink: string;
  movies: MovieRecommendation[];
}

export interface SavedMood {
  date: string;
  mood: string;
  intensity: string;
  movieTitle: string;
}

export interface AppState {
  primaryMood: PrimaryMood | null;
  intensity: Intensity | null;
  energy: EnergyLevel | null;
  mentalState: MentalState | null;
  recType: RecommendationType;
  avoidance: string[];
}
