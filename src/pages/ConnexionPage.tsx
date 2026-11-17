import { FormEvent, useState } from 'react';
import { Eye, EyeOff, Lock, LogIn } from 'lucide-react';
import { ParametresBoutique } from '../types';

interface ConnexionPageProps {
  parametres: ParametresBoutique;
  onConnexion: (motDePasse: string) => boolean;
}

export default function ConnexionPage({ parametres, onConnexion }: ConnexionPageProps) {
  const [motDePasse, setMotDePasse] = useState('');
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [erreur, setErreur] = useState('');

  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    const ok = onConnexion(motDePasse);
    if (!ok) {
      setErreur('Mot de passe incorrect.');
    } else {
      setErreur('');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#041538] p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden p-2 sm:p-6"
      >
        <img
          src="/pwa-512x512.png"
          alt=""
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain opacity-90 blur-[3px]"
        />
        <div className="absolute inset-0 bg-[#041538]/25" />
      </div>

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/25 bg-[#041538]/55 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/pwa-192x192.png"
            alt="Icône FLASH-SHOP"
            referrerPolicy="no-referrer"
            className="mb-3 h-16 w-16 rounded-2xl object-contain shadow-lg"
          />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {parametres.nomBoutique}
          </h1>
          <p className="mt-1 text-xs text-blue-100/90">{parametres.sousTitre}</p>
        </div>

        <form onSubmit={soumettre} className="space-y-4">
          {erreur && (
            <div className="rounded-xl border border-red-300/40 bg-red-500/90 px-3.5 py-2.5 text-xs font-semibold text-white">
              {erreur}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-blue-50">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type={afficherMotDePasse ? 'text' : 'password'}
                required
                autoFocus
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="Saisissez votre mot de passe"
                className="min-h-[46px] w-full rounded-xl border border-white/30 bg-white/95 py-2.5 pl-9 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setAfficherMotDePasse((v) => !v)}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-800"
                aria-label={
                  afficherMotDePasse ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                }
                title={afficherMotDePasse ? 'Masquer' : 'Afficher'}
              >
                {afficherMotDePasse ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-orange-600"
          >
            <LogIn className="h-4 w-4" />
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
