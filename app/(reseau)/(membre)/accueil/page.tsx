import type { Metadata } from 'next';
import Link from 'next/link';

import { Avatar } from '@/components/app/avatar';
import { Icone, type NomDIcone } from '@/components/app/icone';
import { jourDuMois, moisAbrege } from '@/components/maquette/garde/dates';
import { PASTILLE_DE_L_ETAT } from '@/components/maquette/garde/etats';
import { DisponibleMaintenant } from '@/components/maquette/sitter/disponible-maintenant';
import { accueilDuBikeSitter, gardesDuMembre } from '@/lib/depot/accueil';
import {
  disponibiliteImmediateDuMembre,
  horairesDeMesLieuxPublies,
  lieuDuMembre,
  mesLieux,
} from '@/lib/depot/lieux';
import { heureFrancaise } from '@/lib/regles/creneau';
import { ouvertureImmediate } from '@/lib/regles/disponibilite-immediate';
import { delaiEnFrancais, minutesPourRepondre } from '@/lib/regles/garde';
import { exigerUnMembre } from '@/lib/session';
import { creneauCourt } from '@/lib/temps';

export const metadata: Metadata = { title: 'Espace Bike Sitter' };

/**
 * L'accueil du bike sitter.
 *
 * L'ordre suit l'urgence : d'abord les demandes qui attendent une réponse (un
 * délai court), puis la prochaine garde, les chiffres, et enfin les réglages
 * de l'accueil et la reconnaissance. Sans emplacement, l'écran explique
 * comment commencer au lieu d'aligner des compteurs à zéro.
 */
