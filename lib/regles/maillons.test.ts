import { describe, expect, test } from 'vitest';

import {
  etatApresLaGarde,
  joursEntames,
  leSoldeSAffiche,
  listeDesEncombrantsCoherente,
  maillonsPourUneGarde,
  soldeDisponible,
} from './maillons';

function le(jour: string, heure = '09:00'): Date {
  return new Date(`2026-09-${jour}T${heure}:00Z`);
}

describe('un maillon remercie la place immobilisée, pas la valeur du vélo', () => {
  test('un vélo de ville gardé une journée vaut un maillon', () => {
    expect(
      maillonsPourUneGarde({
        debut: le('05', '09:00'),
        fin: le('05', '18:00'),
        typeVelo: 'Ville',
      }),
    ).toBe(1);
  });

  test('un vélo de ville gardé trois jours vaut trois maillons', () => {
    expect(
      maillonsPourUneGarde({
        debut: le('02', '09:00'),
        fin: le('05', '09:00'),
        typeVelo: 'Ville',
      }),
    ).toBe(3);
  });

  test('un cargo gardé deux jours vaut quatre maillons : il prend deux places', () => {
    expect(
      maillonsPourUneGarde({
        debut: le('08', '09:00'),
        fin: le('10', '09:00'),
        typeVelo: 'Cargo',
      }),
    ).toBe(4);
  });

  test('un vélo électrique ne vaut pas plus qu’un vélo de ville', () => {
    // Le remerciement suit l'encombrement, pas le prix du vélo.
    const meme = { debut: le('05', '09:00'), fin: le('05', '18:00') } as const;
    expect(maillonsPourUneGarde({ ...meme, typeVelo: 'Électrique' })).toBe(
      maillonsPourUneGarde({ ...meme, typeVelo: 'Ville' }),
    );
  });

  test('un tandem et une remorque comptent double, comme le cargo', () => {
    const deuxJours = { debut: le('08'), fin: le('10') } as const;
    expect(maillonsPourUneGarde({ ...deuxJours, typeVelo: 'Tandem' })).toBe(4);
    expect(
      maillonsPourUneGarde({ ...deuxJours, typeVelo: 'Avec remorque' }),
    ).toBe(4);
  });

  test('la liste des vélos encombrants ne contient que de vrais types', () => {
    expect(listeDesEncombrantsCoherente()).toBe(true);
  });
});

describe('un jour entamé est un jour dû', () => {
  test('deux heures de garde comptent pour un jour', () => {
    expect(joursEntames(le('05', '09:00'), le('05', '11:00'))).toBe(1);
  });

  test('vingt-cinq heures comptent pour deux jours', () => {
    expect(joursEntames(le('05', '09:00'), le('06', '10:00'))).toBe(2);
  });

  test('un créneau vide ne vaut rien', () => {
    expect(joursEntames(le('05', '09:00'), le('05', '09:00'))).toBe(0);
  });
});

describe('un maillon s’acquiert à la reprise, et se retient en cas de litige', () => {
  test('une garde en cours ne rapporte encore rien', () => {
    expect(etatApresLaGarde({ etat: 'en_cours', conteste: false })).toBeNull();
  });

  test('une garde terminée sans litige est acquise', () => {
    expect(etatApresLaGarde({ etat: 'termine', conteste: false })).toBe('acquis');
  });

  test('une garde contestée retient les maillons le temps qu’on regarde', () => {
    expect(etatApresLaGarde({ etat: 'termine', conteste: true })).toBe(
      'en_attente',
    );
  });

  test('on ne dépense que les maillons acquis', () => {
    expect(soldeDisponible({ acquis: 41, enAttente: 2 })).toBe(41);
  });
});

describe('règle 3 — un compteur n’est pas un classement', () => {
  test('un membre qui n’a jamais accueilli n’a pas de solde affiché', () => {
    // Pas un zéro en gris avec une barre de progression : l'absence de la
    // carte. Faire garder son vélo ne coûte rien et n'en consomme aucun.
    expect(leSoldeSAffiche(0)).toBe(false);
  });

  test('le solde apparaît dès la première garde accueillie', () => {
    expect(leSoldeSAffiche(1)).toBe(true);
  });
});
