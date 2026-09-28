import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { cheminDeRetour } from '@/lib/securite/retour';
import { FormulaireDeConnexion } from '@/components/maquette/compte/formulaire-de-connexion';
import { textes } from '@/lib/i18n/langue';
import { ACCUEIL_DES_MEMBRES } from '@/lib/navigation';
import { membreConnecte } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Connexion') };
}

export default async function Connexion({
  searchParams,
}: {
  searchParams: Promise<{ motDePasse?: string; email?: string; suite?: string }>;
}) {
  const { motDePasse, email, suite } = await searchParams;
  if (await membreConnecte()) {
    redirect(cheminDeRetour(suite) ?? ACCUEIL_DES_MEMBRES);
  }

  return (
    <>
      <main className="page page-etroite" id="contenu">
        <header className="page-tete">
          <span className="kicker">CONNEXION</span>
          <h1>Content de vous revoir.</h1>
          <p>
            Votre adresse et votre mot de passe suffisent. Si vous avez perdu
            le mot de passe, un lien vous est envoyé par e-mail.
          </p>
        </header>

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
          <p>
            Le réseau est en accès fermé : il faut le code d’invitation d’un
            membre. Sans code, laissez votre adresse, vous serez prévenu à
            l’ouverture.
          </p>
          <div className="actions-fin">
            <Link className="outline" href="/invitation">
              J’ai un code
            </Link>
            <Link className="outline" href="/liste-attente">
              Me prévenir à l’ouverture
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
