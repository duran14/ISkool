"use client";

import React, { useState } from 'react';
import { useGamification } from '../context/gamification-context';
import { Sparkles, Palette, Check, Lock, Smile, Shirt, Image as ImageIcon } from 'lucide-react';

interface AvatarCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ isOpen, onClose }) => {
  const { avatar, stats, changeAvatar } = useGamification();
  const [activeTab, setActiveTab] = useState<'hair' | 'eyes' | 'outfit' | 'background'>('hair');

  if (!isOpen) return null;

  const hairOptions = [
    { id: 'classic', name: 'Clásico', price: 0 },
    { id: 'spiky', name: 'Alocado', price: 0 },
    { id: 'wizard_hat', name: 'Sombrero Mago', price: 0 }
  ];

  const eyeOptions = [
    { id: 'happy', name: 'Felices', price: 0 },
    { id: 'sparkle', name: 'Brillantes', price: 0 }
  ];

  const outfitOptions = [
    { id: 'space_suit', name: 'Traje Espacial', price: 0 },
    { id: 'explorer', name: 'Explorador', price: 0 },
    { id: 'purple', name: 'Túnica Púrpura', price: 0 }
  ];

  const backgroundOptions = [
    { id: 'nebula', name: 'Nébula', price: 0 },
    { id: 'forest', name: 'Bosque', price: 0 }
  ];

  const colors = [
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Esmeralda', value: '#10B981' },
    { name: 'Amarillo', value: '#FBBF24' },
    { name: 'Rojo', value: '#EF4444' },
    { name: 'Morado', value: '#8B5CF6' },
    { name: 'Rosa', value: '#EC4899' }
  ];

  const handleSelect = (category: string, value: string) => {
    if (category === 'hair') changeAvatar({ hair_style: value });
    if (category === 'eyes') changeAvatar({ eyes_style: value });
    if (category === 'outfit') changeAvatar({ outfit_style: value });
    if (category === 'background') changeAvatar({ background_style: value });
  };

  const handleColorSelect = (category: string, value: string) => {
    if (category === 'hair') changeAvatar({ hair_color: value });
    if (category === 'outfit') changeAvatar({ outfit_color: value });
  };

