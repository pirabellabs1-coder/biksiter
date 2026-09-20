'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { Icone, type NomDIcone } from './icone';

export type Onglet = {
  href: string;
  libelle: string;
  icone: NomDIcone;
  /** Les écrans qui appartiennent à cet onglet. */
  prefixes: readonly string[];
  pastille?: boolean;
};

function ongletActif(onglets: readonly Onglet[], chemin: string) {
  return onglets.find((onglet) =>
    onglet.prefixes.some(
      (prefixe) => chemin === prefixe || chemin.startsWith(`${prefixe}/`),
    ),
  );
}

function Entrees({ onglets }: { onglets: readonly Onglet[] }) {
  const actif = ongletActif(onglets, usePathname());
  return onglets.map((onglet) => {
    const estActif = onglet === actif;
    return (
      <Link
        key={onglet.href}
        href={onglet.href}
        aria-current={estActif ? 'page' : undefined}
      >
        <Icone
          nom={onglet.icone}
          taille={24}
          strokeWidth={estActif ? 2.2 : 1.8}
        />
        {onglet.libelle}
        {onglet.pastille ? (
          <span className="point-rouge" aria-hidden="true" />
        ) : null}
      </Link>
    );
  });
}

/** Les cinq onglets du bas, sur téléphone. */
export function BarreDOnglets({
  onglets,
  libelle,
}: {
  onglets: readonly Onglet[];
  libelle: string;
}) {
  return (
    <nav className="onglets" aria-label={libelle}>
      <Entrees onglets={onglets} />
    </nav>
  );
}

/** Les mêmes entrées dans la barre latérale, sur ordinateur. */
export function BarreLaterale({
  onglets,
  libelle,
  marque,
  avant,
  apres,
}: {
  onglets: readonly Onglet[];
  libelle: string;
  marque: ReactNode;
  avant?: ReactNode;
  apres?: ReactNode;
}) {
  return (
    <aside className="rail-app">
      {marque}
      {avant}
      <nav aria-label={libelle}>
        <Entrees onglets={onglets} />
      </nav>
      {apres}
    </aside>
  );
}
