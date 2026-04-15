import { useState } from 'react';

const CDN = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

/**
 * Map Russian exercise names to real photos from free-exercise-db.
 * Each entry: [folder_name, image_index]
 */
const EXERCISE_PHOTOS: Record<string, string> = {
  // Legs / Squats
  legs: `${CDN}/Bodyweight_Squat/0.jpg`,
  squat: `${CDN}/Bodyweight_Squat/1.jpg`,
  lunge: `${CDN}/Bodyweight_Lunge/0.jpg`,
  calf: `${CDN}/Rocking_Standing_Calf_Raise/0.jpg`,

  // Upper body
  plank: `${CDN}/Plank/0.jpg`,
  pushup: `${CDN}/Push-Up/0.jpg`,
  pushup_wall: `${CDN}/Push-Ups_-_Close_Triceps_Position/0.jpg`,

  // Glutes / Bridge
  bridge: `${CDN}/Bent-Knee_Hip_Raise/0.jpg`,

  // Core
  crunch: `${CDN}/Crunches/0.jpg`,

  // Stretching / Flexibility
  stretch: `${CDN}/Cat_Stretch/0.jpg`,
  cat: `${CDN}/Cat_Stretch/0.jpg`,
  hamstring: `${CDN}/Seated_Hamstring/0.jpg`,
  toe_touch: `${CDN}/Standing_Toe_Touches/0.jpg`,

  // Arms / Shoulders
  arms: `${CDN}/Shoulder_Circles/0.jpg`,
  shoulder: `${CDN}/Shoulder_Circles/0.jpg`,

  // Back
  back: `${CDN}/Superman/0.jpg`,
  superman: `${CDN}/Superman/0.jpg`,

  // Cardio
  cardio: `${CDN}/Mountain_Climbers/0.jpg`,
  march: `${CDN}/Step-up_with_Knee_Raise/0.jpg`,
  step: `${CDN}/Step-up_with_Knee_Raise/0.jpg`,
  jumping: `${CDN}/Jumping_Jacks/0.jpg`,

  // Hip
  hip: `${CDN}/Hip_Circles_prone/0.jpg`,

  // Neck
  neck: `${CDN}/Isometric_Neck_Exercise_-_Front_And_Back/0.jpg`,

  // Breathing / Yoga / Rest
  breathing: `${CDN}/Cat_Stretch/1.jpg`,

  // Default
  default: `${CDN}/Plank/0.jpg`,
};

function getPhotoUrl(name: string, image?: string): string {
  if (image) return image;

  const n = name.toLowerCase();

  // Match Russian exercise names to photo keys
  if (n.includes('присед')) return EXERCISE_PHOTOS.squat;
  if (n.includes('выпад')) return EXERCISE_PHOTOS.lunge;
  if (n.includes('носк') || n.includes('икр')) return EXERCISE_PHOTOS.calf;
  if (n.includes('планк')) return EXERCISE_PHOTOS.plank;
  if (n.includes('отжим') && n.includes('стен')) return EXERCISE_PHOTOS.pushup_wall;
  if (n.includes('отжим')) return EXERCISE_PHOTOS.pushup;
  if (n.includes('мост') || n.includes('таз') || n.includes('ягодич')) return EXERCISE_PHOTOS.bridge;
  if (n.includes('скруч') || n.includes('прес')) return EXERCISE_PHOTOS.crunch;
  if (n.includes('кошк') || n.includes('коров')) return EXERCISE_PHOTOS.cat;
  if (n.includes('растяж') || n.includes('гибк')) return EXERCISE_PHOTOS.stretch;
  if (n.includes('бедр') && n.includes('задн')) return EXERCISE_PHOTOS.hamstring;
  if (n.includes('наклон')) return EXERCISE_PHOTOS.toe_touch;
  if (n.includes('плеч') || n.includes('круговые') || n.includes('рук')) return EXERCISE_PHOTOS.arms;
  if (n.includes('спин') || n.includes('бубновск') || n.includes('лодочк') || n.includes('суперм')) return EXERCISE_PHOTOS.back;
  if (n.includes('марш') || n.includes('ходьб')) return EXERCISE_PHOTOS.march;
  if (n.includes('степ') || n.includes('шаг')) return EXERCISE_PHOTOS.step;
  if (n.includes('прыж') || n.includes('джек')) return EXERCISE_PHOTOS.jumping;
  if (n.includes('кардио') || n.includes('берпи') || n.includes('скалолаз')) return EXERCISE_PHOTOS.cardio;
  if (n.includes('тазобедр') || n.includes('бедр')) return EXERCISE_PHOTOS.hip;
  if (n.includes('ше') && (n.includes('наклон') || n.includes('голов'))) return EXERCISE_PHOTOS.neck;
  if (n.includes('дыхан') || n.includes('йог') || n.includes('ребёнк') || n.includes('ребенк')) return EXERCISE_PHOTOS.breathing;

  return EXERCISE_PHOTOS.default;
}

interface Props {
  name: string;
  image?: string;
  muscleGroup?: string;
  size?: 'small' | 'large';
}

export default function ExerciseIllustration({ name, image, size = 'small' }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const url = getPhotoUrl(name, image);

  const height = size === 'large' ? 'h-44' : 'h-24';
  const containerClass = size === 'large'
    ? 'w-full rounded-2xl overflow-hidden bg-[var(--secondary)]/20'
    : 'w-full rounded-xl overflow-hidden bg-[var(--secondary)]/20';

  if (error) return null;

  return (
    <div className={`${containerClass} ${height} relative`}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={url}
        alt={name}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover object-center transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
