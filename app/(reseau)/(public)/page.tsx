import Link from 'next/link';

import { Icone } from '@/components/app/icone';
import { Recherche } from '@/components/maquette/recherche';
import { POINTS_PAR_GARDE, POINTS_PAR_JOUR_SUPPLEMENTAIRE } from '@/lib/regles/maillons';

/**
 * L'accueil du site public.
 *
 * La mise en page suit les maquettes définitives : la promesse et le champ de
 * recherche d'abord, puis le déroulement d'une garde, les moments de la ville,
 * ce qui protège, l'appel à devenir bike sitter, les points, et les questions.
 */

const ETAPES = [
  {
    rang: '01',
    titre: 'Cherchez',
    texte: 'Indiquez votre destination et vos horaires.',
    image: '/images/step-01.png',
    alt: 'Une cycliste regarde une carte sur son téléphone, épingle sur la destination et heure de dépôt affichée.',
  },
  {
    rang: '02',
    titre: 'Choisissez',
    texte: 'Comparez les bike sitters proches et leurs emplacements.',
    image: '/images/step-02.png',
    alt: 'Trois cartes de Bike Sitters proches avec leurs notes et leurs distances, tenues par un Bike Sitter.',
  },
  {
    rang: '03',
    titre: 'Demandez',
    texte: 'Envoyez une demande. Le Bike Sitter reste libre d’accepter.',
    image: '/images/step-03.png',
    alt: 'Une cycliste envoie une demande depuis son téléphone ; le Bike Sitter la reçoit en face, sur le sien.',
  },
  {
    rang: '04',
    titre: 'Déposez',
    texte: 'Code, photos et constat rapide avant la remise en main propre.',
    image: '/images/step-04.png',
    alt: 'Un dépôt devant une porte verte, entre deux plantes en pot.',
  },
  {
    rang: '05',
    titre: 'Profitez',
    texte:
      'Restaurant, rendez-vous ou shopping : faites ce que vous avez prévu.',
    image: '/images/step-05.png',
    alt: 'Une cycliste attablée à une terrasse, boisson en main pendant la garde.',
  },
  {
    rang: '06',
    titre: 'Reprenez',
    texte: 'Contrôlez au retour : nouvelles photos et garde terminée.',
    image: '/images/step-06.png',
    alt: 'Un cycliste reprend son vélo devant la maison, garde terminée.',
  },
] as const;

const QUESTIONS = [
  {
    question: 'Le Bike Sitter peut-il refuser ma demande ?',
    reponse:
      'Oui. Une demande n’est confirmée qu’après son acceptation. Vous recevez alors les informations nécessaires au dépôt.',
  },
  {
    question: 'L’adresse du Bike Sitter est-elle publique ?',
    reponse:
      'Non. Seule une zone approximative est visible avant la confirmation de la garde.',
  },
  {
    question: 'Que se passe-t-il si je suis en retard ?',
    reponse:
      'Prévenez depuis la messagerie de la garde. Le Bike Sitter peut accepter une prolongation selon sa disponibilité.',
  },
  {
    question: 'Quels vélos peuvent être gardés ?',
    reponse:
      'Vélos de ville, électriques, cargo, route, VTT et pliants, selon la capacité indiquée par chaque Bike Sitter.',
  },
] as const;

