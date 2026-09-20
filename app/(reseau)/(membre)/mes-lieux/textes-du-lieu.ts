import { NOMS_DE_QUARTIER } from '@/lib/contenu/quartiers';
import type { Textes } from '@/lib/i18n/langue';
import {
  ACCES,
  ANCRAGES,
  INTEMPERIES,
  SERVICES,
  VERROUILLAGES,
} from '@/lib/regles/caracteristiques';
import { TYPES_EMPLACEMENT_PRIVE } from '@/lib/regles/emplacements';
import { TYPES_VELO } from '@/lib/regles/velos';

/** Les listes fermées et les libellés du formulaire, traduits une fois. */
export function optionsEtTextesDuLieu(p: Textes['p']) {
  return {
    options: {
      types: TYPES_EMPLACEMENT_PRIVE.map((type) => [type, p(type)] as const),
      quartiers: NOMS_DE_QUARTIER,
      acces: ACCES.map((acces) => [acces, p(acces)] as const),
      verrouillages: Object.entries(VERROUILLAGES).map(([cle, libelle]) => [cle, p(libelle)] as const),
      intemperies: Object.entries(INTEMPERIES).map(([cle, libelle]) => [cle, p(libelle)] as const),
      ancrages: ANCRAGES.map((ancrage) => [ancrage, p(ancrage)] as const),
      velos: TYPES_VELO.map((velo) => [velo, p(velo)] as const),
      services: SERVICES.map((service) => [service, p(service)] as const),
    },
    textes: {
      type: p('Type d’espace'),
      adresse: p('Adresse exacte'),
      adresseAide: p(
        'Seul votre quartier est visible. L’adresse exacte n’est communiquée qu’après acceptation d’une demande.',
      ),
      quartier: p('Quartier le plus proche'),
      acces: p('Accès au lieu'),
      verrouillage: p('Fermeture'),
      intemperie: p('À l’abri de la pluie'),
      ancrage: p('Point d’attache'),
      capacite: p('Capacité'),
      moins: p('Un vélo de moins'),
      plus: p('Un vélo de plus'),
      velos: p('Vélos acceptés'),
      services: p('Services en plus (facultatif)'),
      precisions: p('Indications pour trouver le lieu (facultatif)'),
      precisionsAide: p('Visibles seulement après acceptation : sonnette, porte, étage…'),
      description: p('Votre présentation (facultatif)'),
      descriptionAide: p('Quelques mots sur vous et votre espace, visibles sur votre fiche.'),
      confidentialite: p(
        'Votre lieu apparaît dans une zone approximative. Votre identité vérifiée rassure les cyclistes.',
      ),
      envoyer: p('Étape suivante'),
      envoi: p('Enregistrement…'),
    },
  };
}
