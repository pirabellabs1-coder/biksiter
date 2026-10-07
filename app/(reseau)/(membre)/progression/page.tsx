import type { Metadata } from 'next';
import Link from 'next/link';

import { Icone } from '@/components/app/icone';
import { statistiquesDuBikeSitter } from '@/lib/depot/lieux';
import { nombreDeNotificationsNonLues } from '@/lib/depot/notifications';
import { classement, progressionDuMembre } from '@/lib/depot/progression';
import { textes } from '@/lib/i18n/langue';
import { modeCourant } from '@/lib/mode';
import {
  etatDesBadges,
  niveauPour,
  PERIODES_DU_CLASSEMENT,
  type PeriodeDuClassement,
} from '@/lib/regles/progression';
import { exigerUnMembre } from '@/lib/session';

import { basculerMonClassement } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Progression et points') };
}

/** Les écrans des points, reliés d'ici plutôt que perdus dans le site. */
const LIENS_DES_POINTS: readonly (readonly [string, string, string])[] = [
  [
    '/progression/badges',
    'Tous les badges',
    'Ceux que vous avez, et comment obtenir les autres',
  ],
  [
    '/progression/objectifs',
    'Vos objectifs',
    'Le prochain niveau et ce qui y mène',
  ],
  [
    '/progression/historique',
    'Historique des points',
    'Chaque garde terminée et ce qu’elle a rapporté',
  ],
  [
    '/classement',
    'Top Bike Sitters',
    'Le classement du jour, de la semaine et du mois',
  ],
  [
    '/progression/regles',
    'Comment fonctionnent les points',
    'Ce qui en rapporte, et quand',
  ],
];

const TITRE_DE_LA_PERIODE: Record<PeriodeDuClassement, string> = {
  jour: 'Aujourd’hui',
  semaine: 'Cette semaine',
  mois: 'Ce mois',
};

