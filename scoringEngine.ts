
import { Movie, PrimaryMood, IntensityLevel, MentalDepth, User } from './types';

const INTENSITY_SCORES: Record<IntensityLevel, number> = { low: 1, medium: 2, high: 3 };
const ENERGY_SCORES: Record<string, number> = { very_low: 1, low: 2, medium: 3, high: 4 };
const DEPTH_SCORES: Record<MentalDepth, number> = { light: 1, medium: 2, deep: 3 };

const ADJACENT_MOODS: Record<PrimaryMood, PrimaryMood[]> = {
  [PrimaryMood.SAD]: [PrimaryMood.LONELY, PrimaryMood.EMPTY, PrimaryMood.NOSTALGIC],
  [PrimaryMood.LONELY]: [PrimaryMood.SAD, PrimaryMood.EMPTY, PrimaryMood.ROMANTIC],
  [PrimaryMood.EMPTY]: [PrimaryMood.SAD, PrimaryMood.LONELY, PrimaryMood.CALM, PrimaryMood.NIHILISTIC],
  [PrimaryMood.HAPPY]: [PrimaryMood.HOPEFUL, PrimaryMood.CALM, PrimaryMood.INSPIRED],
  [PrimaryMood.HOPEFUL]: [PrimaryMood.HAPPY, PrimaryMood.CALM, PrimaryMood.INSPIRED],
  [PrimaryMood.CALM]: [PrimaryMood.HAPPY, PrimaryMood.HOPEFUL, PrimaryMood.EMPTY],
  [PrimaryMood.ANXIOUS]: [PrimaryMood.ANGRY, PrimaryMood.SAD],
  [PrimaryMood.ANGRY]: [PrimaryMood.ANXIOUS],
  [PrimaryMood.ROMANTIC]: [PrimaryMood.HAPPY, PrimaryMood.LONELY, PrimaryMood.NOSTALGIC],
  [PrimaryMood.BORED]: [PrimaryMood.CALM, PrimaryMood.EMPTY],
  [PrimaryMood.TIRED]: [PrimaryMood.CALM, PrimaryMood.EMPTY],
  [PrimaryMood.NIHILISTIC]: [PrimaryMood.EMPTY, PrimaryMood.SAD],
  [PrimaryMood.NOSTALGIC]: [PrimaryMood.ROMANTIC, PrimaryMood.SAD, PrimaryMood.CALM],
  [PrimaryMood.INSPIRED]: [PrimaryMood.HOPEFUL, PrimaryMood.HAPPY, PrimaryMood.CALM]
};

export function calculateMovieScore(
  movie: Movie,
  targetMood: PrimaryMood,
  targetIntensity: IntensityLevel,
  targetEnergy: string,
  targetDepth: MentalDepth,
  user: User | null
): number {
  let score = 0;

  // 1. Mood Match (Base Foundation)
  if (movie.mood_tags.includes(targetMood)) {
    score += 15;
  } else if (movie.mood_tags.some(tag => ADJACENT_MOODS[targetMood]?.includes(tag))) {
    score += 7;
  }

  // 2. Personalization Boost
  if (user) {
    const genreMatchCount = movie.genres.filter(g => user.favoriteGenres.includes(g)).length;
    score += genreMatchCount * 5;

    if (movie.actors) {
      const actorMatchCount = movie.actors.filter(a => user.preferredActors.includes(a)).length;
      score += actorMatchCount * 12;
    }
  }

  // 3. Intensity Compatibility
  const intDiff = Math.abs(INTENSITY_SCORES[movie.intensity] - INTENSITY_SCORES[targetIntensity]);
  score -= intDiff * 4;

  // 4. Energy Level Compatibility
  const energyDiff = Math.abs(ENERGY_SCORES[movie.energy_level] - ENERGY_SCORES[targetEnergy]);
  score -= energyDiff * 2;

  // 5. Mental Depth Alignment
  const depthDiff = Math.abs(DEPTH_SCORES[movie.mental_depth] - DEPTH_SCORES[targetDepth]);
  score -= depthDiff * 3;

  // 6. IMDB Bonus
  score += movie.imdb_score / 2;

  return score;
}

export function getTopRecommendations(
  movies: Movie[],
  targetMood: PrimaryMood,
  targetIntensity: IntensityLevel,
  targetEnergy: string,
  targetDepth: MentalDepth,
  avoidance: string[],
  user: User | null
) {
  const userAge = user?.age || 18;

  const filtered = movies.filter(m => {
    if (userAge < 17 && m.content_rating === 'R') return false;
    if (userAge < 13 && (m.content_rating === 'PG-13' || m.content_rating === 'R')) return false;
    if (avoidance.includes("خشونت دوست ندارم") && m.is_violent) return false;
    if (avoidance.includes("فیلم خیلی غمگین نشون نده") && m.is_extremely_sad) return false;
    return true;
  });

  const scored = filtered.map(m => ({
    movie: m,
    score: calculateMovieScore(m, targetMood, targetIntensity, targetEnergy, targetDepth, user)
  })).sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    const fallbacks = movies.filter(m => m.content_rating === 'G' || m.content_rating === 'PG');
    const safe = fallbacks[0] || movies[0];
    return { safe, challenge: safe, deep: safe };
  }

  const safe = scored[0].movie;
  const challenge = scored.find(s => !s.movie.mood_tags.includes(targetMood))?.movie || scored[Math.min(1, scored.length - 1)].movie;
  const topCount = Math.min(5, scored.length);
  const topItems = scored.slice(0, topCount);
  const deep = topItems.sort((a, b) => DEPTH_SCORES[b.movie.mental_depth] - DEPTH_SCORES[a.movie.mental_depth])[0].movie;

  return { safe, challenge, deep };
}
