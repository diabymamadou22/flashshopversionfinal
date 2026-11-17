import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import MobileBottomNav from './components/MobileBottomNav';
import Sidebar from './components/Sidebar';
import CategoriesPage from './pages/CategoriesPage';
import ConnexionPage from './pages/ConnexionPage';
import DashboardPage from './pages/DashboardPage';
import DepensesPage from './pages/DepensesPage';
import HistoriqueVentesPage from './pages/HistoriqueVentesPage';
import ParametresPage from './pages/ParametresPage';
import ProduitsPage from './pages/ProduitsPage';
import RapportsPage from './pages/RapportsPage';
import StocksPage from './pages/StocksPage';
import VentesCaissePage from './pages/VentesCaissePage';
import {
  authentifierParMotDePasse,
  chargerSession,
  getPageDefautRole,
  peutAccederPage,
  sauvegarderSession,
} from './services/auth';
import {
  chargerBase,
  demanderStockagePersistant,
  importerBaseJson,
  reinitialiserBase,
  sauvegarderBase,
  verifierRestaurationLocale,
} from './services/database';
import {
  BaseDonnees,
  Categorie,
  Depense,
  MouvementStock,
  PageId,
  ParametresBoutique,
  Produit,
  SessionUtilisateur,
  Utilisateur,
  Vente,
} from './types';
import { getStatutStock } from './utils/format';