export default async function Progression({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const membre = await exigerUnMembre();
  const _mode = await modeCourant();
  const demandee = (await searchParams).periode;
  const periode: PeriodeDuClassement =
    PERIODES_DU_CLASSEMENT.find((p) => p.cle === demandee)?.cle ?? 'jour';

  const [progression, _nonLues, stats] = await Promise.all([
    progressionDuMembre(membre.id),
    nombreDeNotificationsNonLues(membre.id),
    statistiquesDuBikeSitter(membre.id),
  ]);
  const niveau = niveauPour(progression.pointsGagnes);
  const badges = etatDesBadges(progression.activite);
  const inscrit = progression.apparaitAuClassement;
  // On ne charge le classement que si on y figure : l'écran ne montre pas une
  // liste à quelqu'un qui n'a pas choisi d'en faire partie.
  const table = inscrit ? await classement(periode, membre.id) : null;

  return (
    <>
      <main className="dashboard-wrap" id="contenu">
        <span className="kicker">VOTRE PROGRESSION</span>
        <h1>{niveau.actuel.titre}</h1>

        <div className="prog-carte">
          <p className="prog-solde">
            <span>{progression.pointsGagnes}</span> points
          </p>
          <p className="prog-sous">
            {progression.activite.gardesTerminees} garde
            {progression.activite.gardesTerminees > 1 ? 's' : ''} terminée
            {progression.activite.gardesTerminees > 1 ? 's' : ''}
          </p>
          <div className="jauge">
            <span
              style={{ width: `${Math.round(niveau.avancement * 100)}%` }}
            />
          </div>
          <p className="prog-reste">
            {niveau.suivant
              ? `Plus que ${niveau.manquants} points avant « ${niveau.suivant.titre} »`
              : 'Vous avez atteint le plus haut niveau.'}
          </p>
        </div>

        <div className="prog-stats">
          <div>
            <b>{progression.cyclistesAides}</b>
            <span>
              cycliste{progression.cyclistesAides > 1 ? 's' : ''} aidé
              {progression.cyclistesAides > 1 ? 's' : ''}
            </span>
          </div>
          {/* La maquette comptait les heures de garde ; le dépôt ne les tient
              pas encore, il tient les gardes accueillies. */}
          <div>
            <b>{stats.gardesMenees}</b>
            <span>
              garde{stats.gardesMenees > 1 ? 's' : ''} accueillie
              {stats.gardesMenees > 1 ? 's' : ''}
            </span>
          </div>
          <div>
            <b>
              {progression.noteMoyenne !== null
                ? progression.noteMoyenne.toLocaleString('fr-BE', {
                    maximumFractionDigits: 1,
                  })
                : '—'}
            </b>
            <span>note moyenne</span>
          </div>
        </div>

        <h2 className="prog-titre">Vos badges</h2>
        <div className="badges">
          {badges.map((badge) => {
            const part =
              badge.objectif > 0
                ? Math.min(
                    100,
                    Math.round((badge.avancement / badge.objectif) * 100),
                  )
                : 0;
            return (
              <div
                className={badge.obtenu ? 'badge on' : 'badge'}
                key={badge.cle}
              >
                <span className="badge-medaille" aria-hidden="true">
                  <Icone
                    nom={badge.obtenu ? 'coche' : 'trophee'}
                    taille={20}
                    strokeWidth={2.2}
                  />
                </span>
                <b>{badge.titre}</b>
                <span>{badge.description}</span>
                {badge.obtenu ? (
                  <em>Obtenu</em>
                ) : (
                  <span className="badge-avancement">
                    <span className="badge-barre" aria-hidden="true">
                      <i style={{ width: `${part}%` }} />
                    </span>
                    <em className="att">
                      {badge.avancement} / {badge.objectif}
                    </em>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <h2 className="prog-titre">Le classement</h2>
        <div className="prog-carte prog-classement">
          <p>
            {inscrit
              ? 'Vous apparaissez dans le classement des Bike Sitters.'
              : 'Vous pouvez y apparaître si vous le souhaitez, et vous retirer à tout moment.'}
          </p>
          <p className="prog-note">
            Seuls ceux qui le souhaitent y apparaissent. Votre adresse n’y
            figure jamais, et votre solde exact reste privé.
          </p>
          <form action={basculerMonClassement}>
            <input
              type="hidden"
              name="apparaitre"
              value={inscrit ? 'non' : 'oui'}
            />
            <input type="hidden" name="periode" value={periode} />
            <button type="submit" className={inscrit ? 'outline' : 'primary'}>
              {inscrit ? 'Ne plus y apparaître' : 'Participer au classement'}
            </button>
          </form>
        </div>

        {table ? (
          <div>
            {/* Les mêmes segments que « Top Bike Sitters » : des liens, qui
                tiennent sans JavaScript. */}
            <nav className="segments" aria-label="Période du classement">
              {PERIODES_DU_CLASSEMENT.map(({ cle }) => (
                <Link
                  key={cle}
                  href={
                    cle === 'jour'
                      ? '/progression'
                      : `/progression?periode=${cle}`
                  }
                  aria-current={cle === periode ? 'page' : undefined}
                >
                  {TITRE_DE_LA_PERIODE[cle]}
                </Link>
              ))}
            </nav>
            <ol className="rang-liste">
              {table.lignes.map((ligne) => (
                <li
                  key={`${ligne.rang}-${ligne.prenom}-${ligne.initiale}`}
                  className={ligne.estMoi ? 'moi' : undefined}
                >
                  <span className="rang">{ligne.rang}</span>
                  <span className="ini" aria-hidden="true">
                    {`${ligne.prenom.charAt(0)}${ligne.initiale}`.toUpperCase()}
                  </span>
                  <span className="qui">
                    <b>
                      {ligne.estMoi
                        ? 'Vous'
                        : `${ligne.prenom} ${ligne.initiale}.`}
                    </b>
                    <span>
                      {niveauPour(ligne.points).actuel.titre}
                      {ligne.verifie ? ' · identité vérifiée' : ''}
                    </span>
                  </span>
                  <span className="chiffre">
                    {ligne.gardes} garde{ligne.gardes > 1 ? 's' : ''}
                    {ligne.note !== null
                      ? ` · ${ligne.note.toLocaleString('fr-BE', {
                          maximumFractionDigits: 1,
                        })}`
                      : ''}
                  </span>
                </li>
              ))}
            </ol>
            {table.lignes.length === 0 ? (
              <p className="prog-note">
                Personne n’a encore terminé de garde sur cette période.
              </p>
            ) : null}
            <p className="prog-note">
              Le classement tient compte des gardes menées à terme, des avis et
              des annulations. Il ne récompense pas le volume seul. Aucune
              adresse n’y apparaît, et les soldes de points restent privés.
            </p>
          </div>
        ) : null}

        <h2 className="prog-titre">Aller plus loin</h2>
        <ul className="groupe sans-icone" role="list">
          {LIENS_DES_POINTS.map(([href, titre, detail]) => (
            <li key={href}>
              <Link href={href} className="rangee">
                <span className="rangee-texte">
                  <strong>{titre}</strong>
                  <span>{detail}</span>
                </span>
                <Icone nom="chevron" taille={18} className="rangee-chevron" />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
