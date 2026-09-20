import { describe, expect, test } from 'vitest';

import {
  CORRECTION_MAXIMALE,
  estUneIssueDeLitige,
  motifDeModerationValide,
  prioriteDuLitige,
  refusDeCorrection,
  tauxDeFinalisation,
  transitionDeSignalementPermise,
  variation,
} from './moderation';

describe('un geste de modération se motive', () => {
  test('un motif trop court ne suffit pas', () => {
    expect(motifDeModerationValide('ok')).toBe(false);
    expect(motifDeModerationValide('   abc   ')).toBe(false);
  });

  test('un motif de quelques mots est accepté', () => {
    expect(motifDeModerationValide('Erreur de calcul corrigée')).toBe(true);
  });
});

describe('corriger des points', () => {
  test('une correction de zéro point n’est pas une correction', () => {
    expect(refusDeCorrection(0, 20)).toBe('nulle');
    expect(refusDeCorrection(2.5, 20)).toBe('nulle');
  });

  test('une correction se limite à cent points d’un coup', () => {
    expect(refusDeCorrection(CORRECTION_MAXIMALE + 1, 0)).toBe('trop_grande');
    expect(refusDeCorrection(-CORRECTION_MAXIMALE, 200)).toBeNull();
  });

  test('un retrait ne fait jamais passer le solde sous zéro', () => {
    expect(refusDeCorrection(-30, 20)).toBe('solde_negatif');
    expect(refusDeCorrection(-20, 20)).toBeNull();
  });
});

describe('les litiges et les signalements', () => {
  test('un vélo non restitué est un litige prioritaire', () => {
    expect(prioriteDuLitige("Le vélo n'a pas été restitué")).toBe('haute');
    expect(prioriteDuLitige('Autre')).toBe('moyenne');
    expect(prioriteDuLitige(null)).toBe('moyenne');
  });

  test('seules les trois issues prévues tranchent un litige', () => {
    expect(estUneIssueDeLitige('annuler')).toBe(true);
    expect(estUneIssueDeLitige('supprimer')).toBe(false);
  });

  test('un signalement avance sans revenir en arrière', () => {
    expect(transitionDeSignalementPermise('ouvert', 'en_cours')).toBe(true);
    expect(transitionDeSignalementPermise('ouvert', 'traite')).toBe(true);
    expect(transitionDeSignalementPermise('traite', 'ouvert')).toBe(false);
    expect(transitionDeSignalementPermise('en_cours', 'en_cours')).toBe(false);
  });
});

describe('les statistiques de l’administration', () => {
  test('la variation se compare à la période précédente', () => {
    expect(variation(112, 100)).toBe(12);
    expect(variation(75, 100)).toBe(-25);
  });

  test('sans période précédente, pas de variation affichée', () => {
    expect(variation(12, 0)).toBeNull();
  });

  test('le taux de finalisation compte les gardes menées à terme', () => {
    expect(tauxDeFinalisation(49, 1)).toBe(98);
    expect(tauxDeFinalisation(0, 0)).toBeNull();
  });
});
