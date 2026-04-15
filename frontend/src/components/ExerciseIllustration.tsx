import { useState } from 'react';

interface Props {
  name: string;
  image?: string;
  muscleGroup?: string;
  size?: 'small' | 'large';
}

function getCategory(name: string, muscleGroup?: string): string {
  const n = name.toLowerCase();
  if (n.includes('присед') || n.includes('выпад') || n.includes('носки')) return 'legs';
  if (n.includes('планк')) return 'plank';
  if (n.includes('отжим')) return 'pushup';
  if (n.includes('мост') || n.includes('таз') || n.includes('ягодич')) return 'bridge';
  if (n.includes('растяж') || n.includes('наклон') || n.includes('кошк') || n.includes('скручив')) return 'stretch';
  if (n.includes('марш') || n.includes('степ') || n.includes('прыж') || n.includes('берпи') || n.includes('кардио')) return 'cardio';
  if (n.includes('рук') || n.includes('плеч') || n.includes('круговые')) return 'arms';
  if (n.includes('спин') || n.includes('бубновск') || n.includes('лодочк')) return 'back';
  if (n.includes('дыхан') || n.includes('йог') || n.includes('ребёнк') || n.includes('ребенк')) return 'breathing';
  if (muscleGroup) {
    const m = muscleGroup.toLowerCase();
    if (m.includes('leg') || m.includes('ног')) return 'legs';
    if (m.includes('arm') || m.includes('рук')) return 'arms';
    if (m.includes('back') || m.includes('спин')) return 'back';
    if (m.includes('core') || m.includes('кор')) return 'plank';
  }
  return 'default';
}

function LegsSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <circle cx="70" cy="12" r="6" />
      {/* Torso - leaning forward in squat */}
      <path d="M70 18 L62 38" />
      {/* Arms forward for balance */}
      <path d="M66 24 L78 28" />
      {/* Hips */}
      <path d="M62 38 L54 40" />
      <path d="M62 38 L68 42" />
      {/* Upper legs - bent at knees */}
      <path d="M54 40 L46 54" />
      <path d="M68 42 L74 54" />
      {/* Lower legs */}
      <path d="M46 54 L50 70" />
      <path d="M74 54 L72 70" />
      {/* Feet */}
      <path d="M50 70 L44 72" />
      <path d="M72 70 L78 72" />
    </svg>
  );
}

function PlankSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <circle cx="96" cy="30" r="5.5" />
      {/* Torso - horizontal plank line */}
      <path d="M91 33 L32 38" />
      {/* Upper arms */}
      <path d="M88 35 L92 52" />
      {/* Forearms on ground */}
      <path d="M92 52 L98 52" />
      {/* Hips to legs - straight line continuing */}
      <path d="M32 38 L18 58" />
      {/* Lower legs */}
      <path d="M18 58 L14 62" />
      {/* Feet */}
      <path d="M14 62 L12 60" />
      {/* Core engagement line */}
      <path d="M60 38 L58 40" strokeDasharray="2 3" opacity="0.4" />
    </svg>
  );
}

function PushupSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <circle cx="94" cy="24" r="5.5" />
      {/* Torso - angled downward */}
      <path d="M90 28 L30 42" />
      {/* Arms - extended pushing */}
      <path d="M86 30 L94 48" />
      <path d="M94 48 L94 50" />
      {/* Other arm */}
      <path d="M78 32 L82 50" />
      {/* Hands on ground */}
      <path d="M94 50 L97 50" />
      <path d="M82 50 L85 50" />
      {/* Hips and legs */}
      <path d="M30 42 L16 60" />
      {/* Feet */}
      <path d="M16 60 L14 58" />
    </svg>
  );
}

function BridgeSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Head on ground */}
      <circle cx="22" cy="54" r="5" />
      {/* Neck to shoulders on ground */}
      <path d="M27 54 L34 54" />
      {/* Back arching up */}
      <path d="M34 54 L48 34 L68 30 L80 36" />
      {/* Hips raised - top of bridge */}
      <circle cx="68" cy="29" r="1.5" fill="currentColor" opacity="0.3" />
      {/* Upper legs going down */}
      <path d="M80 36 L90 54" />
      {/* Lower legs - feet on ground */}
      <path d="M90 54 L92 62" />
      {/* Feet flat */}
      <path d="M92 62 L98 62" />
      {/* Arms flat on ground */}
      <path d="M34 54 L30 62" />
    </svg>
  );
}

function StretchSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <circle cx="76" cy="14" r="5.5" />
      {/* Torso bending forward */}
      <path d="M76 20 L56 42" />
      {/* Arms reaching down to toes */}
      <path d="M62 34 L46 56" />
      <path d="M62 34 L52 58" />
      {/* Hips */}
      <path d="M56 42 L52 44" />
      {/* Legs - standing straight */}
      <path d="M52 44 L54 64" />
      <path d="M56 42 L60 64" />
      {/* Feet */}
      <path d="M54 64 L48 66" />
      <path d="M60 64 L66 66" />
    </svg>
  );
}

function CardioSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <circle cx="58" cy="10" r="5.5" />
      {/* Torso - upright, slight lean */}
      <path d="M58 16 L56 38" />
      {/* Arms in running motion */}
      <path d="M57 22 L68 30" />
      <path d="M57 22 L44 28" />
      {/* Hips */}
      <path d="M56 38 L50 40" />
      <path d="M56 38 L62 40" />
      {/* Legs in stride */}
      <path d="M50 40 L38 56" />
      <path d="M62 40 L72 52" />
      {/* Lower legs */}
      <path d="M38 56 L42 68" />
      <path d="M72 52 L68 68" />
      {/* Feet */}
      <path d="M42 68 L36 70" />
      <path d="M68 68 L74 70" />
      {/* Motion lines */}
      <path d="M30 20 L24 20" opacity="0.3" />
      <path d="M28 28 L22 28" opacity="0.3" />
      <path d="M30 36 L24 36" opacity="0.3" />
    </svg>
  );
}

function ArmsSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <circle cx="60" cy="14" r="5.5" />
      {/* Torso - standing straight */}
      <path d="M60 20 L60 46" />
      {/* Arms raised up in Y shape */}
      <path d="M60 26 L42 12" />
      <path d="M60 26 L78 12" />
      {/* Hands with small circles */}
      <circle cx="42" cy="12" r="2" />
      <circle cx="78" cy="12" r="2" />
      {/* Circular motion indicators */}
      <path d="M38 8 Q 36 14 40 16" strokeDasharray="2 2" opacity="0.4" />
      <path d="M82 8 Q 84 14 80 16" strokeDasharray="2 2" opacity="0.4" />
      {/* Legs */}
      <path d="M60 46 L52 68" />
      <path d="M60 46 L68 68" />
      {/* Feet */}
      <path d="M52 68 L48 70" />
      <path d="M68 68 L72 70" />
    </svg>
  );
}

function BackSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* On all fours - cat/cow style */}
      {/* Head */}
      <circle cx="90" cy="28" r="5" />
      {/* Spine with curve */}
      <path d="M85 30 L72 26 Q 58 20 44 26 L32 32" />
      {/* Spine highlight */}
      <path d="M78 25 L66 22 L54 23 L42 28" strokeDasharray="3 2" opacity="0.4" />
      {/* Front arms */}
      <path d="M82 30 L84 50" />
      <path d="M84 50 L88 50" />
      {/* Back legs (knees on ground) */}
      <path d="M36 32 L32 50" />
      <path d="M32 50 L28 50" />
      {/* Other arm */}
      <path d="M76 28 L78 50" />
      {/* Other leg */}
      <path d="M40 30 L38 50" />
    </svg>
  );
}

function BreathingSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Seated meditation / child's pose */}
      {/* Head */}
      <circle cx="60" cy="16" r="5.5" />
      {/* Torso - seated upright */}
      <path d="M60 22 L60 44" />
      {/* Arms resting on knees */}
      <path d="M60 28 L46 40" />
      <path d="M60 28 L74 40" />
      {/* Hands on knees */}
      <path d="M46 40 L44 42" />
      <path d="M74 40 L76 42" />
      {/* Crossed legs */}
      <path d="M60 44 L44 52 Q 40 56 46 58 L60 54" />
      <path d="M60 44 L76 52 Q 80 56 74 58 L60 54" />
      {/* Breath lines */}
      <path d="M52 12 Q 48 6 52 2" opacity="0.3" strokeDasharray="2 2" />
      <path d="M60 10 L60 4" opacity="0.3" strokeDasharray="2 2" />
      <path d="M68 12 Q 72 6 68 2" opacity="0.3" strokeDasharray="2 2" />
    </svg>
  );
}

function DefaultSvg() {
  return (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <circle cx="60" cy="12" r="5.5" />
      {/* Torso */}
      <path d="M60 18 L60 42" />
      {/* Arms slightly out */}
      <path d="M60 26 L44 36" />
      <path d="M60 26 L76 36" />
      {/* Legs - standing */}
      <path d="M60 42 L50 66" />
      <path d="M60 42 L70 66" />
      {/* Feet */}
      <path d="M50 66 L45 68" />
      <path d="M70 66 L75 68" />
    </svg>
  );
}

const SVG_MAP: Record<string, () => React.ReactNode> = {
  legs: LegsSvg,
  plank: PlankSvg,
  pushup: PushupSvg,
  bridge: BridgeSvg,
  stretch: StretchSvg,
  cardio: CardioSvg,
  arms: ArmsSvg,
  back: BackSvg,
  breathing: BreathingSvg,
  default: DefaultSvg,
};

export default function ExerciseIllustration({ name, image, muscleGroup, size = 'small' }: Props) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const height = size === 'large' ? 160 : 64;

  if (image && !imgError) {
    return (
      <div
        className="bg-[var(--secondary)]/30 rounded-2xl p-4 flex items-center justify-center overflow-hidden"
        style={{ height }}
      >
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-2xl" />
        )}
        <img
          src={image}
          alt={name}
          onError={() => setImgError(true)}
          onLoad={() => setImgLoaded(true)}
          className="h-full w-auto object-contain rounded-xl"
          style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
        />
      </div>
    );
  }

  const category = getCategory(name, muscleGroup);
  const SvgComponent = SVG_MAP[category] || SVG_MAP.default;

  return (
    <div
      className="bg-[var(--secondary)]/30 rounded-2xl flex items-center justify-center text-[var(--primary)]"
      style={{ height, padding: size === 'large' ? 16 : 8 }}
    >
      <div style={{ height: size === 'large' ? 120 : 48, width: size === 'large' ? 180 : 72 }}>
        <SvgComponent />
      </div>
    </div>
  );
}
