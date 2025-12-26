
import React from 'react';
import { PrimaryMood, RecommendationType } from './types';

// Vibrant and unique color palette for each emotional layer - Curated for depth and personality
export const MOOD_COLORS: Record<PrimaryMood, string> = {
  [PrimaryMood.SAD]: '#3B82F6',        // Deep Ocean Blue
  [PrimaryMood.HAPPY]: '#F59E0B',      // Golden Amber
  [PrimaryMood.ANXIOUS]: '#F97316',    // Electric Orange
  [PrimaryMood.ANGRY]: '#EF4444',      // Alert Red
  [PrimaryMood.BORED]: '#64748B',      // Cool Slate
  [PrimaryMood.LONELY]: '#6366F1',     // Twilight Indigo
  [PrimaryMood.ROMANTIC]: '#EC4899',   // Rose Pink
  [PrimaryMood.TIRED]: '#8B5CF6',      // Dreamy Purple
  [PrimaryMood.HOPEFUL]: '#10B981',    // Vitality Green
  [PrimaryMood.NIHILISTIC]: '#1E293B', // Deep Void
  [PrimaryMood.CALM]: '#06B6D4',       // Serene Cyan
  [PrimaryMood.EMPTY]: '#94A3B8',      // Misty Grey
  [PrimaryMood.NOSTALGIC]: '#D97706',  // Sepia Gold
  [PrimaryMood.INSPIRED]: '#EAB308'    // Electric Spark Yellow
};

/**
 * Minimalist Line Art Icons
 * Consistent 24x24 viewBox, strokeWidth 1.5, and strokeLinecap round.
 */
export const MOOD_ICONS: Record<PrimaryMood, React.ReactNode> = {
  [PrimaryMood.SAD]: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"/><path d="M8 15h8"/><path d="M9 9h.01"/><path d="M15 9h.01"/>
    </svg>
  ),
  [PrimaryMood.HAPPY]: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"/><path d="M8 13a4 4 0 1 0 8 0"/><path d="M9 9h.01"/><path d="M15 9h.01"/>
    </svg>
  ),
  [PrimaryMood.ANXIOUS]: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h2"/><path d="M20 12h2"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m16.24 7.76 1.41-1.41"/><path d="m6.34 17.66-1.41 1.41"/><path d="m17.66 17.66-1.41-1.41"/><path d="m4.93 4.93 1.41 1.41"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  [PrimaryMood.ANGRY]: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m11 12 4-7"/><path d="m13 12-4 7"/><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"/><path d="m8 8 8 8"/><path d="m16 8-8 8"/>
    </svg>
  ),
  [PrimaryMood.BORED]: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"/><path d="M8 12h8"/>
    </svg>
  ),
  [PrimaryMood.LONELY]: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"/><path d="M12 2v20"/><path d="M2 12h20"/><path d="M12 12a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity="0.2"/>
    </svg>
  ),
  [PrimaryMood.ROMANTIC]: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  ),
  [PrimaryMood.TIRED]: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M14 8h.01"/><path d="M18 12h.01"/>
    </svg>
  ),
  [PrimaryMood.HOPEFUL]: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/><path d="M12 12V2"/>
    </svg>
  ),
  [PrimaryMood.NIHILISTIC]: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/>
    </svg>
  ),
  [PrimaryMood.CALM]: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h20"/><path d="M2 7h20"/><path d="M2 17h20"/>
    </svg>
  ),
  [PrimaryMood.EMPTY]: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" strokeDasharray="4 4"/>
    </svg>
  ),
  [PrimaryMood.NOSTALGIC]: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/><path d="M16 21v-2a4 4 0 0 0-4-4H6"/>
    </svg>
  ),
  [PrimaryMood.INSPIRED]: (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2"/><path d="M12 18v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
    </svg>
  )
};

export const REC_TYPE_ICONS: Record<RecommendationType, React.ReactNode> = {
  [RecommendationType.QUICK]: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  [RecommendationType.TRIPLE]: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  [RecommendationType.PACK]: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  [RecommendationType.THERAPY]: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
};

export const THEME_ICONS: Record<string, React.ReactNode> = {
  moon: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  sun: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  ),
  heart: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  brain: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  coffee: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
    </svg>
  ),
  sparkles: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
    </svg>
  ),
  storm: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  )
};

export const AVOIDANCE_OPTIONS = [
  "فیلم خیلی غمگین نشون نده",
  "خشونت دوست ندارم",
  "آخر باز نه",
  "بدون ترسناک"
];
