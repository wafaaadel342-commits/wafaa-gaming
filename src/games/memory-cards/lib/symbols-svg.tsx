import React from "react";

interface SymbolIconProps {
  symbolKey: string;
  className?: string;
}

export const EgyptianSymbolIcon: React.FC<SymbolIconProps> = ({
  symbolKey,
  className = "w-16 h-16",
}) => {
  switch (symbolKey) {
    case "pyramid":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FBF3DE" />
          <path d="M50 16L18 78H82L50 16Z" fill="#D4AF37" />
          <path d="M50 16L82 78H50V16Z" fill="#B38E22" opacity="0.8" />
          <path d="M50 16L64 78H50V16Z" fill="#99781B" opacity="0.4" />
          <path d="M12 78C30 74 70 74 88 78H12Z" fill="#E6C875" />
          <circle cx="75" cy="28" r="8" fill="#F59E0B" opacity="0.85" />
        </svg>
      );

    case "sphinx":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FDF6E2" />
          {/* Nemes headdress */}
          <path d="M42 22C42 16 58 16 58 22L66 38L62 48H38L34 38L42 22Z" fill="#3B82F6" />
          <path d="M45 20H55V46H45V20Z" fill="#EAB308" />
          {/* Head */}
          <ellipse cx="50" cy="34" rx="10" ry="12" fill="#D97706" />
          {/* Body */}
          <rect x="22" y="52" width="56" height="24" rx="10" fill="#D4AF37" />
          {/* Paws */}
          <rect x="18" y="72" width="22" height="8" rx="4" fill="#B45309" />
          <rect x="42" y="72" width="22" height="8" rx="4" fill="#B45309" />
        </svg>
      );

    case "ankh":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#F0FDF4" />
          {/* Ankh loop */}
          <ellipse cx="50" cy="32" rx="14" ry="16" stroke="#D4AF37" strokeWidth="6" fill="#FEF08A" />
          {/* Cross arms */}
          <path d="M26 50H74" stroke="#D4AF37" strokeWidth="6" strokeLinecap="round" />
          {/* Stem */}
          <path d="M50 50V82" stroke="#D4AF37" strokeWidth="6" strokeLinecap="round" />
          <circle cx="50" cy="32" r="4" fill="#0D9488" />
        </svg>
      );

    case "scarab":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#ECFDF5" />
          {/* Sun disc held */}
          <circle cx="50" cy="18" r="8" fill="#F59E0B" />
          {/* Head */}
          <path d="M44 28H56L53 36H47L44 28Z" fill="#047857" />
          {/* Body */}
          <ellipse cx="50" cy="54" rx="18" ry="22" fill="#065F46" />
          <path d="M50 36V76" stroke="#34D399" strokeWidth="2.5" />
          <path d="M34 52C42 56 58 56 66 52" stroke="#34D399" strokeWidth="2" />
          {/* Legs */}
          <path d="M36 44L22 36M64 44L78 36M34 56L18 56M66 56L82 56M36 68L22 76M64 68L78 76" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case "eye_of_horus":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#EFF6FF" />
          {/* Eye outline */}
          <path d="M22 45C32 30 68 30 78 45C68 60 32 60 22 45Z" fill="#DBEAFE" stroke="#1E40AF" strokeWidth="4" />
          {/* Pupil */}
          <circle cx="50" cy="45" r="9" fill="#1E3A8A" />
          <circle cx="48" cy="43" r="3" fill="#FFFFFF" />
          {/* Eyebrow */}
          <path d="M20 30C36 22 64 22 80 30" stroke="#1E40AF" strokeWidth="4" strokeLinecap="round" />
          {/* Markings */}
          <path d="M50 56V76" stroke="#1E40AF" strokeWidth="4" strokeLinecap="round" />
          <path d="M62 54C68 62 74 64 80 62" stroke="#1E40AF" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    case "papyrus":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#F0FDF4" />
          {/* Stalk */}
          <path d="M50 84V42" stroke="#15803D" strokeWidth="5" strokeLinecap="round" />
          {/* Umbel head */}
          <path d="M50 42L28 20M50 42L36 16M50 42L50 14M50 42L64 16M50 42L72 20" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M24 20C36 14 64 14 76 20" stroke="#86EFAC" strokeWidth="2.5" />
          <circle cx="50" cy="42" r="5" fill="#166534" />
        </svg>
      );

    case "lotus":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FDF2F8" />
          <path d="M50 82C50 64 50 52 50 50" stroke="#059669" strokeWidth="4" />
          {/* Center petal */}
          <path d="M50 22C44 38 44 54 50 56C56 54 56 38 50 22Z" fill="#EC4899" />
          {/* Side petals */}
          <path d="M50 56C42 54 28 42 32 30C40 34 46 46 50 56Z" fill="#F472B6" />
          <path d="M50 56C58 54 72 42 68 30C60 34 54 46 50 56Z" fill="#F472B6" />
          {/* Calyx */}
          <path d="M36 56C44 62 56 62 64 56L50 66L36 56Z" fill="#10B981" />
        </svg>
      );

    case "falcon":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
          {/* Double Crown */}
          <path d="M46 12H54L58 26H42L46 12Z" fill="#DC2626" />
          <path d="M44 26H56V32H44V26Z" fill="#FFFFFF" />
          {/* Falcon Body */}
          <ellipse cx="50" cy="52" rx="16" ry="24" fill="#B45309" />
          {/* Wing */}
          <path d="M42 42C34 54 36 74 44 82C38 74 36 56 42 42Z" fill="#78350F" />
          {/* Head & Beak */}
          <circle cx="56" cy="34" r="8" fill="#D97706" />
          <path d="M62 34L70 38L62 40V34Z" fill="#F59E0B" />
          <circle cx="56" cy="33" r="2" fill="#000" />
        </svg>
      );

    case "obelisk":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#F8FAFC" />
          {/* Pyramidion */}
          <path d="M50 14L43 28H57L50 14Z" fill="#EAB308" />
          {/* Shaft */}
          <path d="M43 28L39 80H61L57 28H43Z" fill="#94A3B8" />
          <path d="M50 28V80H61L57 28H50Z" fill="#64748B" />
          {/* Base */}
          <rect x="34" y="80" width="32" height="6" fill="#475569" rx="2" />
          {/* Hieroglyph marks */}
          <line x1="47" y1="36" x2="47" y2="42" stroke="#CBD5E1" strokeWidth="2" />
          <line x1="47" y1="48" x2="47" y2="54" stroke="#CBD5E1" strokeWidth="2" />
        </svg>
      );

    case "sailboat_nile":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#E0F2FE" />
          {/* Water */}
          <path d="M14 74C26 71 38 77 50 74C62 71 74 77 86 74" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
          {/* Boat hull */}
          <path d="M22 66H78L70 76H30L22 66Z" fill="#92400E" />
          {/* Mast */}
          <line x1="48" y1="20" x2="48" y2="66" stroke="#451A03" strokeWidth="3" />
          {/* Felucca Sail */}
          <path d="M50 20L78 58H50V20Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M48 24L26 62H48V24Z" fill="#F8FAFC" opacity="0.85" />
        </svg>
      );

    case "water_wheel":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#F1F5F9" />
          {/* Outer Wheel */}
          <circle cx="50" cy="50" r="28" stroke="#92400E" strokeWidth="5" fill="#FEF3C7" />
          <circle cx="50" cy="50" r="8" fill="#78350F" />
          {/* Spokes */}
          <line x1="50" y1="22" x2="50" y2="78" stroke="#92400E" strokeWidth="3" />
          <line x1="22" y1="50" x2="78" y2="50" stroke="#92400E" strokeWidth="3" />
          <line x1="30" y1="30" x2="70" y2="70" stroke="#92400E" strokeWidth="3" />
          <line x1="70" y1="30" x2="30" y2="70" stroke="#92400E" strokeWidth="3" />
          {/* Clay pots */}
          <circle cx="50" cy="18" r="4" fill="#B45309" />
          <circle cx="50" cy="82" r="4" fill="#B45309" />
          <circle cx="18" cy="50" r="4" fill="#B45309" />
          <circle cx="82" cy="50" r="4" fill="#B45309" />
        </svg>
      );

    case "palm_tree":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FEF9C3" />
          {/* Trunk */}
          <path d="M48 82L46 48H54L52 82H48Z" fill="#854D0E" />
          {/* Fronds */}
          <path d="M50 46C34 40 22 46 16 56C28 48 42 48 50 46Z" fill="#15803D" />
          <path d="M50 46C66 40 78 46 84 56C72 48 58 48 50 46Z" fill="#15803D" />
          <path d="M50 46C38 32 30 24 22 26C32 26 44 36 50 46Z" fill="#16A34A" />
          <path d="M50 46C62 32 70 24 78 26C68 26 56 36 50 46Z" fill="#16A34A" />
          <path d="M50 46C46 26 50 16 50 14C52 24 54 36 50 46Z" fill="#22C55E" />
          {/* Dates */}
          <circle cx="47" cy="48" r="3" fill="#B45309" />
          <circle cx="53" cy="48" r="3" fill="#B45309" />
        </svg>
      );

    case "ibis":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#F8FAFC" />
          {/* Body */}
          <ellipse cx="46" cy="52" rx="18" ry="14" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
          <path d="M30 52C24 56 22 66 28 68" stroke="#0F172A" strokeWidth="4" />
          {/* Curved long beak */}
          <path d="M60 40C68 40 76 46 82 56" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          {/* Head & neck */}
          <path d="M52 48C54 44 56 40 60 40" stroke="#0F172A" strokeWidth="4" />
          {/* Legs */}
          <line x1="42" y1="66" x2="42" y2="84" stroke="#0F172A" strokeWidth="2.5" />
          <line x1="50" y1="66" x2="50" y2="84" stroke="#0F172A" strokeWidth="2.5" />
        </svg>
      );

    case "camel":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FFFBEB" />
          {/* Hump & body */}
          <path d="M30 62C30 54 38 42 46 42C52 42 56 48 60 48C66 48 70 54 70 62H30Z" fill="#D97706" />
          {/* Neck & head */}
          <path d="M66 58C70 52 74 38 72 32C76 32 78 34 80 36" stroke="#D97706" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Legs */}
          <line x1="36" y1="62" x2="34" y2="82" stroke="#B45309" strokeWidth="3.5" />
          <line x1="44" y1="62" x2="46" y2="82" stroke="#B45309" strokeWidth="3.5" />
          <line x1="60" y1="62" x2="58" y2="82" stroke="#B45309" strokeWidth="3.5" />
          <line x1="66" y1="62" x2="68" y2="82" stroke="#B45309" strokeWidth="3.5" />
        </svg>
      );

    case "lotus_crown":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FDF4FF" />
          {/* Crown band */}
          <rect x="24" y="62" width="52" height="10" rx="3" fill="#EAB308" />
          {/* Blue Khepresh / Red Crown elements */}
          <path d="M30 62C30 40 40 24 50 20C60 24 70 40 70 62H30Z" fill="#2563EB" />
          <circle cx="50" cy="42" r="5" fill="#EAB308" />
          <path d="M47 20C47 14 53 14 53 20" stroke="#DC2626" strokeWidth="3" />
        </svg>
      );

    case "khayamiya":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FEF2F2" />
          {/* Outer Star / Octagon */}
          <rect x="25" y="25" width="50" height="50" fill="#DC2626" transform="rotate(45 50 50)" />
          <rect x="28" y="28" width="44" height="44" fill="#0284C7" />
          <circle cx="50" cy="50" r="14" fill="#EAB308" />
          <circle cx="50" cy="50" r="6" fill="#FFFFFF" />
          <path d="M50 22V78M22 50H78" stroke="#FEF08A" strokeWidth="2" />
        </svg>
      );

    case "copper_lantern":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FEFCE8" />
          {/* Hanging ring */}
          <circle cx="50" cy="18" r="6" stroke="#CA8A04" strokeWidth="3" fill="none" />
          {/* Top cone */}
          <path d="M38 32L50 22L62 32H38Z" fill="#CA8A04" />
          {/* Glass body */}
          <path d="M36 32L30 58H70L64 32H36Z" fill="#38BDF8" opacity="0.6" stroke="#CA8A04" strokeWidth="2.5" />
          <circle cx="50" cy="46" r="6" fill="#F59E0B" />
          {/* Bottom base */}
          <path d="M30 58L24 76H76L70 58H30Z" fill="#CA8A04" />
          <rect x="36" y="76" width="28" height="6" fill="#A16207" rx="2" />
        </svg>
      );

    case "baladi_bread":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
          {/* Round puffed pita loaf */}
          <ellipse cx="50" cy="50" rx="34" ry="26" fill="#F59E0B" stroke="#D97706" strokeWidth="3" />
          {/* Flour dusting and charred spots */}
          <ellipse cx="44" cy="44" rx="6" ry="4" fill="#92400E" opacity="0.8" />
          <ellipse cx="58" cy="48" rx="8" ry="5" fill="#78350F" opacity="0.75" />
          <ellipse cx="42" cy="56" rx="5" ry="3" fill="#92400E" opacity="0.7" />
          <ellipse cx="50" cy="50" rx="28" ry="18" stroke="#FDE68A" strokeWidth="2" strokeDasharray="3 3" fill="none" />
        </svg>
      );

    case "koshari_bowl":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FFF1F2" />
          {/* Bowl */}
          <path d="M20 50C20 74 34 82 50 82C66 82 80 74 80 50H20Z" fill="#DC2626" />
          {/* Koshari top */}
          <ellipse cx="50" cy="50" rx="30" ry="10" fill="#FEF08A" />
          {/* Tomato sauce */}
          <ellipse cx="50" cy="48" rx="20" ry="6" fill="#B91C1C" />
          {/* Crispy onions */}
          <ellipse cx="50" cy="46" rx="10" ry="3" fill="#78350F" />
          {/* Chickpeas */}
          <circle cx="42" cy="46" r="2.5" fill="#FBBF24" />
          <circle cx="58" cy="46" r="2.5" fill="#FBBF24" />
        </svg>
      );

    case "ful_bowl":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FEFCE8" />
          {/* Ful pot (Qedra) */}
          <path d="M34 26H66L62 38C74 46 76 66 68 76C62 82 38 82 32 76C24 66 26 46 38 38L34 26Z" fill="#CA8A04" stroke="#854D0E" strokeWidth="3" />
          <ellipse cx="50" cy="26" rx="16" ry="4" fill="#A16207" />
          {/* Olive oil drop / cumin sparkle */}
          <circle cx="50" cy="56" r="7" fill="#F59E0B" />
          <circle cx="50" cy="56" r="3" fill="#FEF08A" />
        </svg>
      );

    case "taameya":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#F0FDF4" />
          {/* Crispy patty */}
          <circle cx="50" cy="50" r="28" fill="#B45309" stroke="#78350F" strokeWidth="3" />
          <circle cx="50" cy="50" r="24" fill="#15803D" />
          {/* Sesame seeds */}
          <ellipse cx="44" cy="42" rx="3" ry="1.5" fill="#FEF08A" transform="rotate(20 44 42)" />
          <ellipse cx="54" cy="40" rx="3" ry="1.5" fill="#FEF08A" transform="rotate(-30 54 40)" />
          <ellipse cx="40" cy="54" rx="3" ry="1.5" fill="#FEF08A" transform="rotate(45 40 54)" />
          <ellipse cx="58" cy="52" rx="3" ry="1.5" fill="#FEF08A" transform="rotate(10 58 52)" />
          <ellipse cx="48" cy="60" rx="3" ry="1.5" fill="#FEF08A" transform="rotate(-15 48 60)" />
        </svg>
      );

    case "molokhia_bowl":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#F0FDF4" />
          {/* Clay tagine */}
          <path d="M22 48C22 72 34 80 50 80C66 80 78 72 78 48H22Z" fill="#9A3412" stroke="#7C2D12" strokeWidth="3" />
          {/* Dark green soup */}
          <ellipse cx="50" cy="48" rx="28" ry="10" fill="#14532D" />
          {/* Golden garlic/coriander 'Tasha' swirl */}
          <path d="M42 48C46 44 54 44 58 48" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="48" r="2" fill="#FBBF24" />
        </svg>
      );

    case "feteer":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FEFCE8" />
          {/* Layered round pastry */}
          <circle cx="50" cy="50" r="32" fill="#FDE047" stroke="#CA8A04" strokeWidth="3" />
          <circle cx="50" cy="50" r="24" stroke="#EAB308" strokeWidth="2" strokeDasharray="6 4" fill="#FEF08A" />
          <circle cx="50" cy="50" r="14" stroke="#D97706" strokeWidth="2" fill="#FFFBEB" />
          {/* Golden butter gleam */}
          <circle cx="44" cy="42" r="3" fill="#FFFFFF" opacity="0.8" />
        </svg>
      );

    case "hibiscus_glass":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FFF1F2" />
          {/* Glass */}
          <path d="M34 26L38 78H62L66 26H34Z" fill="#FFE4E6" stroke="#94A3B8" strokeWidth="2" />
          {/* Ruby red Karkadeh */}
          <path d="M35 36L38 76H62L65 36H35Z" fill="#9F1239" />
          {/* Ice cubes */}
          <rect x="42" y="44" width="8" height="8" rx="2" fill="#FECDD3" opacity="0.8" />
          <rect x="50" y="52" width="7" height="7" rx="2" fill="#FECDD3" opacity="0.8" />
        </svg>
      );

    case "cairo_tower":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#F8FAFC" />
          {/* Lattice tower body */}
          <path d="M44 86L46 36L42 28H58L54 36L56 86H44Z" fill="#0D9488" stroke="#115E59" strokeWidth="2" />
          {/* Lotus top / observation deck */}
          <circle cx="50" cy="24" r="8" fill="#F59E0B" />
          <line x1="50" y1="12" x2="50" y2="16" stroke="#115E59" strokeWidth="2" />
          {/* Lattice lines */}
          <line x1="45" y1="45" x2="55" y2="55" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="55" y1="45" x2="45" y2="55" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="45" y1="65" x2="55" y2="75" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="55" y1="65" x2="45" y2="75" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      );

    case "tut_mask":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FEF9C3" />
          {/* Nemes stripes */}
          <path d="M30 30C30 18 70 18 70 30L78 58L68 64H32L22 58L30 30Z" fill="#1E40AF" />
          <path d="M34 26L42 22M46 20L54 20M58 22L66 26" stroke="#EAB308" strokeWidth="3" />
          {/* Face */}
          <ellipse cx="50" cy="44" rx="14" ry="16" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          {/* Eyes & beard */}
          <circle cx="44" cy="42" r="2.5" fill="#000" />
          <circle cx="56" cy="42" r="2.5" fill="#000" />
          <rect x="47" y="58" width="6" height="14" rx="3" fill="#1E3A8A" stroke="#EAB308" strokeWidth="1.5" />
        </svg>
      );

    case "nefertiti_bust":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
          {/* Tall Blue Crown */}
          <path d="M34 44L28 18H72L66 44H34Z" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="2" />
          <rect x="30" y="38" width="40" height="6" fill="#F59E0B" />
          {/* Profile face */}
          <path d="M44 44C44 54 48 62 50 64C52 62 56 54 56 44H44Z" fill="#FBBF24" />
          {/* Graceful neck */}
          <rect x="46" y="64" width="8" height="16" fill="#F59E0B" />
          {/* Broad collar */}
          <path d="M34 80C42 84 58 84 66 80V86H34V80Z" fill="#10B981" />
        </svg>
      );

    case "aragoz_puppet":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FFF1F2" />
          {/* Red pointy hat */}
          <path d="M36 34L50 12L64 34H36Z" fill="#DC2626" />
          <circle cx="50" cy="12" r="4" fill="#FDE047" />
          {/* Face */}
          <circle cx="50" cy="42" r="12" fill="#FED7AA" />
          <circle cx="46" cy="40" r="2" fill="#000" />
          <circle cx="54" cy="40" r="2" fill="#000" />
          {/* Red smiling lips */}
          <path d="M44 47C47 51 53 51 56 47" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
          {/* Red robe */}
          <path d="M32 54L22 78H78L68 54H32Z" fill="#DC2626" />
          <circle cx="50" cy="64" r="3" fill="#FDE047" />
        </svg>
      );

    case "oud_instrument":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FFFBEB" />
          {/* Pear-shaped body */}
          <path d="M32 54C32 74 40 84 50 84C60 84 68 74 68 54C68 42 62 36 50 36C38 36 32 42 32 54Z" fill="#B45309" stroke="#78350F" strokeWidth="3" />
          {/* Sound hole */}
          <circle cx="50" cy="56" r="7" fill="#451A03" stroke="#FEF08A" strokeWidth="1.5" />
          {/* Neck & Pegbox */}
          <rect x="47" y="20" width="6" height="18" fill="#78350F" />
          <path d="M47 20L44 14H56L53 20H47Z" fill="#451A03" />
          {/* Strings */}
          <line x1="49" y1="20" x2="49" y2="76" stroke="#FEF3C7" strokeWidth="1" />
          <line x1="51" y1="20" x2="51" y2="76" stroke="#FEF3C7" strokeWidth="1" />
        </svg>
      );

    case "tabla_darbuka":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#F8FAFC" />
          {/* Drum head */}
          <ellipse cx="50" cy="24" rx="24" ry="8" fill="#F8FAFC" stroke="#0284C7" strokeWidth="3" />
          {/* Goblet body */}
          <path d="M26 24C28 42 42 54 44 64V80H56V64C58 54 72 42 74 24H26Z" fill="#0369A1" stroke="#0C4A6E" strokeWidth="2.5" />
          {/* Base */}
          <ellipse cx="50" cy="80" rx="14" ry="4" fill="#0C4A6E" />
          {/* Mother of pearl patterns */}
          <circle cx="50" cy="40" r="4" fill="#38BDF8" />
        </svg>
      );

    case "tarboosh":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FEF2F2" />
          {/* Cone body */}
          <path d="M32 64L38 28H62L68 64H32Z" fill="#DC2626" stroke="#991B1B" strokeWidth="3" />
          <ellipse cx="50" cy="28" rx="12" ry="4" fill="#B91C1C" />
          {/* Black tassel (Zeraba) */}
          <circle cx="50" cy="28" r="3" fill="#000" />
          <path d="M50 28C56 34 68 38 72 52" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="72" y1="52" x2="74" y2="60" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case "hawawshi":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FFFBEB" />
          {/* Half cut round bread */}
          <path d="M22 62C22 38 40 24 50 24C60 24 78 38 78 62H22Z" fill="#D97706" stroke="#92400E" strokeWidth="3" />
          {/* Inner spiced minced meat */}
          <path d="M26 62C30 54 44 48 50 48C56 48 70 54 74 62H26Z" fill="#78350F" />
          <circle cx="42" cy="56" r="1.5" fill="#15803D" />
          <circle cx="56" cy="54" r="1.5" fill="#EF4444" />
        </svg>
      );

    case "nubian_house":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#F0FDF4" />
          {/* White dome */}
          <ellipse cx="50" cy="42" rx="20" ry="16" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
          {/* Colorful house walls */}
          <rect x="26" y="42" width="48" height="38" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
          {/* Arched door */}
          <path d="M44 80V60C44 56 56 56 56 60V80H44Z" fill="#0284C7" />
          {/* Nubian geometric triangles */}
          <polygon points="30,48 36,48 33,42" fill="#DC2626" />
          <polygon points="40,48 46,48 43,42" fill="#16A34A" />
          <polygon points="54,48 60,48 57,42" fill="#DC2626" />
          <polygon points="64,48 70,48 67,42" fill="#16A34A" />
        </svg>
      );

    case "mesaharaty_drum":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FFFBEB" />
          {/* Baza drum */}
          <ellipse cx="50" cy="46" rx="24" ry="16" fill="#FEF3C7" stroke="#92400E" strokeWidth="3" />
          <path d="M26 46C26 62 36 74 50 74C64 74 74 62 74 46" stroke="#92400E" strokeWidth="3" fill="#B45309" />
          {/* Leather beater */}
          <line x1="56" y1="36" x2="78" y2="22" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
          <circle cx="56" cy="36" r="5" fill="#451A03" />
        </svg>
      );

    case "halawa_horse":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FFF1F2" />
          {/* Pink sugar horse shape */}
          <path d="M34 68C34 56 40 44 48 40C52 36 56 26 54 18C60 22 64 30 62 38L68 44C74 50 72 64 64 68H34Z" fill="#F43F5E" />
          {/* Sugar stand & rider flags */}
          <rect x="28" y="68" width="44" height="10" rx="3" fill="#E11D48" />
          <polygon points="58,16 68,12 62,24" fill="#FBBF24" />
          <circle cx="52" cy="52" r="4" fill="#FFFFFF" />
        </svg>
      );

    case "mint_tea_glass":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#F0FDF4" />
          {/* Small 50 glass */}
          <path d="M34 32L38 78H62L66 32H34Z" fill="#FEF3C7" stroke="#78350F" strokeWidth="2.5" />
          {/* Amber red tea */}
          <path d="M35 44L38 76H62L65 44H35Z" fill="#B45309" />
          {/* Mint sprig */}
          <path d="M50 36C44 26 50 18 56 24C62 20 64 30 54 36" fill="#22C55E" />
          <line x1="50" y1="36" x2="50" y2="60" stroke="#15803D" strokeWidth="2" />
        </svg>
      );

    case "sugar_cane_juice":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FEFCE8" />
          {/* Tall cup */}
          <path d="M32 24L38 82H62L68 24H32Z" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="2.5" />
          {/* Green juice */}
          <path d="M34 36L38 80H62L66 36H34Z" fill="#84CC16" />
          {/* Frothy top */}
          <ellipse cx="50" cy="36" rx="16" ry="5" fill="#ECFCCB" />
          {/* Red/White straw */}
          <line x1="48" y1="12" x2="56" y2="56" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case "qena_pottery":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
          {/* Qolla clay pitcher */}
          <ellipse cx="50" cy="20" rx="10" ry="3.5" fill="#D97706" />
          <path d="M44 20V32C32 40 30 64 38 74C42 78 58 78 62 74C70 64 68 40 56 32V20H44Z" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
          {/* Cool water droplet */}
          <path d="M50 48C46 54 54 54 50 48Z" fill="#38BDF8" />
        </svg>
      );

    default:
      // Generic elegant Egyptian ornamental crest for remaining expanded symbols
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="#FBF7EE" stroke="#D4AF37" strokeWidth="3" />
          <rect x="28" y="28" width="44" height="44" fill="#0D3B46" rx="6" />
          <polygon points="50,18 78,50 50,82 22,50" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="10" fill="#E6C875" />
          <circle cx="50" cy="50" r="5" fill="#0D3B46" />
        </svg>
      );
  }
};

