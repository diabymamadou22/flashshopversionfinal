import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  UserPlus,
  X,
} from 'lucide-react';
import { LIBELLES_ROLE, verifierMotDePasseSuperAdmin } from '../services/auth';
import {
  BaseDonnees,
  ParametresBoutique,
  RoleAssignable,
  Utilisateur,
} from '../types';
import { genererId } from '../utils/format';

interface ParametresPageProps {
  donnees: BaseDonnees;
  utilisateurConnecteId: string;
  onSauvegarderParametres: (parametres: ParametresBoutique) => void;
  onAjouterUtilisateur: (utilisateur: Utilisateur) => void;
  onModifierUtilisateur: (utilisateur: Utilisateur) => void;
  onSupprimerUtilisateur: (id: string) => void;
  onImporterBase: (contenuJson: string) => void;
  onReinitialiserBase: () => void;
}

export default function ParametresPage({
  donnees,
  utilisateurConnecteId,
  onSauvegarderParametres,
  onAjouterUtilisateur,
  onModifierUtilisateur,
  onSupprimerUtilisateur,
  onImporterBase,
  onReinitialiserBase,
}: ParametresPageProps) {
  const [form, setForm] = useState<ParametresBoutique>(donnees.parametres);
  const [messageSucces, setMessageSucces] = useState('');
  const [messageErreur, setMessageErreur] = useState('');
  const [confirmationReset, setConfirmationReset] = useState(false);
  const inputImportRef = useRef<HTMLInputElement>(null);

  // États pour la gestion des utilisateurs et rôles
  const [nomUser, setNomUser] = useState('');
  const [motDePasseUser, setMotDePasseUser] = useState('');
  const [afficherMdpForm, setAfficherMdpForm] = useState(false);
  const [mdpVisibles, setMdpVisibles] = useState<Record<string, boolean>>({});
  const [roleUser, setRoleUser] = useState<RoleAssignable>('comptable');
  const [userEnEdition, setUserEnEdition] = useState<Utilisateur | null>(null);
  const [erreurUser, setErreurUser] = useState('');

  const afficherSucces = (msg: string) => {
    setMessageErreur('');
    setMessageSucces(msg);
    setTimeout(() => setMessageSucces(''), 3500);
  };

  const soumettreBoutique = (e: FormEvent) => {
    e.preventDefault();
    onSauvegarderParametres(form);
    afficherSucces('Paramètres de la boutique enregistrés.');
  };

  const reinitialiserFormUser = () => {
    setUserEnEdition(null);
    setNomUser('');
    setMotDePasseUser('');
    setAfficherMdpForm(false);
    setRoleUser('comptable');
    setErreurUser('');
  };

  const toggleMdpVisible = (id: string) => {
    setMdpVisibles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const chargerEditionUser = (u: Utilisateur) => {
    setUserEnEdition(u);
    setNomUser(u.nom);
    setMotDePasseUser(u.motDePasse);
    setRoleUser(u.role);
    setErreurUser('');
  };

  const soumettreUtilisateur = (e: FormEvent) => {
    e.preventDefault();
    const mdpPropre = motDePasseUser.trim();

    if (!nomUser.trim() || !mdpPropre) {
      setErreurUser('Le nom et le mot de passe sont obligatoires.');
      return;
    }

    if (verifierMotDePasseSuperAdmin(mdpPropre)) {
      setErreurUser("Ce mot de passe n'est pas disponible.");
      return;
    }

    const doublon = donnees.utilisateurs.some(
      (u) => u.motDePasse === mdpPropre && u.id !== userEnEdition?.id
    );
    if (doublon) {
      setErreurUser('Ce mot de passe est déjà utilisé par un autre utilisateur.');
      return;
    }

    if (userEnEdition) {
      onModifierUtilisateur({
        ...userEnEdition,
        nom: nomUser.trim(),
        motDePasse: mdpPropre,
        role: roleUser,
      });
      afficherSucces(`Compte "${nomUser.trim()}" mis à jour.`);
    } else {
      onAjouterUtilisateur({
        id: genererId('usr'),
        nom: nomUser.trim(),
        motDePasse: mdpPropre,
        role: roleUser,
        dateCreation: new Date().toISOString(),
      });
      afficherSucces(
        `Utilisateur "${nomUser.trim()}" créé avec le rôle ${LIBELLES_ROLE[roleUser]}.`
      );
    }

    reinitialiserFormUser();
  };

  const tenterSuppressionUser = (u: Utilisateur) => {
    if (u.id === utilisateurConnecteId) {
      setErreurUser('Vous ne pouvez pas supprimer votre propre compte actif.');
      return;
    }
    setErreurUser('');
    onSupprimerUtilisateur(u.id);
  };

  const exporterSauvegardeJson = () => {
    const contenu = JSON.stringify(donnees, null, 2);
    const blob = new Blob([contenu], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = `flash-shop-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    lien.click();
    URL.revokeObjectURL(url);
  };

  const gererImportFichier = async (e: ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    try {
      const texte = await fichier.text();
      onImporterBase(texte);
      afficherSucces('Sauvegarde importée et enregistrée sur cet appareil.');
    } catch {
      setMessageErreur('Le fichier sélectionné ne correspond pas à une sauvegarde FLASH-SHOP.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {messageSucces && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {messageSucces}
        </div>
      )}

      {messageErreur && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {messageErreur}
        </div>
      )}

      {/* Gestion des utilisateurs et rôles */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <UserPlus className="h-5 w-5 text-[#0A3072]" />
          <h2 className="text-base font-bold text-slate-900">
            Gestion des utilisateurs et rôles
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Formulaire création / modification utilisateur */}
          <form onSubmit={soumettreUtilisateur} className="space-y-3 lg:col-span-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {userEnEdition ? 'Modifier l’utilisateur' : 'Créer un utilisateur'}
              </h3>
              {userEnEdition && (
                <button
                  type="button"
                  onClick={reinitialiserFormUser}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {erreurUser && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {erreurUser}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Nom complet *
              </label>
              <input
                type="text"
                required
                value={nomUser}
                onChange={(e) => setNomUser(e.target.value)}
                placeholder="Ex: Ibrahim Diallo"
                className="min-h-[42px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Rôle *</label>
              <select
                value={roleUser}
                onChange={(e) => setRoleUser(e.target.value as RoleAssignable)}
                className="min-h-[42px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              >
                <option value="admin">Administrateur</option>
                <option value="comptable">Comptable</option>
                <option value="caissier">Caissier</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Mot de passe de connexion *
              </label>
              <div className="relative">
                <input
                  type={afficherMdpForm ? 'text' : 'password'}
                  required
                  value={motDePasseUser}
                  onChange={(e) => setMotDePasseUser(e.target.value)}
                  placeholder="Définir un mot de passe unique"
                  className="min-h-[42px] w-full rounded-lg border border-slate-200 py-2 pl-3 pr-10 text-sm focus:border-blue-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setAfficherMdpForm((v) => !v)}
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={afficherMdpForm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  title={afficherMdpForm ? 'Masquer' : 'Afficher'}
                >
                  {afficherMdpForm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="text-[11px] leading-relaxed text-slate-500">
              <strong>Administrateur :</strong> accès complet · <strong>Comptable :</strong>{' '}
              tableau de bord, historique, dépenses, rapports · <strong>Caissier :</strong> caisse,
              catalogue en lecture, historique.
            </div>

            <button
              type="submit"
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <Plus className="h-4 w-4" />
              {userEnEdition ? 'Mettre à jour le compte' : 'Créer l’utilisateur'}
            </button>
          </form>

          {/* Liste des utilisateurs créés */}
          <div className="lg:col-span-7">
            <h3 className="mb-3 text-sm font-bold text-slate-800">
              Utilisateurs enregistrés ({donnees.utilisateurs.length})
            </h3>

            {donnees.utilisateurs.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                Aucun utilisateur secondaire créé pour le moment. Utilisez le formulaire à gauche
                pour ajouter un comptable, un caissier ou un administrateur.
              </div>
            ) : (
              <>
                {/* Vue mobile */}
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 md:hidden">
                  {donnees.utilisateurs.map((u) => {
                    const visible = !!mdpVisibles[u.id];
                    return (
                      <div key={u.id} className="flex items-center justify-between gap-2 p-3.5">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900">{u.nom}</div>
                          <div className="text-xs font-medium text-blue-700">
                            {LIBELLES_ROLE[u.role]}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 font-mono text-xs text-slate-600">
                            <span>{visible ? u.motDePasse : '••••••'}</span>
                            <button
                              type="button"
                              onClick={() => toggleMdpVisible(u.id)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              aria-label={
                                visible
                                  ? `Masquer le mot de passe de ${u.nom}`
                                  : `Afficher le mot de passe de ${u.nom}`
                              }
                            >
                              {visible ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => chargerEditionUser(u)}
                            className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                            aria-label={`Modifier ${u.nom}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => tenterSuppressionUser(u)}
                            className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700"
                            aria-label={`Supprimer ${u.nom}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Vue desktop */}
                <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-[#0D357A] text-xs font-semibold text-white">
                        <th className="px-4 py-3">Nom</th>
                        <th className="px-4 py-3">Rôle</th>
                        <th className="px-4 py-3">Mot de passe</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {donnees.utilisateurs.map((u) => {
                        const visible = !!mdpVisibles[u.id];
                        return (
                          <tr key={u.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-900">{u.nom}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-blue-700">
                              {LIBELLES_ROLE[u.role]}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-700">
                              <div className="flex items-center gap-2">
                                <span>{visible ? u.motDePasse : '••••••'}</span>
                                <button
                                  type="button"
                                  onClick={() => toggleMdpVisible(u.id)}
                                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                  aria-label={
                                    visible
                                      ? `Masquer le mot de passe de ${u.nom}`
                                      : `Afficher le mot de passe de ${u.nom}`
                                  }
                                  title={visible ? 'Masquer' : 'Afficher'}
                                >
                                  {visible ? (
                                    <EyeOff className="h-3.5 w-3.5" />
                                  ) : (
                                    <Eye className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => chargerEditionUser(u)}
                                className="rounded-lg bg-indigo-600 p-1.5 text-white hover:bg-indigo-700"
                                title="Modifier"
                                aria-label={`Modifier ${u.nom}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => tenterSuppressionUser(u)}
                                className="rounded-lg bg-red-600 p-1.5 text-white hover:bg-red-700"
                                title="Supprimer"
                                aria-label={`Supprimer ${u.nom}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Informations de la boutique + Base locale */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-2">
          <h2 className="mb-4 text-base font-bold text-slate-900">Informations de la boutique</h2>

          <form onSubmit={soumettreBoutique} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Nom de la boutique
                </label>
                <input
                  type="text"
                  required
                  value={form.nomBoutique}
                  onChange={(e) => setForm({ ...form, nomBoutique: e.target.value })}
                  className="min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Activité / Sous-titre
                </label>
                <input
                  type="text"
                  value={form.sousTitre}
                  onChange={(e) => setForm({ ...form, sousTitre: e.target.value })}
                  className="min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Téléphone</label>
                <input
                  type="text"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className="min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Adresse</label>
                <input
                  type="text"
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                  className="min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Nom du gérant
                </label>
                <input
                  type="text"
                  value={form.nomGerant}
                  onChange={(e) => setForm({ ...form, nomGerant: e.target.value })}
                  className="min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Devise</label>
                <input
                  type="text"
                  value={form.devise}
                  onChange={(e) => setForm({ ...form, devise: e.target.value })}
                  className="min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 sm:w-auto"
            >
              <Save className="h-4 w-4" />
              Enregistrer les modifications
            </button>
          </form>
        </section>

        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-base font-bold text-slate-900">Base de données locale</h2>
          <p className="text-xs leading-relaxed text-slate-600">
            Toutes vos données sont enregistrées en double dans votre appareil (
            <code className="font-mono">localStorage</code> +{' '}
            <code className="font-mono">IndexedDB</code>) pour rester conservées même après
            redémarrage.
          </p>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={exporterSauvegardeJson}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Exporter les données (JSON)
            </button>

            <input
              ref={inputImportRef}
              type="file"
              accept="application/json,.json"
              onChange={gererImportFichier}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputImportRef.current?.click()}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <Upload className="h-4 w-4" />
              Importer une sauvegarde (JSON)
            </button>

            {!confirmationReset ? (
              <button
                type="button"
                onClick={() => setConfirmationReset(true)}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                <RotateCcw className="h-4 w-4" />
                Réinitialiser les données de démo
              </button>
            ) : (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <p className="mb-2 font-semibold">
                  Confirmer la remise à zéro avec les données initiales ?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onReinitialiserBase();
                      setConfirmationReset(false);
                      afficherSucces('Base locale réinitialisée.');
                    }}
                    className="min-h-[40px] flex-1 rounded-md bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700"
                  >
                    Confirmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmationReset(false)}
                    className="min-h-[40px] flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
