import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { Avatar } from '@/components/app/avatar';
import { detailDeLaGarde, type DetailDeGarde } from '@/lib/depot/gardes';
import { heureFrancaise } from '@/lib/regles/creneau';
import {
  ADRESSE_APRES_REPRISE_HEURES,
  delaiEnFrancais,
  minutesPourRepondre,
} from '@/lib/regles/garde';
import { exigerUnMembre } from '@/lib/session';
import { dePrenom } from '@/lib/texte/elision';
import {
  creneauEnFrancais,
  enJour,
  heureABruxelles,
  moisEtAnnee,
} from '@/lib/temps';

import { gesteDirect } from '../../gardes/[id]/actions';

/** « 14h00 », comme on le dit et comme la maquette l'écrit. */
function heure(instant: Date): string {
  return heureFrancaise(heureABruxelles(instant));
}

function dureeEnHeures(garde: DetailDeGarde): number {
  return Math.round(
    (new Date(garde.fin).getTime() - new Date(garde.debut).getTime()) / 3_600_000,
  );
}

/**
 * Une demande de garde, vue par celui qui doit répondre.
 *
 * Trois états, trois écrans de la maquette : la demande qui attend, la demande
 * acceptée, et le refus. L'état s'écrit en toutes lettres, jamais par la
 * seule couleur.
 */
