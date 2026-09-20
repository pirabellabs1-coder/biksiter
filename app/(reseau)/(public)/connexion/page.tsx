import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Icone } from '@/components/app/icone';
import { textes } from '@/lib/i18n/langue';
import { ACCUEIL_DES_MEMBRES } from '@/lib/navigation';
import { membreConnecte } from '@/lib/session';

import { EcranDeCompte } from '../ecran-de-compte';
import { FormulaireDeConnexion } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return { title: p('Connexion') };
}

export default async function Connexion({
  searchParams,
}: {
  searchParams: Promise<{ motDePasse?: string; email?: string }>;
}) {
  if (await membreConnecte()) {
    redirect(ACCUEIL_DES_MEMBRES);
  }

  const { p } = await textes();
  const { motDePasse, email } = await searchParams;

  return (
    <EcranDeCompte p={p} retour="/bienvenue">
      <h1 className="titre-ecran">{p('Se connecter')}</h1>
      <p className="sous-titre">{p('Retrouvez votre espace Bike Sitters.')}</p>

      <div className="pile">
        {motDePasse === 'change' ? (
          <div className="encart" role="status">
            <Icone nom="coche" taille={20} />
            <span>
              {p(
                'Votre mot de passe est changé. Connectez-vous avec le nouveau : vos autres appareils ont été déconnectés.',
              )}
            </span>
          </div>
        ) : null}
        {email === 'lien-perime' ? (
          <div className="encart rouge" role="status">
            <Icone nom="alerte" taille={20} />
            <span>
              {p(
                'Ce lien de confirmation n’est plus valable. Connectez-vous : vous pourrez en demander un nouveau.',
              )}
            </span>
          </div>
        ) : null}
        {email === 'confirme' ? (
          <div className="encart bleu" role="status">
            <Icone nom="verifie" taille={20} />
            <span>
              {p('Merci, votre adresse est confirmée. Vous pouvez vous connecter.')}
            </span>
          </div>
        ) : null}

        <FormulaireDeConnexion
          libelles={{
            email: p('E-mail'),
            motDePasse: p('Mot de passe'),
            oublie: p('Mot de passe oublié ?'),
            seConnecter: p('Se connecter'),
            enCours: p('Connexion…'),
          }}
        />
      </div>

      <p className="centre texte-doux" style={{ margin: '20px 0 0', fontSize: 15 }}>
        {p('Pas encore de compte ?')}{' '}
        <Link href="/invitation" className="lien-souligne texte-vert">
          {p('Créer un compte')}
        </Link>
      </p>
    </EcranDeCompte>
  );
}
