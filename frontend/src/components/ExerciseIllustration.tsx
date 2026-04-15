import { useMemo } from 'react';

interface Props {
  name: string;
  image?: string;
  muscleGroup?: string;
  size?: 'small' | 'large';
}

type Category =
  | 'squat' | 'lunge' | 'calf'
  | 'plank' | 'pushup'
  | 'bridge'
  | 'stretch' | 'cat'
  | 'arms' | 'shoulder'
  | 'back'
  | 'cardio' | 'march'
  | 'breathing'
  | 'default';

function getCategory(name: string): Category {
  const n = name.toLowerCase();
  if (n.includes('присед')) return 'squat';
  if (n.includes('выпад')) return 'lunge';
  if (n.includes('носк') || n.includes('икр')) return 'calf';
  if (n.includes('планк')) return 'plank';
  if (n.includes('отжим')) return 'pushup';
  if (n.includes('мост') || n.includes('таз') || n.includes('ягодич')) return 'bridge';
  if (n.includes('кошк') || n.includes('коров')) return 'cat';
  if (n.includes('растяж') || n.includes('наклон') || n.includes('скруч')) return 'stretch';
  if (n.includes('плеч') || n.includes('круговые')) return 'shoulder';
  if (n.includes('рук')) return 'arms';
  if (n.includes('спин') || n.includes('бубновск') || n.includes('лодочк') || n.includes('суперм')) return 'back';
  if (n.includes('марш') || n.includes('ходьб') || n.includes('шаг')) return 'march';
  if (n.includes('прыж') || n.includes('кардио') || n.includes('берпи') || n.includes('скалолаз') || n.includes('степ')) return 'cardio';
  if (n.includes('дыхан') || n.includes('йог') || n.includes('ребёнк') || n.includes('ребенк') || n.includes('голов')) return 'breathing';
  return 'default';
}

/* Unique animation ID per category */
let idCounter = 0;
function useUniqueId() {
  return useMemo(() => `ex-${++idCounter}`, []);
}

