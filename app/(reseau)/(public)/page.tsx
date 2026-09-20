import Link from 'next/link';

import { Icone } from '@/components/app/icone';
import { EnTeteDuSite } from '@/components/site/en-tete-du-site';
import { ParcoursIllustre } from '@/components/site/parcours-illustre';
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
 * Pensé comme une vitrine éditoriale : un visuel plein cadre au-dessus du
 * fil de la page, un récit qui déroule (comment ça marche, ce qui protège,
 * l'association, un dernier appel), et les chiffres du réseau lus en base
 * — jamais inventés.
 */
export default async function Accueil() {
  const lesTextes = await textes();
  const { p } = lesTextes;
  const [zones, chiffres] = await Promise.all([
    zonesOuvertes(),
    chiffresDeLaCommunaute(),
  ]);
  const reseauOuvert = chiffres.emplacements > 0;

  // Le nombre d'heures de la fenêtre de réponse et la longueur du code sont
  // repris dans le parcours illustré (composant client) via les phrases
  // localisées ; on les référence ici pour que la valeur reste centralisée.
  void EXPIRATION_D_UNE_DEMANDE_HEURES;
  void CHIFFRES_DU_CODE_DE_REMISE;

  return (
    <>
      <EnTeteDuSite p={p} />

      <main id="contenu" className="site-premium">
        {/* Hero en deux colonnes : le texte à gauche, la photo à droite. */}
        <section className="heros-duo" aria-labelledby="titre-accueil">
          <div className="contenu-public heros-duo-grille">
            <div className="heros-duo-texte">
              <p className="heros-duo-surtitre">
                <span className="point-vivant" aria-hidden="true" />
                {p('Réseau d’entraide entre cyclistes · Bruxelles')}
              </p>
              <h1 id="titre-accueil" className="heros-duo-titre">
                {p('Un endroit sûr pour votre vélo, ')}
                <em>{p('près de chez vous.')}</em>
              </h1>
              <p className="heros-duo-chapeau">
                {p(
                  'Bike Sitters met en relation les cyclistes bruxellois avec des particuliers qui accueillent gratuitement leur vélo dans un espace privé — le temps d’une course, d’un rendez-vous ou d’un week-end.',
                )}
              </p>
              <div className="heros-duo-actions">
                <Link href="/bienvenue" className="bouton plein grand">
                  {p('Rejoindre le réseau')}
                  <Icone nom="chevron" taille={22} />
                </Link>
                <Link href="/comment-ca-marche" className="bouton contour grand">
                  {p('Comment ça marche')}
                </Link>
              </div>
              {INSCRIPTION_SUR_INVITATION ? (
                <p className="heros-duo-note">
                  {p(
                    'Pendant le lancement, on entre sur invitation d’un membre.',
                  )}{' '}
                  <Link href="/liste-attente" className="lien-souligne">
                    {p('Rejoindre la liste d’attente')}
                  </Link>
                </p>
              ) : null}
              <ul className="heros-duo-garanties">
                {[
                  p('Entièrement gratuit'),
                  p('Membres vérifiés'),
                  p('Espace privé et fermé'),
                ].map((garantie) => (
                  <li key={garantie}>
                    <Icone nom="coche" taille={17} strokeWidth={2.6} />
                    {garantie}
                  </li>
                ))}
              </ul>
            </div>

            <div className="heros-duo-visuel">
              <div className="heros-duo-cadre">
                {/* Une cycliste du quotidien en ville : ni course, ni sport. */}
                <img
                  src="/images/accueil-hero.jpg"
                  alt=""
                  fetchPriority="high"
                />
              </div>
              {/* Deux pastilles posées sur la photo : ce qui rassure. */}
              <div className="heros-duo-pastille heros-duo-pastille-haut">
                <span className="heros-duo-pastille-icone bleu">
                  <Icone nom="verifie" taille={20} />
                </span>
                <span>
                  <strong>{p('Identité vérifiée')}</strong>
                  <small>{p('par une personne de l’association')}</small>
                </span>
              </div>
              <div className="heros-duo-pastille heros-duo-pastille-bas">
                <span className="heros-duo-pastille-icone vert">
                  <Icone nom="cle" taille={20} />
                </span>
                <span>
                  <strong>{p('Remise sécurisée')}</strong>
                  <small>{p('par un code communiqué oralement')}</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Parcours illustré : six vignettes qui apparaissent au scroll. */}
        <section
          className="section-editoriale bande-parcours"
          aria-labelledby="titre-parcours"
        >
          <div className="contenu-public">
            <div className="entete-editoriale">
              <p className="surtitre-editorial">{p('Comment ça marche')}</p>
              <h2 id="titre-parcours" className="titre-editorial">
                {p('Une garde en six étapes.')}
              </h2>
              <p className="chapeau-editorial">
                {p(
                  'De la recherche d’un emplacement à la reprise de votre vélo, tout se déroule depuis votre espace membre. Vous êtes accompagné à chaque étape.',
                )}
              </p>
            </div>
            <ParcoursIllustre
              etapes={[
                {
                  titre: p('Rechercher un emplacement'),
                  texte: p(
                    'Vous indiquez votre destination, la date et le vélo que vous souhaitez confier. Les emplacements disponibles vous sont proposés à proximité.',
                  ),
                },
                {
                  titre: p('Choisir un bike sitter'),
                  texte: p(
                    'Chaque fiche présente l’espace d’accueil, les horaires, les types de vélos acceptés et les avis des cyclistes précédents.',
                  ),
                },
                {
                  titre: p('Envoyer votre demande'),
                  texte: p(
                    'Vous envoyez une demande depuis la fiche. Le bike sitter dispose de quelques heures pour vous répondre.',
                  ),
                },
                {
                  titre: p('Déposer votre vélo'),
                  texte: p(
                    'À la porte, quelques photos suffisent à noter l’état du vélo. Vous communiquez ensuite un code à six chiffres pour marquer le début de la garde.',
                  ),
                },
                {
                  titre: p('Profiter de votre journée'),
                  texte: p(
                    'Votre vélo est en sécurité, vous êtes libre. Vous pouvez suivre l’avancement de la garde depuis votre espace à tout moment.',
                  ),
                },
                {
                  titre: p('Récupérer votre vélo'),
                  texte: p(
                    'Au retour, un nouveau constat photo termine la garde. Vous pouvez ensuite laisser un mot au bike sitter.',
                  ),
                },
              ]}
            />
          </div>
        </section>

        {/* Éditorial 2 colonnes, image à gauche : espace privé. */}
        <section
          className="section-editoriale sombre"
          aria-labelledby="titre-espace"
        >
          <div className="contenu-public duo-editorial">
            <div className="duo-image">
              <img
                src="/images/accueil-espace-prive.jpg"
                alt=""
                loading="lazy"
              />
            </div>
            <div className="duo-texte">
              <p className="surtitre-editorial">{p('Un espace privé')}</p>
              <h2 id="titre-espace" className="titre-editorial">
                {p('Votre vélo est accueilli dans un espace fermé.')}
              </h2>
              <p>
                {p(
                  'Chaque emplacement proposé sur Bike Sitters est un espace privé, appartenant au bike sitter et non partagé avec les autres résidents de l’immeuble. Les quatorze types d’espaces acceptés répondent tous à cette règle.',
                )}
              </p>
              <ul className="liste-a-puces">
                <li>{p('Garage privé fermé ou box individuel')}</li>
                <li>{p('Cave privative, pièce dédiée ou débarras')}</li>
                <li>{p('Cour, jardin, terrasse ou véranda close')}</li>
              </ul>
              <Link
                href="/securite"
                className="bouton plein bouton-editorial"
              >
                {p('Voir les protections')}
                <Icone nom="chevron" taille={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* Éditorial 2 colonnes, image à droite : vérification humaine. */}
        <section
          className="section-editoriale"
          aria-labelledby="titre-verification"
        >
          <div className="contenu-public duo-editorial inverse">
            <div className="duo-texte">
              <p className="surtitre-editorial">
                {p('Une vérification humaine')}
              </p>
              <h2 id="titre-verification" className="titre-editorial">
                {p('Chaque dossier est examiné par l’association.')}
              </h2>
              <p>
                {p(
                  'Avant qu’un membre puisse proposer ou réserver un emplacement, son identité et son espace d’accueil sont vérifiés par une personne de l’association. Cette étape prend en général quarante-huit heures.',
                )}
              </p>
              <ul className="liste-a-puces">
                <li>{p('Vérification de la pièce d’identité, qui est ensuite supprimée')}</li>
                <li>{p('L’adresse exacte n’est communiquée qu’après acceptation d’une demande')}</li>
                <li>
                  {p(
                    'Le vélo change de mains à l’aide d’un code à six chiffres, communiqué oralement',
                  )}
                </li>
              </ul>
              <Link
                href="/comment-ca-marche"
                className="bouton plein bouton-editorial"
              >
                {p('Comment ça marche')}
                <Icone nom="chevron" taille={20} />
              </Link>
            </div>
            <div className="duo-image">
              <img
                src="/images/accueil-verification.jpg"
                alt=""
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Chiffres serif géants. */}
        {reseauOuvert ? (
          <section className="chiffres-serif" aria-label={p('Le réseau')}>
            <div className="contenu-public">
              <p className="surtitre-editorial centre">
                {p('Le réseau aujourd’hui')}
              </p>
              <dl className="chiffres-serif-grille">
                <div>
                  <dd>{zones.length}</dd>
                  <dt>
                    {p(
                      zones.length > 1
                        ? 'zones ouvertes à Bruxelles'
                        : 'zone ouverte à Bruxelles',
                    )}
                  </dt>
                </div>
                <div>
                  <dd>{chiffres.emplacements}</dd>
                  <dt>
                    {p(
                      chiffres.emplacements > 1
                        ? 'emplacements ouverts'
                        : 'emplacement ouvert',
                    )}
                  </dt>
                </div>
                <div>
                  <dd>{chiffres.stationnementsTermines}</dd>
                  <dt>
                    {p(
                      chiffres.stationnementsTermines > 1
                        ? 'gardes menées'
                        : 'garde menée',
                    )}
                  </dt>
                </div>
                <div>
                  <dd className="chiffre-monetaire">0&nbsp;€</dd>
                  <dt>{p('le coût d’une garde, pour les deux membres')}</dt>
                </div>
              </dl>
            </div>
          </section>
        ) : null}

        {/* L'association — pas de fausse photo de fondateur : illustration. */}
        <section
          className="section-editoriale sombre"
          aria-labelledby="titre-association"
        >
          <div className="contenu-public duo-editorial">
            <div className="duo-illustration" aria-hidden="true">
              <IllustrationAssociation />
            </div>
            <div className="duo-texte">
              <p className="surtitre-editorial">{p('L’association')}</p>
              <h2 id="titre-association" className="titre-editorial">
                {p('Une association bruxelloise, sans but lucratif.')}
              </h2>
              <p>
                {p(
                  'Bike Sitters est une association en cours de constitution, portée par des cyclistes de Bruxelles. Son fonctionnement repose sur le bénévolat et les dons volontaires. Le service reste entièrement gratuit pour tous les membres.',
                )}
              </p>
              <div className="duo-actions">
                <Link href="/a-propos" className="bouton plein bouton-editorial">
                  {p('À propos de l’association')}
                  <Icone nom="chevron" taille={20} />
                </Link>
                <Link href="/soutenir" className="bouton contour bouton-editorial">
                  {p('Nous soutenir')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA final plein cadre. */}
        <section className="cta-final" aria-labelledby="titre-cta-final">
          <div className="contenu-public cta-final-corps">
            <h2 id="titre-cta-final" className="cta-final-titre">
              {p('Rejoindre Bike Sitters.')}
            </h2>
            <p className="cta-final-chapeau">
              {p(
                'Un compte unique vous permet de confier votre vélo à d’autres membres ou d’en accueillir un chez vous. Vous choisissez librement quand et à qui ouvrir votre espace.',
              )}
            </p>
            <div className="cta-final-actions">
              <Link href="/bienvenue" className="bouton plein grand">
                {p('Rejoindre le réseau')}
                <Icone nom="chevron" taille={22} />
              </Link>
              <Link href="/faq" className="bouton contour clair">
                {p('Questions fréquentes')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PiedPublic {...lesTextes} />
    </>
  );
}

