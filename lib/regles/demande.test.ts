import { describe, expect, test } from 'vitest';

import {
  dansLesHoraires,
  horairesDuJour,
  joursReservables,
  libelleDesHoraires,
  type Horaires,
} from './creneau';
import {
  motifsDeRefusDeLaDemande,
  placesRestantes,
  type ContexteDeDemande,
} from './demande';

// Le lundi 14 septembre 2026.
const LUNDI = '2026-09-14';

const HORAIRES: Horaires = {
  jours: [1, 2, 3, 4, 5],
  ouverture: '07:30',
  fermeture: '20:00',
  parJour: { '5': { de: '08:00', a: '22:00' } },
  fermetures: ['2026-09-16'],
};

function contexte(modifs: Partial<ContexteDeDemande> = {}): ContexteDeDemande {
  return {
    maintenant: new Date('2026-09-14T06:00:00Z'),
    aujourdhui: LUNDI,
    membre: { id: 'lucas', verifie: true, suspendu: false },
    emplacement: {
      bikeSitterId: 'thomas',
      prenomDuBikeSitter: 'Thomas',
      horaires: HORAIRES,
      dureeMaxHeures: 8,
      dureeMaxJours: 1,
      velosAcceptes: ['Ville', 'Cargo'],
    },
    bloque: false,
    demandeEnAttente: false,
    tropDeDemandes: false,
    velo: { type: 'Ville' },
    veloDejaConfieChez: null,
    creneau: {
      jourDepot: LUNDI,
      heureDepot: '09:00',
      jourReprise: LUNDI,
      heureReprise: '17:00',
    },
    debut: new Date('2026-09-14T07:00:00Z'),
    placesRestantes: 2,
    bikeSitterOccupeAilleurs: false,
    ...modifs,
  };
}

const textes = (c: ContexteDeDemande) =>
  motifsDeRefusDeLaDemande(c).map((m) => m.texte);

describe('les horaires d’un emplacement', () => {
  test('un jour de fermeture exceptionnelle n’accueille pas', () => {
    expect(horairesDuJour(HORAIRES, '2026-09-16')).toBeNull();
  });

  test('un horaire particulier remplace l’horaire commun ce jour-là', () => {
    expect(horairesDuJour(HORAIRES, '2026-09-18')).toEqual({
      de: '08:00',
      a: '22:00',
    });
  });

  test('un emplacement sans jour d’accueil le dimanche ne s’y réserve pas', () => {
    expect(
      dansLesHoraires(HORAIRES, {
        jourDepot: '2026-09-13',
        heureDepot: '10:00',
        jourReprise: '2026-09-13',
        heureReprise: '12:00',
      }),
    ).toBe(false);
  });

  test('les jours aux mêmes heures se regroupent sur une ligne', () => {
    expect(libelleDesHoraires(HORAIRES)).toBe(
      'Lun, Mar, Mer, Jeu · 07:30 → 20:00   Ven · 08:00 → 22:00',
    );
  });

  test('on choisit un dépôt parmi les sept jours à venir', () => {
    const jours = joursReservables(LUNDI);
    expect(jours).toHaveLength(7);
    expect(jours[6]).toBe('2026-09-20');
  });
});

describe('une demande de garde', () => {
  test('une demande complète dans les horaires est acceptée', () => {
    expect(textes(contexte())).toEqual([]);
  });

  test('règle 2 — une identité non vérifiée ne demande pas de garde', () => {
    expect(
      textes(
        contexte({ membre: { id: 'lucas', verifie: false, suspendu: false } }),
      ),
    ).toContain("Vérifiez votre identité avant d'envoyer une demande.");
  });

  test('on ne demande pas une garde chez soi', () => {
    expect(
      textes(
        contexte({ membre: { id: 'thomas', verifie: true, suspendu: false } }),
      ),
    ).toContain("C'est votre propre emplacement.");
  });

  test('une garde dure au moins une heure', () => {
    const court = contexte({
      creneau: {
        jourDepot: LUNDI,
        heureDepot: '09:00',
        jourReprise: LUNDI,
        heureReprise: '09:45',
      },
    });
    expect(
      textes(court).some((t) =>
        t.startsWith('Une garde dure au moins une heure'),
      ),
    ).toBe(true);
  });

  test('on ne demande pas une garde plus de sept jours à l’avance', () => {
    const loin = contexte({
      creneau: {
        jourDepot: '2026-09-21',
        heureDepot: '09:00',
        jourReprise: '2026-09-21',
        heureReprise: '12:00',
      },
    });
    expect(textes(loin)).toContain(
      "Les demandes de garde s'ouvrent {jours} jours à l'avance.",
    );
  });

  test('un type de vélo que le bike sitter n’accueille pas est refusé', () => {
    expect(textes(contexte({ velo: { type: 'Tandem' } }))).toContain(
      "{prenom} n'accueille pas ce type de vélo.",
    );
  });

  test('un vélo déjà confié ailleurs sur le même créneau ne se confie pas deux fois', () => {
    expect(
      textes(contexte({ veloDejaConfieChez: 'Manoelle' })).some((t) =>
        t.startsWith('Ce vélo est déjà confié'),
      ),
    ).toBe(true);
  });

  test('au-delà de la durée acceptée dans la journée, la demande est refusée', () => {
    const longue = contexte({
      emplacement: { ...contexte().emplacement, dureeMaxHeures: 3 },
    });
    expect(textes(longue)).toContain(
      "{prenom} accueille un vélo jusqu'à {heures} heures d'affilée.",
    );
  });

  test('sans place libre sur le créneau, la demande est refusée', () => {
    expect(
      textes(contexte({ placesRestantes: 0 })).some((t) =>
        t.startsWith('Plus de place'),
      ),
    ).toBe(true);
  });

  test('une personne ne peut pas accueillir à deux endroits à la fois', () => {
    expect(
      textes(contexte({ bikeSitterOccupeAilleurs: true })).some((t) =>
        t.startsWith('Un vélo est déjà accueilli'),
      ),
    ).toBe(true);
  });
});

describe('les places restantes', () => {
  const h = (heure: number) => new Date(Date.UTC(2026, 8, 14, heure));

  test('une garde retenue occupe une place, marge comprise', () => {
    expect(
      placesRestantes(2, [{ debut: h(8), fin: h(10) }], {
        debut: h(10),
        fin: h(12),
      }),
    ).toBe(1);
  });

  test('une garde qui se termine bien avant ne compte pas', () => {
    expect(
      placesRestantes(1, [{ debut: h(6), fin: h(8) }], {
        debut: h(10),
        fin: h(12),
      }),
    ).toBe(1);
  });

  test('un blocage donne le même motif neutre, quel que soit celui qui a bloqué', () => {
    expect(motifsDeRefusDeLaDemande(contexte({ bloque: true }))).toContainEqual({
      texte: "Cet emplacement n'est pas disponible.",
    });
  });

  test('une seule demande en attente par emplacement', () => {
    const motifs = motifsDeRefusDeLaDemande(contexte({ demandeEnAttente: true }));
    expect(motifs.map((m) => m.texte)).toContain(
      'Vous avez déjà une demande en attente pour cet emplacement : {prenom} vous répondra.',
    );
  });

  test('les demandes envoyées sur un jour sont plafonnées', () => {
    const motifs = motifsDeRefusDeLaDemande(contexte({ tropDeDemandes: true }));
    expect(motifs).toHaveLength(1);
  });
});
