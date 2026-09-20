import Link from 'next/link';

import { libelleDEtat } from '@/components/membre/garde';
import type { ProchaineGarde } from '@/lib/depot/accueil';
import type { Textes } from '@/lib/i18n/langue';
import { TON_DE_L_ETAT, type EtatDeGarde } from '@/lib/regles/garde';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';

import { Icone, type NomDIcone } from './icone';

/** Règle 6 : la teinte dit le sens, l'icône et le texte le disent aussi. */
const PASTILLE_DU_TON = {
  trust: ['', 'coche'],
  lamp: ['ambre', 'velo'],
  alert: ['rouge', 'croix'],
} as const satisfies Record<string, readonly [string, NomDIcone]>;

export function PastilleDEtat({
  t,
  etat,
}: {
  t: Textes['t'];
  etat: EtatDeGarde;
}) {
  const [classe, icone] = PASTILLE_DU_TON[TON_DE_L_ETAT[etat]];
  return (
    <span className={`pastille ${classe}`}>
      <Icone
        nom={etat === 'demande' ? 'horloge' : icone}
        taille={14}
        strokeWidth={2.4}
      />
      {libelleDEtat(t, etat)}
    </span>
  );
}

const JOURS_COURTS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
const MOIS = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

/** « Sam. 20 sept. · 14:00 – 18:00 », à l'heure de Bruxelles. */
export function dateDeGarde(p: Textes['p'], debut: Date, fin: Date): string {
  const jour = jourABruxelles(debut);
  const [annee, mois, date] = jour.split('-').map(Number) as [
    number,
    number,
    number,
  ];
  const semaine = new Date(Date.UTC(annee, mois - 1, date)).getUTCDay();
  const memeJour = jour === jourABruxelles(fin);
  const debutTexte = `${p(JOURS_COURTS[semaine]!)} ${date} ${p(MOIS[mois - 1]!)}`;
  return memeJour
    ? `${debutTexte} · ${heureABruxelles(debut)} – ${heureABruxelles(fin)}`
    : `${debutTexte} ${heureABruxelles(debut)} → ${jourABruxelles(fin).split('-').reverse().slice(0, 2).join('/')} ${heureABruxelles(fin)}`;
}

/** La garde telle que l'accueil et la liste des gardes la montrent. */
export function CarteDeGarde({
  t,
  p,
  garde,
}: {
  t: Textes['t'];
  p: Textes['p'];
  garde: ProchaineGarde;
}) {
  return (
    <Link href={`/gardes/${garde.id}`} className="carte carte-de-garde">
      <div className="vignette-app">
        {garde.aUnePhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/emplacements/${garde.reference}/photo/0`} alt="" />
        ) : (
          <Icone nom="maison" taille={34} />
        )}
      </div>
      <div className="carte-de-garde-corps">
        <strong>{dateDeGarde(p, garde.debut, garde.fin)}</strong>
        <span className="carte-de-garde-personne">
          <span className="avatar-app mini" aria-hidden="true">
            {garde.autrePrenom.charAt(0)}
          </span>
          {garde.autrePrenom} {garde.autreInitiale}.
          {garde.autreVerifie ? (
            <Icone
              nom="verifie"
              taille={16}
              className="texte-verifie"
              aria-label={p('Identité vérifiée')}
              role="img"
            />
          ) : null}
        </span>
        <PastilleDEtat t={t} etat={garde.etat} />
        <span className="carte-de-garde-detail">
          <Icone nom="velo" taille={16} />
          {garde.veloNom ?? p(garde.typeVelo)}
        </span>
        <span className="carte-de-garde-detail">
          <Icone nom="epingle" taille={16} />
          {p(garde.typeDEmplacement)} · {garde.quartier}
        </span>
      </div>
      <Icone nom="chevron" taille={20} className="texte-leger" />
    </Link>
  );
}
