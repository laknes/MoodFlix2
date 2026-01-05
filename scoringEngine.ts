
import { PrimaryMood, Intensity, MentalState } from './types.ts';

const INTENSITY_SCORES = { low: 1, medium: 2, high: 3 };
const ENERGY_SCORES = { very_low: 1, low: 2, medium: 3, high: 4 };
const DEPTH_SCORES = { light: 1, medium: 2, fun: 2, deep: 3 };

const ADJACENT_MOODS = {
  [PrimaryMood.SAD]: [PrimaryMood.LONELY, PrimaryMood.EMPTY, PrimaryMood.NOSTALGIC, PrimaryMood.GLOOMY],
  [PrimaryMood.LONELY]: [PrimaryMood.SAD, PrimaryMood.EMPTY, PrimaryMood.ROMANTIC],
  [PrimaryMood.EMPTY]: [PrimaryMood.SAD, PrimaryMood.LONELY, PrimaryMood.CALM, PrimaryMood.NIHILISTIC, PrimaryMood.GLOOMY],
  [PrimaryMood.HAPPY]: [PrimaryMood.HOPEFUL, PrimaryMood.CALM, PrimaryMood.INSPIRED, PrimaryMood.PLAYFUL, PrimaryMood.EXCITED],
  [PrimaryMood.HOPEFUL]: [PrimaryMood.HAPPY, PrimaryMood.CALM, PrimaryMood.INSPIRED, PrimaryMood.DREAMY],
  [PrimaryMood.CALM]: [PrimaryMood.HAPPY, PrimaryMood.HOPEFUL, PrimaryMood.EMPTY, PrimaryMood.DREAMY],
  [PrimaryMood.ANXIOUS]: [PrimaryMood.ANGRY, PrimaryMood.SAD, PrimaryMood.TENSE, PrimaryMood.STRESSED],
  [PrimaryMood.ANGRY]: [PrimaryMood.ANXIOUS, PrimaryMood.TENSE],
  [PrimaryMood.ROMANTIC]: [PrimaryMood.HAPPY, PrimaryMood.LONELY, PrimaryMood.NOSTALGIC, PrimaryMood.DREAMY],
  [PrimaryMood.BORED]: [PrimaryMood.CALM, PrimaryMood.EMPTY, PrimaryMood.TIRED],
  [PrimaryMood.TIRED]: [PrimaryMood.CALM, PrimaryMood.EMPTY, PrimaryMood.BORED],
  [PrimaryMood.NIHILISTIC]: [PrimaryMood.EMPTY, PrimaryMood.SAD, PrimaryMood.GLOOMY],
  [PrimaryMood.NOSTALGIC]: [PrimaryMood.ROMANTIC, PrimaryMood.SAD, PrimaryMood.CALM, PrimaryMood.DREAMY],
  [PrimaryMood.INSPIRED]: [PrimaryMood.HOPEFUL, PrimaryMood.HAPPY, PrimaryMood.CALM, PrimaryMood.DREAMY],
  [PrimaryMood.DREAMY]: [PrimaryMood.INSPIRED, PrimaryMood.HOPEFUL, PrimaryMood.CALM, PrimaryMood.ROMANTIC, PrimaryMood.NOSTALGIC],
  [PrimaryMood.EXCITED]: [PrimaryMood.HAPPY, PrimaryMood.PLAYFUL, PrimaryMood.INSPIRED],
  [PrimaryMood.TENSE]: [PrimaryMood.ANXIOUS, PrimaryMood.ANGRY, PrimaryMood.STRESSED],
  [PrimaryMood.PLAYFUL]: [PrimaryMood.HAPPY, PrimaryMood.EXCITED],
  [PrimaryMood.GLOOMY]: [PrimaryMood.SAD, PrimaryMood.EMPTY, PrimaryMood.NIHILISTIC],
  [PrimaryMood.STRESSED]: [PrimaryMood.ANXIOUS, PrimaryMood.TENSE]
};

const calculateAge = (birthday) => {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export function calculateMovieScore(
  movie,
  targetMood,
  targetIntensity,
  targetEnergy,
  targetDepth,
  user
) {
  let score = 0;

  if (movie.mood_tags.includes(targetMood)) {
    score += 15;
  } else if (movie.mood_tags.some(tag => ADJACENT_MOODS[targetMood]?.includes(tag))) {
    score += 7;
  }

  if (user) {
    const genreMatchCount = movie.genres.filter(g => user.favoriteGenres.includes(g)).length;
    score += genreMatchCount * 5;

    if (movie.actors) {
      const actorMatchCount = movie.actors.filter(a => user.preferredActors.includes(a)).length;
      score += actorMatchCount * 12;
    }
  }

  const intDiff = Math.abs(INTENSITY_SCORES[movie.intensity] - INTENSITY_SCORES[targetIntensity]);
  score -= intDiff * 4;

  const energyDiff = Math.abs(ENERGY_SCORES[movie.energy_level] - ENERGY_SCORES[targetEnergy]);
  score -= energyDiff * 2;

  const depthDiff = Math.abs(DEPTH_SCORES[movie.mental_depth] - DEPTH_SCORES[targetDepth]);
  score -= depthDiff * 3;

  score += movie.imdb_score / 2;

  return score;
}

export function getTopRecommendations(
  movies,
  targetMood,
  targetIntensity,
  targetEnergy,
  targetDepth,
  avoidance,
  user
) {
  const userAge = user ? calculateAge(user.birthday) : 18;

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
