import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { FormulaireDeConnexion } from '@/components/maquette/compte/formulaire-de-connexion';
import { textes } from '@/lib/i18n/langue';
import { ACCUEIL_DES_MEMBRES } from '@/lib/navigation';
import { INSCRIPTION_SUR_INVITATION } from '@/lib/regles/modules';
import { cheminDeRetour } from '@/lib/securite/retour';
import { membreConnecte } from '@/lib/session';

import { EcranDeCompte } from '../ecran-de-compte';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Connexion') };
}

/**
 * La connexion, dans le même cadre que les autres écrans du compte : le
 * visuel de la marque à gauche sur ordinateur, le formulaire à droite.
 */
export default async function Connexion({
  searchParams,
}: {
  searchParams: Promise<{ motDePasse?: string; email?: string; suite?: string }>;
}) {
  const { motDePasse, email, suite } = await searchParams;
  if (await membreConnecte()) {
    redirect(cheminDeRetour(suite) ?? ACCUEIL_DES_MEMBRES);
  }
  const { p } = await textes();

  return (
    <EcranDeCompte p={p}>
      <h1 className="titre-ecran">Bon retour sur Bike Sitters</h1>
      <p className="sous-titre">
        Votre adresse et votre mot de passe suffisent. Si vous avez perdu le
        mot de passe, un lien vous est envoyé par e-mail.
      </p>

      {motDePasse === 'change' ? (
        <p className="info-bleue" role="status">
          Votre mot de passe est changé. Connectez-vous avec le nouveau : vos
          autres appareils ont été déconnectés.
        </p>
      ) : null}
      {email === 'lien-perime' ? (
        <p className="mention" role="status">
          Ce lien de confirmation n’est plus valable. Connectez-vous : vous
          pourrez en demander un nouveau.
        </p>
      ) : null}
      {email === 'confirme' ? (
        <p className="info-bleue" role="status">
          Merci, votre adresse est confirmée. Vous pouvez vous connecter.
        </p>
      ) : null}

      <FormulaireDeConnexion suite={cheminDeRetour(suite)} />

      <section className="bloc">
        <h2>Pas encore membre ?</h2>
        {INSCRIPTION_SUR_INVITATION ? (
          <>
            <p>
              L’inscription se fait avec le code d’invitation d’un membre. Sans
              code, laissez votre adresse : vous recevez un e-mail à
              l’ouverture.
            </p>
            <div className="actions-fin">
              <Link className="outline" href="/invitation">
                J’ai un code
              </Link>
              <Link className="outline" href="/liste-attente">
                Être averti de l’ouverture
              </Link>
            </div>
          </>
        ) : (
          <>
            <p>
              L’inscription prend quelques minutes : un compte, vos
              coordonnées, puis votre pièce d’identité, vérifiée par une
              personne de l’association.
            </p>
            <div className="actions-fin">
              <Link className="outline" href="/inscription">
                Créer un compte
              </Link>
            </div>
          </>
        )}
      </section>
    </EcranDeCompte>
  );
}
