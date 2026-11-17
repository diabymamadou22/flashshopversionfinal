/**
 * Identifiants des écrans de l'application FLASH-SHOP.
 */
export type PageId =
  | 'dashboard'
  | 'produits'
  | 'categories'
  | 'caisse'
  | 'historique'
  | 'stocks'
  | 'depenses'
  | 'rapports'
  | 'parametres';

/**
 * Rôles disponibles dans l'application.
 */
export type RoleUtilisateur = 'super_admin' | 'admin' | 'comptable' | 'caissier';

/**
 * Rôles pouvant être attribués à un utilisateur créé depuis les Paramètres.
 */
export type RoleAssignable = 'admin' | 'comptable' | 'caissier';

/**
 * Compte utilisateur créé dans Paramètres.
 */
export interface Utilisateur {
  id: string;
  nom: string;
  motDePasse: string;
  role: RoleAssignable;
  dateCreation: string;
}

/**
 * Session active de l'utilisateur connecté.
 */
export interface SessionUtilisateur {
  id: string;
  nom: string;
  role: RoleUtilisateur;
}

/**
 * Statut calculé automatiquement selon la quantité en stock et le seuil d'alerte.
 */
export type StatutStock = 'en_stock' | 'stock_faible' | 'rupture';

/**
 * Représente une catégorie de matériels électroniques.
 */
export interface Categorie {
  id: string;
  nom: string;
  description: string;
}

/**
 * Représente un article vendu dans la boutique (sans image pour garder la fiche légère).
 */
export interface Produit {
  id: string;
  reference: string;
  codeBarre: string;
  nom: string;
  description: string;
  categorieId: string;
  prixAchat: number;
  prixVente: number;
  stock: number;
  seuil: number;
  dateAjout: string;
}

/**
 * Ligne d'un panier ou d'une facture de vente.
 */
export interface LigneVente {
  produitId: string;
  reference: string;
  nomProduit: string;
  quantite: number;
  prixAchatUnitaire: number;
  prixUnitaire: number;
  sousTotal: number;
}

export type ModePaiement = 'Especes' | 'Orange Money' | 'Moov Money' | 'Carte';

/**
 * Vente validée à la caisse.
 */
export interface Vente {
  id: string;
  numeroFacture: string;
  date: string;
  clientNom: string;
  modePaiement: ModePaiement;
  lignes: LigneVente[];
  total: number;
}

/**
 * Historique des entrées et sorties manuelles de stock.
 */
export interface MouvementStock {
  id: string;
  produitId: string;
  nomProduit: string;
  type: 'entree' | 'sortie';
  quantite: number;
  motif: string;
  date: string;
}

/**
 * Dépense courante de fonctionnement de la boutique.
 */
export interface Depense {
  id: string;
  libelle: string;
  categorie: 'Loyer' | 'Electricite' | 'Transport' | 'Salaires' | 'Autre';
  montant: number;
  date: string;
}

/**
 * Informations générales de la boutique affichées dans l'interface et sur les reçus.
 */
export interface ParametresBoutique {
  nomBoutique: string;
  sousTitre: string;
  telephone: string;
  adresse: string;
  nomGerant: string;
  roleGerant: string;
  devise: string;
}

/**
 * Structure complète enregistrée dans la base de données locale (localStorage + IndexedDB).
 */
export interface BaseDonnees {
  categories: Categorie[];
  produits: Produit[];
  ventes: Vente[];
  mouvementsStock: MouvementStock[];
  depenses: Depense[];
  utilisateurs: Utilisateur[];
  parametres: ParametresBoutique;
}
