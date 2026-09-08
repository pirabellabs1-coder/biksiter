import type { Metadata } from 'next';
import Link from 'next/link';

import BarreDuMembre from '@/components/barre-du-membre';
import { emplacementsDuMembre } from '@/lib/depot/emplacements';
import { invitationsDisponibles } from '@/lib/depot/membres';
import {
  demandesRecues,
  mesStationnements,
} from '@/lib/depot/stationnements';
import { EMPLACEMENTS_PAR_MEMBRE } from '@/lib/regles/emplacements';
import { exigerUnMembre } from '@/lib/session';

export const metadata: Metadata = { title: 'Mon compte' };
export const dynamic = 'force-dynamic';

export default async function MonCompte() {
  const membre = await exigerUnMembre();

  const [emplacements, recues, miennes, invitations] = await Promise.all([
    emplacementsDuMembre(membre.id),
    demandesRecues(membre.id),
    mesStationnements(membre.id),
    invitationsDisponibles(membre.id),
  ]);

  const enAttente = recues.filter(
    (stationnement) => stationnement.etat === 'demande',
  ).length;

  return (
    <div className="page page--lecture">
      <BarreDuMembre membre={membre} page="compte" />

      <h1 className="titre-page">Bonjour {membre.prenom}</h1>

      {membre.verification === 'verifiee' ? null : (
        <div className="encart">
          <p>
            <strong>Votre identité n’est pas encore vérifiée.</strong> Tant
            qu’une personne ne l’a pas contrôlée, vous ne pouvez ni publier un
            emplacement ni demander un stationnement — c’est ce qui rend
            acceptable d’ouvrir sa porte à un inconnu.
          </p>
          <p>
            <Link href="/inscription/verification" className="lien">
              Voir où en est la vérification
            </Link>
          </p>
        </div>
      )}

      <div className="grille grille--deux">
        <article className="carte">
          <h2>Mes emplacements</h2>
          <p className="discret">
            {emplacements.length === 0
              ? 'Vous n’en proposez aucun pour l’instant.'
              : `${emplacements.length} sur ${EMPLACEMENTS_PAR_MEMBRE} possibles.`}
          </p>
          <Link
            href="/mes-emplacements"
            className="bouton bouton--discret bouton--large"
          >
            Les gérer
          </Link>
        </article>

        <article className="carte">
          <h2>Mes stationnements</h2>
          <p className="discret">
            {enAttente > 0
              ? `${enAttente} demande${enAttente > 1 ? 's' : ''} attend${enAttente > 1 ? 'ent' : ''} votre réponse.`
              : `${miennes.length} de mon côté, ${recues.length} reçue${recues.length > 1 ? 's' : ''}.`}
          </p>
          <Link
            href="/mes-stationnements"
            className="bouton bouton--discret bouton--large"
          >
            Les voir
          </Link>
        </article>
      </div>

      <h2 className="titre-section titre-section--aere">Mes invitations</h2>
      <p className="discret">
        Le réseau s’agrandit par recommandation : quelqu’un répond de la
        personne qu’il fait entrer. Une invitation vaut le plus dans votre
        propre quartier, puisque c’est ce qui fait ouvrir les quartiers un par
        un.
      </p>

      {invitations.length === 0 ? (
        <p className="discret">
          Vous n’avez pas d’invitation disponible pour l’instant. On en gagne
          une après chaque stationnement mené à bien.
        </p>
      ) : (
        <ul className="codes">
          {invitations.map((code) => (
            <li key={code}>
              <code>{code}</code>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
