
import React from 'react';
import { PrimaryMood, RecommendationType } from './types.ts';

export const MOOD_COLORS = {
  [PrimaryMood.SAD]: '#3B82F6',
  [PrimaryMood.HAPPY]: '#F59E0B',
  [PrimaryMood.ANXIOUS]: '#F97316',
  [PrimaryMood.ANGRY]: '#EF4444',
  [PrimaryMood.BORED]: '#64748B',
  [PrimaryMood.LONELY]: '#6366F1',
  [PrimaryMood.ROMANTIC]: '#EC4899',
  [PrimaryMood.TIRED]: '#8B5CF6',
  [PrimaryMood.HOPEFUL]: '#10B981',
  [PrimaryMood.NIHILISTIC]: '#1E293B',
  [PrimaryMood.CALM]: '#06B6D4',
  [PrimaryMood.EMPTY]: '#94A3B8',
  [PrimaryMood.NOSTALGIC]: '#D97706',
  [PrimaryMood.INSPIRED]: '#EAB308',
  [PrimaryMood.DREAMY]: '#A78BFA',
  [PrimaryMood.EXCITED]: '#F472B6',
  [PrimaryMood.TENSE]: '#475569',
  [PrimaryMood.PLAYFUL]: '#FCD34D',
  [PrimaryMood.GLOOMY]: '#1E293B',
  [PrimaryMood.STRESSED]: '#DC2626'
};

const MinimalIcon = ({ children }) => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const MOOD_ICONS = {
  [PrimaryMood.SAD]: <MinimalIcon><path d="M7 10h.01M17 10h.01M12 18c-2 0-3-1-3-1m6 1s-1-1-3-1"/></MinimalIcon>,
  [PrimaryMood.HAPPY]: <MinimalIcon><path d="M7 10h.01M17 10h.01M8 15s1.5 2 4 2 4-2 4-2"/></MinimalIcon>,
  [PrimaryMood.ANXIOUS]: <MinimalIcon><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/></MinimalIcon>,
  [PrimaryMood.ANGRY]: <MinimalIcon><path d="m7 7 10 10M17 7 7 17"/></MinimalIcon>,
  [PrimaryMood.BORED]: <MinimalIcon><path d="M5 12h14"/></MinimalIcon>,
  [PrimaryMood.LONELY]: <MinimalIcon><circle cx="12" cy="12" r="1"/><circle cx="12" cy="12" r="10" opacity="0.1"/></MinimalIcon>,
  [PrimaryMood.ROMANTIC]: <MinimalIcon><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></MinimalIcon>,
  [PrimaryMood.TIRED]: <MinimalIcon><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></MinimalIcon>,
  [PrimaryMood.HOPEFUL]: <MinimalIcon><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5"/></MinimalIcon>,
  [PrimaryMood.NIHILISTIC]: <MinimalIcon><circle cx="12" cy="12" r="10"/><path d="M12 12h.01"/></MinimalIcon>,
  [PrimaryMood.CALM]: <MinimalIcon><path d="M4 12h16"/></MinimalIcon>,
  [PrimaryMood.EMPTY]: <MinimalIcon><circle cx="12" cy="12" r="10" strokeDasharray="2 4"/></MinimalIcon>,
  [PrimaryMood.NOSTALGIC]: <MinimalIcon><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></MinimalIcon>,
  [PrimaryMood.INSPIRED]: <MinimalIcon><path d="M12 2v2M12 20v2"/><circle cx="12" cy="12" r="4"/></MinimalIcon>,
  [PrimaryMood.DREAMY]: <MinimalIcon><path d="M12 2v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/><circle cx="12" cy="12" r="4" opacity="0.3"/></MinimalIcon>,
  [PrimaryMood.EXCITED]: <MinimalIcon><path d="m13 2-2 20h2L11 2zM17 7l-10 10M17 17 7 7"/></MinimalIcon>,
  [PrimaryMood.TENSE]: <MinimalIcon><path d="M4 4l16 16M4 20L20 4"/></MinimalIcon>,
  [PrimaryMood.PLAYFUL]: <MinimalIcon><circle cx="8" cy="8" r="2"/><circle cx="16" cy="16" r="2"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/></MinimalIcon>,
  [PrimaryMood.GLOOMY]: <MinimalIcon><path d="M12 12c-4 0-7 3-7 7h14c0-4-3-7-7-7z"/></MinimalIcon>,
  [PrimaryMood.STRESSED]: <MinimalIcon><path d="M12 8v4M12 16h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></MinimalIcon>
};

export const REC_TYPE_ICONS = {
  [RecommendationType.QUICK]: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  [RecommendationType.TRIPLE]: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
    </svg>
  ),
  [RecommendationType.PACK]: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2" />
    </svg>
  ),
  [RecommendationType.THERAPY]: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
};

export const THEME_ICONS = {
  moon: (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  sun: (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  ),
  heart: (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  sparkles: (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
    </svg>
  )
};

export const AVOIDANCE_OPTIONS = [
  "No sad endings",
  "No violence",
  "No horror",
  "No cliffhangers"
];
