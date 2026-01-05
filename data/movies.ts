
import { PrimaryMood } from '../types.ts';

export const MOVIE_DATABASE = [
  {
    id: 'm1',
    imdb_id: 'tt2119532',
    title: 'The Secret Life of Walter Mitty',
    year: '2013',
    imdb_score: 7.3,
    mood_tags: [PrimaryMood.HOPEFUL, PrimaryMood.EMPTY, PrimaryMood.INSPIRED],
    intensity: 'low',
    energy_level: 'medium',
    mental_depth: 'medium',
    emotional_effect: 'motivating',
    is_series: false,
    is_violent: false,
    is_extremely_sad: false,
    description_en: 'A mild-mannered office worker embarks on a global journey.',
    genres: ['Adventure', 'Comedy', 'Drama'],
    actors: ['Ben Stiller', 'Kristen Wiig'],
    content_rating: 'PG'
  },
  {
    id: 'm2',
    imdb_id: 'tt0338013',
    title: 'Eternal Sunshine of the Spotless Mind',
    year: '2004',
    imdb_score: 8.3,
    mood_tags: [PrimaryMood.SAD, PrimaryMood.LONELY, PrimaryMood.ROMANTIC, PrimaryMood.NOSTALGIC],
    intensity: 'medium',
    energy_level: 'low',
    mental_depth: 'deep',
    emotional_effect: 'reflective',
    is_series: false,
    is_violent: false,
    is_extremely_sad: false,
    description_en: 'A couple undergoes a procedure to erase each other from their memories.',
    genres: ['Drama', 'Romance', 'Sci-Fi'],
    actors: ['Jim Carrey', 'Kate Winslet'],
    content_rating: 'R'
  }
];
