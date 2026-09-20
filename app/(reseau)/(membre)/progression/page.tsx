import type { Metadata } from 'next';
import Link from 'next/link';

import { EnTete } from '@/components/app/en-tete';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { Anneau } from '@/components/app/progression';
import { nombreDEmplacements } from '@/lib/depot/emplacements';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { progressionDuMembre } from '@/lib/depot/progression';
import { textes } from '@/lib/i18n/langue';
import { POINTS_PAR_GARDE } from '@/lib/regles/maillons';
import { niveauPour, objectifsEnCours } from '@/lib/regles/progression';
import { exigerUnMembre } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Ma progression') };
}

export default async function Progression() {
  const membre = await exigerUnMembre();
  const { p } = await textes();
  const [progression, lieux, nonLues] = await Promise.all([
    progressionDuMembre(membre.id),
    nombreDEmplacements(membre.id),
    nombreDeNotificationsNonLues(membre.id),
  ]);

  // Faire garder son vélo ne rapporte ni ne coûte de points : sans lieu ni
  // garde accueillie, l'écran présente la démarche plutôt qu'un compteur à zéro.
  if (lieux === 0 && progression.activite.gardesTerminees === 0) {
    return (
      <main id="contenu">
        <EnTete p={p} notificationsNonLues={nonLues} />
        <div className="ecran-app">
          <h1 className="titre-ecran">{p('Ma progression')}</h1>
          <div className="carte vide-liste">
            <Icone nom="trophee" taille={34} className="texte-vert" />
            <strong>{p('Les points récompensent les gardes')}</strong>
            <span className="texte-doux">
              {p(
                'Chaque garde menée à terme chez vous rapporte au moins {n} points, à échanger contre des avantages.',
                { n: POINTS_PAR_GARDE },
              )}
            </span>
          </div>
          <div className="boutons" style={{ marginTop: 16 }}>
            <Link href="/devenir-bike-sitter" className="bouton plein">
              {p('Devenir Bike Sitter')}
              <Icone nom="chevron" taille={20} />
            </Link>
            <Link href="/progression/regles" className="bouton discret">
              {p('Comment fonctionnent les points ?')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const niveau = niveauPour(progression.pointsGagnes);
  const prochain = objectifsEnCours(progression.activite)[0] ?? null;
  const liens: [NomDIcone, string, string, string][] = [
    [
      'trophee',
      p('Mes badges'),
      '/progression/badges',
      p('Ce que vos gardes ont débloqué'),
    ],
    [
      'progression',
      p('Top Bike Sitters'),
      '/classement',
      p('Le classement du jour, de la semaine et du mois'),
    ],
    [
      'cadeau',
      p('Avantages'),
      '/catalogue',
      p('{n} points disponibles', { n: progression.solde.acquis }),
    ],
    [
      'document',
      p('Historique des points'),
      '/progression/historique',
      p('Gagnés, utilisés et en attente'),
    ],
  ];

  return (
    <main id="contenu">
      <EnTete p={p} notificationsNonLues={nonLues} />
      <div className="ecran-app ecran-large">
        <h1 className="titre-ecran">{p('Ma progression')}</h1>
        <span className="pastille niveau-pastille">
          <Icone nom="etoile" taille={15} plein />
          {p(niveau.actuel.titre)}
        </span>

        <div className="colonnes colonnes-egales">
          <section
            className="colonne panneau-progression"
            aria-label={p('Mes points')}
          >
            <Anneau avancement={niveau.avancement}>
              <strong>{progression.pointsGagnes}</strong>
              <span>{p('points')}</span>
              <small>
                {niveau.suivant
                  ? p('Plus que {n} points', { n: niveau.manquants })
                  : p('Vous avez atteint le plus haut niveau.')}
              </small>
            </Anneau>

            <div className="tuiles">
              <span className="tuile">
                <strong>{progression.activite.gardesTerminees}</strong>
                <span>{p('gardes')}</span>
                <Icone nom="velo" taille={20} className="texte-vert" />
              </span>
              <span className="tuile">
                <strong>{progression.cyclistesAides}</strong>
                <span>{p('cyclistes aidés')}</span>
                <Icone nom="utilisateurs" taille={20} className="texte-vert" />
              </span>
              <span className="tuile">
                <strong>
                  {progression.noteMoyenne !== null
                    ? progression.noteMoyenne.toLocaleString('fr-BE', {
                        maximumFractionDigits: 1,
                      })
                    : '—'}
                </strong>
                <span>{p('avis moyen')}</span>
                <Icone nom="etoile" taille={20} plein className="texte-vert" />
              </span>
            </div>
          </section>

          <section className="colonne">
            {prochain ? (
              <Link href="/progression/objectifs" className="carte objectif">
                <span className="ligne-icone" aria-hidden="true">
                  <Icone nom="trophee" taille={26} />
                </span>
                <span className="ligne-texte">
                  <strong>{p('Prochain objectif')}</strong>
                  <span>{p(prochain.description)}</span>
                </span>
                <span className="objectif-compte">
                  {prochain.avancement} / {prochain.objectif}
                </span>
                <span className="jauge" aria-hidden="true">
                  <span
                    style={{
                      width: `${(prochain.avancement / prochain.objectif) * 100}%`,
                    }}
                  />
                </span>
              </Link>
            ) : null}

            <div className="liste" style={{ marginTop: 12 }}>
              {liens.map(([icone, titre, href, detail]) => (
                <Link key={href} href={href} className="ligne">
                  <span className="ligne-icone" aria-hidden="true">
                    <Icone nom={icone} taille={24} />
                  </span>
                  <span className="ligne-texte">
                    <strong>{titre}</strong>
                    <span>{detail}</span>
                  </span>
                  <Icone nom="chevron" taille={20} className="texte-leger" />
                </Link>
              ))}
            </div>

            <Link href="/progression/regles" className="encart lien-encart">
              <Icone nom="velo" taille={26} />
              <span>
                {p('Chaque garde réalisée vous fait gagner des points !')}
              </span>
              <Icone nom="chevron" taille={20} />
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