export default function App() {
  // Chargement initial de la base locale et de la session
  const [donnees, setDonnees] = useState<BaseDonnees>(() => chargerBase());
  const [session, setSession] = useState<SessionUtilisateur | null>(() => chargerSession());
  const [pageActive, setPageActive] = useState<PageId>(() => {
    const s = chargerSession();
    return s ? getPageDefautRole(s.role) : 'produits';
  });
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false);

  // Demande de stockage persistant + restauration depuis IndexedDB si nécessaire
  useEffect(() => {
    void demanderStockagePersistant();
    void verifierRestaurationLocale().then((restauree) => {
      if (restauree) {
        setDonnees(restauree);
      }
    });
  }, []);

  // Sauvegarde automatique dans localStorage et IndexedDB à chaque modification
  useEffect(() => {
    sauvegarderBase(donnees);
  }, [donnees]);

  // Sauvegarde de la session active
  useEffect(() => {
    sauvegarderSession(session);
  }, [session]);

  // Liste des produits ayant atteint ou dépassé leur seuil minimal
  const produitsEnAlerte = useMemo(
    () => donnees.produits.filter((p) => getStatutStock(p.stock, p.seuil) !== 'en_stock'),
    [donnees.produits]
  );

  // --- Authentification ---
  const gererConnexion = (motDePasse: string): boolean => {
    const nouvelleSession = authentifierParMotDePasse(motDePasse, donnees.utilisateurs);
    if (!nouvelleSession) return false;
    setSession(nouvelleSession);
    setPageActive(getPageDefautRole(nouvelleSession.role));
    return true;
  };

  const gererDeconnexion = () => {
    setSession(null);
    setMenuMobileOuvert(false);
  };

  const changerPage = (page: PageId) => {
    if (!session) return;
    if (peutAccederPage(session.role, page)) {
      setPageActive(page);
    }
  };

  // --- Opérations CRUD Produits ---
  const ajouterProduit = (produit: Produit) => {
    setDonnees((prev) => ({
      ...prev,
      produits: [produit, ...prev.produits],
    }));
  };

  const modifierProduit = (produitModifie: Produit) => {
    setDonnees((prev) => ({
      ...prev,
      produits: prev.produits.map((p) => (p.id === produitModifie.id ? produitModifie : p)),
    }));
  };

  const supprimerProduit = (id: string) => {
    setDonnees((prev) => ({
      ...prev,
      produits: prev.produits.filter((p) => p.id !== id),
    }));
  };

  // --- Opérations CRUD Catégories ---
  const ajouterCategorie = (categorie: Categorie) => {
    setDonnees((prev) => ({
      ...prev,
      categories: [...prev.categories, categorie],
    }));
  };

  const modifierCategorie = (categorieModifiee: Categorie) => {
    setDonnees((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categorieModifiee.id ? categorieModifiee : c
      ),
    }));
  };

  const supprimerCategorie = (id: string) => {
    setDonnees((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
    }));
  };

  // --- Ventes & Suppression du Chiffre d'affaires ---
  const validerVente = (vente: Vente) => {
    setDonnees((prev) => {
      const produitsMisAJour = prev.produits.map((produit) => {
        const ligne = vente.lignes.find((l) => l.produitId === produit.id);
        if (!ligne) return produit;
        return {
          ...produit,
          stock: Math.max(0, produit.stock - ligne.quantite),
        };
      });

      return {
        ...prev,
        produits: produitsMisAJour,
        ventes: [vente, ...prev.ventes],
      };
    });
  };

  const supprimerVente = (id: string) => {
    setDonnees((prev) => ({
      ...prev,
      ventes: prev.ventes.filter((v) => v.id !== id),
    }));
  };

  const supprimerChiffreAffaires = () => {
    setDonnees((prev) => ({
      ...prev,
      ventes: [],
    }));
  };

  // --- Mouvement de stock manuel (entrée ou sortie) ---
  const enregistrerMouvementStock = (mouvement: MouvementStock) => {
    setDonnees((prev) => {
      const produitsMisAJour = prev.produits.map((p) => {
        if (p.id !== mouvement.produitId) return p;
        const nouveauStock =
          mouvement.type === 'entree'
            ? p.stock + mouvement.quantite
            : Math.max(0, p.stock - mouvement.quantite);
        return { ...p, stock: nouveauStock };
      });

      return {
        ...prev,
        produits: produitsMisAJour,
        mouvementsStock: [mouvement, ...prev.mouvementsStock],
      };
    });
  };

  // --- Dépenses ---
  const ajouterDepense = (depense: Depense) => {
    setDonnees((prev) => ({
      ...prev,
      depenses: [depense, ...prev.depenses],
    }));
  };

  const supprimerDepense = (id: string) => {
    setDonnees((prev) => ({
      ...prev,
      depenses: prev.depenses.filter((d) => d.id !== id),
    }));
  };

  // --- Utilisateurs & Paramètres ---
  const ajouterUtilisateur = (utilisateur: Utilisateur) => {
    setDonnees((prev) => ({
      ...prev,
      utilisateurs: [...prev.utilisateurs, utilisateur],
    }));
  };

  const modifierUtilisateur = (utilisateurModifie: Utilisateur) => {
    setDonnees((prev) => ({
      ...prev,
      utilisateurs: prev.utilisateurs.map((u) =>
        u.id === utilisateurModifie.id ? utilisateurModifie : u
      ),
    }));
  };

  const supprimerUtilisateur = (id: string) => {
    setDonnees((prev) => ({
      ...prev,
      utilisateurs: prev.utilisateurs.filter((u) => u.id !== id),
    }));
  };

  const sauvegarderParametres = (parametres: ParametresBoutique) => {
    setDonnees((prev) => ({
      ...prev,
      parametres,
    }));
  };

  const handleImporter = (contenuJson: string) => {
    const nouvelleBase = importerBaseJson(contenuJson);
    setDonnees(nouvelleBase);
  };

  const handleReinitialiser = () => {
    const basePropre = reinitialiserBase();
    setDonnees(basePropre);
  };

  // Écran de connexion si aucune session n'est active
  if (!session) {
    return <ConnexionPage parametres={donnees.parametres} onConnexion={gererConnexion} />;
  }

  const pageCourante = peutAccederPage(session.role, pageActive)
    ? pageActive
    : getPageDefautRole(session.role);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        pageActive={pageCourante}
        role={session.role}
        onChangerPage={changerPage}
        onDeconnexion={gererDeconnexion}
        parametres={donnees.parametres}
        ouvertMobile={menuMobileOuvert}
        onFermerMobile={() => setMenuMobileOuvert(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          pageActive={pageCourante}
          session={session}
          produitsEnAlerte={produitsEnAlerte}
          onOuvrirMenu={() => setMenuMobileOuvert(true)}
          onAllerPage={changerPage}
          onDeconnexion={gererDeconnexion}
        />

        <main className="flex-1 p-3 pb-24 sm:p-6 lg:pb-6">
          {pageCourante === 'dashboard' && (
            <DashboardPage
              donnees={donnees}
              role={session.role}
              onAllerPage={changerPage}
            />
          )}

          {pageCourante === 'produits' && (
            <ProduitsPage
              produits={donnees.produits}
              categories={donnees.categories}
              devise={donnees.parametres.devise}
              lectureSeule={session.role === 'caissier'}
              onAjouterProduit={ajouterProduit}
              onModifierProduit={modifierProduit}
              onSupprimerProduit={supprimerProduit}
            />
          )}

          {pageCourante === 'categories' && (
            <CategoriesPage
              categories={donnees.categories}
              produits={donnees.produits}
              onAjouterCategorie={ajouterCategorie}
              onModifierCategorie={modifierCategorie}
              onSupprimerCategorie={supprimerCategorie}
            />
          )}

          {pageCourante === 'caisse' && (
            <VentesCaissePage
              produits={donnees.produits}
              parametres={donnees.parametres}
              nombreVentesExistantes={donnees.ventes.length}
              onValiderVente={validerVente}
            />
          )}

          {pageCourante === 'historique' && (
            <HistoriqueVentesPage
              ventes={donnees.ventes}
              parametres={donnees.parametres}
              role={session.role}
              onSupprimerVente={supprimerVente}
              onSupprimerChiffreAffaires={supprimerChiffreAffaires}
            />
          )}

          {pageCourante === 'stocks' && (
            <StocksPage
              produits={donnees.produits}
              mouvements={donnees.mouvementsStock}
              onEnregistrerMouvement={enregistrerMouvementStock}
            />
          )}

          {pageCourante === 'depenses' && (
            <DepensesPage
              depenses={donnees.depenses}
              devise={donnees.parametres.devise}
              onAjouterDepense={ajouterDepense}
              onSupprimerDepense={supprimerDepense}
            />
          )}

          {pageCourante === 'rapports' && (
            <RapportsPage
              donnees={donnees}
              role={session.role}
              onSupprimerChiffreAffaires={supprimerChiffreAffaires}
            />
          )}

          {pageCourante === 'parametres' && (
            <ParametresPage
              donnees={donnees}
              utilisateurConnecteId={session.id}
              onSauvegarderParametres={sauvegarderParametres}
              onAjouterUtilisateur={ajouterUtilisateur}
              onModifierUtilisateur={modifierUtilisateur}
              onSupprimerUtilisateur={supprimerUtilisateur}
              onImporterBase={handleImporter}
              onReinitialiserBase={handleReinitialiser}
            />
          )}
        </main>
      </div>

      <MobileBottomNav
        pageActive={pageCourante}
        role={session.role}
        onChangerPage={changerPage}
        onOuvrirMenu={() => setMenuMobileOuvert(true)}
      />
    </div>
  );
}