export default async function Accueil() {
  return (
    <>
      {/* Le lien d'évitement est posé par la mise en page publique ; ici on
          n'en pose que la cible. */}
      <span id="contenu" tabIndex={-1} />
      <main id="accueil">
        <section className="hero">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span /> Une garde humaine, près de votre destination
              </div>
              <h1>
                Allez où vous voulez à vélo.
                <br />
                Sans le laisser dans la rue.
              </h1>
              <p>
                Un Bike Sitter proche de votre destination garde votre vélo dans
                un emplacement privé fermé, puis vous le remet en main propre.
              </p>
            </div>
            <div className="hero-brand-visual">
              <div
                className="plan"
                role="img"
                aria-label="Plan de quartier : trois Bike Sitters à quatre, sept et neuf minutes à pied de votre destination"
              >
                <svg
                  viewBox="0 0 420 420"
                  aria-hidden="true"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <g
                    stroke="rgba(9,45,26,.09)"
                    strokeWidth="1.5"
                    fill="none"
                  >
                    <path d="M0 104 H420 M0 226 H420 M0 336 H420 M86 0 V420 M206 0 V420 M312 0 V420" />
                  </g>
                  <path
                    d="M-20 300 L200 120 L440 260"
                    stroke="rgba(36,107,253,.12)"
                    strokeWidth="26"
                    fill="none"
                  />
                  <circle cx="146" cy="158" r="62" fill="rgba(1,118,40,.13)" />
                  <circle cx="292" cy="150" r="52" fill="rgba(1,118,40,.10)" />
                  <circle cx="168" cy="306" r="58" fill="rgba(1,118,40,.11)" />
                </svg>
                <span className="ici">
                  <i />
                  <b>Votre destination</b>
                </span>
                <span className="min m1">4 min</span>
                <span className="min m2">7 min</span>
                <span className="min m3">9 min</span>
                <div className="floating-card card-two">
                  <i>✓</i>
                  <div>
                    <b>Identité vérifiée</b>
                    <span>Remise en main propre</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Recherche />

          <div className="trust-strip">
            <span>
              <Icone nom="cadenas" taille={16} strokeWidth={2} />
              <b>Emplacement privé et fermé</b>
            </span>
            <span>
              <Icone nom="cle" taille={16} strokeWidth={2} />
              <b>Remise en main propre</b>
            </span>
            <span className="verified">
              <Icone nom="bouclier" taille={16} strokeWidth={2} />
              <b>Identité vérifiée</b>
            </span>
            <span>
              <Icone nom="photo" taille={16} strokeWidth={2} />
              <b>Photos au dépôt et au retour</b>
            </span>
          </div>
        </section>

        <section className="section how" id="fonctionnement">
          <div className="parcours-tete">
            <p className="parcours-pastille">
              <span>Comment ça marche ?</span>
            </p>
            <h2>Une demande en quelques étapes</h2>
            <p className="parcours-intro">
              En seulement 6 étapes, vous pouvez trouver un Bike Sitter de
              confiance pour vos trajets, vos courses ou vos déplacements.
            </p>
          </div>

          <ol className="parcours">
            {ETAPES.map((etape) => (
              <li key={etape.rang} className="parcours-etape">
                <span className="parcours-num" aria-hidden="true">
                  {etape.rang}
                </span>
                <article className="parcours-carte">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    width={384}
                    height={216}
                    loading="lazy"
                    alt={etape.alt}
                    src={etape.image}
                  />
                  <h3>
                    <span className="vh">Étape {etape.rang} — </span>
                    {etape.titre}
                  </h3>
                  <p>{etape.texte}</p>
                </article>
                <span className="parcours-fleche" aria-hidden="true" />
              </li>
            ))}
          </ol>
        </section>

        <section className="section moments">
          <div>
            <h2>La ville reste à vous.</h2>
            <p>
              Pas de catégories à choisir. Indiquez simplement où vous allez.
            </p>
          </div>
          <div className="moment-grid">
            <article className="moment">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="moment-photo"
                loading="lazy"
                alt="Une terrasse de café, un vélo garé derrière"
                src="/images/maquette-img-7.webp"
              />
              <div className="moment-txt">
                <svg
                  className="moment-glyphe"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 9h11v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Z" />
                  <path d="M15 10h2.2a2.5 2.5 0 0 1 0 5H15" />
                  <path d="M6.5 6V3.5M10 6V3.5M13.5 6V3.5" />
                </svg>
                <b>Un déjeuner</b>
                <span>Le vélo à quelques minutes à pied</span>
              </div>
            </article>
            <article className="moment">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="moment-photo"
                loading="lazy"
                alt="Une spectatrice de dos devant une scène éclairée"
                src="/images/maquette-img-8.webp"
              />
              <div className="moment-txt">
                <svg
                  className="moment-glyphe"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18V6l10-2v12" />
                  <circle cx="6.5" cy="18" r="2.5" />
                  <circle cx="16.5" cy="16" r="2.5" />
                </svg>
                <b>Un concert</b>
                <span>Sans chercher un arceau toute la soirée</span>
              </div>
            </article>
            <article className="moment">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="moment-photo"
                loading="lazy"
                alt="Deux personnes en réunion autour d’une table"
                src="/images/maquette-img-9.webp"
              />
              <div className="moment-txt">
                <svg
                  className="moment-glyphe"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="5" width="18" height="11" rx="2" />
                  <path d="M2 20h20" />
                </svg>
                <b>Une réunion</b>
                <span>L’esprit libre pendant votre rendez-vous</span>
              </div>
            </article>
            <article className="moment">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="moment-photo"
                loading="lazy"
                alt="Une passante avec ses sacs dans une rue commerçante"
                src="/images/maquette-img-10.webp"
              />
              <div className="moment-txt">
                <svg
                  className="moment-glyphe"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 8h12l-1 12H7L6 8Z" />
                  <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                </svg>
                <b>Des courses</b>
                <span>Votre vélo et ses accessoires à l’abri</span>
              </div>
            </article>
          </div>
        </section>

        <section className="section security" id="securite">
          <div className="security-visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="visuel-securite"
              width={160}
              height={374}
              loading="lazy"
              alt="Un vélo rangé dans un emplacement privé fermé, le bike sitter présent sur place"
              src="/images/maquette-img-11.webp"
            />
            <div className="safe-pill">✓ Garde confirmée</div>
            <span className="visuel-marque">
              <span className="brand-mark" aria-hidden="true" />
              Bike Sitters
            </span>
          </div>
          <div className="security-copy">
            <h2>
              Une personne. Un emplacement fermé. Une remise en main propre.
            </h2>
            <p>
              Bike Sitters organise une garde entre personnes identifiées.
              L’adresse exacte n’est communiquée qu’après acceptation.
            </p>
            <ul>
              <li>
                <b>Identité vérifiée</b>
                <span>
                  Chaque membre est vérifié par une personne de l’association
                  avant sa première garde.
                </span>
              </li>
              <li>
                <b>État du vélo documenté</b>
                <span>Photos au dépôt et au retour.</span>
              </li>
              <li>
                <b>Codes de remise uniques</b>
                <span>Chaque étape est confirmée par les deux membres.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="become" id="devenir">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="visuel-devenir"
            width={381}
            height={400}
            loading="lazy"
            alt="Un Bike Sitter reçoit un vélo sur le pas de sa porte"
            src="/images/maquette-img-12.webp"
          />
          <div>
            <h2>Devenez Bike Sitter.</h2>
            <p>
              Gardez ponctuellement un vélo chez vous. Chaque garde menée à
              terme vous donne des points, échangeables contre un geste offert
              par un commerce du quartier.
            </p>
          </div>
          <Link className="white" href="/devenir-bike-sitter">
            Découvrir le rôle
          </Link>
        </section>

        <section className="section points-pub" id="points">
          <div className="pts-int">
            <span className="kicker">LE SYSTÈME DE POINTS</span>
            <h2>
              Garder un vélo ne rapporte pas d’argent. Ça rapporte autre chose.
            </h2>
            <p className="pts-intro">
              La garde est entièrement gratuite pour le cycliste. Le bike
              sitter, lui, reçoit des points à chaque garde menée à terme, et
              les utilise chez les commerces du quartier qui soutiennent le
              réseau.
            </p>
            <div className="pts-grille">
              <div className="pts-carte">
                <b>{POINTS_PAR_GARDE} points</b>
                <span>pour chaque garde menée à terme</span>
              </div>
              <div className="pts-carte">
                <b>+{POINTS_PAR_JOUR_SUPPLEMENTAIRE} point</b>
                <span>par jour entamé au-delà du premier</span>
              </div>
              <div className="pts-carte">
                <b>Gratuit</b>
                <span>pour le cycliste, à chaque garde</span>
              </div>
              <div className="pts-carte">
                <b>× 2</b>
                <span>
                  pour un vélo qui prend plus de place : cargo, longtail,
                  tandem ou avec remorque
                </span>
              </div>
            </div>
            <p className="pts-note">
              Les points n’ont aucune valeur monétaire, ne s’échangent pas entre
              membres et ne se revendent pas : ils servent à remercier, chez
              les commerces du quartier.
            </p>
            <Link className="outline" href="/catalogue">
              Voir le catalogue
            </Link>
          </div>
        </section>

        <section className="section faq" id="faq">
          <h2>Avant votre première garde.</h2>
          <div className="accordions">
            {QUESTIONS.map((entree) => (
              <details key={entree.question}>
                <summary>{entree.question}</summary>
                <p>{entree.reponse}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
