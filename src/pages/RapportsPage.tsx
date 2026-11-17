import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import ModalSuppressionCA from '../components/ModalSuppressionCA';
import { BaseDonnees, RoleUtilisateur } from '../types';
import { formatPrix } from '../utils/format';

interface RapportsPageProps {
  donnees: BaseDonnees;
  role: RoleUtilisateur;
  onSupprimerChiffreAffaires: () => void;
}

export default function RapportsPage({
  donnees,
  role,
  onSupprimerChiffreAffaires,
}: RapportsPageProps) {
  const { produits, categories, ventes, depenses, parametres } = donnees;
  const [modalSuppressionOuverte, setModalSuppressionOuverte] = useState(false);

  const peutSupprimerCA = role === 'super_admin' || role === 'admin';

  const bilan = useMemo(() => {
    const chiffreAffaires = ventes.reduce((acc, v) => acc + v.total, 0);
    const coutMarchandises = ventes.reduce(
      (acc, v) =>
        acc + v.lignes.reduce((s, l) => s + l.prixAchatUnitaire * l.quantite, 0),
      0
    );
    const margeBrute = chiffreAffaires - coutMarchandises;
    const totalDepenses = depenses.reduce((acc, d) => acc + d.montant, 0);
    const beneficeNet = margeBrute - totalDepenses;

    const valeurStockVente = produits.reduce((acc, p) => acc + p.prixVente * p.stock, 0);

    const parCategorie = categories.map((cat) => {
      const items = produits.filter((p) => p.categorieId === cat.id);
      const unites = items.reduce((s, p) => s + p.stock, 0);
      const valeur = items.reduce((s, p) => s + p.prixAchat * p.stock, 0);
      return {
        id: cat.id,
        nom: cat.nom,
        nbProduits: items.length,
        unites,
        valeur,
      };
    });

    const maxValeur = Math.max(1, ...parCategorie.map((c) => c.valeur));

    return {
      chiffreAffaires,
      coutMarchandises,
      margeBrute,
      totalDepenses,
      beneficeNet,
      valeurStockVente,
      parCategorie,
      maxValeur,
    };
  }, [produits, categories, ventes, depenses]);

  return (
    <div className="space-y-6">
      {/* Indicateurs financiers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">Chiffre d&apos;affaires</span>
            {peutSupprimerCA && ventes.length > 0 && (
              <button
                type="button"
                onClick={() => setModalSuppressionOuverte(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                title="Supprimer le chiffre d'affaires"
              >
                <Trash2 className="h-3 w-3" />
                Supprimer
              </button>
            )}
          </div>
          <div className="mt-2 font-mono text-xl font-bold text-slate-900 tabular-nums">
            {formatPrix(bilan.chiffreAffaires, parametres.devise)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Marge brute sur ventes</div>
          <div className="mt-2 font-mono text-xl font-bold text-blue-700 tabular-nums">
            {formatPrix(bilan.margeBrute, parametres.devise)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Total des dépenses</div>
          <div className="mt-2 font-mono text-xl font-bold text-amber-700 tabular-nums">
            {formatPrix(bilan.totalDepenses, parametres.devise)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Bénéfice net estimé</div>
          <div
            className={`mt-2 font-mono text-xl font-bold tabular-nums ${
              bilan.beneficeNet >= 0 ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            {formatPrix(bilan.beneficeNet, parametres.devise)}
          </div>
        </div>
      </div>

      {/* Détail comptable et répartition du stock par catégorie */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-base font-bold text-slate-900">Synthèse financière</h2>
          <dl className="divide-y divide-slate-100 text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-slate-600">Total des ventes encaissées</dt>
              <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                {formatPrix(bilan.chiffreAffaires, parametres.devise)}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-slate-600">Coût d&apos;achat des articles vendus</dt>
              <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                {formatPrix(bilan.coutMarchandises, parametres.devise)}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-slate-600">Marge commerciale brute</dt>
              <dd className="font-mono font-semibold text-blue-700 tabular-nums">
                {formatPrix(bilan.margeBrute, parametres.devise)}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-slate-600">Charges / Dépenses de la boutique</dt>
              <dd className="font-mono font-semibold text-amber-700 tabular-nums">
                {formatPrix(bilan.totalDepenses, parametres.devise)}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="font-semibold text-slate-900">Résultat net (Marge - Dépenses)</dt>
              <dd
                className={`font-mono font-bold tabular-nums ${
                  bilan.beneficeNet >= 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {formatPrix(bilan.beneficeNet, parametres.devise)}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-slate-600">Valeur potentielle du stock à la vente</dt>
              <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                {formatPrix(bilan.valeurStockVente, parametres.devise)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-base font-bold text-slate-900">
            Valeur du stock par catégorie
          </h2>
          <div className="space-y-4">
            {bilan.parCategorie.map((cat) => {
              const pourcentage = Math.round((cat.valeur / bilan.maxValeur) * 100);
              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {cat.nom} ({cat.nbProduits} réf. · {cat.unites} unités)
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {formatPrix(cat.valeur, parametres.devise)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${pourcentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <ModalSuppressionCA
        ouvert={modalSuppressionOuverte}
        role={role}
        titre="Supprimer le chiffre d'affaires ?"
        description="Cette action supprime toutes les factures de ventes enregistrées et remet le chiffre d'affaires à 0."
        onFermer={() => setModalSuppressionOuverte(false)}
        onConfirmer={onSupprimerChiffreAffaires}
      />
    </div>
  );
}
