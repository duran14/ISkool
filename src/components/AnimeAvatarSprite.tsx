"use client";

import React from 'react';

export interface AnimeAvatarSpriteProps {
  gender?: 'male' | 'female';
  rpgClass?: string; // guerrero, mago, ninja, curador, domador, cazador, reptil
  headType?: string; // standard, elf, cat, horns, mask
  skinTone?: string; // hex color or preset name
  hairColor?: string; // hex color or preset name
  hairStyle?: string; // spiky, long, ponytail, twintails, bob, dreadlocks, bald, short, hat, mohawk
  equippedArtifacts?: string[];
  className?: string;
}

export const AnimeAvatarSprite: React.FC<AnimeAvatarSpriteProps> = ({
  gender = 'female',
  rpgClass = 'mago',
  headType = 'standard',
  skinTone = '#FED7AA', // preset light
  hairColor = '#EC4899', // preset pink
  hairStyle = 'spiky',
  equippedArtifacts = [],
  className = "w-full h-full"
}) => {

  // Normalizar presets de piel
  const resolveSkinColor = (tone: string) => {
    const presets: Record<string, string> = {
      'light': '#FED7AA',
      'medium': '#FDBA74',
      'dark': '#92400E',
      'pale': '#FFF1F2',
      'reptile': '#10B981',
      'dragon': '#0891B2'
    };
    return presets[tone] || tone;
  };

  const skinColor = resolveSkinColor(skinTone);
  const skinShadow = skinColor === '#FED7AA' ? '#FDBA74' : skinColor === '#FDBA74' ? '#F59E0B' : '#78350F';

  // Normalizar presets de cabello
  const resolveHairColor = (color: string) => {
    const presets: Record<string, string> = {
      'pink': '#EC4899',
      'brown': '#78350F',
      'yellow': '#FBBF24',
      'black': '#111827',
      'blue': '#3B82F6',
      'red': '#EF4444',
      'silver': '#D1D5DB',
      'purple': '#8B5CF6',
      'orange': '#F97316',
      'green': '#10B981'
    };
    return presets[color] || color;
  };

  const hColor = resolveHairColor(hairColor);

  return (
    <svg viewBox="0 0 100 100" className={`${className} overflow-visible`} xmlns="http://www.w3.org/2000/svg">
      {/* Base Shadow */}
      <ellipse cx="50" cy="88" rx="28" ry="5.5" fill="#000" opacity="0.35" />

      {/* 1. BACK HAIR / CLOAK / TAILS BACKGROUND */}
      <g id="back-hair-and-accessories">
        {/* Cape for Healer/Mage/Warrior */}
        {rpgClass === 'mago' && (
          <path d="M 30 55 C 20 62, 16 82, 18 87 C 32 87, 34 72, 34 55" fill="#310D4A" />
        )}
        {rpgClass === 'mago' && (
          <path d="M 70 55 C 80 62, 84 82, 82 87 C 68 87, 66 72, 66 55" fill="#310D4A" />
        )}

        {rpgClass === 'curador' && (
          <path d="M 28 55 C 18 64, 16 84, 18 87 C 34 87, 34 72, 34 55 Z" fill="#DC2626" opacity="0.85" />
        )}
        {rpgClass === 'curador' && (
          <path d="M 72 55 C 82 64, 84 84, 82 87 C 66 87, 66 72, 66 55 Z" fill="#DC2626" opacity="0.85" />
        )}

        {/* Dragon Tamer Cape and Tail */}
        {rpgClass === 'domador' && (
          <>
            <path d="M 28 56 C 18 65, 12 85, 12 88 C 30 88, 32 72, 32 56" fill="#EA580C" />
            <path d="M 72 56 C 82 65, 88 85, 88 88 C 70 88, 68 72, 68 56" fill="#EA580C" />
            {/* Dragon Tail */}
            <path d="M 36 82 Q 22 92 18 85 Q 22 78 36 82" fill="#C2410C" />
            <polygon points="18,85 12,88 16,82" fill="#FDE047" />
          </>
        )}

        {/* Reptile Tail */}
        {rpgClass === 'reptil' && (
          <path d="M 36 82 Q 20 95 14 85 Q 22 75 36 82" fill="#047857" stroke="#065F46" strokeWidth="0.8" />
        )}

        {/* Long hair styles back layers */}
        {hairStyle === 'long' && (
          <path d="M 34 35 C 32 45, 20 65, 22 80 C 26 80, 32 60, 35 45 M 66 35 C 68 45, 80 65, 78 80 C 74 80, 68 60, 65 45" fill={hColor} />
        )}
        {hairStyle === 'twintails' && (
          <g>
            <path d="M 28 32 C 18 36, 12 55, 14 68 C 18 68, 22 55, 26 38" fill={hColor} />
            <path d="M 72 32 C 82 36, 88 55, 86 68 C 82 68, 78 55, 74 38" fill={hColor} />
            {/* Hair bands */}
            <circle cx="27" cy="35" r="2" fill="#EF4444" />
            <circle cx="73" cy="35" r="2" fill="#EF4444" />
          </g>
        )}
        {hairStyle === 'ponytail' && (
          <path d="M 50 32 C 55 24, 72 26, 75 48 C 65 52, 58 42, 54 35" fill={hColor} />
        )}
      </g>

      {/* 2. BODY OUTFITS BY CLASS */}
      <g id="class-outfit">
        {rpgClass === 'guerrero' && (
          <g>
            {/* Blue Steel armor */}
            <path d="M 28 85 L 35 52 Q 50 46 65 52 L 72 85 Z" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="1" />
            {gender === 'female' ? (
              <path d="M 38 52 C 42 60, 58 60, 62 52 M 46 52 L 46 76 M 54 52 L 54 76" stroke="#FBBF24" strokeWidth="0.8" fill="none" />
            ) : (
              <path d="M 36 52 L 36 78 M 64 52 L 64 78" stroke="#FBBF24" strokeWidth="0.8" fill="none" />
            )}
            {/* Shoulder armor */}
            <path d="M 25 54 Q 30 46 38 52 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
            <path d="M 75 54 Q 70 46 62 52 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
            {/* Chest plate */}
            <rect x="42" y="55" width="16" height="30" fill="#9CA3AF" stroke="#D1D5DB" strokeWidth="0.8" rx="1" />
            <circle cx="50" cy="65" r="2.5" fill="#EF4444" />
          </g>
        )}

        {rpgClass === 'mago' && (
          <g>
            {/* Elegant Purple Robe */}
            <path d="M 28 85 L 36 52 Q 50 45 64 52 L 72 85 Q 50 90 28 85 Z" fill="#581C87" stroke="#7E22CE" strokeWidth="1" />
            <path d="M 45 50 L 50 87 L 55 50 Z" fill="#FBBF24" />
          </g>
        )}

        {rpgClass === 'ninja' && (
          <g>
            {/* Stealth Dark wrap */}
            <path d="M 28 85 L 35 52 Q 50 46 65 52 L 72 85 Z" fill="#18181B" stroke="#3F3F46" strokeWidth="1" />
            {/* Scarf wrapped around neck */}
            <path d="M 34 52 Q 50 46 66 52 Q 70 56 64 60 Q 50 56 36 60 Q 30 56 34 52 Z" fill="#71717A" stroke="#52525B" strokeWidth="0.5" />
            <path d="M 64 56 Q 74 62 76 74 Q 68 76 60 58" fill="#52525B" />
          </g>
        )}

        {rpgClass === 'curador' && (
          <g>
            {/* White & Red robes */}
            <path d="M 28 85 L 36 52 Q 50 45 64 52 L 72 85 Q 50 90 28 85 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
            <path d="M 32 55 L 42 85 L 34 85 Z" fill="#EF4444" />
            <path d="M 68 55 L 58 85 L 66 85 Z" fill="#EF4444" />
            <rect x="46" y="52" width="8" height="33" fill="#FBBF24" opacity="0.9" />
          </g>
        )}

        {rpgClass === 'domador' && (
          <g>
            {/* Dragon scale orange armor */}
            <path d="M 28 85 L 35 52 Q 50 46 65 52 L 72 85 Z" fill="#EA580C" stroke="#F97316" strokeWidth="1" />
            <path d="M 34 56 L 40 85 L 44 85 L 36 56 Z" fill="#FDE047" />
            <path d="M 66 56 L 60 85 L 56 85 L 64 56 Z" fill="#FDE047" />
            {/* Dragon emblem */}
            <circle cx="50" cy="65" r="4" fill="#C2410C" />
            <polygon points="50,62 48,66 52,66" fill="#FDE047" />
          </g>
        )}

        {rpgClass === 'cazador' && (
          <g>
            {/* Forest Ranger green/brown */}
            <path d="M 28 85 L 35 52 Q 50 46 65 52 L 72 85 Z" fill="#064E3B" stroke="#059669" strokeWidth="1" />
            <line x1="37" y1="52" x2="63" y2="85" stroke="#78350F" strokeWidth="2" />
            <line x1="63" y1="52" x2="37" y2="85" stroke="#78350F" strokeWidth="2" />
          </g>
        )}

        {rpgClass === 'reptil' && (
          <g>
            {/* Dark green scaly tunic */}
            <path d="M 28 85 L 35 52 Q 50 46 65 52 L 72 85 Z" fill="#065F46" stroke="#047857" strokeWidth="1" />
            {/* Reptil segmented yellow chest */}
            <path d="M 42 54 C 42 54, 50 62, 58 54 C 58 54, 50 78, 42 78" fill="#FDE047" opacity="0.85" />
            <path d="M 40 76 C 40 76, 50 84, 60 76 C 60 76, 50 88, 40 88" fill="#FDE047" opacity="0.85" />
          </g>
        )}
      </g>

      {/* 3. HEAD & SKIN AND FACE */}
      <g id="head-and-face">
        {/* Neck */}
        <rect x="46" y="49" width="8" height="6" fill={skinColor} />
        {/* Head Shape */}
        <path d="M 35 34 C 35 34, 34 46, 50 53 C 66 46, 64 34, 64 34 Z" fill={skinColor} stroke={skinShadow} strokeWidth="0.5" />
        
        {/* Cute Blush */}
        {gender === 'female' && (
          <>
            <ellipse cx="40" cy="45" rx="2.5" ry="1.2" fill="#F43F5E" opacity="0.45" />
            <ellipse cx="60" cy="45" rx="2.5" ry="1.2" fill="#F43F5E" opacity="0.45" />
          </>
        )}

        {/* Eyes (Female vs Male) */}
        {gender === 'female' ? (
          <g id="female-eyes">
            <ellipse cx="42" cy="41" rx="3.5" ry="5.5" fill="#BE185D" />
            <ellipse cx="42" cy="40" rx="2" ry="3.5" fill="#DB2777" />
            <circle cx="41" cy="38" r="1.2" fill="#FFF" />
            <circle cx="43.5" cy="42" r="0.6" fill="#FFF" />
            
            <ellipse cx="58" cy="41" rx="3.5" ry="5.5" fill="#BE185D" />
            <ellipse cx="58" cy="40" rx="2" ry="3.5" fill="#DB2777" />
            <circle cx="57" cy="38" r="1.2" fill="#FFF" />
            <circle cx="59.5" cy="42" r="0.6" fill="#FFF" />
            
            {/* Eyelashes */}
            <path d="M 37 38 Q 42 37 46 40" stroke="#000" strokeWidth="1.5" fill="none" />
            <path d="M 63 38 Q 58 37 54 40" stroke="#000" strokeWidth="1.5" fill="none" />
            <path d="M 37 35 Q 42 33 46 36" stroke="#4A044E" strokeWidth="1.5" fill="none" />
            <path d="M 63 35 Q 58 33 54 36" stroke="#4A044E" strokeWidth="1.5" fill="none" />
          </g>
        ) : (
          <g id="male-eyes">
            {/* Sharper JRPG anime eyes */}
            <ellipse cx="43" cy="41" rx="2.8" ry="4" fill="#1D4ED8" />
            <circle cx="42.2" cy="39.2" r="0.8" fill="#FFF" />
            
            <ellipse cx="57" cy="41" rx="2.8" ry="4" fill="#1D4ED8" />
            <circle cx="56.2" cy="39.2" r="0.8" fill="#FFF" />

            {/* Sharp eyebrows */}
            <path d="M 38 34 L 46 36" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 62 34 L 54 36" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )}

        {/* Nose & Smile */}
        <line x1="50" y1="44" x2="50" y2="46" stroke="#78350F" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M 48 48 Q 50 50.5 52 48" stroke="#991B1B" strokeWidth="1" fill="none" strokeLinecap="round" />

        {/* 5 Head Options */}
        {headType === 'elf' && (
          <g id="head-option-elf">
            {/* Pointy Elf Ears */}
            <polygon points="36,36 26,30 34,40" fill={skinColor} stroke={skinShadow} strokeWidth="0.5" />
            <polygon points="64,36 74,30 66,40" fill={skinColor} stroke={skinShadow} strokeWidth="0.5" />
          </g>
        )}

        {headType === 'cat' && (
          <g id="head-option-cat">
            {/* Cat Ears on top of head */}
            <polygon points="34,22 28,10 40,16" fill="#F472B6" stroke="#EC4899" strokeWidth="0.8" />
            <polygon points="35,20 31,12 38,16" fill="#FDA4AF" />
            <polygon points="66,22 72,10 60,16" fill="#F472B6" stroke="#EC4899" strokeWidth="0.8" />
            <polygon points="65,20 69,12 62,16" fill="#FDA4AF" />
          </g>
        )}

        {headType === 'horns' && (
          <g id="head-option-horns">
            {/* Dragon horns */}
            <path d="M 34,22 C 30,10, 20,8, 18,12 C 22,16, 30,22, 34,22 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.8" />
            <path d="M 66,22 C 70,10, 80,8, 82,12 C 78,16, 70,22, 66,22 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.8" />
          </g>
        )}

        {headType === 'mask' && (
          <g id="head-option-mask">
            {/* Ninja mask covering lower face */}
            <path d="M 34 43 Q 50 40 66 43 Q 66 52 50 54 Q 34 52 34 43 Z" fill="#18181B" stroke="#27272A" strokeWidth="0.5" />
          </g>
        )}
      </g>

      {/* 4. HAIR STYLES FRONT LAYERS */}
      <g id="front-hair">
        {hairStyle !== 'bald' && (
          <g fill={hColor} stroke={skinShadow} strokeWidth="0.3">
            {/* 1. Spiky JRPG */}
            {hairStyle === 'spiky' && (
              <>
                <path d="M 33 34 C 31 22, 22 30, 20 18 C 26 23, 28 14, 36 24 C 38 12, 44 20, 50 8 C 56 20, 62 12, 64 24 C 72 14, 74 23, 80 18 C 78 30, 69 22, 67 34 Z" />
                <path d="M 38 34 Q 42 41 43 41 Q 44 32 45 28 Z" fill={hColor} opacity="0.9" />
                <path d="M 62 34 Q 58 41 57 41 Q 56 32 55 28 Z" fill={hColor} opacity="0.9" />
              </>
            )}

            {/* 2. Long Flowing (Front layers) */}
            {hairStyle === 'long' && (
              <>
                <path d="M 34 35 C 34 22, 40 16, 50 16 C 60 16, 66 22, 66 35 C 66 35, 68 45, 63 45 C 57 45, 54 28, 50 28 C 46 28, 43 45, 37 45 C 32 45, 34 35, 34 35" />
                <path d="M 34 35 C 30 40, 28 55, 30 65 C 32 65, 34 50, 35 40 Z" />
                <path d="M 66 35 C 70 40, 72 55, 70 65 C 68 65, 66 50, 65 40 Z" />
              </>
            )}

            {/* 3. Ponytail (Front layers) */}
            {hairStyle === 'ponytail' && (
              <path d="M 34 35 C 34 22, 40 16, 50 16 C 60 16, 66 22, 66 35 C 66 35, 68 45, 63 45 C 57 45, 54 28, 50 28 C 46 28, 43 45, 37 45 C 32 45, 34 35, 34 35" />
            )}

            {/* 4. Twin Tails (Front layers) */}
            {hairStyle === 'twintails' && (
              <path d="M 34 35 C 34 22, 40 16, 50 16 C 60 16, 66 22, 66 35 C 66 35, 68 45, 63 45 C 57 45, 54 28, 50 28 C 46 28, 43 45, 37 45 C 32 45, 34 35, 34 35" />
            )}

            {/* 5. Bob Cut */}
            {hairStyle === 'bob' && (
              <path d="M 33 34 C 33 22, 40 15, 50 15 C 60 15, 67 22, 67 34 C 67 44, 69 52, 67 52 C 60 52, 62 35, 50 35 C 38 35, 40 52, 33 52 C 31 52, 33 44, 33 34 Z" />
            )}

            {/* 6. Dreadlocks */}
            {hairStyle === 'dreadlocks' && (
              <g>
                <rect x="33" y="16" width="34" height="6" rx="2" />
                {/* Individual locs hanging */}
                <path d="M 32 20 Q 22 35 24 55 Q 26 55 28 35" />
                <path d="M 68 20 Q 78 35 76 55 Q 74 55 72 35" />
                <path d="M 36 20 Q 30 40 32 60 Q 34 60 36 40" />
                <path d="M 64 20 Q 70 40 68 60 Q 66 60 64 40" />
                <path d="M 46 20 Q 44 35 42 50 Z" />
                <path d="M 54 20 Q 56 35 58 50 Z" />
              </g>
            )}

            {/* 8. Short Crop */}
            {hairStyle === 'short' && (
              <path d="M 33 34 C 33 22, 40 16, 50 16 C 60 16, 67 22, 67 34 C 67 34, 62 26, 50 28 C 38 26, 33 34, 33 34" />
            )}

            {/* 9. Mage Hat Hair */}
            {hairStyle === 'hat' && (
              <g>
                {/* Hair peaking below hat */}
                <path d="M 34 32 C 30 40, 24 55, 23 68 C 28 68, 30 55, 33 42" />
                <path d="M 66 32 C 70 40, 76 55, 77 68 C 72 68, 70 55, 67 42" />
                <path d="M 46 30 Q 50 43 51 43 Q 52 43 54 30 Z" />
                <path d="M 37 32 Q 44 41 45 41 Q 45 32 46 30 Z" />
                <path d="M 63 32 Q 56 41 55 41 Q 55 32 54 30 Z" />
                {/* Witch Hat */}
                <path d="M 20 28 C 20 28, 50 18, 80 28 C 80 28, 70 8, 50 0 L 20 28 Z" fill="#6B21A8" stroke="#A855F7" strokeWidth="0.8" />
                <ellipse cx="50" cy="28" rx="33" ry="4.5" fill="#581C87" stroke="#A855F7" strokeWidth="0.8" />
                <path d="M 33 26 C 42 24, 58 24, 67 26 L 68 28 C 59 26, 41 26, 32 28 Z" fill="#FDE047" />
                <rect x="47" y="23" width="6" height="5" fill="#D97706" rx="1" />
              </g>
            )}

            {/* 10. Mohawk */}
            {hairStyle === 'mohawk' && (
              <path d="M 48 34 C 48 20, 44 14, 46 4 C 54 4, 52 20, 52 34 Z M 48 20 Q 50 6 52 6" fill={hColor} />
            )}
          </g>
        )}
      </g>

      {/* 5. WEAPONS AND PETS ROW */}
      <g id="weapons-and-companions">
        {/* Warrior Sword on back if not in combat */}
        {rpgClass === 'guerrero' && !equippedArtifacts.includes('art-book') && (
          <g id="class-sword" transform="translate(10, 5) rotate(10)">
            <line x1="62" y1="80" x2="76" y2="40" stroke="#B5B5B5" strokeWidth="3" strokeLinecap="round" />
            <line x1="62" y1="80" x2="76" y2="40" stroke="#FFF" strokeWidth="1" strokeLinecap="round" />
            <polygon points="74,42 78,35 79,41" fill="#FFF" />
            <rect x="58" y="77" width="8" height="3" fill="#D97706" transform="rotate(22 58 77)" />
            <line x1="59" y1="79" x2="56" y2="85" stroke="#78350F" strokeWidth="2.5" />
          </g>
        )}

        {/* Mage Staff */}
        {rpgClass === 'mago' && (
          <g id="class-staff">
            <line x1="69" y1="85" x2="69" y2="35" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="69" cy="30" r="5" fill="#22D3EE" stroke="#E0F7FA" strokeWidth="0.8" className="animate-pulse" />
            <ellipse cx="69" cy="30" rx="9" ry="2" fill="none" stroke="#22D3EE" strokeWidth="0.8" transform="rotate(-20 69 30)" opacity="0.7" className="animate-spin" />
          </g>
        )}

        {/* Healer Holy Staff */}
        {rpgClass === 'curador' && (
          <g id="class-holy-staff">
            <line x1="69" y1="85" x2="69" y2="35" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
            <circle cx="69" cy="32" r="4" fill="#FBBF24" stroke="#FFF" strokeWidth="0.8" />
            {/* Cross on top */}
            <rect x="68" y="24" width="2" height="7" fill="#FBBF24" />
            <rect x="66" y="26" width="6" height="2" fill="#FBBF24" />
          </g>
        )}

        {/* Dragon Tamer Baby Dragon companion */}
        {rpgClass === 'domador' && (
          <g id="baby-dragon" transform="translate(72, 38) scale(0.35)" className="animate-bounce">
            <circle cx="50" cy="55" r="20" fill="#34D399" />
            <circle cx="50" cy="35" r="13" fill="#6EE7B7" />
            <circle cx="45" cy="32" r="1.5" fill="#065F46" />
            <circle cx="55" cy="32" r="1.5" fill="#065F46" />
            <path d="M46 41 Q 50 44 54 41" stroke="#065F46" strokeWidth="1.5" fill="none" />
            <polygon points="40,22 44,14 47,22" fill="#FBBF24" />
            <polygon points="60,22 56,14 53,22" fill="#FBBF24" />
          </g>
        )}

        {/* Hunter Bow */}
        {rpgClass === 'cazador' && (
          <g id="class-bow" transform="translate(10, 5)">
            <path d="M 64 78 Q 78 57 64 36" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 64 78 Q 74 57 64 36" stroke="#D97706" strokeWidth="0.8" fill="none" />
            <line x1="64" y1="78" x2="64" y2="36" stroke="#E2E8F0" strokeWidth="0.6" opacity="0.8" />
          </g>
        )}

        {/* Reptile Glowing Claws */}
        {rpgClass === 'reptil' && (
          <g id="class-claws" fill="#FBBF24" opacity="0.9">
            <polygon points="26,78 22,81 27,83" />
            <polygon points="74,78 78,81 73,83" />
          </g>
        )}
      </g>

      {/* 6. EQUIPPED ARTIFACT OVERLAYS (ONLY FOR SECONDARY COMBAT STAGE) */}
      <g id="equipped-artifacts-overlays">
        {equippedArtifacts.includes('art-boots') && (
          <g id="equipped-boots">
            <path d="M 23 80 L 29 80 L 29 86 L 21 86 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
            <path d="M 17 78 Q 23 80 20 84 Q 16 82 17 78 Z" fill="#FFFFFF" opacity="0.95" stroke="#E2E8F0" strokeWidth="0.5" />
            <path d="M 69 80 L 75 80 L 73 86 L 67 86 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
            <path d="M 77 78 Q 71 80 74 84 Q 78 82 77 78 Z" fill="#FFFFFF" opacity="0.95" stroke="#E2E8F0" strokeWidth="0.5" />
          </g>
        )}

        {equippedArtifacts.includes('art-shield') && (
          <g id="equipped-shield" className="animate-pulse">
            <polygon points="12,56 22,52 24,66 18,74 12,66" fill="#3B82F6" stroke="#93C5FD" strokeWidth="1" opacity="0.85" />
            <polygon points="14,58 20,55 22,64 17,70 14,64" fill="#60A5FA" opacity="0.9" />
            <path d="M 15 62 L 20 62" stroke="#FFFFFF" strokeWidth="0.8" />
            <path d="M 17 60 L 17 65" stroke="#FFFFFF" strokeWidth="0.8" />
          </g>
        )}

        {equippedArtifacts.includes('art-pen') && (
          <g id="equipped-feather">
            <path d="M 40 24 Q 32 12 30 6 Q 36 10 40 18 Z" fill="#EF4444" stroke="#F59E0B" strokeWidth="0.5" />
            <path d="M 39 24 Q 33 14 32 8" stroke="#FFF" strokeWidth="0.5" fill="none" />
          </g>
        )}

        {equippedArtifacts.includes('art-potion') && (
          <g id="equipped-potion">
            <rect x="33" y="58" width="4" height="6" rx="1" fill="#10B981" stroke="#047857" strokeWidth="0.5" />
            <rect x="34" y="56" width="2" height="2" fill="#78350F" />
            <circle cx="35" cy="60" r="0.8" fill="#FFF" opacity="0.8" />
          </g>
        )}

        {equippedArtifacts.includes('art-crown') && (
          <g id="equipped-crown" transform="translate(36, -8) scale(0.28)" className="animate-bounce">
            <polygon points="10,25 25,5 40,25 32,32 18,32" fill="#FDE047" stroke="#D97706" strokeWidth="1.5" />
            <circle cx="25" cy="5" r="2.5" fill="#EF4444" />
            <circle cx="10" cy="25" r="2" fill="#3B82F6" />
            <circle cx="40" cy="25" r="2" fill="#3B82F6" />
          </g>
        )}

        {equippedArtifacts.includes('art-book') && (
          <g id="equipped-book" transform="translate(9, 36) scale(0.35)" className="animate-pulse">
            <path d="M 5 5 L 20 2 L 35 5 L 35 25 L 20 22 L 5 25 Z" fill="#78350F" stroke="#FBBF24" strokeWidth="1" />
            <path d="M 8 7 L 20 4 L 32 7 L 32 23 L 20 20 L 8 23 Z" fill="#FEF3C7" />
            <line x1="12" y1="10" x2="18" y2="8" stroke="#000" strokeWidth="0.8" />
            <line x1="12" y1="14" x2="18" y2="12" stroke="#000" strokeWidth="0.8" />
            <line x1="22" y1="8" x2="28" y2="10" stroke="#000" strokeWidth="0.8" />
            <line x1="22" y1="12" x2="28" y2="14" stroke="#000" strokeWidth="0.8" />
          </g>
        )}
      </g>
    </svg>
  );
};
