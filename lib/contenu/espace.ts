import type { Pictogramme } from '@/components/icone-caracteristique';

/**
 * La navigation de l'espace du membre, en un seul endroit.
 *
 * Elle est séparée de `navigation.ts` parce que les deux ne servent pas au
 * même moment : on ne lit pas la FAQ pendant qu'on répond à une demande. Elles
 * n'ont ni le même vocabulaire — ici on dit « mes » — ni le même ordre.
 *
 * L'ordre suit ce qu'on vient y faire, du plus fréquent au plus rare : on
 * regarde d'abord si quelque chose attend une réponse, puis on gère ses
 * emplacements, et on ne va sur son profil que de temps en temps.
 */

export type EntreeDEspace = {
  chemin: string;
  libelle: string;
  pictogramme: Pictogramme;
  /** Le nom du compteur qui s'affiche à côté, quand il y en a un. */
  compteur?: 'demandesAAnswerer' | 'gardesEnCours';
};

export const ESPACE_DU_MEMBRE: readonly EntreeDEspace[] = [
  { chemin: '/mon-compte', libelle: 'Tableau de bord', pictogramme: 'tableau' },
  {
    chemin: '/mes-stationnements',
    libelle: 'Mes stationnements',
    pictogramme: 'calendrier',
    compteur: 'demandesAAnswerer',
  },
  {
    chemin: '/mes-emplacements',
    libelle: 'Mes emplacements',
    pictogramme: 'prive',
  },
  { chemin: '/profil', libelle: 'Mon profil', pictogramme: 'compte' },
];

export const ESPACE_ANNEXE: readonly EntreeDEspace[] = [
  { chemin: '/catalogue', libelle: 'Le catalogue', pictogramme: 'etiquette' },
];

export const ESPACE_DU_MODERATEUR: readonly EntreeDEspace[] = [
  { chemin: '/moderation', libelle: 'Modération', pictogramme: 'identite' },
];
