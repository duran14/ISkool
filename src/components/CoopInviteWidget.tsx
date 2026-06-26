"use client";

import React, { useState } from 'react';
import { useCoopStore } from '@/store/useCoopStore';
import { Share2, Check, Copy, Users, Sparkles } from 'lucide-react';

interface CoopInviteWidgetProps {
  missionId: string;
}

export default function CoopInviteWidget({ missionId }: CoopInviteWidgetProps) {
  const { partyId, createParty } = useCoopStore();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreateParty = async () => {
    setLoading(true);
    try {
      await createParty(missionId);
    } catch (err) {
      console.error('Error creating party:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!partyId) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?party_id=${partyId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-3xl border border-indigo-200/80 bg-white dark:border-indigo-900/50 dark:bg-zinc-900/90 p-5 shadow-lg shadow-indigo-500/5 transition-all">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-indigo-150 text-indigo-650 dark:bg-indigo-950/60 dark:text-indigo-400">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Modo Cooperativo</h3>
          <h2 className="text-md font-extrabold text-zinc-900 dark:text-white mt-0.5">Combate Multijugador</h2>
        </div>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-normal font-semibold">
        ¡Une fuerzas con tus compañeros de clase para derrotar al jefe de esta misión el doble de rápido!
      </p>

      {!partyId ? (
        <button
          onClick={handleCreateParty}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-indigo-500/10 disabled:opacity-50 select-none cursor-pointer"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
          ) : (
            <>
              <Sparkles className="h-4 w-4 animate-pulse text-yellow-350" />
              <span>¡Invitar Aliados!</span>
            </>
          )}
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/60">
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate flex-1 select-all">
              {`${window.location.origin}${window.location.pathname}?party_id=${partyId}`}
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer select-none ${
              copied 
                ? 'bg-emerald-600 text-white' 
                : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-black'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>¡Liga Copiada! ⚔️</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copiar Liga de Invitación</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
