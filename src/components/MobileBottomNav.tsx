import { Boxes, Home, Menu, Package, ShoppingCart } from 'lucide-react';
import { peutAccederPage } from '../services/auth';
import { PageId, RoleUtilisateur } from '../types';

interface MobileBottomNavProps {
  pageActive: PageId;
  role: RoleUtilisateur;
  onChangerPage: (page: PageId) => void;
  onOuvrirMenu: () => void;
}

export default function MobileBottomNav({
  pageActive,
  role,
  onChangerPage,
  onOuvrirMenu,
}: MobileBottomNavProps) {
  const tousOnglets: { id: PageId; label: string; icone: typeof Home }[] = [
    { id: 'dashboard', label: 'Accueil', icone: Home },
    { id: 'produits', label: 'Produits', icone: Package },
    { id: 'caisse', label: 'Caisse', icone: ShoppingCart },
    { id: 'stocks', label: 'Stocks', icone: Boxes },
  ];

  const ongletsAutorises = tousOnglets.filter((o) => peutAccederPage(role, o.id));
  const estAutrePage = !ongletsAutorises.some((o) => o.id === pageActive);

  return (
    <nav
      aria-label="Navigation mobile"
      className="no-print pb-safe fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden"
    >
      <div className="flex h-16 items-center justify-around">
        {ongletsAutorises.map((onglet) => {
          const Icone = onglet.icone;
          const actif = pageActive === onglet.id;
          return (
            <button
              key={onglet.id}
              type="button"
              onClick={() => onChangerPage(onglet.id)}
              className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                actif ? 'text-orange-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icone className="h-5 w-5" />
              <span>{onglet.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onOuvrirMenu}
          className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
            estAutrePage ? 'text-orange-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Menu className="h-5 w-5" />
          <span>Plus</span>
        </button>
      </div>
    </nav>
  );
}
