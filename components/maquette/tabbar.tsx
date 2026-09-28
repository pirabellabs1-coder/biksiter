'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { Icone, type NomDIcone } from '@/components/app/icone';

/**
 * Les deux barres du bas de l'espace membre.
 *
 * Une barre par rôle : celle du cycliste par défaut, celle du bike sitter quand
 * on a choisi ce rôle. La maquette les bascule sur `body[data-mode]` ; on garde
 * ce mécanisme, porté par `maquette-167.css`.
 *
 * Chaque barre ne montre que les destinations du rôle courant — jamais un
 * raccourci vers l'autre rôle. Le changement de rôle vit dans l'en-tête
 * (« Cycliste / Bike Sitter »), atteignable depuis n'importe quel écran : le
 * répéter dans la barre du bas semait la confusion (« ce rond, c'est quoi ? »).
 *
 * Les pictogrammes sont de vraies icônes tracées, pas des caractères : elles
 * s'affichent partout de la même façon et se remplissent sur l'onglet courant.
 */

type Entree = {
  href: string;
  icone: NomDIcone;
  libelle: string;
  prefixes: readonly string[];
};

const CYCLISTE: readonly Entree[] = [
  {
    href: '/mon-espace',
    icone: 'accueil',
    libelle: 'Accueil',
    prefixes: ['/mon-espace'],
  },
  {
    href: '/recherche',
    icone: 'recherche',
    libelle: 'Chercher',
    prefixes: ['/recherche', '/emplacements', '/carte'],
  },
  {
    href: '/gardes',
    icone: 'gardes',
    libelle: 'Mes gardes',
    prefixes: ['/gardes', '/demande'],
  },
  {
    href: '/favoris',
    icone: 'coeur',
    libelle: 'Favoris',
    prefixes: ['/favoris'],
  },
  {
    href: '/plus',
    icone: 'menu',
    libelle: 'Plus',
    prefixes: ['/plus', '/plan-du-site'],
  },
];

const SITTER: readonly Entree[] = [
  {
    href: '/accueil',
    icone: 'demandes',
    libelle: 'Demandes',
    prefixes: ['/accueil', '/demandes', '/demande'],
  },
  {
    href: '/mes-lieux',
    icone: 'horloge',
    libelle: 'Dispos',
    prefixes: ['/mes-lieux'],
  },
  {
    href: '/profil',
    icone: 'profil',
    libelle: 'Mon profil',
    prefixes: ['/profil', '/membres'],
  },
  {
    href: '/catalogue',
    icone: 'etoile',
    libelle: 'Points',
    prefixes: ['/catalogue', '/progression', '/classement'],
  },
  {
    href: '/plus',
    icone: 'menu',
    libelle: 'Plus',
    prefixes: ['/plus', '/plan-du-site'],
  },
];

/**
 * Les chemins qui désignent un côté sans ambiguïté.
 *
 * Le témoin de mode dit quel rôle on a choisi, mais certaines pages n'ont de
 * sens que d'un côté. Y arriver par un lien direct laissait la barre de l'autre
 * rôle en bas. Ici la page l'emporte.
 */
const COTE_SITTER = [
  '/accueil',
  '/mes-lieux',
  '/demandes',
  '/catalogue',
  '/progression',
];
const COTE_CYCLISTE = ['/mon-espace', '/recherche', '/emplacements', '/favoris'];

function coteDuChemin(chemin: string): 'sitter' | 'cycliste' | null {
  if (COTE_SITTER.some((p) => chemin.startsWith(p))) return 'sitter';
  if (COTE_CYCLISTE.some((p) => chemin.startsWith(p))) return 'cycliste';
  return null;
}

/**
 * Le côté que montre l'écran courant, pour la barre du bas comme pour la
 * bascule de l'en-tête : les deux doivent dire la même chose, à l'œil comme
 * au lecteur d'écran.
 */
export function coteAffiche(chemin: string): 'sitter' | 'cycliste' | null {
  // Un écran peut dire lui-même de quel côté il se trouve (`data-cote` sur
  // son <main> ou dans son cadre) quand l'adresse seule ne suffit pas.
  const annonce = document.querySelector<HTMLElement>('[data-cote]')?.dataset
    .cote;
  if (annonce === 'sitter' || annonce === 'cycliste') return annonce;
  // Sur une page neutre (messages, notifications…), on revient au rôle
  // choisi par le membre : sinon la barre de l'écran précédent restait.
  const choisi = document.body.dataset.modeChoisi;
  return (
    coteDuChemin(chemin) ??
    (choisi === 'sitter' || choisi === 'cycliste' ? choisi : null)
  );
}

function estActif(chemin: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefixe) =>
    prefixe === '/' ? chemin === '/' : chemin.startsWith(prefixe),
  );
}

function Barre({
  entrees,
  classe,
  libelle,
}: {
  entrees: readonly Entree[];
  classe: string;
  libelle: string;
}) {
  const chemin = usePathname();

  return (
    <nav className={`tabbar ${classe}`} aria-label={libelle}>
      {entrees.map((entree) => {
        const actif = estActif(chemin, entree.prefixes);
        return (
          <Link
            key={entree.libelle}
            href={entree.href}
            className={`tb${actif ? ' actif' : ''}`}
            aria-current={actif ? 'page' : undefined}
          >
            <span className="tb-i" aria-hidden="true">
              <Icone nom={entree.icone} taille={23} />
            </span>
            {entree.libelle}
          </Link>
        );
      })}
    </nav>
  );
}

export function BarresDuBas() {
  const chemin = usePathname();

  useEffect(() => {
    const cote = coteAffiche(chemin);
    if (cote) document.body.dataset.mode = cote;
  }, [chemin]);

  return (
    <>
      <Barre
        entrees={CYCLISTE}
        classe="tabbar-cycliste"
        libelle="Navigation cycliste"
      />
      <Barre
        entrees={SITTER}
        classe="tabbar-sitter"
        libelle="Navigation Bike Sitter"
      />
    </>
  );
}
