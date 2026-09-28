import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { adresseIpDuVisiteur } from '@/lib/adresse-ip';
import { baseConfiguree } from '@/lib/bd/client';
import { invitationPresentee } from '@/lib/depot/membres';
import { nombreDeBikeSitters } from '@/lib/depot/reseau-public';
import { limiteDejaAtteinte, noterUneTentative } from '@/lib/depot/tentatives';
import { CONSULTATIONS_D_INVITATION } from '@/lib/regles/limites';
import { INSCRIPTION_SUR_INVITATION } from '@/lib/regles/modules';
import {
  BIKE_SITTERS_POUR_OUVRIR,
  avancementDeLOuverture,
} from '@/lib/regles/ouverture';

export const metadata: Metadata = { title: 'Rejoindre le réseau' };

/**
 * L'entrée dans le réseau, par le code d'une invitation.
 *
 * Le code est lu par un simple formulaire GET : la page se recharge avec la
 * personne qui invite, sans JavaScript, et rien n'est écrit tant que le compte
 * n'est pas créé.
 */
export default async function Invitation({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const code = ((await searchParams).code ?? '').trim().toUpperCase();

  // Quand le réseau est ouvert, l'écran « accès fermé » n'a plus de sens :
  // l'inscription se fait directement, le code suivant s'il y en a un.
  if (!INSCRIPTION_SUR_INVITATION) {
    redirect(
      code ? `/inscription?code=${encodeURIComponent(code)}` : '/inscription',
    );
  }

  let invitant: Awaited<ReturnType<typeof invitationPresentee>> = null;
  let tropDEssais = false;
  if (code && baseConfiguree()) {
    const adresse = await adresseIpDuVisiteur();
    tropDEssais = await limiteDejaAtteinte(CONSULTATIONS_D_INVITATION, adresse);
    if (!tropDEssais) {
      await noterUneTentative('consultation_invitation', adresse);
      invitant = await invitationPresentee(code);
    }
  }
  const codeRefuse = Boolean(code) && !invitant && !tropDEssais;

  // La jauge de lancement dit où en est le quartier, pour de vrai.
  const bikeSitters = await nombreDeBikeSitters();
  const avancement = avancementDeLOuverture(bikeSitters);

  return (
    <main className="page page-etroite" id="contenu">
      <header className="page-tete">
        <span className="kicker">ACCÈS FERMÉ</span>
        <h1>On n’entre que sur invitation.</h1>
        <p>
          Pendant les deux premiers mois, chaque nouveau membre est invité par
          quelqu’un qui est déjà là. Ce n’est pas une liste d’attente
          marketing : c’est la seule façon de savoir qui garde les vélos du
          quartier.
        </p>
      </header>

      <section className="bloc">
        <h2>Pourquoi fermé</h2>
        <ul className="liste-nette">
          <li>
            <b>Parce qu’on se porte garant.</b> Celui qui invite répond un peu
            de la personne qu’il fait entrer. Ça change tout sur la confiance.
          </li>
          <li>
            <b>Parce que la densité prime.</b> Vingt Bike Sitters dans un rayon
            de six cents mètres valent mieux que deux cents dispersés dans la
            ville.
          </li>
          <li>
            <b>Parce qu’on visite chaque emplacement.</b> À vingt candidatures
            par semaine, c’est possible. À deux cents, non.
          </li>
        </ul>
      </section>

      <section className="bloc">
        <h2>Vous avez un code</h2>
        <form className="deux-ligne" action="/invitation" method="get">
          <label className="champ">
            <span>Code d’invitation</span>
            <input
              type="text"
              name="code"
              defaultValue={code}
              placeholder="FLAGEY-7K2M"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-invalid={codeRefuse || undefined}
              aria-describedby={
                codeRefuse || tropDEssais ? 'code-erreur' : undefined
              }
              required
            />
          </label>
          <button type="submit" className="bleu">
            Vérifier le code
          </button>
        </form>

        {tropDEssais ? (
          <p className="notice" id="code-erreur" role="alert">
            Beaucoup de codes ont été essayés depuis cette connexion. Vous
            pourrez réessayer dans une heure.
          </p>
        ) : codeRefuse ? (
          <p className="notice" id="code-erreur" role="alert">
            Ce code d’invitation n’existe pas, ou il a déjà servi. Vérifiez
            qu’il est recopié tel quel, par exemple FLAGEY-7K2M.
          </p>
        ) : null}

        {invitant ? (
          <div className="actions-fin">
            <Link
              className="bleu"
              href={`/inscription?code=${encodeURIComponent(code)}`}
            >
              {invitant.prenom} vous invite : continuer
            </Link>
          </div>
        ) : null}

        <p className="notice">
          Un code ressemble à FLAGEY-7K2M. Il vous a été envoyé par la personne
          qui vous invite, et il ne sert qu’une fois.
        </p>
      </section>

      <section className="bloc">
        <h2>Vous n’en avez pas</h2>
        <p>
          Laissez votre adresse : vous recevez un e-mail à l’ouverture de votre
          quartier, et pas avant. Aucune autre utilisation, aucun autre envoi.
        </p>
        <form className="deux-ligne" action="/liste-attente" method="get">
          <label className="champ">
            <span>Adresse e-mail</span>
            <input
              type="email"
              name="email"
              placeholder="vous@exemple.be"
              autoComplete="email"
              required
            />
          </label>
          <button type="submit" className="outline">
            Me prévenir
          </button>
        </form>
        <div className="jauge-invit">
          <span style={{ width: `${avancement}%` }} />
        </div>
        <p className="mention">
          <b>
            {bikeSitters} Bike Sitter{bikeSitters > 1 ? 's' : ''} sur{' '}
            {BIKE_SITTERS_POUR_OUVRIR}
          </b>{' '}
          dans le rayon de lancement. Les invitations côté cycliste s’ouvriront
          au {BIKE_SITTERS_POUR_OUVRIR}ᵉ.
        </p>
      </section>

      <section className="bloc">
        <h2>Vous pouvez entrer autrement</h2>
        <p>
          Une candidature de Bike Sitter n’a pas besoin de code : si vous avez
          un garage, une cave ou une cour fermée dans le quartier, vous êtes
          exactement ce qui manque.
        </p>
        <div className="actions-fin">
          <Link className="bleu" href="/devenir-bike-sitter">
            Proposer un emplacement
          </Link>
          <Link className="outline" href="/a-propos">
            Qui nous sommes
          </Link>
        </div>
      </section>
    </main>
  );
}
