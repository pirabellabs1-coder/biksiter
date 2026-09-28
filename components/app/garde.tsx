import Link from 'next/link';

import { libelleDEtat } from '@/components/membre/garde';
import type { ProchaineGarde } from '@/lib/depot/accueil';
import type { Textes } from '@/lib/i18n/langue';
import { heureFrancaise } from '@/lib/regles/creneau';
import { TON_DE_L_ETAT, type EtatDeGarde } from '@/lib/regles/garde';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';

import { Avatar } from './avatar';
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

/** « Sam. 20 sept. · 14h00 – 16h00 », à l'heure de Bruxelles. */
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
  // Les heures au format des formulaires (10h00), et des espaces insécables
  // autour du tiret : « 14h00 – 16h00 » ne se coupe jamais en deux lignes.
  const de = heureFrancaise(heureABruxelles(debut));
  const a = heureFrancaise(heureABruxelles(fin));
  return memeJour
    ? `${debutTexte} · ${de}\u00a0–\u00a0${a}`
    : `${debutTexte} ${de}\u00a0→ ${jourABruxelles(fin).split('-').reverse().slice(0, 2).join('/')}\u00a0${a}`;
}

/** La garde telle que l'accueil et la liste des gardes la montrent. */
export function CarteDeGarde({
  t,
  p,
  garde,
  href = `/gardes/${garde.id}`,
  vignette = 'lieu',
}: {
  t: Textes['t'];
  p: Textes['p'];
  garde: ProchaineGarde;
  href?: string;
  /**
   * Le bike sitter connaît son propre lieu : sur ses demandes, la vignette
   * montre plutôt l'initiale du cycliste.
   */
  vignette?: 'lieu' | 'personne';
}) {
  return (
    <Link href={href} className="carte carte-de-garde">
      <div className={vignette === 'personne' ? 'vignette-app vignette-personne' : 'vignette-app'}>
        {vignette === 'personne' ? (
          <Avatar
            membreId={garde.autreId}
            prenom={garde.autrePrenom}
            version={garde.autrePhoto}
            taille={64}
          />
        ) : garde.aUnePhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/emplacements/${garde.reference}/photo/0`} alt="" />
        ) : (
          <Icone nom="maison" taille={34} />
        )}
      </div>
      <div className="carte-de-garde-corps">
        <strong>{dateDeGarde(p, garde.debut, garde.fin)}</strong>
        <span className="carte-de-garde-personne">
          {/* Le visage est déjà dans la vignette : pas de seconde initiale. */}
          {vignette === 'personne' ? null : (
            <Avatar
              membreId={garde.autreId}
              prenom={garde.autrePrenom}
              version={garde.autrePhoto}
              taille={22}
            />
          )}
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