/**
 * Une illustration SVG pour représenter l'association : pas de fausse photo
 * de fondateur (l'ASBL n'a pas encore de visage à afficher — voir la règle
 * `ASSOCIATION.fondateur = null`).
 */
function IllustrationAssociation() {
  return (
    <svg viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ciel" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e8f5ec" />
          <stop offset="1" stopColor="#c9e4d3" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="480" height="480" fill="url(#ciel)" rx="24" />
      {/* Maison, garage, vélo — trois formes qui disent Bruxelles. */}
      <g fill="#017628">
        <path d="M120 300 L120 220 L200 160 L280 220 L280 300 Z" opacity="0.15" />
        <path d="M280 300 L280 240 L340 200 L400 240 L400 300 Z" opacity="0.2" />
      </g>
      <g fill="none" stroke="#017628" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
        <path d="M60 300 L60 210 L200 120 L340 210 L340 300" />
        <rect x="150" y="240" width="60" height="60" />
        <path d="M340 300 L340 250 L410 210 L410 300" />
      </g>
      {/* Vélo devant. */}
      <g fill="none" stroke="#0b190f" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="180" cy="380" r="34" />
        <circle cx="300" cy="380" r="34" />
        <path d="M180 380 L230 320 L280 380 M230 320 L260 320 L300 380" />
        <path d="M230 320 L240 300 L260 300" />
        <path d="M180 380 L200 340" />
      </g>
      {/* Petit écusson bleu de vérification. */}
      <g transform="translate(346 90)">
        <path d="M0 8 L26 0 L52 8 L52 32 C52 46 40 58 26 62 C12 58 0 46 0 32 Z" fill="#1677E8" />
        <path
          d="M14 30 L22 38 L38 22"
          fill="none"
          stroke="#fff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