export async function VueDeLaDemande({ reference }: { reference: string }) {
  const membre = await exigerUnMembre();
  const garde = await detailDeLaGarde(membre.id, reference);
  if (!garde) notFound();
  // Passé l'acceptation, la garde a sa propre page, qui suit chaque étape
  // pour les deux membres : l'écran « Demande acceptée » ne décrirait plus
  // ce qui se passe.
  // Le cycliste, lui, suit sa demande depuis la garde : les écrans qui
  // attendent une réponse ou l'annoncent s'adressent au bike sitter.
  const encoreOuverte = ['demande', 'accepte'].includes(garde.etat);
  // Une garde annulée après son acceptation (désistement, absence, litige)
  // se raconte sur sa propre page : ici, « annulée » veut dire « retirée
  // avant toute réponse ».
  const annuleeApresAcceptation =
    garde.etat === 'annule' &&
    garde.evenements.some((e) => e.etape === 'accepte');
  const close =
    ['refuse', 'annule', 'expire'].includes(garde.etat) &&
    !annuleeApresAcceptation;
  if ((!encoreOuverte && !close) || (encoreOuverte && garde.role !== 'bike_sitter')) {
    redirect(`/gardes/${garde.id}`);
  }
  const prenom = garde.autre.prenom;
  const debut = new Date(garde.debut);
  const fin = new Date(garde.fin);

  if (['refuse', 'annule', 'expire'].includes(garde.etat)) {
    // Trois fins possibles, deux points de vue : chacun lit ce qui s'est
    // passé pour lui, et ce qu'il peut faire ensuite.
    const sitter = garde.role === 'bike_sitter';
    const quand = `${enJour(debut)}, ${heure(debut)} → ${heure(fin)}`;
    const recit =
      garde.etat === 'refuse'
        ? sitter
          ? {
              etiquette: 'Demande déclinée',
              titre: 'Vous avez décliné cette demande',
              texte: `La demande ${dePrenom(prenom)} pour le ${quand} n’est pas retenue. Un message l’annonce à ${prenom}.`,
            }
          : {
              etiquette: 'Demande déclinée',
              titre: `${prenom} n’est pas disponible cette fois`,
              texte: `Votre demande pour le ${quand} n’a pas été acceptée. Aucun engagement n’a été pris de part et d’autre.`,
            }
        : garde.etat === 'expire'
          ? sitter
            ? {
                etiquette: 'Demande expirée',
                titre: 'Cette demande a expiré',
                texte: `Elle est arrivée à son terme sans réponse. Un message l’a annoncé à ${prenom}, qui peut en envoyer une autre.`,
              }
            : {
                etiquette: 'Demande expirée',
                titre: 'Votre demande a expiré',
                texte: `${prenom} n’a pas pu répondre à temps pour le ${quand}. Vous pouvez chercher un autre Bike Sitter pour ce créneau.`,
              }
          : sitter
            ? {
                etiquette: 'Demande retirée',
                titre: 'Cette demande a été retirée',
                texte: `${prenom} a retiré sa demande pour le ${quand}. Rien d’autre n’est attendu de vous.`,
              }
            : {
                etiquette: 'Demande retirée',
                titre: 'Vous avez retiré cette demande',
                texte: `Votre demande pour le ${quand} est retirée. Un message l’annonce à ${prenom}.`,
              };

    return (
      <main id="contenu" data-cote={sitter ? 'sitter' : 'cycliste'}>
        <div className="page page-etroite" id="refusee">
          <header className="page-tete">
            <span className="kicker kicker-rouge">{recit.etiquette}</span>
            <h1>{recit.titre}</h1>
            <p>{recit.texte}</p>
          </header>

          {garde.etat === 'refuse' && garde.motif ? (
            <section className="bloc">
              <h2>{sitter ? 'Votre réponse' : `Ce que ${prenom} a répondu`}</h2>
              <p className="message-membre">« {garde.motif} »</p>
            </section>
          ) : null}

          {sitter ? (
            <div className="actions-fin">
              <Link className="primary" href="/demandes">
                Voir mes demandes
              </Link>
            </div>
          ) : (
            <section className="bloc">
              <h2>Trouver un autre Bike Sitter</h2>
              <p className="gris">
                D’autres membres accueillent peut-être aux mêmes heures, près
                de votre destination.
              </p>
              <div className="actions-fin">
                <Link className="primary" href="/recherche">
                  Chercher sur ce créneau
                </Link>
                <Link className="outline" href="/gardes">
                  Mes gardes
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>
    );
  }


  if (garde.etat !== 'demande') {
    return (
      <main id="contenu" data-cote="sitter">
        <div className="dashboard-wrap" id="bsacceptee">
          <div className="ok-rond" aria-hidden="true">
            ✓
          </div>
          <h1>Demande acceptée</h1>
          <p className="bs-intro">
            {prenom} vient de recevoir votre réponse, avec votre adresse
            exacte, jusqu’à la fin de la garde.
          </p>

          <div className="dem-qui">
            <Avatar
              membreId={garde.autre.id}
              prenom={prenom}
              version={garde.autre.photo}
              taille={56}
            />
            <div>
              <b>
                {prenom} {garde.autre.initiale}.
              </b>
              <p>
                {garde.velo?.nom ?? garde.typeVelo} ·{' '}
                {creneauEnFrancais(debut, fin)}
              </p>
            </div>
          </div>

          <h2 className="prog-titre">D’ici {heure(debut)}</h2>
          <ul className="bs-liste">
            <li>
              <b>Libérez l’emplacement</b> — de quoi poser un{' '}
              {(garde.velo?.type ?? garde.typeVelo).toLowerCase()}.
            </li>
            <li>
              <b>Soyez là un peu avant</b> — le temps de descendre et d’ouvrir.
            </li>
            <li>
              <b>Préparez votre téléphone</b> — deux photos au dépôt, deux au
              retour.
            </li>
          </ul>

          <div className="deux-boutons">
            <Link className="primary" href={`/gardes/${garde.id}`}>
              Voir la garde
            </Link>
            <Link className="outline" href={`/membres/${garde.autre.id}`}>
              Revoir son profil
            </Link>
            <Link className="outline" href="/accueil">
              Retour à mon espace
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const restant = delaiEnFrancais(
    minutesPourRepondre(new Date(garde.demandeLe), debut, new Date()),
  );

  return (
    // Cet écran n'a de sens que du côté du bike sitter : on le dit au cadre,
    // pour que l'en-tête et la barre du bas passent dans ce rôle.
    <main id="contenu" data-cote="sitter">
      <div className="dashboard-wrap" id="bsdemande">
        <div className="delai-bandeau" role="status">
          Vous avez {restant} pour répondre. Sans réponse, la demande expire
          et {prenom} en est informé.
        </div>

        <h1>Nouvelle demande</h1>

        <div className="dem-qui">
          <Avatar
            membreId={garde.autre.id}
            prenom={prenom}
            version={garde.autre.photo}
            taille={56}
          />
          <div>
            <b>
              {prenom} {garde.autre.initiale}.
            </b>
            <p>
              {garde.autre.verifie ? (
                <>
                  <span className="tag ver">Identité vérifiée</span> ·{' '}
                </>
              ) : null}
              {garde.autre.gardes} garde{garde.autre.gardes > 1 ? 's' : ''} ·
              membre depuis {moisEtAnnee(garde.autre.depuis)}
            </p>
            <Link className="lien-profil" href={`/membres/${garde.autre.id}`}>
              Voir le profil {dePrenom(prenom)}
            </Link>
          </div>
        </div>

        <div className="champs lecture">
          <div>
            <span>Date et heure</span>
            <b>{creneauEnFrancais(debut, fin)}</b>
          </div>
          <div>
            <span>Durée</span>
            <b>{dureeEnHeures(garde)} heures</b>
          </div>
          <div>
            <span>Vélo</span>
            <b>{garde.velo?.nom ?? garde.typeVelo}</b>
          </div>
          <div>
            <span>Emplacement</span>
            <b>
              {garde.emplacement.type} · {garde.emplacement.quartier}
            </b>
          </div>
        </div>

        {garde.message ? (
          <div className="note-cycliste">
            <b>Message {dePrenom(prenom)}</b>
            <p>« {garde.message} »</p>
          </div>
        ) : null}

        <div className="bs-non">
          <b>Ce que vous acceptez</b>
          <ul>
            <li>
              Recevoir {prenom} à {heure(debut)} et lui rendre le vélo à{' '}
              {heure(fin)}
            </li>
            <li>Ranger le vélo dans votre emplacement fermé entre les deux</li>
            <li>Être joignable pendant la garde</li>
          </ul>
        </div>

        <p className="prog-note">
          Votre adresse n’est communiquée à {prenom} qu’après votre
          acceptation. Elle cesse de s’afficher {ADRESSE_APRES_REPRISE_HEURES}{' '}
          heures après la reprise du vélo.
        </p>

        {/* La décision tient en deux boutons côte à côte, toujours à portée
            du pouce : refuser à gauche, accepter — l'action attendue — à
            droite, plus large. */}
        <div className="barre-decision">
          <Link className="outline" href={`/gardes/${garde.id}/motif/refuser`}>
            Refuser
          </Link>
          <form action={gesteDirect}>
            <input type="hidden" name="id" value={garde.id} />
            <input type="hidden" name="geste" value="accepter" />
            <button type="submit" className="primary">
              Accepter la garde
            </button>
          </form>
        </div>
        <p className="prog-note">
          Refuser ne demande aucune justification et n’a aucune conséquence sur
          votre profil.
        </p>
      </div>
    </main>
  );
}
