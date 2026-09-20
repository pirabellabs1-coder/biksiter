import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { CarteDeGarde } from '@/components/app/garde';
import { Icone } from '@/components/app/icone';
import { gardesDuMembre } from '@/lib/depot/accueil';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { textes } from '@/lib/i18n/langue';
import {
  EXPIRATION_D_UNE_DEMANDE_HEURES,
  ONGLETS_DES_GARDES,
  ongletDeLEtat,
} from '@/lib/regles/garde';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Mes gardes') };
}

export default async function MesGardes({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const membre = await exigerUnMembre();
  const { t, p } = await textes();
  const { onglet: demande } = await searchParams;
  const [gardes, nonLues] = await Promise.all([
    gardesDuMembre(membre.id),
    nombreDeNotificationsNonLues(membre.id),
  ]);

  const onglet =
    ONGLETS_DES_GARDES.find((o) => o.cle === demande) ?? ONGLETS_DES_GARDES[0];
  const liste = gardes.filter((g) => ongletDeLEtat(g.etat) === onglet.cle);
  // À venir se lit dans l'ordre où les gardes arrivent ; le reste, du plus récent.
  if (onglet.cle === 'a-venir') {
    liste.sort(
      (a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime(),
    );
  }

  return (
    <main id="contenu">
      <EnTete p={p} notificationsNonLues={nonLues} />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Mes gardes')}</h1>
        <nav className="onglets-haut" aria-label={p('Mes gardes')}>
          {ONGLETS_DES_GARDES.map((o) => {
            const combien = gardes.filter(
              (g) => ongletDeLEtat(g.etat) === o.cle,
            ).length;
            return (
              <Link
                key={o.cle}
                href={`/gardes?onglet=${o.cle}`}
                aria-current={o.cle === onglet.cle ? 'page' : undefined}
              >
                {p(o.titre)}
                {combien > 0 &&
                o.cle !== 'terminees' &&
                o.cle !== 'annulees' ? (
                  <span className="compteur">{combien}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {liste.length === 0 ? (
          <div className="carte vide-liste">
            <Icone nom="calendrier" taille={30} />
            <strong>
              {onglet.cle === 'a-venir'
                ? p('Aucune autre garde prévue.')
                : p('Rien dans cette rubrique.')}
            </strong>
            <span>
              {p('Trouvez un Bike Sitter pour vos prochaines sorties.')}
            </span>
            <Link href="/recherche" className="bouton contour petit">
              {p('Trouver un Bike Sitter')}
            </Link>
          </div>
        ) : (
          <div className="pile grille-cartes">
            {liste.map((garde) => (
              <div key={garde.id}>
                <CarteDeGarde t={t} p={p} garde={garde} />
                {garde.etat === 'demande' ? (
                  <p className="petit texte-doux sous-carte">
                    {garde.role === 'bike_sitter'
                      ? p('À traiter · expire dans {n} h', {
                          n: heuresRestantes(garde.demandeLe),
                        })
                      : p('Expire dans {n} h sans réponse', {
                          n: heuresRestantes(garde.demandeLe),
                        })}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function heuresRestantes(demandeLe: Date): number {
  return Math.max(
    0,
    Math.ceil(
      EXPIRATION_D_UNE_DEMANDE_HEURES -
        (Date.now() - new Date(demandeLe).getTime()) / 3_600_000,
    ),
  );
}
