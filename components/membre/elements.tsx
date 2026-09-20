import Link from 'next/link';

import type { Textes } from '@/lib/i18n/langue';
import type { ValeursDUnePhrase } from '@/lib/i18n/traduction';
import { libelleDuCreneau, type Creneau } from '@/lib/regles/creneau';
import { presence } from '@/lib/regles/notifications';
import { heureABruxelles, jourABruxelles } from '@/lib/temps';

/**
 * Les pièces qui reviennent d'un écran de l'espace membre à l'autre.
 */

type P = Textes['p'];

/** « Thomas R. » : le prénom et l'initiale, jamais le nom entier. */
export function nomPublic(prenom: string, initiale: string): string {
  return initiale ? `${prenom} ${initiale}.` : prenom;
}

/** Le créneau d'une garde, lu à l'heure de Bruxelles. */
export function creneauDeLaGarde(debut: Date, fin: Date): Creneau {
  return {
    jourDepot: jourABruxelles(debut),
    heureDepot: heureABruxelles(debut),
    jourReprise: jourABruxelles(fin),
    heureReprise: heureABruxelles(fin),
  };
}

export function texteDuCreneau(p: P, creneau: Creneau): string {
  const { texte, valeurs } = libelleDuCreneau(creneau);
  return p(texte, valeurs);
}

/** Une liste de motifs, dans un encart d'erreur. */
export function Motifs({
  p,
  motifs,
  id,
}: {
  p: P;
  motifs: readonly { texte: string; valeurs?: ValeursDUnePhrase }[];
  id?: string;
}) {
  if (motifs.length === 0) return null;
  return (
    <div id={id} className="banner alert" role="alert">
      {motifs.map((motif, rang) => (
        <span key={motif.texte + rang}>
          {rang > 0 ? <br /> : null}
          {p(motif.texte, motif.valeurs)}
        </span>
      ))}
    </div>
  );
}

/** Le point de présence, et « Vu il y a 2 h » quand on le demande. */
export function Presence({
  p,
  vuLe,
  avecLibelle = false,
}: {
  p: P;
  vuLe: Date | null;
  avecLibelle?: boolean;
}) {
  const etat = presence(vuLe ? new Date(vuLe) : null, new Date());
  if (!etat) return null;
  const point = (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: etat.enLigne ? 'var(--trust)' : 'var(--chalk-strong)',
        marginRight: 5,
      }}
    />
  );
  if (!avecLibelle) return point;
  return (
    <span
      className="t-xs"
      style={{ color: etat.enLigne ? 'var(--trust-deep)' : 'var(--slate)' }}
    >
      {point}
      {p(etat.texte, etat.valeurs)}
    </span>
  );
}

/**
 * Trois niveaux distincts, jamais confondus : qui est cette personne, ses
 * coordonnées, et si un de ses emplacements a été regardé par la modération.
 */
export function Pastilles({
  p,
  emailVerifie,
  telephoneVerifie,
  identiteVerifiee,
  bikeSitterVerifie,
}: {
  p: P;
  emailVerifie: boolean;
  telephoneVerifie: boolean;
  identiteVerifiee: boolean;
  bikeSitterVerifie: boolean;
}) {
  return (
    <div className="chips">
      {emailVerifie ? (
        <span className="pill ver">{p('E-mail vérifié')}</span>
      ) : null}
      {telephoneVerifie ? (
        <span className="pill ver">{p('Téléphone vérifié')}</span>
      ) : null}
      {identiteVerifiee ? (
        <span className="pill ver">{p('Identité vérifiée')}</span>
      ) : (
        <span className="pill plain">{p('Identité non vérifiée')}</span>
      )}
      {bikeSitterVerifie ? (
        <span className="pill ver">{p('Bike Sitter vérifié')}</span>
      ) : null}
    </div>
  );
}

/** « Dernière garde il y a 3 jours » : toujours approximatif. */
export function derniereActivite(
  p: P,
  derniereGarde: Date | null,
  aUnEmplacement: boolean,
): string {
  if (!derniereGarde) {
    return aUnEmplacement ? p("Nouveau — aucune garde pour l'instant") : '';
  }
  const heures = (Date.now() - new Date(derniereGarde).getTime()) / 3_600_000;
  if (heures < 1) return p('Dernière garde il y a moins d’une heure');
  if (heures < 24) {
    return p('Dernière garde il y a {n} h', { n: Math.floor(heures) });
  }
  const jours = Math.floor(heures / 24);
  if (jours < 7) return p('Dernière garde il y a {n} j', { n: jours });
  if (jours < 30) {
    return p('Dernière garde il y a {n} sem.', { n: Math.floor(jours / 7) });
  }
  return p('Dernière garde il y a {n} mois', {
    n: Math.max(1, Math.floor(jours / 30)),
  });
}

/** Une ligne d'emplacement : qui accueille, où, et quels vélos. */
export function CarteDEmplacement({
  p,
  t,
  emplacement,
  suffixe = '',
}: {
  p: P;
  t: Textes['t'];
  emplacement: {
    reference: string;
    prenom: string;
    initialeDuNom: string;
    type: string;
    quartier: string;
    capacite: number;
    velosAcceptes: readonly string[];
    vuLe: Date | null;
  };
  suffixe?: string;
}) {
  return (
    <Link
      href={`/emplacements/${emplacement.reference}${suffixe}`}
      className="card tap"
    >
      <div className="card-body">
        <div className="row">
          <div className="avatar" aria-hidden="true">
            {emplacement.prenom.charAt(0)}
          </div>
          <div className="grow">
            <p className="t-s strong">
              <Presence p={p} vuLe={emplacement.vuLe} />
              {p(emplacement.type)} ·{' '}
              {nomPublic(emplacement.prenom, emplacement.initialeDuNom)}
            </p>
            <p className="t-xs muted">
              {p('{n} vélos · {quartier}', {
                n: emplacement.capacite,
                quartier: emplacement.quartier,
              })}
            </p>
            <p className="t-xs muted">
              {t('sp.bikes')} :{' '}
              {emplacement.velosAcceptes.map((v) => p(v)).join(', ')}
            </p>
            <p className="t-xs" style={{ color: 'var(--trust-deep)' }}>
              {t('sp.free')}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Une étoile et une note, seulement à partir de trois avis. */
export function Note({ note }: { note: number | null }) {
  if (note === null) return null;
  return (
    <span className="muted t-xs" aria-label={`${note.toFixed(1)} / 5`}>
      {' '}
      ★ {note.toFixed(1)}
    </span>
  );
}
