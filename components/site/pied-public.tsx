import Link from 'next/link';

import { Logo } from '@/components/app/logo';
import { ASSOCIATION } from '@/lib/contenu/association';
import type { Textes } from '@/lib/i18n/langue';

import { ChoixDeLangue } from './choix-de-langue';

const COLONNES: readonly [string, readonly (readonly [string, string])[]][] = [
  [
    'Le réseau',
    [
      ['Comment ça marche', '/comment-ca-marche'],
      ['Sécurité', '/securite'],
      ['Communauté', '/communaute'],
      ['Questions fréquentes', '/faq'],
    ],
  ],
  [
    'L’association',
    [
      ['À propos', '/a-propos'],
      ['Contact', '/contact'],
      ['Nous soutenir', '/soutenir'],
      ['Rejoindre le réseau', '/bienvenue'],
    ],
  ],
  [
    'Vos droits',
    [
      ['Conditions d’utilisation', '/conditions-generales'],
      ['Politique de confidentialité', '/confidentialite'],
    ],
  ],
];

/**
 * Le pied des pages publiques.
 *
 * Le soutien est libre et ne conditionne rien : un droit d'entrée découragerait
 * surtout ceux qui donnent sans rien demander.
 */
export function PiedPublic({ t, p, langue }: Textes) {
  return (
    <footer className="pied-public">
      <div className="contenu-public">
        <div className="pied-marque">
          <Link href="/" className="entete-marque">
            <Logo taille={34} />
            Bike Sitters
          </Link>
          <p>{t('ld.lead')}</p>
          <p>{t('ft.supportd')}</p>
        </div>
        {COLONNES.map(([titre, liens]) => (
          <nav key={titre} className="pied-colonne" aria-label={p(titre)}>
            <h2>{p(titre)}</h2>
            {liens.map(([libelle, adresse]) => (
              <Link key={adresse} href={adresse}>
                {p(libelle)}
              </Link>
            ))}
          </nav>
        ))}
        <div className="pied-bas">
          <span>
            {ASSOCIATION.nom} · {p(ASSOCIATION.forme)} · {ASSOCIATION.ville}
          </span>
          <ChoixDeLangue langue={langue} />
        </div>
      </div>
    </footer>
  );
}
