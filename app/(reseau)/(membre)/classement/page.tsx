import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone } from '@/components/app/icone';
import { enGardes, enPoints } from '@/components/app/progression';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import {
  apparaitAuClassement,
  classement,
  type ClassementDeLaPeriode,
} from '@/lib/depot/progression';
import { textes, type Textes } from '@/lib/i18n/langue';
import { PERIODES_DU_CLASSEMENT, type LigneDuClassement } from '@/lib/regles/progression';
import { instantABruxelles } from '@/lib/temps';
import { exigerUnMembre } from '@/lib/session';

import { basculerLeClassement } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Top Bike Sitters') };
}

type Ligne = ClassementDeLaPeriode['lignes'][number];

function libelleDeLaPeriode(p: Textes['p'], langue: string, c: ClassementDeLaPeriode): string {
  const locale = langue === 'nl' ? 'nl-BE' : langue === 'en' ? 'en-GB' : 'fr-BE';
  const jour = (iso: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { timeZone: 'Europe/Brussels', ...options }).format(
      instantABruxelles(iso, '12:00')!,
    );
  if (c.periode === 'jour') {
    return p('Aujourd’hui, {date}', { date: jour(c.premierJour, { day: 'numeric', month: 'long' }) });
  }
  if (c.periode === 'semaine') {
    return p('Du {debut} au {fin}', {
      debut: jour(c.premierJour, { day: 'numeric' }),
      fin: jour(c.dernierJour, { day: 'numeric', month: 'long' }),
    });
  }
  const mois = jour(c.premierJour, { month: 'long', year: 'numeric' });
  return mois.charAt(0).toUpperCase() + mois.slice(1);
}

function Nom({ ligne, p }: { ligne: LigneDuClassement; p: Textes['p'] }) {
  return (
    <>
      {ligne.prenom} {ligne.initiale}.
      {ligne.verifie ? (
        <Icone nom="verifie" taille={15} className="texte-verifie" role="img" aria-label={p('Identité vérifiée')} />
      ) : null}
    </>
  );
}

function Details({ ligne, p }: { ligne: LigneDuClassement; p: Textes['p'] }) {
  const morceaux = [
    enGardes(p, ligne.gardes),
    ligne.note !== null ? `${ligne.note.toLocaleString('fr-BE', { maximumFractionDigits: 1 })} ★` : null,
    ligne.fiabilite !== null ? p('{n} % fiabilité', { n: ligne.fiabilite }) : null,
  ];
  return <>{morceaux.filter(Boolean).join(' · ')}</>;
}

function Podium({ lignes, p }: { lignes: Ligne[]; p: Textes['p'] }) {
  // Deuxième, premier, troisième : le premier au centre, comme sur un podium.
  const ordre = [lignes[1], lignes[0], lignes[2]].filter((l): l is Ligne => Boolean(l));
  return (
    <ol className="podium" style={{ listStyle: 'none', padding: 0 }}>
      {ordre.map((ligne) => (
        <li key={`${ligne.rang}-${ligne.prenom}-${ligne.points}`} className={ligne === lignes[0] ? 'podium-place premier' : 'podium-place'}>
          <span className="rang">
            <span className="lecteur">{p('Rang')} </span>
            {ligne.rang}
          </span>
          <span className="avatar-app" aria-hidden="true">
            {ligne.prenom.charAt(0)}
          </span>
          <strong>
            <Nom ligne={ligne} p={p} />
          </strong>
          {ligne.fiabilite !== null ? (
            <>
              <span className="podium-fiabilite">{ligne.fiabilite} %</span>
              <small>{p('fiabilité')}</small>
            </>
          ) : (
            <small>{enGardes(p, ligne.gardes)}</small>
          )}
          <span className="pastille">{enPoints(p, ligne.points)}</span>
          {ligne.estMoi ? <small>{p('C’est vous')}</small> : null}
        </li>
      ))}
    </ol>
  );
}

