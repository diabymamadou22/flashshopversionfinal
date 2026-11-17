import { PageId, RoleUtilisateur, SessionUtilisateur, Utilisateur } from '../types';

const CLE_SESSION = 'flash_shop_session_v1';
const CODE_MAITRE = '00223';

export const LIBELLES_ROLE: Record<RoleUtilisateur, string> = {
  super_admin: 'Administrateur',
  admin: 'Administrateur',
  comptable: 'Comptable',
  caissier: 'Caissier',
};

/**
 * Pages autorisées pour chaque rôle utilisateur.
 */
export const PAGES_PAR_ROLE: Record<RoleUtilisateur, PageId[]> = {
  super_admin: [
    'dashboard',
    'produits',
    'categories',
    'caisse',
    'historique',
    'stocks',
    'depenses',
    'rapports',
    'parametres',
  ],
  admin: [
    'dashboard',
    'produits',
    'categories',
    'caisse',
    'historique',
    'stocks',
    'depenses',
    'rapports',
    'parametres',
  ],
  comptable: ['dashboard', 'historique', 'depenses', 'rapports'],
  caissier: ['produits', 'caisse', 'historique'],
};

/**
 * Vérifie si un rôle a accès à un écran donné.
 */
export function peutAccederPage(role: RoleUtilisateur, page: PageId): boolean {
  return PAGES_PAR_ROLE[role].includes(page);
}

/**
 * Retourne la page d'accueil par défaut selon le rôle connecté.
 */
export function getPageDefautRole(role: RoleUtilisateur): PageId {
  if (role === 'comptable') return 'rapports';
  if (role === 'caissier') return 'caisse';
  return 'produits';
}

/**
 * Vérifie le mot de passe principal (invisible dans les paramètres).
 */
export function verifierMotDePasseSuperAdmin(saisie: string): boolean {
  return saisie.trim() === CODE_MAITRE;
}

/**
 * Authentifie uniquement avec le mot de passe :
 * - Vérifie d'abord le mot de passe principal (invisible dans Paramètres)
 * - Sinon cherche parmi les utilisateurs créés dans Paramètres
 */
export function authentifierParMotDePasse(
  motDePasse: string,
  utilisateurs: Utilisateur[]
): SessionUtilisateur | null {
  const mdpPropre = motDePasse.trim();
  if (!mdpPropre) return null;

  if (verifierMotDePasseSuperAdmin(mdpPropre)) {
    return {
      id: 'compte-principal',
      nom: 'Admin',
      role: 'super_admin',
    };
  }

  const trouve = utilisateurs.find((u) => u.motDePasse === mdpPropre);
  if (!trouve) return null;

  return {
    id: trouve.id,
    nom: trouve.nom,
    role: trouve.role,
  };
}

export function chargerSession(): SessionUtilisateur | null {
  try {
    const brut = localStorage.getItem(CLE_SESSION);
    if (!brut) return null;
    return JSON.parse(brut) as SessionUtilisateur;
  } catch {
    return null;
  }
}

export function sauvegarderSession(session: SessionUtilisateur | null): void {
  try {
    if (!session) {
      localStorage.removeItem(CLE_SESSION);
    } else {
      localStorage.setItem(CLE_SESSION, JSON.stringify(session));
    }
  } catch {
    // Ignoré si le stockage est bloqué
  }
}