export default async function EspaceBikeSitter() {
  const membre = await exigerUnMembre();
  const maintenant = new Date();
  const [accueil, gardes, lieux, jusqua, horairesPublies] = await Promise.all([
    accueilDuBikeSitter(membre.id),
    gardesDuMembre(membre.id),
    mesLieux(membre.id),
    disponibiliteImmediateDuMembre(membre.id),
    horairesDeMesLieuxPublies(membre.id),
  ]);
  const ouverture = ouvertureImmediate(horairesPublies, maintenant);
  const premierLieu = lieux[0]
    ? await lieuDuMembre(membre.id, lieux[0].reference)
    : null;

  const demandes = gardes.filter(
    (garde) => garde.role === 'bike_sitter' && garde.etat === 'demande',
  );
  const prochaine = gardes
    .filter(
      (garde) =>
        garde.role === 'bike_sitter' &&
        [
          'accepte',
          'arrivee',
          'en_cours',
          'reprise_demandee',
          'litige',
        ].includes(garde.etat),
    )
    .at(-1);

  if (!premierLieu) {
    return (
      <main id="contenu" className="ecran">
        <header className="ecran-tete">
          <p className="kicker">Espace bike sitter</p>
          <h1>Bonjour {membre.prenom}</h1>
          <p className="ecran-intro">
            Proposez un emplacement pour recevoir vos premières demandes.
          </p>
        </header>
        <section className="carte-accueillir" aria-labelledby="titre-commencer">
          <h2 id="titre-commencer">Accueillir un vélo chez vous</h2>
          <p>
            Un garage, une cave ou une cour fermée suffit. Vous décrivez le
            lieu, vous ajoutez quelques photos et vous choisissez vos jours et
            vos heures. Dès que votre identité est vérifiée, votre emplacement
            apparaît dans les recherches. Chaque garde menée à terme vous
            rapporte des points.
          </p>
          <Link className="primary" href="/devenir-bike-sitter">
            Proposer un emplacement
          </Link>
        </section>
      </main>
    );
  }

  // Des horaires jamais saisis ne s'inventent pas : on invite à les choisir.
  const horaires =
    premierLieu.ouverture && premierLieu.fermeture
      ? `${heureFrancaise(premierLieu.ouverture)} – ${heureFrancaise(premierLieu.fermeture)}`
      : 'Horaires à choisir';

  const reconnaissance: {
    href: string;
    icone: NomDIcone;
    titre: string;
    valeur?: string;
  }[] = [
    {
      href: '/progression',
      icone: 'progression',
      titre: 'Progression et badges',
      valeur: `${accueil.points} pt${accueil.points > 1 ? 's' : ''}`,
    },
    { href: '/catalogue', icone: 'cadeau', titre: 'Catalogue des points' },
    { href: '/classement', icone: 'trophee', titre: 'Top Bike Sitters' },
    {
      href: `/membres/${membre.id}`,
      icone: 'profil',
      titre: 'Mon profil public',
    },
  ];

  return (
    <main id="contenu" className="ecran">
      <header className="ecran-tete">
        <p className="kicker">Espace bike sitter</p>
        <h1>Bonjour {membre.prenom}</h1>
        <p className="ecran-intro">
          {accueil.disponibleAujourdhui
            ? `Vous accueillez aujourd’hui, ${horaires}.`
            : 'Aucun accueil n’est prévu aujourd’hui.'}
        </p>
      </header>

      <section aria-labelledby="titre-demandes">
        <h2 className="titre-section" id="titre-demandes">
          Demandes à traiter
          {demandes.length > 0 ? (
            <span className="titre-compteur attente">{demandes.length}</span>
          ) : null}
        </h2>
        {demandes.length === 0 ? (
          <p className="prog-note">
            Aucune demande n’attend votre réponse. Vous serez prévenu dès qu’un
            cycliste vous écrira.
          </p>
        ) : (
          <ul className="pile-cartes" role="list">
            {demandes.map((demande) => (
              <li key={demande.id}>
                <Link
                  href={`/demande/${demande.id}`}
                  className="demande-a-traiter"
                >
                  <Avatar
                    membreId={demande.autreId}
                    prenom={demande.autrePrenom}
                    version={demande.autrePhoto}
                    taille={46}
                  />
                  <span className="gav-texte">
                    <strong>
                      {demande.autrePrenom} {demande.autreInitiale}.
                      {demande.autreVerifie ? (
                        <span className="tag ver">Identité vérifiée</span>
                      ) : null}
                    </strong>
                    <span>
                      {demande.veloNom ?? demande.typeVelo} ·{' '}
                      {creneauCourt(
                        new Date(demande.debut),
                        new Date(demande.fin),
                      )}
                    </span>
                    <span className="delai">
                      Réponse attendue dans{' '}
                      {delaiEnFrancais(
                        minutesPourRepondre(
                          new Date(demande.demandeLe),
                          new Date(demande.debut),
                          maintenant,
                        ),
                      )}
                    </span>
                  </span>
                  <Icone nom="chevron" taille={20} className="rangee-chevron" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titre-prochaine">
        <h2 className="titre-section" id="titre-prochaine">
          Prochaine garde
        </h2>
        {prochaine ? (
          <Link href={`/demande/${prochaine.id}`} className="garde-a-venir">
            <span className="gav-date" aria-hidden="true">
              <b>{jourDuMois(new Date(prochaine.debut))}</b>
              <span>{moisAbrege(new Date(prochaine.debut))}</span>
            </span>
            <span className="gav-texte">
              <span className={PASTILLE_DE_L_ETAT[prochaine.etat].pastille}>
                {PASTILLE_DE_L_ETAT[prochaine.etat].texte}
              </span>
              <strong>
                {prochaine.autrePrenom} {prochaine.autreInitiale}.
              </strong>
              <span>
                {prochaine.veloNom ?? prochaine.typeVelo} ·{' '}
                {creneauCourt(
                  new Date(prochaine.debut),
                  new Date(prochaine.fin),
                )}
              </span>
            </span>
            <Icone nom="chevron" taille={20} className="rangee-chevron" />
          </Link>
        ) : (
          <p className="prog-note">Aucune garde n’est prévue pour le moment.</p>
        )}
      </section>

      <section aria-labelledby="titre-chiffres">
        <h2 className="titre-section" id="titre-chiffres">
          Vos chiffres
        </h2>
        <div className="prog-stats">
          <div>
            <b data-solde>{accueil.points}</b>
            <span>point{accueil.points > 1 ? 's' : ''}</span>
          </div>
          <div>
            <b>{accueil.demandesEnAttente}</b>
            <span>
              demande{accueil.demandesEnAttente > 1 ? 's' : ''} en attente
            </span>
          </div>
          <div>
            <b>{accueil.gardesTerminees}</b>
            <span>
              garde{accueil.gardesTerminees > 1 ? 's' : ''} terminée
              {accueil.gardesTerminees > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </section>

      <section aria-labelledby="titre-accueil">
        <h2 className="titre-section" id="titre-accueil">
          Votre accueil
        </h2>
        <ul className="groupe" role="list">
          <li>
            <Link
              href={`/mes-lieux/${premierLieu.reference}/disponibilites`}
              className="rangee"
            >
              <span className="rangee-icone" aria-hidden="true">
                <Icone nom="horloge" taille={18} strokeWidth={2} />
              </span>
              <span className="rangee-texte">
                <strong>Jours et horaires</strong>
                <span>
                  {horaires} · jusqu’à {premierLieu.dureeMaxHeures} h d’affilée
                </span>
              </span>
              <Icone nom="chevron" taille={18} className="rangee-chevron" />
            </Link>
          </li>
          <li>
            <DisponibleMaintenant
              jusqua={jusqua ? jusqua.toISOString() : null}
              attente={
                // Un lieu en pause ou pas encore publié n'apparaît dans
                // aucune recherche : l'interrupteur attend sa publication.
                horairesPublies.length === 0
                  ? 'Possible dès que votre emplacement est en ligne.'
                  : ouverture.possible
                    ? null
                    : ouverture.des
                      ? `Possible à partir de ${heureFrancaise(ouverture.des)}, pendant vos horaires d’accueil.`
                      : 'Possible demain, pendant vos horaires d’accueil.'
              }
            />
          </li>
          <li>
            <Link
              href={`/mes-lieux/${premierLieu.reference}`}
              className="rangee"
            >
              <span className="rangee-icone" aria-hidden="true">
                <Icone nom="maison" taille={18} strokeWidth={2} />
              </span>
              <span className="rangee-texte">
                <strong>Mon emplacement</strong>
                <span>
                  {premierLieu.type} · {premierLieu.quartier} ·{' '}
                  {premierLieu.capacite} place
                  {premierLieu.capacite > 1 ? 's' : ''}
                </span>
              </span>
              <Icone nom="chevron" taille={18} className="rangee-chevron" />
            </Link>
          </li>
        </ul>
      </section>

      <section aria-labelledby="titre-reconnaissance">
        <h2 className="titre-section" id="titre-reconnaissance">
          Reconnaissance
        </h2>
        <ul className="groupe" role="list">
          {reconnaissance.map((r) => (
            <li key={r.href}>
              <Link href={r.href} className="rangee">
                <span className="rangee-icone" aria-hidden="true">
                  <Icone nom={r.icone} taille={18} strokeWidth={2} />
                </span>
                <span className="rangee-texte">
                  <strong>{r.titre}</strong>
                </span>
                {r.valeur ? (
                  <span className="rangee-valeur">{r.valeur}</span>
                ) : null}
                <Icone nom="chevron" taille={18} className="rangee-chevron" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