export default async function TopBikeSitters({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { p, langue } = await textes();
  const { periode: demande } = await searchParams;
  const periode = PERIODES_DU_CLASSEMENT.find((x) => x.cle === demande) ?? PERIODES_DU_CLASSEMENT[0];
  const [c, nonLues, apparait] = await Promise.all([
    classement(periode.cle, membre.id),
    nombreDeNotificationsNonLues(membre.id),
    apparaitAuClassement(membre.id),
  ]);
  const podium = c.lignes.length >= 3 ? c.lignes.slice(0, 3) : [];
  const suite = c.lignes.slice(podium.length);

  return (
    <main id="contenu">
      <EnTete p={p} notificationsNonLues={nonLues} retour="/progression" />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Top Bike Sitters')}</h1>

        <nav className="segments" aria-label={p('Période du classement')}>
          {PERIODES_DU_CLASSEMENT.map((x) => (
            <Link
              key={x.cle}
              href={x.cle === 'jour' ? '/classement' : `/classement?periode=${x.cle}`}
              aria-current={x.cle === periode.cle ? 'page' : undefined}
            >
              {p(x.titre)}
            </Link>
          ))}
        </nav>
        <p className="periode">
          <Icone nom="calendrier" taille={18} />
          {libelleDeLaPeriode(p, langue, c)}
        </p>

        {c.lignes.length === 0 ? (
          <div className="carte vide-liste" style={{ marginTop: 14 }}>
            <Icone nom="trophee" taille={32} className="texte-leger" />
            <strong>{p('Aucun membre n’apparaît au classement sur cette période.')}</strong>
            <span className="texte-doux">
              {p('Le classement se remplit à mesure que des gardes se terminent.')}
            </span>
          </div>
        ) : (
          <>
            {podium.length > 0 ? <Podium lignes={podium} p={p} /> : null}
            {suite.length > 0 ? (
            <ol className="liste" style={{ listStyle: 'none', padding: 0, marginTop: podium.length ? 0 : 14 }}>
              {suite.map((ligne, position) => (
                <li key={`${ligne.rang}-${position}`} className="ligne ligne-info">
                  <span className={ligne.estMoi ? 'rang moi' : 'rang'}>
                    <span className="lecteur">{p('Rang')} </span>
                    {ligne.rang}
                  </span>
                  <span className="avatar-app" aria-hidden="true" style={{ width: 40, height: 40, fontSize: 16 }}>
                    {ligne.prenom.charAt(0)}
                  </span>
                  <span className="ligne-texte">
                    <strong>
                      <Nom ligne={ligne} p={p} />
                    </strong>
                    <span>
                      <Details ligne={ligne} p={p} />
                    </span>
                  </span>
                  <span className="pastille">{enPoints(p, ligne.points)}</span>
                </li>
              ))}
            </ol>
            ) : null}
          </>
        )}

        {c.maPlace ? (
          <div className="encart solde-encart" style={{ marginTop: 12 }}>
            <span className="avatar-app" aria-hidden="true" style={{ width: 42, height: 42, background: 'var(--fond)' }}>
              <Icone nom="profil" taille={22} />
            </span>
            <span>
              <strong style={{ fontSize: 18 }}>
                {c.maPlace.rang === 1
                  ? p('Votre position : 1er')
                  : p('Votre position : {rang}e', { rang: c.maPlace.rang })}
              </strong>
              <Details ligne={c.maPlace} p={p} />
              {' · '}
              {enPoints(p, c.maPlace.points)}
            </span>
          </div>
        ) : apparait ? (
          <p className="petit texte-doux" style={{ marginTop: 12 }}>
            {p('Vous apparaîtrez ici dès votre prochaine garde terminée sur cette période.')}
          </p>
        ) : null}

        <form action={basculerLeClassement} className="carte interrupteur-demandes" style={{ marginTop: 12 }}>
          <input type="hidden" name="apparaitre" value={apparait ? 'non' : 'oui'} />
          <input type="hidden" name="periode" value={periode.cle} />
          <span className="ligne-texte">
            <strong>{p('Apparaître dans le classement')}</strong>
            <span>
              {apparait
                ? p('Votre prénom et vos points figurent dans le classement.')
                : p('Vous n’apparaissez pas dans le classement.')}
            </span>
          </span>
          <button
            type="submit"
            role="switch"
            aria-checked={apparait}
            aria-label={p('Apparaître dans le classement')}
            className="interrupteur"
          />
        </form>
        <p className="periode centre" style={{ justifyContent: 'center', marginTop: 10 }}>
          <Icone nom="cadenas" taille={16} />
          {p('Votre adresse reste confidentielle.')}
        </p>
      </div>
    </main>
  );
}
