import { FormEvent, useState } from 'react';
import { Eye, EyeOff, Lock, Trash2, X } from 'lucide-react';
import { verifierMotDePasseSuperAdmin } from '../services/auth';
import { RoleUtilisateur } from '../types';

interface ModalSuppressionCAProps {
  ouvert: boolean;
  role: RoleUtilisateur;
  titre: string;
  description: string;
  onFermer: () => void;
  onConfirmer: () => void;
}

export default function ModalSuppressionCA({
  ouvert,
  role,
  titre,
  description,
  onFermer,
  onConfirmer,
}: ModalSuppressionCAProps) {
  const [motDePasse, setMotDePasse] = useState('');
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [erreur, setErreur] = useState('');

  if (!ouvert) return null;

  const estSuperAdmin = role === 'super_admin';

  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    if (!estSuperAdmin && !verifierMotDePasseSuperAdmin(motDePasse)) {
      setErreur('Mot de passe Super Admin incorrect.');
      return;
    }
    setMotDePasse('');
    setErreur('');
    onConfirmer();
    onFermer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">{titre}</h3>
          <button
            type="button"
            onClick={() => {
              setMotDePasse('');
              setErreur('');
              onFermer();
            }}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs leading-relaxed text-slate-600">{description}</p>

        <form onSubmit={soumettre} className="mt-4 space-y-3">
          {erreur && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {erreur}
            </div>
          )}

          {!estSuperAdmin && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Mot de passe Super Admin requis
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={afficherMotDePasse ? 'text' : 'password'}
                  required
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="Saisir le mot de passe"
                  className="min-h-[44px] w-full rounded-lg border border-slate-200 py-2 pl-9 pr-11 text-sm focus:border-red-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setAfficherMotDePasse((v) => !v)}
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={
                    afficherMotDePasse ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                  }
                >
                  {afficherMotDePasse ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setMotDePasse('');
                setErreur('');
                onFermer();
              }}
              className="min-h-[44px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
