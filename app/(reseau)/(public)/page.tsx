import Link from 'next/link';

import { Icone, type NomDIcone } from '@/components/app/icone';
import { ApercuDeLApplication } from '@/components/site/apercu-application';
import { EnTeteDuSite } from '@/components/site/en-tete-du-site';
import { PiedPublic } from '@/components/site/pied-public';
import {
  chiffresDeLaCommunaute,
  zonesOuvertes,
} from '@/lib/depot/reseau-public';
import { textes } from '@/lib/i18n/langue';
import { EXPIRATION_D_UNE_DEMANDE_HEURES } from '@/lib/regles/garde';
import { INSCRIPTION_SUR_INVITATION } from '@/lib/regles/modules';
import { CHIFFRES_DU_CODE_DE_REMISE } from '@/lib/regles/remise';

/**
 * L'accueil du site public.
 *
 * C'est la vitrine, pas l'application : un en-tête de site, des sections, un
 * pied de page. Ce que la page montre du réseau est lu dans la base ; tant
 * qu'aucun emplacement n'est ouvert, la bande des chiffres se tait plutôt que
 * d'en inventer.
 */
export default async function Accueil() {
  const lesTextes = await textes();
  const { t, p } = lesTextes;
  const [zones, chiffres] = await Promise.all([
    zonesOuvertes(),
    chiffresDeLaCommunaute(),
  ]);
  const reseauOuvert = chiffres.emplacements > 0;

  const etapes: [string, string][] = [
    [
      p('Trouvez un emplacement'),
      p(
        'Cherchez près de votre destination : chaque fiche indique une zone approximative, les horaires et les vélos acceptés.',
      ),
    ],
    [
      p('Envoyez une demande'),
      p(
        'Le bike sitter répond dans les {heures} heures. Dès qu’il accepte, vous recevez l’adresse exacte.',
        { heures: EXPIRATION_D_UNE_DEMANDE_HEURES },
      ),
    ],
    [
      p('Déposez, puis récupérez'),
      p(
        'Quelques photos devant la porte, un code à {chiffres} chiffres dit à voix haute. Même chose au retour.',
        { chiffres: CHIFFRES_DU_CODE_DE_REMISE },
      ),
    ],
  ];

  const protections: [NomDIcone, string, string][] = [
    [
      'verifie',
      p('Identité vérifiée'),
      p(
        'Une personne de l’association vérifie chaque membre avant sa première garde.',
      ),
    ],
    [
      'cadenas',
      p('Adresse confidentielle'),
      p(
        'Une zone approximative sur la fiche. L’adresse exacte, après l’acceptation seulement.',
      ),
    ],
    [
      'photo',
      p('Photos et code'),
      p(
        'Le vélo change de mains devant la porte, photographié, avec un code dit à voix haute.',
      ),
    ],
    [
      'bouclier',
      p('Une équipe qui répond'),
      p(
        'Un problème se signale depuis la garde ; la modération reprend le dossier avec son historique.',
      ),
    ],
  ];

  const usages: [string, string][] = [
    [t('ld.w1'), t('ld.w1d')],
    [t('ld.w2'), t('ld.w2d')],
    [t('ld.w3'), t('ld.w3d')],
  ];

  const chiffresDuReseau: [string, string][] = [
    [
      String(zones.length),
      p(
        zones.length > 1
          ? 'zones ouvertes à Bruxelles'
          : 'zone ouverte à Bruxelles',
      ),
    ],
    [
      String(chiffres.emplacements),
      p(chiffres.emplacements > 1 ? 'emplacements' : 'emplacement'),
    ],
    [
      String(chiffres.stationnementsTermines),
      p(
        chiffres.stationnementsTermines > 1
          ? 'gardes terminées'
          : 'garde terminée',
      ),
    ],
    ['0 €', p('pour chaque garde')],
  ];

  return (
    <>
      <EnTeteDuSite p={p} />

      <main id="contenu" className="site-public">
        <section className="bande-heros" aria-labelledby="titre-accueil">
          <div className="contenu-public heros">
            <div className="heros-texte">
              <p className="surtitre-public">
                {p('Réseau d’entraide · Bruxelles')}
              </p>
              <h1 id="titre-accueil" className="titre-affiche">
                {p('Votre vélo n’est')} <em>{p('jamais seul.')}</em>
              </h1>
              <p className="chapeau-public">{t('ld.lead')}</p>
              <div className="actions-heros">
                <Link href="/bienvenue" className="bouton plein">
                  {p('Rejoindre le réseau')}
                  <Icone nom="chevron" taille={20} />
                </Link>
                <Link href="/comment-ca-marche" className="bouton contour">
                  {p('Comment ça marche')}
                </Link>
              </div>
              {INSCRIPTION_SUR_INVITATION ? (
                <p className="note-heros">
                  {p(
                    'Pendant le lancement, on entre sur invitation d’un membre.',
                  )}{' '}
                  <Link
                    href="/liste-attente"
                    className="lien-souligne texte-vert"
                  >
                    {p('Rejoindre la liste d’attente')}
                  </Link>
                </p>
              ) : null}
              <ul className="garanties">
                {[
                  p('Entièrement gratuit'),
                  p('Membres vérifiés'),
                  p('Espace privé et fermé'),
                ].map((garantie) => (
                  <li key={garantie}>
                    <Icone nom="coche" taille={18} strokeWidth={2.4} />
                    {garantie}
                  </li>
                ))}
              </ul>
            </div>

            <ApercuDeLApplication p={p} />
          </div>
        </section>

        {reseauOuvert ? (
          <section
            className="bande-chiffres"
            aria-label={p('Le réseau aujourd’hui')}
          >
            <dl className="contenu-public chiffres-reseau">
              {chiffresDuReseau.map(([valeur, libelle]) => (
                <div key={libelle}>
                  <dt>{libelle}</dt>
                  <dd>{valeur}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <div className="contenu-public">
          <section className="section-publique" aria-labelledby="titre-etapes">
            <div className="entete-de-section deux">
              <div>
                <p className="surtitre-public">{p('Comment ça marche')}</p>
                <h2 id="titre-etapes" className="titre-de-section">
                  {p('Trois gestes, et votre vélo est à l’abri.')}
                </h2>
              </div>
              <Link href="/comment-ca-marche" className="lien-de-section">
                {p('Voir le parcours complet')}
                <Icone nom="chevron" taille={18} />
              </Link>
            </div>
            <ol className="etapes-publiques">
              {etapes.map(([titre, texte], rang) => (
                <li key={titre}>
                  <span className="numero" aria-hidden="true">
                    {String(rang + 1).padStart(2, '0')}
                  </span>
                  <h3>{titre}</h3>
                  <p>{texte}</p>
                </li>
              ))}
            </ol>
          </section>

          <section
            className="section-publique"
            aria-labelledby="titre-protections"
          >
            <div className="entete-de-section deux">
              <div>
                <p className="surtitre-public">{p('Sécurité')}</p>
                <h2 id="titre-protections" className="titre-de-section">
                  {p('Ce qui permet d’ouvrir sa porte.')}
                </h2>
              </div>
              <Link href="/securite" className="lien-de-section">
                {p('Toutes les protections')}
                <Icone nom="chevron" taille={18} />
              </Link>
            </div>
            <ul className="protections">
              {protections.map(([icone, titre, texte]) => (
                <li key={titre} className="protection">
                  <Icone nom={icone} taille={26} />
                  <strong>{titre}</strong>
                  <span>{texte}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="section-publique" aria-labelledby="titre-usages">
            <div className="entete-de-section">
              <p className="surtitre-public">{t('ld.who')}</p>
              <h2 id="titre-usages" className="titre-de-section">
                {p('Le temps d’une course, ou de toute une journée.')}
              </h2>
            </div>
            <ul className="usages">
              {usages.map(([titre, texte], rang) => (
                <li key={titre}>
                  <span className="numero" aria-hidden="true">
                    {String(rang + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <strong>{titre}</strong>
                    <p>{texte}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="appel-public">
              <div>
                <h2>{t('ld.host')}</h2>
                <p>{t('ld.hostd')}</p>
              </div>
              <Link href="/bienvenue" className="bouton plein">
                {t('ld.hostc')}
                <Icone nom="chevron" taille={20} />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <PiedPublic {...lesTextes} />
    </>
  );
}
