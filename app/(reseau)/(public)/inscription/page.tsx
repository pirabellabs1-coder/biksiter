import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { FormulaireDInscription } from '@/components/maquette/compte/formulaire-d-inscription';
import { adresseIpDuVisiteur } from '@/lib/adresse-ip';
import { baseConfiguree } from '@/lib/bd/client';
import { invitationPresentee } from '@/lib/depot/membres';
import { limiteDejaAtteinte, noterUneTentative } from '@/lib/depot/tentatives';
import { textes } from '@/lib/i18n/langue';
import { CONSULTATIONS_D_INVITATION } from '@/lib/regles/limites';
import { INSCRIPTION_SUR_INVITATION } from '@/lib/regles/modules';
import { membreConnecte } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Créer votre compte') };
}

/** Première étape de l'inscription : le compte. */
export default async function Inscription({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  if (await membreConnecte()) {
    redirect('/inscription/telephone');
  }

  const code = ((await searchParams).code ?? '').trim().toUpperCase();
  // Un code dans l'adresse dit qui invite : chaque consultation compte, pour
  // qu'on ne puisse pas essayer des codes au hasard jusqu'à en trouver un.
  let invitation: Awaited<ReturnType<typeof invitationPresentee>> = null;
  let tropDEssais = false;
  if (code && baseConfiguree()) {
    const adresse = await adresseIpDuVisiteur();
    tropDEssais = await limiteDejaAtteinte(CONSULTATIONS_D_INVITATION, adresse);
    if (!tropDEssais) {
      await noterUneTentative('consultation_invitation', adresse);
      invitation = await invitationPresentee(code);
    }
  }

  // Pendant le lancement, on n'arrive ici qu'avec une invitation valable :
  // sans elle, l'écran d'invitation explique ce qui manque.
  if (INSCRIPTION_SUR_INVITATION && baseConfiguree() && !invitation) {
    redirect(
      code ? `/invitation?code=${encodeURIComponent(code)}` : '/invitation',
    );
  }
  // Un lien dont le code a déjà servi ne pré-remplit rien : le code serait
  // refusé à l'envoi, après que tout a été saisi.
  const codeValable = invitation ? code : '';

  return (
    <>
      <main className="page page-etroite" id="contenu">
        <header className="page-tete">
          <span className="kicker">INSCRIPTION</span>
          <h1>Créer votre compte</h1>
          <p>
            Trois minutes, et vous pouvez chercher un Bike Sitter. Devenir Bike
            Sitter vous-même se fait plus tard, quand vous le voulez.
          </p>
        </header>

        {invitation ? (
          <div className="invitation-recue">
            <span className="invitation-initiale" aria-hidden="true">
              {invitation.prenom.slice(0, 1)}
            </span>
            <p>
              <strong>{invitation.prenom} vous invite sur Bike Sitters.</strong>
              <span>
                Membre depuis {invitation.depuis}
                {invitation.quartier ? ` · ${invitation.quartier}` : ''}
              </span>
            </p>
            {invitation.identiteVerifiee ? (
              <span className="tag ver">Identité vérifiée</span>
            ) : null}
          </div>
        ) : tropDEssais ? (
          <p className="encart-doux">
            Plusieurs codes ont été essayés depuis cette connexion. Vous pouvez
            créer votre compte sans code, ou revenir avec votre lien dans une
            heure.
          </p>
        ) : code ? (
          <p className="encart-doux">
            Ce lien d’invitation a déjà servi, ou il n’est plus valable. Vous
            pouvez tout de même créer votre compte : l’inscription est ouverte
            à tous.
          </p>
        ) : null}

        <ol className="jalons">
          <li className="fait">
            <b>1</b>Votre compte
          </li>
          <li>
            <b>2</b>Votre téléphone
          </li>
          <li>
            <b>3</b>Votre identité
          </li>
        </ol>

        <FormulaireDInscription
          code={codeValable}
          codeObligatoire={INSCRIPTION_SUR_INVITATION}
        />

        <section className="bloc">
          <h2>Ensuite</h2>
          <ul className="liste-nette">
            <li>
              <b>Un code par SMS</b> confirme votre numéro. Il reste privé.
            </li>
            <li>
              <b>Une pièce d’identité</b> est vérifiée par une personne de
              l’association avant votre première garde. Elle est supprimée
              aussitôt : seul le résultat « vérifié » est conservé.
            </li>
            <li>
              <b>C’est tout.</b> Le service est gratuit : aucun moyen de
              paiement n’est demandé.
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
