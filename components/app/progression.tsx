import type { ReactNode } from 'react';

import type { Textes } from '@/lib/i18n/langue';
import type { CategorieDOffre, RefusDEchange } from '@/lib/regles/catalogue';
import type { CleDeBadge, EtatDUnBadge } from '@/lib/regles/progression';

import { Icone, type NomDIcone } from './icone';

const RAYON = 44;
const CIRCONFERENCE = 2 * Math.PI * RAYON;

/** L'anneau de progression : la part parcourue vers le niveau suivant. */
export function Anneau({
  avancement,
  petit = false,
  children,
}: {
  /** Entre 0 et 1. */
  avancement: number;
  petit?: boolean;
  children: ReactNode;
}) {
  const part = Math.min(1, Math.max(0, avancement));
  return (
    <div className={petit ? 'anneau petit' : 'anneau'}>
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <circle className="anneau-fond" cx="50" cy="50" r={RAYON} />
        {part > 0 ? (
          <circle
            className="anneau-plein"
            cx="50"
            cy="50"
            r={RAYON}
            strokeDasharray={`${CIRCONFERENCE * part} ${CIRCONFERENCE}`}
          />
        ) : null}
      </svg>
      <div className="anneau-texte">{children}</div>
    </div>
  );
}

const ICONE_DU_BADGE: Record<CleDeBadge, NomDIcone> = {
  premiere_garde: 'velo',
  reponse_rapide: 'horloge',
  zero_annulation: 'calendrier',
  accueil_5_etoiles: 'etoile',
  dix_gardes: 'trophee',
  specialiste_vae: 'batterie',
};

export function iconeDuBadge(cle: CleDeBadge): NomDIcone {
  return ICONE_DU_BADGE[cle];
}

export function EmblemeDeBadge({ badge }: { badge: EtatDUnBadge }) {
  return (
    <span
      className={badge.obtenu ? 'embleme' : 'embleme verrouille'}
      aria-hidden="true"
    >
      <Icone nom={ICONE_DU_BADGE[badge.cle]} taille={30} strokeWidth={2} />
      {badge.obtenu ? null : (
        <span className="embleme-cadenas">
          <Icone nom="cadenas" taille={13} strokeWidth={2.4} />
        </span>
      )}
    </span>
  );
}

/** « Encore 3 gardes », dans l'unité du badge. */
export function resteDuBadge(p: Textes['p'], badge: EtatDUnBadge): string {
  switch (badge.unite) {
    case 'gardes':
      return badge.reste > 1
        ? p('Encore {n} gardes', { n: badge.reste })
        : p('Encore 1 garde');
    case 'reponses':
      return badge.reste > 1
        ? p('Encore {n} réponses rapides', { n: badge.reste })
        : p('Encore 1 réponse rapide');
    case 'avis':
      return badge.reste > 1
        ? p('Encore {n} avis à cinq étoiles', { n: badge.reste })
        : p('Encore 1 avis à cinq étoiles');
  }
}

export const ICONE_DE_LA_CATEGORIE: Record<CategorieDOffre, NomDIcone> = {
  securite: 'cadenas',
  equipement: 'velo',
  entretien: 'reglages',
  autre: 'cadeau',
};

/** Pourquoi un avantage ne s'échange pas, dit sans reproche. */
export function motifDuRefusDEchange(
  p: Textes['p'],
  motif: RefusDEchange | 'introuvable',
  manquants = 0,
): string {
  switch (motif) {
    case 'jamais_accueilli':
      return p('Les avantages s’ouvrent dès votre première garde accueillie.');
    case 'introuvable':
    case 'offre_indisponible':
      return p('Cet avantage n’est plus proposé.');
    case 'rupture':
      return p('Cet avantage est épuisé pour le moment.');
    case 'solde_insuffisant':
      return manquants > 1
        ? p('Il vous manque {n} points', { n: manquants })
        : p('Il vous manque 1 point');
  }
}

/** « 1 point », « 12 points ». */
export function enPoints(p: Textes['p'], n: number): string {
  return Math.abs(n) === 1 ? p('{n} point', { n }) : p('{n} points', { n });
}

/** « 1 garde », « 4 gardes ». */
export function enGardes(p: Textes['p'], n: number): string {
  return n === 1 ? p('{n} garde', { n }) : p('{n} gardes', { n });
}
