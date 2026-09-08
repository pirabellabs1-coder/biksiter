/**
 * Emplacements de démonstration.
 *
 * Ce fichier tient lieu de base de données tant que le schéma PostgreSQL /
 * PostGIS n’existe pas. Son nom dit ce qu’il est : personne ne doit le
 * confondre avec des données réelles, et il disparaîtra le jour où la table
 * `emplacement` sera là.
 *
 * Les adresses exactes y figurent volontairement : c’est ce qui permet aux
 * tests et au code d’exercer la règle 4 — elles ne sortent d’ici que par
 * `ficheVisible()`, jamais directement.
 */

import type { Emplacement } from '@/lib/regles/adresse';
import type {
  Acces,
  Ancrage,
  Intemperie,
  Service,
  Verrouillage,
} from '@/lib/regles/caracteristiques';
import type { TypeEmplacementPrive } from '@/lib/regles/emplacements';
import type { TypeVelo } from '@/lib/regles/velos';

export type EmplacementDeDemonstration = Emplacement & {
  type: TypeEmplacementPrive;
  capacite: number;
  verrouillage: Verrouillage;
  intemperie: Intemperie;
  acces: Acces;
  ancrage: Ancrage;
  services: readonly Service[];
  velosAcceptes: readonly TypeVelo[];
  /** Position de la tache sur la carte, en pourcentage. Remplacée par une
   *  géométrie PostGIS le jour où la carte sera réelle. */
  position: { x: number; y: number };
};

export const EMPLACEMENTS_DE_DEMONSTRATION: readonly EmplacementDeDemonstration[] =
  [
    {
      reference: 'bxl-central-1',
      prenomDuBikeSitter: 'Thomas',
      quartier: 'Bruxelles-Central',
      rayonDeLaZone: 350,
      adresseExacte: 'rue de l’Écuyer 8, 1000 Bruxelles',
      type: 'Garage privé fermé',
      capacite: 3,
      verrouillage: 'cle',
      intemperie: 'interieur',
      acces: 'Plain-pied',
      ancrage: 'Ancrage mural',
      services: ['Gonflage des pneus'],
      velosAcceptes: ['Ville', 'Route', 'VTC', 'Électrique', 'Cargo'],
      position: { x: 22, y: 30 },
    },
    {
      reference: 'bxl-flagey-1',
      prenomDuBikeSitter: 'Manoelle',
      quartier: 'Place Flagey',
      rayonDeLaZone: 400,
      adresseExacte: 'rue Malibran 12, 1050 Ixelles',
      type: 'Cour privée',
      capacite: 2,
      verrouillage: 'code',
      intemperie: 'partiel',
      acces: 'Quelques marches',
      ancrage: 'Arceau ou barre fixe',
      services: [],
      velosAcceptes: ['Ville', 'Pliant', 'VTC', 'Enfant'],
      position: { x: 56, y: 22 },
    },
    {
      reference: 'bxl-parvis-1',
      prenomDuBikeSitter: 'Yanis',
      quartier: 'Parvis de Saint-Gilles',
      rayonDeLaZone: 300,
      adresseExacte: 'rue de Bosnie 41, 1060 Saint-Gilles',
      type: 'Cave privative',
      capacite: 1,
      verrouillage: 'cle',
      intemperie: 'interieur',
      acces: 'Escalier',
      ancrage: 'Ancrage au sol',
      services: ['Petit outillage à disposition'],
      velosAcceptes: ['Ville', 'Route', 'Pliant', 'Gravel'],
      position: { x: 40, y: 60 },
    },
    {
      reference: 'bxl-nord-1',
      prenomDuBikeSitter: 'Aïcha',
      quartier: 'Gare du Nord',
      rayonDeLaZone: 450,
      adresseExacte: 'rue du Progrès 210, 1030 Schaerbeek',
      type: 'Box de garage individuel',
      capacite: 4,
      verrouillage: 'cle',
      intemperie: 'interieur',
      acces: 'Rampe',
      ancrage: 'Râtelier fixe',
      services: ['Recharge VAE', 'Gonflage des pneus'],
      velosAcceptes: [
        'Ville',
        'Route',
        'VTT',
        'VTC',
        'Électrique',
        'Cargo',
        'Longtail',
      ],
      position: { x: 70, y: 44 },
    },
  ];

export function emplacementParReference(
  reference: string,
): EmplacementDeDemonstration | undefined {
  return EMPLACEMENTS_DE_DEMONSTRATION.find(
    (emplacement) => emplacement.reference === reference,
  );
}
