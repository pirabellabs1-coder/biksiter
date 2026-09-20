import type { Metadata } from 'next';
import Link from 'next/link';

import { baseConfiguree } from '@/lib/bd/client';
import { membreDuJeton } from '@/lib/depot/jetons';
import { textes } from '@/lib/i18n/langue';

import { EcranDeCompte, EncartDErreurs } from '../ecran-de-compte';
import { FormulaireDuNouveauMotDePasse } from './formulaire';

export async function generateMetadata(): Promise<Metadata> {
  const { p } = await textes();
  return {
    title: p('Nouveau mot de passe'),
    // Le jeton est dans l'adresse de la page : il ne doit partir nulle part
    // dans l'en-tête Referer.
    referrer: 'no-referrer',
  };
}

/**
 * L'écran où l'on choisit un nouveau mot de passe, depuis le lien reçu par
 * courriel. Ouvrir le lien ne consomme rien : un aperçu de lien par la
 * messagerie ne doit pas le rendre inutilisable. Le jeton ne sert qu'à
 * l'enregistrement.
 */
export default async function NouveauMotDePasse({
  searchParams,
}: {
  searchParams: Promise<{ jeton?: string }>;
}) {
  const { p } = await textes();
  const jeton = ((await searchParams).jeton ?? '').slice(0, 100);
  const valable =
    jeton !== '' &&
    baseConfiguree() &&
    (await membreDuJeton(jeton, 'nouveau_mot_de_passe')) !== null;

  return (
    <EcranDeCompte p={p} retour="/connexion">
      <h1 className="titre-ecran">{p('Nouveau mot de passe')}</h1>
      {valable ? (
        <>
          <p className="sous-titre">
            {p('Choisissez un mot de passe que vous n’utilisez nulle part ailleurs.')}
          </p>
          <FormulaireDuNouveauMotDePasse
            jeton={jeton}
            libelles={{
              motDePasse: p('Nouveau mot de passe'),
              aide: p('8 caractères minimum'),
              confirmation: p('Confirmez le mot de passe'),
              redemander: p('Demander un nouveau lien'),
              enregistrer: p('Enregistrer le mot de passe'),
              enCours: p('Enregistrement…'),
            }}
          />
        </>
      ) : (
        <div className="pile" style={{ marginTop: 14 }}>
          <EncartDErreurs
            erreurs={[
              p(
                'Ce lien n’est plus valable : il a déjà servi ou a expiré. Vous pouvez en demander un nouveau.',
              ),
            ]}
          />
          <Link href="/mot-de-passe-oublie" className="bouton plein">
            {p('Demander un nouveau lien')}
          </Link>
        </div>
      )}
    </EcranDeCompte>
  );
}
