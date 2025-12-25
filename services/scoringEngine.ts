
import { Movie, PrimaryMood, IntensityLevel, MentalDepth, User } from '../types';

const INTENSITY_SCORES: Record<IntensityLevel, number> = { low: 1, medium: 2, high: 3 };
const ENERGY_SCORES: Record<string, number> = { very_low: 1, low: 2, medium: 3, high: 4 };
const DEPTH_SCORES: Record<MentalDepth, number> = { light: 1, medium: 2, deep: 3 };

const ADJACENT_MOODS: Record<PrimaryMood, PrimaryMood[]> = {
  [PrimaryMood.SAD]: [PrimaryMood.LONELY, PrimaryMood.EMPTY],
  [PrimaryMood.LONELY]: [PrimaryMood.SAD, PrimaryMood.EMPTY, PrimaryMood.ROMANTIC],
  [PrimaryMood.EMPTY]: [PrimaryMood.SAD, PrimaryMood.LONELY, PrimaryMood.CALM],
  [PrimaryMood.HAPPY]: [PrimaryMood.HOPEFUL, PrimaryMood.CALM],
  [PrimaryMood.HOPEFUL]: [PrimaryMood.HAPPY, PrimaryMood.CALM],
  [PrimaryMood.CALM]: [PrimaryMood.HAPPY, PrimaryMood.HOPEFUL, PrimaryMood.EMPTY],
  [PrimaryMood.ANXIOUS]: [PrimaryMood.ANGRY, PrimaryMood.SAD],
  [PrimaryMood.ANGRY]: [PrimaryMood.ANXIOUS],
  [PrimaryMood.ROMANTIC]: [PrimaryMood.HAPPY, PrimaryMood.LONELY],
  [PrimaryMood.BORED]: [PrimaryMood.CALM, PrimaryMood.EMPTY],
  [PrimaryMood.TIRED]: [PrimaryMood.CALM, PrimaryMood.EMPTY],
  [PrimaryMood.NIHILISTIC]: [PrimaryMood.EMPTY, PrimaryMood.SAD]
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

  // 2. Personalization Boost (Advanced Algorithm)
  if (user) {
    // Genre Match (+5 per matching genre)
    const genreMatchCount = movie.genres.filter(g => user.favoriteGenres.includes(g)).length;
    score += genreMatchCount * 5;

    // Actor Match (+10 per preferred actor)
    if (movie.actors) {
      const actorMatchCount = movie.actors.filter(a => user.preferredActors.includes(a)).length;
      score += actorMatchCount * 12;
    }
  }

  // 3. Intensity Compatibility (Penalize large gaps)
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
  // Pre-filter by avoidance
  const filtered = movies.filter(m => {
    if (avoidance.includes("خشونت دوست ندارم") && m.is_violent) return false;
    if (avoidance.includes("فیلم خیلی غمگین نشون نده") && m.is_extremely_sad) return false;
    return true;
  });

  const scored = filtered.map(m => ({
    movie: m,
    score: calculateMovieScore(m, targetMood, targetIntensity, targetEnergy, targetDepth, user)
  })).sort((a, b) => b.score - a.score);

  // SAFE: Top overall match
  const safe = scored[0].movie;

  // CHALLENGE: High score but distinct from the user's usual genre/mood if possible
  const challenge = scored.find(s => !s.movie.mood_tags.includes(targetMood))?.movie || scored[1].movie;

  // DEEP: Highest depth among top 5 performers
  const top5 = scored.slice(0, 5);
  const deep = top5.sort((a, b) => DEPTH_SCORES[b.movie.mental_depth] - DEPTH_SCORES[a.movie.mental_depth])[0].movie;

  return { safe, challenge, deep };
}