/* Animated SVG illustrations — feminine silhouettes with CSS keyframe motion */
function AnimatedSVG({ category, size }: { category: Category; size: 'small' | 'large' }) {
  const id = useUniqueId();
  const w = size === 'large' ? 280 : 160;
  const h = size === 'large' ? 180 : 100;
  const stroke = '#B5886A';
  const strokeW = size === 'large' ? 2.5 : 2;

  const svgProps = {
    viewBox: '0 0 140 90',
    width: w,
    height: h,
    fill: 'none',
    stroke,
    strokeWidth: strokeW,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (category) {
    case 'squat':
      return (
        <svg {...svgProps}>
          <style>{`
            @keyframes ${id} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
            .${id}{animation:${id} 2s ease-in-out infinite}
          `}</style>
          <g className={id}>
            {/* head */}
            <circle cx="70" cy="16" r="7" fill="#E8D5C4" />
            {/* hair */}
            <path d="M63 14c0-6 5-10 10-9 4 1 6 5 6 9" stroke={stroke} fill="#B5886A" opacity="0.3" />
            {/* body */}
            <line x1="70" y1="23" x2="70" y2="48" />
            {/* arms out for balance */}
            <line x1="70" y1="30" x2="52" y2="36" />
            <line x1="70" y1="30" x2="88" y2="36" />
            {/* legs bent */}
            <path d="M70 48 L58 62 L54 78" />
            <path d="M70 48 L82 62 L86 78" />
            {/* feet */}
            <line x1="50" y1="78" x2="58" y2="78" />
            <line x1="82" y1="78" x2="90" y2="78" />
          </g>
        </svg>
      );

    case 'lunge':
      return (
        <svg {...svgProps}>
          <style>{`
            @keyframes ${id} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }
            .${id}{animation:${id} 2.5s ease-in-out infinite}
          `}</style>
          <g className={id}>
            <circle cx="70" cy="16" r="7" fill="#E8D5C4" />
            <path d="M63 14c0-6 5-10 10-9 4 1 6 5 6 9" stroke={stroke} fill="#B5886A" opacity="0.3" />
            <line x1="70" y1="23" x2="70" y2="46" />
            <line x1="70" y1="32" x2="55" y2="40" />
            <line x1="70" y1="32" x2="85" y2="40" />
            {/* front leg bent */}
            <path d="M70 46 L56 60 L52 78" />
            {/* back leg extended */}
            <path d="M70 46 L90 58 L100 78" />
            <line x1="48" y1="78" x2="56" y2="78" />
            <line x1="96" y1="78" x2="104" y2="78" />
          </g>
        </svg>
      );

    case 'calf':
      return (
        <svg {...svgProps}>
          <style>{`
            @keyframes ${id} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
            .${id}{animation:${id} 1.5s ease-in-out infinite}
          `}</style>
          <g className={id}>
            <circle cx="70" cy="16" r="7" fill="#E8D5C4" />
            <path d="M63 14c0-6 5-10 10-9 4 1 6 5 6 9" stroke={stroke} fill="#B5886A" opacity="0.3" />
            <line x1="70" y1="23" x2="70" y2="50" />
            <line x1="70" y1="32" x2="56" y2="38" />
            <line x1="70" y1="32" x2="84" y2="38" />
            <line x1="70" y1="50" x2="64" y2="72" />
            <line x1="70" y1="50" x2="76" y2="72" />
            {/* on toes */}
            <circle cx="64" cy="74" r="2" fill={stroke} opacity="0.5" />
            <circle cx="76" cy="74" r="2" fill={stroke} opacity="0.5" />
          </g>
        </svg>
      );

    case 'plank':
      return (
        <svg {...svgProps}>
          <style>{`
            @keyframes ${id} { 0%,100%{opacity:1} 50%{opacity:0.7} }
            .${id}{animation:${id} 3s ease-in-out infinite}
          `}</style>
          <g className={id}>
            <circle cx="30" cy="38" r="7" fill="#E8D5C4" />
            <path d="M23 36c0-6 5-10 10-9 4 1 6 5 6 9" stroke={stroke} fill="#B5886A" opacity="0.3" />
            {/* straight body */}
            <line x1="37" y1="40" x2="105" y2="46" />
            {/* arms down */}
            <line x1="40" y1="40" x2="36" y2="58" />
            <line x1="36" y1="58" x2="32" y2="58" />
            {/* forearm on ground */}
            <line x1="42" y1="40" x2="46" y2="58" />
            <line x1="46" y1="58" x2="50" y2="58" />
            {/* legs */}
            <line x1="105" y1="46" x2="112" y2="58" />
            <line x1="105" y1="46" x2="118" y2="58" />
          </g>
        </svg>
      );

    case 'pushup':
      return (
        <svg {...svgProps}>
          <style>{`
            @keyframes ${id} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
            .${id}{animation:${id} 2s ease-in-out infinite}
          `}</style>
          <g className={id}>
            <circle cx="28" cy="34" r="7" fill="#E8D5C4" />
            <path d="M21 32c0-6 5-10 10-9 4 1 6 5 6 9" stroke={stroke} fill="#B5886A" opacity="0.3" />
            <line x1="35" y1="36" x2="105" y2="44" />
            {/* arms pushing */}
            <path d="M38 36 L34 52 L30 52" />
            <path d="M44 37 L48 52 L52 52" />
            <line x1="105" y1="44" x2="112" y2="56" />
            <line x1="105" y1="44" x2="118" y2="56" />
          </g>
        </svg>
      );

    case 'bridge':
      return (
        <svg {...svgProps}>
          <style>{`
            @keyframes ${id} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
            .${id}{animation:${id} 2.5s ease-in-out infinite}
          `}</style>
          <g className={id} transform="translate(0,10)">
            <circle cx="25" cy="50" r="7" fill="#E8D5C4" />
            <path d="M18 48c0-6 5-10 10-9 4 1 6 5 6 9" stroke={stroke} fill="#B5886A" opacity="0.3" />
            {/* body arched up */}
            <path d="M32 50 Q70 20 95 55" />
            {/* arms on ground */}
            <line x1="30" y1="52" x2="26" y2="62" />
            {/* legs bent, feet on ground */}
            <path d="M95 55 L100 68 L92 68" />
            <path d="M92 55 L86 68 L80 68" />
            {/* ground line */}
            <line x1="15" y1="68" x2="110" y2="68" stroke={stroke} opacity="0.2" />
          </g>
        </svg>
      );

    case 'cat':
      return (
        <svg {...svgProps}>
          <style>{`
            @keyframes ${id} { 0%,100%{d:path('M40 42 Q70 30 100 42')} 50%{d:path('M40 42 Q70 55 100 42')} }
            @keyframes ${id}h { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
            .${id}{animation:${id}h 3s ease-in-out infinite}
          `}</style>
          <g className={id}>
            <circle cx="35" cy="34" r="7" fill="#E8D5C4" />
            <path d="M28 32c0-6 5-10 10-9 4 1 6 5 6 9" stroke={stroke} fill="#B5886A" opacity="0.3" />
            {/* spine curve */}
            <path d="M40 38 Q70 28 100 38" />
            {/* arms (on all fours) */}
            <line x1="42" y1="40" x2="42" y2="60" />
            <line x1="50" y1="40" x2="50" y2="60" />
            {/* legs */}
            <line x1="95" y1="40" x2="95" y2="60" />
            <line x1="103" y1="40" x2="103" y2="60" />
            {/* ground */}
            <line x1="30" y1="60" x2="115" y2="60" stroke={stroke} opacity="0.2" />
          </g>
        </svg>
      );

    case 'stretch':
      return (
        <svg {...svgProps}>
          <style>{`
            @keyframes ${id} { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-8deg)} }
            .${id}{animation:${id} 3s ease-in-out infinite;transform-origin:70px 50px}
          `}</style>
          <g className={id}>
            <circle cx="70" cy="16" r="7" fill="#E8D5C4" />
            <path d="M63 14c0-6 5-10 10-9 4 1 6 5 6 9" stroke={stroke} fill="#B5886A" opacity="0.3" />
            {/* body bending forward */}
            <path d="M70 23 L70 48" />
            {/* arms reaching down */}
            <path d="M70 30 L56 50" />
            <path d="M70 30 L84 50" />
            {/* legs straight */}
            <line x1="70" y1="48" x2="62" y2="76" />
            <line x1="70" y1="48" x2="78" y2="76" />
            <line x1="58" y1="76" x2="66" y2="76" />
            <line x1="74" y1="76" x2="82" y2="76" />
          </g>
        </svg>
      );

    case 'shoulder':
    case 'arms':
      return (
        <svg {...svgProps}>
          <style>{`
            @keyframes ${id} { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
            .${id}a{animation:${id} 3s linear infinite;transform-origin:54px 30px}
            .${id}b{animation:${id} 3s linear infinite reverse;transform-origin:86px 30px}
          `}</style>
          <g>
            <circle cx="70" cy="16" r="7" fill="#E8D5C4" />
            <path d="M63 14c0-6 5-10 10-9 4 1 6 5 6 9" stroke={stroke} fill="#B5886A" opacity="0.3" />
            <line x1="70" y1="23" x2="70" y2="50" />
            {/* animated arms */}
            <g className={`${id}a`}><line x1="54" y1="30" x2="42" y2="20" /></g>
            <g className={`${id}b`}><line x1="86" y1="30" x2="98" y2="20" /></g>
            {/* shoulders */}
            <line x1="70" y1="28" x2="54" y2="30" />
            <line x1="70" y1="28" x2="86" y2="30" />
            {/* legs */}
            <line x1="70" y1="50" x2="62" y2="76" />
            <line x1="70" y1="50" x2="78" y2="76" />
            <line x1="58" y1="76" x2="66" y2="76" />
            <line x1="74" y1="76" x2="82" y2="76" />
          </g>
        </svg>
      );

    case 'back':
      return (
        <svg {...svgProps}>
          <style>{`
            @keyframes ${id} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
            .${id}{animation:${id} 2.5s ease-in-out infinite}
          `}</style>
          <g className={id}>
            {/* lying face down, lifting upper body — superman */}
            <circle cx="35" cy="44" r="7" fill="#E8D5C4" />
            <path d="M28 42c0-6 5-10 10-9 4 1 6 5 6 9" stroke={stroke} fill="#B5886A" opacity="0.3" />
            <line x1="42" y1="48" x2="105" y2="54" />
            {/* arms forward */}
            <line x1="38" y1="44" x2="20" y2="36" />
            <line x1="40" y1="46" x2="22" y2="38" />
            {/* legs up */}
            <line x1="105" y1="54" x2="118" y2="46" />
            <line x1="105" y1="54" x2="120" y2="50" />
            {/* ground */}
            <line x1="15" y1="62" x2="125" y2="62" stroke={stroke} opacity="0.2" />
          </g>
        </svg>
      );

    case 'cardio':
      return (
        <svg {...svgProps}>
          <style>{`
            @keyframes ${id} { 0%,100%{transform:translateY(0)} 25%{transform:translateY(-10px)} 75%{transform:translateY(-5px)} }
            .${id}{animation:${id} 0.8s ease-in-out infinite}
          `}</style>
          <g className={id}>
            <circle cx="70" cy="14" r="7" fill="#E8D5C4" />
            <path d="M63 12c0-6 5-10 10-9 4 1 6 5 6 9" stroke={stroke} fill="#B5886A" opacity="0.3" />
            <line x1="70" y1="21" x2="70" y2="45" />
            {/* arms swinging */}
            <path d="M70 28 L54 38" />
            <path d="M70 28 L86 22" />
            {/* running legs */}
            <path d="M70 45 L56 60 L50 72" />
            <path d="M70 45 L84 58 L92 72" />
          </g>
        </svg>
      );

    case 'march':
      return (
        <svg {...svgProps}>
          <style>{`
            @keyframes ${id}l { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-20deg)} }
            @keyframes ${id}r { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(20deg)} }
            .${id}l{animation:${id}l 1.5s ease-in-out infinite;transform-origin:70px 48px}
            .${id}r{animation:${id}r 1.5s ease-in-out infinite;transform-origin:70px 48px}
          `}</style>
          <g>
            <circle cx="70" cy="14" r="7" fill="#E8D5C4" />
            <path d="M63 12c0-6 5-10 10-9 4 1 6 5 6 9" stroke={stroke} fill="#B5886A" opacity="0.3" />
            <line x1="70" y1="21" x2="70" y2="48" />
            <line x1="70" y1="28" x2="56" y2="36" />
            <line x1="70" y1="28" x2="84" y2="36" />
            {/* marching legs */}
            <g className={`${id}l`}><path d="M70 48 L60 68 L58 78" /></g>
            <g className={`${id}r`}><path d="M70 48 L80 68 L82 78" /></g>
          </g>
        </svg>
      );

    case 'breathing':
      return (
        <svg {...svgProps}>
          <style>{`
            @keyframes ${id} { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
            .${id}{animation:${id} 4s ease-in-out infinite;transform-origin:70px 45px}
          `}</style>
          <g className={id}>
            {/* seated meditation pose */}
            <circle cx="70" cy="22" r="7" fill="#E8D5C4" />
            <path d="M63 20c0-6 5-10 10-9 4 1 6 5 6 9" stroke={stroke} fill="#B5886A" opacity="0.3" />
            <line x1="70" y1="29" x2="70" y2="52" />
            {/* hands on knees */}
            <path d="M70 36 L52 46 L48 56" />
            <path d="M70 36 L88 46 L92 56" />
            {/* crossed legs */}
            <path d="M70 52 L50 62 L48 66" />
            <path d="M70 52 L90 62 L92 66" />
            {/* breath indicator */}
            <circle cx="70" cy="40" r="4" fill="none" stroke={stroke} opacity="0.3" strokeDasharray="2 2" />
          </g>
        </svg>
      );

    default:
      return (
        <svg {...svgProps}>
          <style>{`
            @keyframes ${id} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
            .${id}{animation:${id} 2s ease-in-out infinite}
          `}</style>
          <g className={id}>
            <circle cx="70" cy="16" r="7" fill="#E8D5C4" />
            <path d="M63 14c0-6 5-10 10-9 4 1 6 5 6 9" stroke={stroke} fill="#B5886A" opacity="0.3" />
            <line x1="70" y1="23" x2="70" y2="50" />
            <line x1="70" y1="30" x2="54" y2="40" />
            <line x1="70" y1="30" x2="86" y2="40" />
            <line x1="70" y1="50" x2="60" y2="76" />
            <line x1="70" y1="50" x2="80" y2="76" />
          </g>
        </svg>
      );
  }
}

export default function ExerciseIllustration({ name, size = 'small' }: Props) {
  const category = getCategory(name);
  const containerHeight = size === 'large' ? 'h-44' : 'h-24';

  return (
    <div className={`w-full ${containerHeight} rounded-2xl bg-[var(--secondary)]/20 flex items-center justify-center overflow-hidden`}>
      <AnimatedSVG category={category} size={size} />
    </div>
  );
}