  // Renderizador estático del Avatar en SVG
  const renderAvatarPreview = (width = 160, height = 160) => {
    const bgGradient = avatar.background_style === 'nebula' 
      ? 'from-indigo-950 via-slate-900 to-purple-950'
      : 'from-emerald-950 via-teal-900 to-cyan-950';

    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br ${bgGradient} overflow-hidden shadow-inner`} style={{ width, height }}>
        {/* Estrellas o partículas del fondo */}
        {avatar.background_style === 'nebula' ? (
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-4 left-6 h-1 w-1 rounded-full bg-white animate-ping" />
            <div className="absolute top-12 right-10 h-1.5 w-1.5 rounded-full bg-indigo-300 animate-pulse" />
            <div className="absolute bottom-6 left-12 h-1 w-1 rounded-full bg-purple-300 animate-pulse" />
            <div className="absolute bottom-12 right-6 h-0.5 w-0.5 rounded-full bg-white" />
          </div>
        ) : (
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-8 left-10 h-2 w-2 rounded-full bg-emerald-400 opacity-20" />
            <div className="absolute bottom-8 right-12 h-3 w-3 rounded-full bg-teal-400 opacity-10" />
          </div>
        )}

        {/* El Avatar SVG */}
        <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 z-10 filter drop-shadow-lg">
          {/* Cuerpo / Traje */}
          {avatar.outfit_style === 'space_suit' && (
            <path d="M25 80 C 25 55, 75 55, 75 80 Z" fill={avatar.outfit_color} />
          )}
          {avatar.outfit_style === 'explorer' && (
            <>
              <path d="M25 80 C 25 55, 75 55, 75 80 Z" fill={avatar.outfit_color} />
              {/* Cuello de camisa */}
              <polygon points="40,58 50,66 60,58" fill="#F3F4F6" />
              {/* Bolsillo */}
              <rect x="58" y="66" width="10" height="10" rx="1" fill="#047857" opacity="0.3" />
            </>
          )}
          {avatar.outfit_style === 'purple' && (
            <path d="M22 80 C 22 50, 78 50, 78 80 Z" fill="#6D28D9" />
          )}

          {/* Cabeza (Piel) */}
          <circle cx="50" cy="45" r="18" fill="#FDBA74" />

          {/* Ojos */}
          {avatar.eyes_style === 'happy' && (
            <>
              <path d="M41 43 Q 44 39 47 43" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M53 43 Q 56 39 59 43" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          )}
          {avatar.eyes_style === 'sparkle' && (
            <>
              <path d="M42 41 L 46 45 M 46 41 L 42 45" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M54 41 L 58 45 M 58 41 L 54 45" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}

          {/* Boca sonriente */}
          <path d="M44 51 Q 50 56 56 51" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Cabello */}
          {avatar.hair_style === 'classic' && (
            <path d="M30 38 C 30 20, 70 20, 70 38 C 65 34, 35 34, 30 38" fill={avatar.hair_color} />
          )}
          {avatar.hair_style === 'spiky' && (
            <path d="M30 38 L 35 25 L 43 32 L 50 20 L 57 32 L 65 25 L 70 38 Z" fill={avatar.hair_color} />
          )}
          {avatar.hair_style === 'wizard_hat' && (
            <>
              {/* Ala del sombrero */}
              <ellipse cx="50" cy="30" rx="25" ry="4" fill="#312E81" />
              {/* Pico del sombrero */}
              <polygon points="30,29 50,5 70,29" fill="#1E1B4B" />
              {/* Hebilla */}
              <rect x="46" y="24" width="8" height="5" fill="#F59E0B" />
            </>
          )}
        </svg>

        {/* Nivel en esquina inferior derecha */}
        <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
          NIVEL {stats.level}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Personalizar tu Avatar
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Modifica el aspecto del explorador de tu perfil</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6">
          {/* Preview Panel */}
          <div className="md:col-span-2 flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
            {renderAvatarPreview(180, 180)}
            <div className="w-full text-center">
              <input
                type="text"
                value={avatar.avatar_name}
                onChange={(e) => changeAvatar({ avatar_name: e.target.value })}
                className="w-full text-center font-bold text-lg bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-blue-500 focus:outline-none text-zinc-900 dark:text-white"
                placeholder="Nombre del Avatar"
              />
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">Haz clic para cambiar el nombre</p>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="md:col-span-3 flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setActiveTab('hair')}
                className={`flex-1 pb-2 text-xs font-semibold text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'hair'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
                }`}
              >
                <Palette className="h-4.5 w-4.5" />
                Cabello
              </button>
              <button
                onClick={() => setActiveTab('eyes')}
                className={`flex-1 pb-2 text-xs font-semibold text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'eyes'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
                }`}
              >
                <Smile className="h-4.5 w-4.5" />
                Ojos
              </button>
              <button
                onClick={() => setActiveTab('outfit')}
                className={`flex-1 pb-2 text-xs font-semibold text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'outfit'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
                }`}
              >
                <Shirt className="h-4.5 w-4.5" />
                Traje
              </button>
              <button
                onClick={() => setActiveTab('background')}
                className={`flex-1 pb-2 text-xs font-semibold text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'background'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
                }`}
              >
                <ImageIcon className="h-4.5 w-4.5" />
                Fondo
              </button>
            </div>

            {/* Tab Options */}
            <div className="flex-1 overflow-y-auto max-h-[200px] pr-2 flex flex-col gap-4">
              {activeTab === 'hair' && (
                <div className="flex flex-col gap-4">
                  {/* Estilo de Cabello */}
                  <div className="grid grid-cols-3 gap-2">
                    {hairOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelect('hair', opt.id)}
                        className={`p-2 rounded-xl border text-xs font-medium text-center transition-all ${
                          avatar.hair_style === opt.id
                            ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                        }`}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                  {/* Color de Cabello */}
                  {avatar.hair_style !== 'wizard_hat' && (
                    <div>
                      <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mb-2">Color del Cabello</p>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => handleColorSelect('hair', color.value)}
                            className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-transform hover:scale-105"
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          >
                            {avatar.hair_color === color.value && (
                              <Check className="h-4 w-4 text-white drop-shadow-sm" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'eyes' && (
                <div className="grid grid-cols-2 gap-2">
                  {eyeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect('eyes', opt.id)}
                      className={`p-3 rounded-xl border text-xs font-medium text-center transition-all ${
                        avatar.eyes_style === opt.id
                          ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                          : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'outfit' && (
                <div className="flex flex-col gap-4">
                  {/* Estilo de Traje */}
                  <div className="grid grid-cols-3 gap-2">
                    {outfitOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelect('outfit', opt.id)}
                        className={`p-2 rounded-xl border text-xs font-medium text-center transition-all ${
                          avatar.outfit_style === opt.id
                            ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                        }`}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                  {/* Color de Traje */}
                  {avatar.outfit_style !== 'purple' && (
                    <div>
                      <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mb-2">Color del Traje</p>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => handleColorSelect('outfit', color.value)}
                            className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-transform hover:scale-105"
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          >
                            {avatar.outfit_color === color.value && (
                              <Check className="h-4 w-4 text-white drop-shadow-sm" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'background' && (
                <div className="grid grid-cols-2 gap-2">
                  {backgroundOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect('background', opt.id)}
                      className={`p-3 rounded-xl border text-xs font-medium text-center transition-all ${
                        avatar.background_style === opt.id
                          ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                          : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <Lock className="h-3.5 w-3.5" />
            <span>Desbloquearás más accesorios al subir de nivel.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold bg-zinc-950 hover:bg-zinc-800 text-white rounded-full transition-all dark:bg-white dark:hover:bg-zinc-200 dark:text-black shadow-md"
          >
            Guardar Cambios
          </button>
        </div>

      </div>
    </div>
  );
};
